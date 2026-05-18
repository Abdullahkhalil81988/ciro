"""FastAPI routes: REST endpoints + WebSocket."""
import asyncio
import uuid
import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, BackgroundTasks
from pydantic import BaseModel

from core.graph import ciro_graph, initial_state
from core.models import CrisisScenario, CrisisType, SeverityLevel, ResponseTier
from core.models import CrisisEvent, CrisisAnalysis, DispatchRecord
from dispatch.channels import ALERT_LOG
from agents import report_agent
from api.websocket import connect, disconnect

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory stores (replace with DB in full build)
_run_history: list[dict] = []
_active_events: list[dict] = []


# ─── WebSocket ────────────────────────────────────────────────────────────────

@router.websocket("/ws/dashboard")
async def dashboard_ws(websocket: WebSocket):
    await connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # keep-alive
    except WebSocketDisconnect:
        disconnect(websocket)


# ─── Health ───────────────────────────────────────────────────────────────────

@router.get("/health")
async def health():
    return {
        "status": "ok",
        "agents": ["monitor", "detect", "analyze", "dispatch", "report"],
        "agents_healthy": True,
        "timestamp": datetime.utcnow().isoformat(),
    }


# ─── Trigger pipeline ─────────────────────────────────────────────────────────

async def _run_pipeline(run_id: str):
    logger.info(f"Pipeline run {run_id} starting")
    state = initial_state(run_id)
    try:
        final_state = await asyncio.to_thread(ciro_graph.invoke, state)
        _run_history.append({
            "run_id": run_id,
            "completed_at": datetime.utcnow().isoformat(),
            "events_detected": len(final_state.get("detected_events", [])),
            "max_severity": final_state.get("max_severity", 0),
            "alerts_sent": len(final_state.get("dispatch_records", [])),
        })
        for analysis in final_state.get("analyses", []):
            _active_events.append({
                "id": analysis.id,
                "type": analysis.crisis_type.value,
                "location": analysis.location,
                "severity": analysis.severity_score,
                "trajectory": analysis.escalation_trajectory,
                "summary": analysis.executive_summary,
                "actions": analysis.recommended_actions,
                "detected_at": analysis.detected_at.isoformat(),
            })
    except Exception as e:
        logger.error(f"Pipeline run {run_id} failed: {e}", exc_info=True)


@router.post("/trigger")
async def trigger_pipeline(background_tasks: BackgroundTasks):
    run_id = str(uuid.uuid4())
    background_tasks.add_task(_run_pipeline, run_id)
    return {"run_id": run_id, "started_at": datetime.utcnow().isoformat(), "status": "running"}


# ─── Events ───────────────────────────────────────────────────────────────────

@router.get("/events")
async def list_events(page: int = 1, limit: int = 20):
    start = (page - 1) * limit
    return {
        "events": _active_events[start: start + limit],
        "total": len(_active_events),
        "page": page,
    }


@router.get("/dashboard/summary")
async def dashboard_summary():
    recent = sorted(_active_events, key=lambda e: e.get("severity", 0), reverse=True)
    max_sev = max((e.get("severity", 0) for e in _active_events), default=0)
    return {
        "active_events": len(_active_events),
        "max_severity": max_sev,
        "recent_alerts": ALERT_LOG[-10:],
        "recent_events": recent[:5],
        "run_history": _run_history[-5:],
    }


# ─── Simulate (DEMO endpoint) ─────────────────────────────────────────────────

@router.post("/simulate")
async def simulate_crisis(scenario: CrisisScenario, background_tasks: BackgroundTasks):
    """Inject a synthetic crisis directly at the Analysis stage — bypasses live ingestion."""
    import random

    severity = scenario.severity_override or random.randint(6, 9)
    tier = ResponseTier.national if severity >= 8 else (ResponseTier.regional if severity >= 5 else ResponseTier.local)

    fake_event = CrisisEvent(
        candidate_id="simulation",
        crisis_type=scenario.crisis_type,
        location=scenario.location,
        p_crisis=0.95,
        severity_hint=SeverityLevel.critical if severity >= 8 else SeverityLevel.high,
        raw_sources=[scenario.source],
    )

    analysis = CrisisAnalysis(
        event_id=fake_event.id,
        crisis_type=scenario.crisis_type,
        location=scenario.location,
        severity_score=severity,
        escalation_trajectory="worsening" if severity >= 7 else "stable",
        recommended_response_tier=tier,
        affected_radius_km=severity * 2.5,
        population_at_risk=severity * 50000,
        executive_summary=scenario.description,
        recommended_actions=[
            f"Deploy emergency services to {scenario.location}",
            "Issue public evacuation alert",
            "Coordinate with NDMA and local administration",
            "Open emergency relief camps",
        ],
    )

    # Run dispatch + report in background
    async def _sim_dispatch():
        from agents import dispatch_agent, report_agent
        from core.state import CIROState

        state = initial_state()
        state["detected_events"] = [fake_event]
        state["analyses"] = [analysis]
        state["max_severity"] = severity
        state = await dispatch_agent.run(state)
        state = await report_agent.run(state)
        _active_events.append({
            "id": analysis.id,
            "type": analysis.crisis_type.value,
            "location": analysis.location,
            "severity": analysis.severity_score,
            "trajectory": analysis.escalation_trajectory,
            "summary": analysis.executive_summary,
            "actions": analysis.recommended_actions,
            "detected_at": analysis.detected_at.isoformat(),
        })

    background_tasks.add_task(_sim_dispatch)

    return {
        "simulated_event": {
            "event_id": fake_event.id,
            "analysis_id": analysis.id,
            "crisis_type": scenario.crisis_type.value,
            "location": scenario.location,
            "severity": severity,
        },
        "status": "simulation dispatched — watch dashboard WebSocket",
    }


# ─── Logs ─────────────────────────────────────────────────────────────────────

@router.get("/logs")
async def get_logs():
    return {"alert_log": ALERT_LOG, "run_history": _run_history}
