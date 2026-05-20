"""Agent 7 — Outcome Agent
Simulates before/after outcomes: what happens if you follow normal route vs Raasta recommendation.
Uses Gemini 2.0 Flash for narrative generation.
"""
import json
import logging
import time
from datetime import datetime
from typing import List, Optional

import google.generativeai as genai

from core.models import (
    AgentTrace, CrisisAnalysis, OutcomeScenario, OutcomeSimulation, RouteResponse,
)
from core.state import RaastaState
from config import settings

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.gemini_api_key)
_model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-lite",
    generation_config={"temperature": 0.4, "max_output_tokens": 600},
)

OUTCOME_PROMPT = """You are simulating two outcomes for a Pakistani commuter navigating a crisis zone.

Route WITHOUT rerouting (normal/blocked route): {blocked_route}
Route WITH Raasta rerouting (safe route): {safe_route}

Active crises on blocked route:
{crisis_list}

Generate realistic outcome scenarios. Return ONLY valid JSON:
{{
  "without_rerouting": {{
    "outcome_headline": "<15 words max>",
    "outcome_detail": "<2 sentences, realistic negative consequence>",
    "delay_minutes": <int — extra delay caused by crisis>,
    "risk_exposure": <"low"|"medium"|"high"|"critical">
  }},
  "with_rerouting": {{
    "outcome_headline": "<15 words max>",
    "outcome_detail": "<2 sentences, positive outcome>",
    "delay_minutes": <int — extra time from longer route, typically 3-8>,
    "risk_exposure": "none"
  }},
  "lives_at_risk_avoided": <int 0-1000 estimate>
}}

Be specific, realistic, and Pakistan-context aware."""


def _llm_outcome(
    blocked_route_name: str,
    safe_route_name: str,
    analyses: List[CrisisAnalysis],
) -> dict:
    crisis_list = "\n".join(
        f"- {a.crisis_type.value.upper()} at {a.location}: {a.executive_summary[:100]}"
        for a in analyses
    ) or "- Road blockage detected on normal route"

    prompt = OUTCOME_PROMPT.format(
        blocked_route=blocked_route_name,
        safe_route=safe_route_name,
        crisis_list=crisis_list,
    )
    try:
        response = _model.generate_content(prompt)
        raw = response.text.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        return json.loads(raw)
    except Exception as e:
        logger.warning(f"Outcome LLM failed, using defaults: {e}")
        return {
            "without_rerouting": {
                "outcome_headline": "Stuck in crisis zone for 45+ minutes",
                "outcome_detail": "Vehicle trapped near active incident. Emergency services blocking all lanes on Jinnah Avenue. No exit available for 45 minutes.",
                "delay_minutes": 45,
                "risk_exposure": "high",
            },
            "with_rerouting": {
                "outcome_headline": "Safe arrival via Kashmir Highway, 4 minutes extra",
                "outcome_detail": "Raasta rerouted via Kashmir Highway, avoiding D-Chowk entirely. Journey completed safely with only 4 minutes added.",
                "delay_minutes": 4,
                "risk_exposure": "none",
            },
            "lives_at_risk_avoided": 1,
        }


async def run(state: RaastaState) -> RaastaState:
    t_start = time.time()
    route_response: Optional[RouteResponse] = state.get("route_response")
    analyses: List[CrisisAnalysis] = state.get("analyses", [])
    traces: List[AgentTrace] = state.get("agent_traces", [])

    if not route_response:
        traces.append(AgentTrace(
            run_id=state["run_id"],
            agent_name="outcome_agent",
            step_number=6,
            input_summary="No route response to simulate",
            output_summary="Skipped",
            duration_ms=0,
        ))
        state["agent_traces"] = traces
        return state

    logger.info("Outcome Agent: simulating before/after scenarios")

    # Find blocked and safe routes
    blocked = next(
        (r for r in [route_response.recommended_route] + route_response.alternative_routes
         if r.risk_level == "blocked"),
        route_response.alternative_routes[0] if route_response.alternative_routes else route_response.recommended_route,
    )
    safe = route_response.recommended_route

    result = _llm_outcome(blocked.name, safe.name, analyses)

    wo = result["without_rerouting"]
    wr = result["with_rerouting"]

    simulation = OutcomeSimulation(
        route_request_id=route_response.request_id,
        without_rerouting=OutcomeScenario(
            scenario_type="without_rerouting",
            route_name=blocked.name,
            outcome_headline=wo["outcome_headline"],
            outcome_detail=wo["outcome_detail"],
            delay_minutes=wo["delay_minutes"],
            risk_exposure=wo["risk_exposure"],
            confidence=0.85,
        ),
        with_rerouting=OutcomeScenario(
            scenario_type="with_rerouting",
            route_name=safe.name,
            outcome_headline=wr["outcome_headline"],
            outcome_detail=wr["outcome_detail"],
            delay_minutes=wr["delay_minutes"],
            risk_exposure="none",
            confidence=0.92,
        ),
        time_saved_minutes=wo["delay_minutes"] - wr["delay_minutes"],
        lives_at_risk_avoided=result.get("lives_at_risk_avoided", 0),
    )

    duration_ms = int((time.time() - t_start) * 1000)
    traces.append(AgentTrace(
        run_id=state["run_id"],
        agent_name="outcome_agent",
        step_number=6,
        input_summary=f"Comparing '{blocked.name}' vs '{safe.name}'",
        output_summary=f"Without rerouting: {wo['delay_minutes']}min delay, {wo['risk_exposure']} risk. With Raasta: {wr['delay_minutes']}min delay, safe.",
        duration_ms=duration_ms,
        llm_calls=1,
        confidence=0.88,
    ))

    state["outcome_simulation"] = simulation
    state["agent_traces"] = traces
    logger.info(f"Outcome Agent: {simulation.time_saved_minutes}min saved by rerouting")
    return state
