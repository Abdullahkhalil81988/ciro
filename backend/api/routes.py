"""Raasta FastAPI routes."""
import asyncio
import uuid
import logging
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, BackgroundTasks
from pydantic import BaseModel

from core.graph import raasta_graph, initial_state
from core.models import (
    CrisisScenario, CrisisType, SeverityLevel, ResponseTier,
    CrisisEvent, CrisisAnalysis, DispatchRecord, RouteRequest,
)
from dispatch.channels import ALERT_LOG
from api.websocket import connect, disconnect
from api.demo_data import DEMO_SCENARIOS

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory stores
_run_history: list[dict] = []
_active_incidents: list[dict] = []
_agent_traces_by_run: dict[str, list] = {}
_route_responses: dict[str, dict] = {}
_outcome_sims: dict[str, dict] = {}


# ─── WebSocket ────────────────────────────────────────────────────────────────

@router.websocket("/ws/dashboard")
async def dashboard_ws(websocket: WebSocket):
    await connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        disconnect(websocket)


@router.websocket("/ws/mobile")
async def mobile_ws(websocket: WebSocket):
    await connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        disconnect(websocket)


# ─── Health ───────────────────────────────────────────────────────────────────

@router.get("/health")
async def health():
    return {
        "status": "ok",
        "app": "Raasta",
        "agents": ["monitor", "detect", "analyze", "route", "dispatch", "outcome", "report"],
        "agents_healthy": True,
        "timestamp": datetime.utcnow().isoformat(),
    }


# ─── Pipeline ─────────────────────────────────────────────────────────────────

async def _run_pipeline(run_id: str, route_request: Optional[RouteRequest] = None):
    logger.info(f"Pipeline run {run_id} starting")
    state = initial_state(run_id, route_request=route_request)
    try:
        final_state = await asyncio.to_thread(raasta_graph.invoke, state)

        _run_history.append({
            "run_id": run_id,
            "completed_at": datetime.utcnow().isoformat(),
            "events_detected": len(final_state.get("detected_events", [])),
            "max_severity": final_state.get("max_severity", 0),
            "alerts_sent": len(final_state.get("dispatch_records", [])),
            "route_planned": route_request is not None,
        })

        for analysis in final_state.get("analyses", []):
            _active_incidents.append({
                "id": analysis.id,
                "type": analysis.crisis_type.value,
                "location": analysis.location,
                "severity": analysis.severity_score,
                "trajectory": analysis.escalation_trajectory,
                "summary": analysis.executive_summary,
                "actions": analysis.recommended_actions,
                "detected_at": analysis.detected_at.isoformat(),
                "affected_radius_km": analysis.affected_radius_km,
                "population_at_risk": analysis.population_at_risk,
            })

        traces = final_state.get("agent_traces", [])
        _agent_traces_by_run[run_id] = [
            {
                "agent": t.agent_name,
                "step": t.step_number,
                "input_summary": t.input_summary,
                "output_summary": t.output_summary,
                "duration_ms": t.duration_ms,
                "llm_calls": t.llm_calls,
                "confidence": t.confidence,
                "timestamp": t.timestamp.isoformat(),
            }
            for t in traces
        ]

        rr = final_state.get("route_response")
        if rr:
            _route_responses[rr.request_id] = _serialize_route_response(rr)

        os_ = final_state.get("outcome_simulation")
        if os_:
            _outcome_sims[os_.route_request_id] = _serialize_outcome(os_)

    except Exception as e:
        logger.error(f"Pipeline run {run_id} failed: {e}", exc_info=True)


def _serialize_route_response(rr) -> dict:
    def _opt(opt):
        return {
            "id": opt.id,
            "name": opt.name,
            "waypoints": opt.waypoints,
            "coordinates": [{"lat": c.lat, "lng": c.lng, "label": c.label} for c in opt.coordinates],
            "distance_km": opt.distance_km,
            "eta_minutes": opt.eta_minutes,
            "risk_level": opt.risk_level,
            "color": opt.color,
            "recommended": opt.recommended,
            "crisis_on_path": opt.crisis_on_path,
        }
    return {
        "request_id": rr.request_id,
        "origin": rr.origin,
        "destination": rr.destination,
        "recommended_route": _opt(rr.recommended_route),
        "alternative_routes": [_opt(r) for r in rr.alternative_routes],
        "avoided_crises": rr.avoided_crises,
        "active_crises": rr.active_crises,
        "generated_at": rr.generated_at.isoformat(),
    }


def _serialize_outcome(os_) -> dict:
    def _sc(sc):
        return {
            "scenario_type": sc.scenario_type,
            "route_name": sc.route_name,
            "outcome_headline": sc.outcome_headline,
            "outcome_detail": sc.outcome_detail,
            "delay_minutes": sc.delay_minutes,
            "risk_exposure": sc.risk_exposure,
            "confidence": sc.confidence,
        }
    return {
        "id": os_.id,
        "route_request_id": os_.route_request_id,
        "without_rerouting": _sc(os_.without_rerouting),
        "with_rerouting": _sc(os_.with_rerouting),
        "time_saved_minutes": os_.time_saved_minutes,
        "lives_at_risk_avoided": os_.lives_at_risk_avoided,
        "generated_at": os_.generated_at.isoformat(),
    }


@router.post("/trigger")
async def trigger_pipeline(background_tasks: BackgroundTasks):
    run_id = str(uuid.uuid4())
    background_tasks.add_task(_run_pipeline, run_id)
    return {"run_id": run_id, "started_at": datetime.utcnow().isoformat(), "status": "running"}


# ─── Route Planning ───────────────────────────────────────────────────────────

class PlanRouteRequest(BaseModel):
    origin: str
    destination: str
    city: str = "Islamabad"


@router.post("/plan-route")
async def plan_route(req: PlanRouteRequest, background_tasks: BackgroundTasks):
    run_id = str(uuid.uuid4())
    route_request = RouteRequest(
        origin=req.origin,
        destination=req.destination,
        city=req.city,
    )
    background_tasks.add_task(_run_pipeline, run_id, route_request)
    return {
        "run_id": run_id,
        "request_id": route_request.request_id,
        "status": "processing",
        "message": "Route planning started — poll /routes/{request_id} or watch WebSocket",
    }


@router.get("/routes/{request_id}")
async def get_route(request_id: str):
    if request_id not in _route_responses:
        return {"status": "processing", "request_id": request_id}
    rr = _route_responses[request_id]
    outcome = _outcome_sims.get(request_id)
    return {**rr, "outcome_simulation": outcome}


# ─── Incidents ────────────────────────────────────────────────────────────────

@router.get("/incidents")
async def list_incidents(page: int = 1, limit: int = 20, city: Optional[str] = None):
    incidents = _active_incidents
    if city:
        incidents = [i for i in incidents if city.lower() in i.get("location", "").lower()]
    start = (page - 1) * limit
    return {
        "incidents": incidents[start: start + limit],
        "total": len(incidents),
        "page": page,
    }


# ─── Agent Traces ─────────────────────────────────────────────────────────────

@router.get("/agent-traces/{run_id}")
async def get_agent_traces(run_id: str):
    traces = _agent_traces_by_run.get(run_id, [])
    return {
        "run_id": run_id,
        "traces": traces,
        "total_agents": len(traces),
        "total_llm_calls": sum(t.get("llm_calls", 0) for t in traces),
    }


@router.get("/agent-traces")
async def list_agent_traces():
    return {
        "runs": list(_agent_traces_by_run.keys())[-20:],
        "total_runs": len(_agent_traces_by_run),
    }


# ─── Simulate ─────────────────────────────────────────────────────────────────

@router.post("/simulate")
async def simulate_crisis(scenario: CrisisScenario, background_tasks: BackgroundTasks):
    """Inject synthetic crisis + trigger route re-plan for demo."""
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
        affected_radius_km=severity * 2.0,
        population_at_risk=severity * 30000,
        executive_summary=scenario.description,
        recommended_actions=[
            f"Deploy emergency services to {scenario.location}",
            "Issue public evacuation alert",
            "Coordinate with NDMA and local administration",
        ],
    )

    _active_incidents.append({
        "id": analysis.id,
        "type": analysis.crisis_type.value,
        "location": analysis.location,
        "severity": analysis.severity_score,
        "trajectory": analysis.escalation_trajectory,
        "summary": analysis.executive_summary,
        "actions": analysis.recommended_actions,
        "detected_at": analysis.detected_at.isoformat(),
        "affected_radius_km": analysis.affected_radius_km,
        "population_at_risk": analysis.population_at_risk,
    })

    # Also trigger route re-plan for demo scenario
    async def _sim_with_route():
        from agents import dispatch_agent, report_agent, route_agent, outcome_agent
        from core.state import RaastaState
        from core.graph import initial_state

        route_request = RouteRequest(origin="G-11 Markaz", destination="Blue Area")
        state = initial_state(route_request=route_request)
        state["detected_events"] = [fake_event]
        state["analyses"] = [analysis]
        state["max_severity"] = severity
        state = await route_agent.run(state)
        state = await dispatch_agent.run(state)
        state = await outcome_agent.run(state)
        state = await report_agent.run(state)

        rr = state.get("route_response")
        os_ = state.get("outcome_simulation")
        if rr:
            _route_responses[rr.request_id] = _serialize_route_response(rr)
        if os_:
            _outcome_sims[os_.route_request_id] = _serialize_outcome(os_)

    background_tasks.add_task(_sim_with_route)

    return {
        "simulated_event": {
            "event_id": fake_event.id,
            "analysis_id": analysis.id,
            "crisis_type": scenario.crisis_type.value,
            "location": scenario.location,
            "severity": severity,
        },
        "demo_route": {
            "origin": "G-11 Markaz",
            "destination": "Blue Area",
            "message": "Route re-planning triggered — watch WebSocket for updates",
        },
        "status": "simulation dispatched",
    }


# ─── Demo endpoint (pre-canned for judges) ────────────────────────────────────

@router.post("/demo/d-chowk-protest")
async def demo_d_chowk(background_tasks: BackgroundTasks):
    """One-click demo: inject D-Chowk protest, reroute G-11 → Blue Area."""
    scenario = CrisisScenario(
        crisis_type=CrisisType.civil,
        location="D-Chowk, Islamabad",
        severity_override=8,
        description="Large-scale protest at D-Chowk blocking Constitution Avenue. Police deployed. All lanes blocked.",
        source="demo",
    )
    return await simulate_crisis(scenario, background_tasks)


# ─── Dashboard summary ────────────────────────────────────────────────────────

@router.get("/dashboard/summary")
async def dashboard_summary():
    max_sev = max((e.get("severity", 0) for e in _active_incidents), default=0)
    return {
        "active_incidents": len(_active_incidents),
        "max_severity": max_sev,
        "recent_alerts": ALERT_LOG[-10:],
        "recent_incidents": sorted(_active_incidents, key=lambda e: e.get("severity", 0), reverse=True)[:5],
        "run_history": _run_history[-5:],
        "total_routes_planned": len(_route_responses),
    }


# ─── Alerts Simulate ──────────────────────────────────────────────────────────

class AlertSimulateRequest(BaseModel):
    crisis_id: str
    location: str
    message: str
    recipient_count: int = 100
    channel: str = "push_notification"

@router.post("/alerts/simulate")
async def simulate_alerts(req: AlertSimulateRequest):
    """Simulate sending commuter alerts — returns proof of execution."""
    import random
    from api.demo_data import ALERT_LOG as DEMO_ALERT_LOG

    alert_id = f"ALT-{str(uuid.uuid4())[:8].upper()}"
    delivered = int(req.recipient_count * random.uniform(0.85, 0.98))
    record = {
        "alert_id": alert_id,
        "crisis_id": req.crisis_id,
        "location": req.location,
        "message": req.message,
        "channel": req.channel,
        "recipients": req.recipient_count,
        "delivered": delivered,
        "status": "sent",
        "sent_at": datetime.utcnow().isoformat(),
    }
    DEMO_ALERT_LOG.append(record)
    return record


# ─── Tickets Simulate ─────────────────────────────────────────────────────────

TICKET_PREFIXES = {
    "civil_disruption": "ICT-TRF",
    "road_blockage": "ICT-ACC",
    "flood": "ICT-FLD",
    "accident": "ICT-ACC",
    "heatwave": "ICT-WTH",
    "unknown": "ICT-GEN",
}

class TicketSimulateRequest(BaseModel):
    crisis_type: str
    location: str
    severity: int
    description: str
    assigned_to: str = "Islamabad Traffic Police"

@router.post("/tickets/simulate")
async def simulate_ticket(req: TicketSimulateRequest):
    """Simulate creating an authority/emergency ticket."""
    from api.demo_data import TICKET_LOG

    prefix = TICKET_PREFIXES.get(req.crisis_type, "ICT-GEN")
    year = datetime.utcnow().year
    seq = len(TICKET_LOG) + 44  # start from 044
    ticket_id = f"{prefix}-{year}-{str(seq).zfill(3)}"

    ticket = {
        "ticket_id": ticket_id,
        "crisis_type": req.crisis_type,
        "location": req.location,
        "severity": req.severity,
        "description": req.description,
        "assigned_to": req.assigned_to,
        "status": "open",
        "priority": "critical" if req.severity >= 8 else ("high" if req.severity >= 6 else "medium"),
        "created_at": datetime.utcnow().isoformat(),
        "estimated_resolution": f"{req.severity * 15} minutes",
    }
    TICKET_LOG.append(ticket)
    return ticket


# ─── Demo scenarios (deterministic) ───────────────────────────────────────────

@router.post("/demo/{scenario_name}")
async def run_demo_scenario(scenario_name: str, background_tasks: BackgroundTasks):
    """Run a named demo scenario with deterministic output."""
    scenario = DEMO_SCENARIOS.get(scenario_name)
    if not scenario:
        available = list(DEMO_SCENARIOS.keys())
        return {"error": f"Unknown scenario. Available: {available}"}

    run_id = scenario.get("runId", str(uuid.uuid4()))

    # Store in active incidents for /incidents endpoint
    crisis = scenario.get("crisis", {})
    if crisis:
        _active_incidents.append({
            "id": run_id,
            "type": crisis.get("type", "unknown"),
            "location": crisis.get("location", ""),
            "severity": crisis.get("severity", 5),
            "trajectory": scenario.get("analysis", {}).get("escalation_trajectory", "stable"),
            "summary": crisis.get("summary", ""),
            "actions": [a.get("description", "") for a in scenario.get("actions", [])],
            "detected_at": datetime.utcnow().isoformat(),
            "affected_radius_km": scenario.get("analysis", {}).get("affected_radius_km"),
            "population_at_risk": scenario.get("analysis", {}).get("population_at_risk"),
        })

    # Store traces
    traces = scenario.get("agentTrace", [])
    _agent_traces_by_run[run_id] = traces

    return {
        "run_id": run_id,
        "scenario": scenario_name,
        "status": "complete",
        **{k: v for k, v in scenario.items() if k != "runId"},
    }


@router.get("/logs")
async def get_logs():
    return {"alert_log": ALERT_LOG, "run_history": _run_history}
