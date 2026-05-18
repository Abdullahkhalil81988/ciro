"""Agent 4 — Dispatch Agent
Maps CrisisAnalysis → response teams → sends alerts via channels.
"""
import asyncio
import logging
from typing import List

from core.models import CrisisAnalysis, DispatchRecord
from core.state import CIROState
from dispatch.routing_table import get_teams
from dispatch.channels import send_slack, send_email

logger = logging.getLogger(__name__)


async def _dispatch_analysis(analysis: CrisisAnalysis) -> List[DispatchRecord]:
    teams = get_teams(analysis.crisis_type, analysis.recommended_response_tier)
    logger.info(f"Dispatch Agent: alerting {len(teams)} teams for {analysis.crisis_type.value} @ {analysis.location}")

    tasks = []
    for team in teams:
        tasks.append(send_slack(analysis, team))
        tasks.append(send_email(analysis, team))

    results = await asyncio.gather(*tasks, return_exceptions=True)
    records = []
    for r in results:
        if isinstance(r, DispatchRecord):
            records.append(r)
        else:
            logger.error(f"Dispatch task error: {r}")
    return records


async def run(state: CIROState) -> CIROState:
    analyses: List[CrisisAnalysis] = state.get("analyses", [])
    logger.info(f"Dispatch Agent: processing {len(analyses)} analyses")

    all_records: List[DispatchRecord] = []
    errors: List[str] = []

    dispatch_results = await asyncio.gather(
        *[_dispatch_analysis(a) for a in analyses],
        return_exceptions=True,
    )

    for result in dispatch_results:
        if isinstance(result, list):
            all_records.extend(result)
        else:
            errors.append(str(result))

    state["dispatch_records"] = all_records
    state["dispatch_errors"] = errors
    logger.info(f"Dispatch Agent: sent {len(all_records)} alerts, {len(errors)} errors")
    return state
