"""Agent 5 — Report Agent
Generates situation reports and broadcasts to WebSocket clients.
"""
import asyncio
import json
import logging
from datetime import datetime
from typing import List

import anthropic

from core.models import CrisisAnalysis, DispatchRecord, SituationReport
from core.state import CIROState
from config import settings

logger = logging.getLogger(__name__)

_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

REPORT_SYSTEM = """You are a professional emergency management report writer for Pakistan.
Generate a concise situation report in plain English (3-4 paragraphs).
Structure: [1] Executive Summary [2] Current Situation [3] Actions Taken [4] Recommendations.
Be specific, factual, and action-oriented."""


def _llm_report(analysis: CrisisAnalysis, dispatch_records: List[DispatchRecord]) -> str:
    teams_alerted = list({r.team_name for r in dispatch_records if r.analysis_id == analysis.id})
    prompt = (
        f"Crisis: {analysis.crisis_type.value} in {analysis.location}\n"
        f"Severity: {analysis.severity_score}/10\n"
        f"Trajectory: {analysis.escalation_trajectory}\n"
        f"Population at risk: {analysis.population_at_risk or 'unknown'}\n"
        f"Actions already taken: {', '.join(teams_alerted) if teams_alerted else 'None yet'}\n"
        f"Recommended actions: {'; '.join(analysis.recommended_actions[:3])}\n\n"
        "Write the situation report now."
    )
    try:
        message = _client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=600,
            system=REPORT_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text.strip()
    except Exception as e:
        logger.warning(f"Report LLM failed: {e}")
        return (
            f"SITUATION REPORT — {analysis.crisis_type.value.upper()} @ {analysis.location}\n\n"
            f"{analysis.executive_summary}\n\n"
            f"Severity Score: {analysis.severity_score}/10. "
            f"Trajectory: {analysis.escalation_trajectory}. "
            f"Response tier {analysis.recommended_response_tier.value} activated.\n\n"
            f"Teams alerted: {', '.join(teams_alerted) if teams_alerted else 'Pending'}.\n\n"
            f"Recommended actions: {'; '.join(analysis.recommended_actions)}."
        )


# WebSocket broadcast registry (populated by api/websocket.py)
_ws_broadcast_callbacks: list = []


def register_broadcast(callback):
    _ws_broadcast_callbacks.append(callback)


async def _broadcast(event_type: str, data: dict):
    if not _ws_broadcast_callbacks:
        return
    message = json.dumps({"event_type": event_type, "data": data})
    dead = []
    for cb in _ws_broadcast_callbacks:
        try:
            await cb(message)
        except Exception:
            dead.append(cb)
    for cb in dead:
        _ws_broadcast_callbacks.remove(cb)


async def run(state: CIROState) -> CIROState:
    analyses: List[CrisisAnalysis] = state.get("analyses", [])
    dispatch_records: List[DispatchRecord] = state.get("dispatch_records", [])
    loop = asyncio.get_event_loop()

    reports: List[SituationReport] = []

    raw_reports = await asyncio.gather(
        *[loop.run_in_executor(None, _llm_report, a, dispatch_records) for a in analyses],
        return_exceptions=True,
    )

    for analysis, report_text in zip(analyses, raw_reports):
        if isinstance(report_text, Exception):
            report_text = f"Report generation failed for {analysis.location}: {report_text}"

        report = SituationReport(
            analysis_id=analysis.id,
            report_text=report_text,
        )
        reports.append(report)

        # Broadcast to dashboard
        await _broadcast("CRISIS_DETECTED", {
            "id": analysis.id,
            "type": analysis.crisis_type.value,
            "location": analysis.location,
            "severity": analysis.severity_score,
            "trajectory": analysis.escalation_trajectory,
            "summary": analysis.executive_summary,
            "actions": analysis.recommended_actions,
            "detected_at": analysis.detected_at.isoformat(),
            "population_at_risk": analysis.population_at_risk,
            "affected_radius_km": analysis.affected_radius_km,
        })

        # Broadcast dispatch records for this analysis
        for record in dispatch_records:
            if record.analysis_id == analysis.id:
                await _broadcast("ALERT_DISPATCHED", {
                    "crisis_id": analysis.id,
                    "team": record.team_name,
                    "channel": record.channel,
                    "status": record.status,
                })

    # System heartbeat
    await _broadcast("HEARTBEAT", {
        "agents_healthy": True,
        "last_run": datetime.utcnow().isoformat(),
        "events_processed": len(analyses),
        "alerts_sent": len(dispatch_records),
    })

    state["situation_reports"] = reports
    state["run_complete"] = True
    logger.info(f"Report Agent: generated {len(reports)} reports, broadcast complete")
    return state
