"""Alert channel implementations: Slack, Email (SendGrid), in-memory log."""
import logging
from datetime import datetime

import httpx

from core.models import CrisisAnalysis, DispatchRecord
from config import settings

logger = logging.getLogger(__name__)

# In-memory alert log for demo (persists within process lifetime)
ALERT_LOG: list[dict] = []


def _build_slack_payload(analysis: CrisisAnalysis, team: str) -> dict:
    severity_emoji = {1: "🟢", 2: "🟡", 3: "🟠", 4: "🔴", 5: "🔴",
                      6: "🆘", 7: "🆘", 8: "🆘", 9: "🆘", 10: "💀"}
    emoji = severity_emoji.get(analysis.severity_score, "⚠️")
    return {
        "blocks": [
            {"type": "header", "text": {"type": "plain_text",
                "text": f"{emoji} CRISIS ALERT — {analysis.crisis_type.value.upper()}"}},
            {"type": "section", "fields": [
                {"type": "mrkdwn", "text": f"*Location:* {analysis.location}"},
                {"type": "mrkdwn", "text": f"*Severity:* {analysis.severity_score}/10"},
                {"type": "mrkdwn", "text": f"*Tier:* {analysis.recommended_response_tier.value}"},
                {"type": "mrkdwn", "text": f"*Team:* {team}"},
            ]},
            {"type": "section", "text": {"type": "mrkdwn",
                "text": analysis.executive_summary}},
        ]
    }


async def send_slack(analysis: CrisisAnalysis, team: str) -> DispatchRecord:
    record = DispatchRecord(
        analysis_id=analysis.id,
        team_name=team,
        channel="slack",
        message_preview=analysis.executive_summary[:120],
    )
    if not settings.slack_webhook_url:
        record.status = "simulated"
        record.sent_at = datetime.utcnow()
        ALERT_LOG.append({"channel": "slack", "team": team, "location": analysis.location,
                           "severity": analysis.severity_score, "time": record.sent_at.isoformat()})
        logger.info(f"[SIMULATED] Slack alert → {team}")
        return record
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                settings.slack_webhook_url,
                json=_build_slack_payload(analysis, team),
                timeout=5,
            )
            resp.raise_for_status()
            record.status = "sent"
            record.sent_at = datetime.utcnow()
    except Exception as e:
        record.status = "failed"
        record.error = str(e)
        logger.error(f"Slack dispatch failed: {e}")
    return record


async def send_email(analysis: CrisisAnalysis, team: str) -> DispatchRecord:
    record = DispatchRecord(
        analysis_id=analysis.id,
        team_name=team,
        channel="email",
        message_preview=f"CRISIS: {analysis.crisis_type.value} @ {analysis.location} | Severity {analysis.severity_score}/10",
    )
    # Simulated for hackathon — wire SendGrid here in prod
    record.status = "simulated"
    record.sent_at = datetime.utcnow()
    ALERT_LOG.append({"channel": "email", "team": team, "location": analysis.location,
                       "severity": analysis.severity_score, "time": record.sent_at.isoformat()})
    logger.info(f"[SIMULATED] Email alert → {team}")
    return record
