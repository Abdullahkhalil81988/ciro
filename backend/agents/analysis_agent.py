"""Agent 3 — Analysis Agent
Enriches CrisisEvent with severity scoring, escalation trajectory, and response tier.
Uses Claude Sonnet for deep reasoning.
"""
import asyncio
import json
import logging
from datetime import datetime
from typing import List

import google.generativeai as genai

from core.models import CrisisAnalysis, CrisisEvent, CrisisType, ResponseTier
from core.state import CIROState
from nlp.keyword_filter import keyword_score
from config import settings

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.gemini_api_key)
_model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-lite",
    generation_config={"temperature": 0.2, "max_output_tokens": 512},
)

ANALYSIS_PROMPT = """You are a crisis analysis expert for Pakistan urban emergency management.
Return ONLY valid JSON — no prose, no markdown fences.

Schema:
{{
  "severity_score": <int 1-10>,
  "escalation_trajectory": <"stable"|"worsening"|"critical">,
  "recommended_response_tier": <1|2|3>,
  "affected_radius_km": <float>,
  "population_at_risk": <int estimate>,
  "executive_summary": <string 2-3 sentences>,
  "recommended_actions": [<string>, ...]
}}

Response tiers: 1=local (district), 2=regional (province), 3=national (federal/army).

{event_details}"""

POPULATION_BY_CITY = {
    "Karachi": 16_000_000, "Lahore": 13_000_000, "Faisalabad": 3_600_000,
    "Rawalpindi": 2_300_000, "Islamabad": 1_100_000, "Gujranwala": 2_300_000,
    "Peshawar": 2_100_000, "Multan": 1_900_000, "Hyderabad": 1_700_000,
    "Quetta": 1_200_000,
}


def _severity_score_heuristic(event: CrisisEvent) -> int:
    """Weighted heuristic — used as fallback if LLM fails."""
    hint_map = {"low": 0.2, "medium": 0.5, "high": 0.8, "critical": 1.0}
    base = (
        event.p_crisis * 0.30
        + keyword_score(event.crisis_type.value) * 0.15
        + hint_map.get(event.severity_hint.value, 0.5) * 0.35
        + 0.2  # unknown historical weight
    )
    return max(1, min(10, round(base * 10)))


def _llm_analyze(event: CrisisEvent) -> dict:
    event_details = (
        f"Crisis Type: {event.crisis_type.value}\n"
        f"Location: {event.location}\n"
        f"Detection Confidence: {event.p_crisis:.2f}\n"
        f"Initial Severity Hint: {event.severity_hint.value}\n"
        f"Sources: {', '.join(event.raw_sources[:3])}\n\n"
        "Analyze for Pakistan context. Consider population density, "
        "infrastructure vulnerability, and historical patterns."
    )
    try:
        response = _model.generate_content(ANALYSIS_PROMPT.format(event_details=event_details))
        raw = response.text.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        return json.loads(raw)
    except Exception as e:
        logger.warning(f"Analysis LLM failed, using heuristic: {e}")
        score = _severity_score_heuristic(event)
        pop = POPULATION_BY_CITY.get(event.location, 500_000)
        return {
            "severity_score": score,
            "escalation_trajectory": "worsening" if score >= 6 else "stable",
            "recommended_response_tier": 3 if score >= 8 else (2 if score >= 5 else 1),
            "affected_radius_km": 5.0 if score < 5 else 20.0,
            "population_at_risk": int(pop * 0.05),
            "executive_summary": (
                f"A {event.crisis_type.value} event has been detected in {event.location} "
                f"with severity score {score}/10. Immediate assessment required."
            ),
            "recommended_actions": [
                f"Dispatch emergency services to {event.location}",
                "Issue public alert via all channels",
                "Coordinate with district administration",
            ],
        }


async def run(state: CIROState) -> CIROState:
    events: List[CrisisEvent] = state.get("detected_events", [])
    logger.info(f"Analysis Agent: analyzing {len(events)} events")

    loop = asyncio.get_event_loop()
    raw_analyses = await asyncio.gather(
        *[loop.run_in_executor(None, _llm_analyze, event) for event in events],
        return_exceptions=True,
    )

    analyses: List[CrisisAnalysis] = []
    for event, result in zip(events, raw_analyses):
        if isinstance(result, Exception):
            logger.error(f"Analysis failed for event {event.id}: {result}")
            result = {
                "severity_score": _severity_score_heuristic(event),
                "escalation_trajectory": "worsening",
                "recommended_response_tier": 2,
                "affected_radius_km": 10.0,
                "population_at_risk": 50000,
                "executive_summary": f"Crisis detected in {event.location}.",
                "recommended_actions": ["Deploy emergency services", "Issue public alert"],
            }
        analyses.append(
            CrisisAnalysis(
                event_id=event.id,
                crisis_type=event.crisis_type,
                location=event.location,
                severity_score=result.get("severity_score", 5),
                escalation_trajectory=result.get("escalation_trajectory", "stable"),
                recommended_response_tier=ResponseTier(result.get("recommended_response_tier", 1)),
                affected_radius_km=result.get("affected_radius_km"),
                population_at_risk=result.get("population_at_risk"),
                executive_summary=result.get("executive_summary", ""),
                recommended_actions=result.get("recommended_actions", []),
                detected_at=event.detected_at,
            )
        )

    max_severity = max((a.severity_score for a in analyses), default=0)
    state["analyses"] = analyses
    state["max_severity"] = max_severity
    logger.info(f"Analysis Agent: done. Max severity this cycle: {max_severity}")
    return state
