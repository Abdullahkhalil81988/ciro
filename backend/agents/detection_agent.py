"""Agent 2 — Detection Agent
Scores each CrisisCandidate via keyword pre-filter + Claude Haiku LLM classifier.
"""
import asyncio
import json
import logging
from datetime import datetime
from typing import List

import anthropic

from core.models import (
    CrisisCandidate, CrisisEvent, CrisisType,
    DetectionResult, SeverityLevel,
)
from core.state import CIROState
from nlp.keyword_filter import keyword_score
from nlp.entity_extractor import extract_location
from config import settings

logger = logging.getLogger(__name__)

_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

DETECTION_SYSTEM = """You are a crisis detection classifier. Analyze the following text and return ONLY valid JSON. No prose, no markdown fences.

Schema:
{
  "p_crisis": <float 0.0-1.0>,
  "crisis_type": <"flood"|"fire"|"cyber"|"civil"|"medical"|"industrial"|"heatwave"|"road_blockage"|"unknown">,
  "location": <string or null>,
  "severity_hint": <"low"|"medium"|"high"|"critical">,
  "confidence": <float 0.0-1.0>
}

Focus on Pakistan geography when inferring locations. Recognize Urdu and Roman-Urdu crisis terms."""


def _llm_classify(text: str) -> DetectionResult:
    try:
        message = _client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=256,
            system=DETECTION_SYSTEM,
            messages=[{"role": "user", "content": f"Text: {text[:800]}"}],
        )
        raw = message.content[0].text.strip()
        data = json.loads(raw)
        return DetectionResult(**data)
    except Exception as e:
        logger.warning(f"LLM classification failed, using keyword fallback: {e}")
        score = keyword_score(text)
        return DetectionResult(
            p_crisis=score,
            crisis_type="unknown",
            location=None,
            severity_hint=SeverityLevel.medium,
            confidence=0.5,
        )


def _candidate_to_event(candidate: CrisisCandidate, result: DetectionResult) -> CrisisEvent:
    location = result.location or extract_location(candidate.raw_text, candidate.location_hint)
    try:
        crisis_type = CrisisType(result.crisis_type)
    except ValueError:
        crisis_type = CrisisType.unknown

    return CrisisEvent(
        candidate_id=candidate.id,
        crisis_type=crisis_type,
        location=location,
        p_crisis=result.p_crisis,
        severity_hint=result.severity_hint,
        raw_sources=[candidate.url or candidate.source],
    )


async def run(state: CIROState) -> CIROState:
    candidates: List[CrisisCandidate] = state.get("raw_candidates", [])
    logger.info(f"Detection Agent: processing {len(candidates)} candidates")

    # Stage 1: keyword pre-filter (free)
    shortlisted = [c for c in candidates if keyword_score(c.raw_text) >= settings.keyword_prefilter_threshold]
    logger.info(f"Detection Agent: {len(shortlisted)} passed keyword filter")

    # Stage 2: LLM classification (paid — run in thread pool to avoid blocking)
    loop = asyncio.get_event_loop()
    results = await asyncio.gather(
        *[loop.run_in_executor(None, _llm_classify, c.raw_text) for c in shortlisted],
        return_exceptions=True,
    )

    events: List[CrisisEvent] = []
    for candidate, result in zip(shortlisted, results):
        if isinstance(result, Exception):
            logger.error(f"Detection error for candidate {candidate.id}: {result}")
            continue
        if result.p_crisis >= settings.detection_threshold:
            events.append(_candidate_to_event(candidate, result))

    # Dedup by location+type (keep highest p_crisis)
    deduped: dict[str, CrisisEvent] = {}
    for event in events:
        key = f"{event.crisis_type}_{event.location}"
        if key not in deduped or event.p_crisis > deduped[key].p_crisis:
            deduped[key] = event
    events = list(deduped.values())

    logger.info(f"Detection Agent: {len(events)} crisis events detected")
    state["detected_events"] = events
    state["detection_skipped"] = len(events) == 0
    return state
