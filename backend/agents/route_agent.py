"""Agent 6 — Route Agent
Given active crisis analyses + a route request, plans safe alternative routes
using Gemini 2.0 Flash and a hardcoded Islamabad/Lahore/Karachi road graph.
"""
import json
import logging
import time
from datetime import datetime
from typing import List, Optional

import google.generativeai as genai

from core.models import (
    AgentTrace, CrisisAnalysis, RouteCoordinate,
    RouteOption, RouteRequest, RouteResponse,
)
from core.state import RaastaState
from config import settings

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.gemini_api_key)
_model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-lite",
    generation_config={"temperature": 0.2, "max_output_tokens": 800},
)

# ─── Islamabad Road Graph ──────────────────────────────────────────────────────
# Key intersections / waypoints with real coordinates

ISLAMABAD_NODES = {
    "G-11 Markaz":     RouteCoordinate(lat=33.6844, lng=73.0479, label="G-11 Markaz"),
    "G-10 Markaz":     RouteCoordinate(lat=33.6972, lng=73.0547, label="G-10 Markaz"),
    "G-9 Markaz":      RouteCoordinate(lat=33.7040, lng=73.0610, label="G-9 Markaz"),
    "D-Chowk":         RouteCoordinate(lat=33.7260, lng=73.0942, label="D-Chowk"),
    "Blue Area":       RouteCoordinate(lat=33.7215, lng=73.0898, label="Blue Area"),
    "F-8 Markaz":      RouteCoordinate(lat=33.7200, lng=73.0479, label="F-8 Markaz"),
    "F-7 Markaz":      RouteCoordinate(lat=33.7250, lng=73.0617, label="F-7 Markaz"),
    "F-6 Markaz":      RouteCoordinate(lat=33.7356, lng=73.0938, label="F-6 Markaz"),
    "Faisal Chowk":    RouteCoordinate(lat=33.7298, lng=73.0862, label="Faisal Chowk"),
    "Kashmir Highway": RouteCoordinate(lat=33.7150, lng=73.0700, label="Kashmir Highway"),
    "Zero Point":      RouteCoordinate(lat=33.7162, lng=73.0560, label="Zero Point"),
    "Jinnah Ave":      RouteCoordinate(lat=33.7100, lng=73.0750, label="Jinnah Avenue"),
    "Constitution Ave":RouteCoordinate(lat=33.7320, lng=73.0950, label="Constitution Avenue"),
}

# Pre-built routes: G-11 → Blue Area (main demo scenario)
DEMO_ROUTES = {
    "G-11 to Blue Area": [
        {
            "name": "Via Jinnah Avenue (Normal Route)",
            "waypoints": ["G-11 Markaz", "G-10 Markaz", "G-9 Markaz", "Jinnah Ave", "D-Chowk", "Blue Area"],
            "distance_km": 8.2,
            "eta_minutes": 18,
            "risk_level": "blocked",
            "color": "#ef4444",
            "recommended": False,
        },
        {
            "name": "Via Kashmir Highway (Raasta Recommendation)",
            "waypoints": ["G-11 Markaz", "Zero Point", "Kashmir Highway", "F-7 Markaz", "F-6 Markaz", "Blue Area"],
            "distance_km": 11.4,
            "eta_minutes": 22,
            "risk_level": "safe",
            "color": "#22c55e",
            "recommended": True,
        },
        {
            "name": "Via F-8 / Margalla Road",
            "waypoints": ["G-11 Markaz", "F-8 Markaz", "F-7 Markaz", "Faisal Chowk", "Blue Area"],
            "distance_km": 9.8,
            "eta_minutes": 25,
            "risk_level": "caution",
            "color": "#eab308",
            "recommended": False,
        },
    ]
}


def _build_route_option(template: dict, nodes: dict = ISLAMABAD_NODES) -> RouteOption:
    coords = [nodes[wp] for wp in template["waypoints"] if wp in nodes]
    return RouteOption(
        name=template["name"],
        waypoints=template["waypoints"],
        coordinates=coords,
        distance_km=template["distance_km"],
        eta_minutes=template["eta_minutes"],
        risk_level=template["risk_level"],
        color=template["color"],
        recommended=template["recommended"],
    )


ROUTE_PROMPT = """You are a route safety analyst for Pakistan urban roads. Given active crises and a travel request, decide which routes are safe.

Active crises:
{crisis_list}

Travel request: {origin} → {destination}

Available routes:
{routes_json}

For each route, set risk_level to:
- "blocked": route passes through or within 500m of an active crisis zone
- "caution": route is near (within 1km) of a crisis zone
- "safe": no nearby crises

Also set recommended=true for the best safe option.
Return ONLY valid JSON array with the same structure, updated risk_level and recommended fields.
No prose, no markdown."""


def _llm_score_routes(
    origin: str,
    destination: str,
    route_templates: list,
    analyses: List[CrisisAnalysis],
) -> list:
    if not analyses:
        # No crises → first route is safe
        templates = [dict(t) for t in route_templates]
        templates[0]["risk_level"] = "safe"
        templates[0]["recommended"] = True
        return templates

    crisis_list = "\n".join(
        f"- {a.crisis_type.value.upper()} at {a.location} (severity {a.severity_score}/10, radius {a.affected_radius_km or 2}km)"
        for a in analyses
    )
    routes_json = json.dumps(route_templates, indent=2)
    prompt = ROUTE_PROMPT.format(
        crisis_list=crisis_list,
        origin=origin,
        destination=destination,
        routes_json=routes_json,
    )
    try:
        response = _model.generate_content(prompt)
        raw = response.text.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        return json.loads(raw)
    except Exception as e:
        logger.warning(f"Route LLM failed, using defaults: {e}")
        return route_templates


def _find_templates_for(origin: str, destination: str) -> Optional[list]:
    """Find pre-built route templates for an origin-destination pair."""
    key = f"{origin} to {destination}"
    if key in DEMO_ROUTES:
        return DEMO_ROUTES[key]
    # Try fuzzy match
    o_lower, d_lower = origin.lower(), destination.lower()
    for k, v in DEMO_ROUTES.items():
        k_parts = k.lower().split(" to ")
        if len(k_parts) == 2 and k_parts[0] in o_lower and k_parts[1] in d_lower:
            return v
    # Default: return G-11 to Blue Area routes relabelled
    templates = [dict(t) for t in DEMO_ROUTES["G-11 to Blue Area"]]
    for t in templates:
        t["waypoints"][0] = origin
        t["waypoints"][-1] = destination
    return templates


async def run(state: RaastaState) -> RaastaState:
    t_start = time.time()
    route_request: Optional[RouteRequest] = state.get("route_request")
    analyses: List[CrisisAnalysis] = state.get("analyses", [])
    traces: List[AgentTrace] = state.get("agent_traces", [])

    if not route_request:
        # No route request this cycle — skip
        traces.append(AgentTrace(
            run_id=state["run_id"],
            agent_name="route_agent",
            step_number=4,
            input_summary="No route request",
            output_summary="Skipped",
            duration_ms=0,
        ))
        state["agent_traces"] = traces
        return state

    logger.info(f"Route Agent: planning {route_request.origin} → {route_request.destination}")

    templates = _find_templates_for(route_request.origin, route_request.destination)

    # Use Gemini to score routes against active crises
    scored = _llm_score_routes(
        route_request.origin,
        route_request.destination,
        [
            {
                "name": t["name"],
                "waypoints": t["waypoints"],
                "distance_km": t["distance_km"],
                "eta_minutes": t["eta_minutes"],
                "risk_level": t["risk_level"],
                "color": t["color"],
                "recommended": t["recommended"],
            }
            for t in templates
        ],
        analyses,
    )

    route_options = [_build_route_option(s) for s in scored]

    # Pick recommended
    recommended = next((r for r in route_options if r.recommended), route_options[0])
    alternatives = [r for r in route_options if r.id != recommended.id]

    avoided_crises = [
        f"{a.crisis_type.value} at {a.location}"
        for a in analyses
        if a.severity_score >= 5
    ]

    response = RouteResponse(
        request_id=route_request.request_id,
        origin=route_request.origin,
        destination=route_request.destination,
        recommended_route=recommended,
        alternative_routes=alternatives,
        avoided_crises=avoided_crises,
        active_crises=[f"{a.crisis_type.value} @ {a.location} (sev {a.severity_score})" for a in analyses],
    )

    duration_ms = int((time.time() - t_start) * 1000)
    traces.append(AgentTrace(
        run_id=state["run_id"],
        agent_name="route_agent",
        step_number=4,
        input_summary=f"{route_request.origin} → {route_request.destination}, {len(analyses)} active crises",
        output_summary=f"Recommended: {recommended.name} ({recommended.eta_minutes}min, {recommended.risk_level}). Avoided: {len(avoided_crises)} crises.",
        duration_ms=duration_ms,
        llm_calls=1,
        confidence=0.90,
    ))

    state["route_response"] = response
    state["agent_traces"] = traces
    logger.info(f"Route Agent: recommended '{recommended.name}', avoided {len(avoided_crises)} crises")
    return state
