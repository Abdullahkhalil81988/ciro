"""LangGraph state machine — 7-agent Raasta pipeline."""
import time
import uuid
from datetime import datetime

from langgraph.graph import StateGraph, END

from .state import RaastaState
from agents import (
    monitor_agent, detection_agent, analysis_agent,
    dispatch_agent, report_agent,
)
from agents import route_agent, outcome_agent

# ─── Agent trace helpers ──────────────────────────────────────────────────────

def _traced(agent_module, agent_name: str, step: int):
    """Wraps an agent run() to add timing trace."""
    async def _wrapper(state: RaastaState) -> RaastaState:
        from core.models import AgentTrace
        t0 = time.time()
        state = await agent_module.run(state)
        duration_ms = int((time.time() - t0) * 1000)
        traces = state.get("agent_traces", [])
        # Only add trace if agent didn't add its own
        agent_names = {t.agent_name for t in traces}
        if agent_name not in agent_names:
            traces.append(AgentTrace(
                run_id=state["run_id"],
                agent_name=agent_name,
                step_number=step,
                input_summary=f"Step {step}",
                output_summary="Completed",
                duration_ms=duration_ms,
            ))
            state["agent_traces"] = traces
        return state
    return _wrapper


# ─── Conditional edges ────────────────────────────────────────────────────────

def _should_analyze(state: RaastaState) -> str:
    if state.get("detection_skipped") or not state.get("detected_events"):
        return "route"
    return "analyze"


def _should_route(state: RaastaState) -> str:
    if state.get("route_request"):
        return "route"
    return "dispatch"


# ─── Graph construction ───────────────────────────────────────────────────────

def build_graph() -> StateGraph:
    graph = StateGraph(RaastaState)

    graph.add_node("monitor",  _traced(monitor_agent,    "monitor_agent",    1))
    graph.add_node("detect",   _traced(detection_agent,  "detection_agent",  2))
    graph.add_node("analyze",  _traced(analysis_agent,   "analysis_agent",   3))
    graph.add_node("route",    _traced(route_agent,      "route_agent",      4))
    graph.add_node("dispatch", _traced(dispatch_agent,   "dispatch_agent",   5))
    graph.add_node("outcome",  _traced(outcome_agent,    "outcome_agent",    6))
    graph.add_node("report",   _traced(report_agent,     "report_agent",     7))

    graph.add_edge("monitor", "detect")
    graph.add_conditional_edges(
        "detect",
        _should_analyze,
        {"analyze": "analyze", "route": "route"},
    )
    graph.add_edge("analyze", "route")
    graph.add_edge("route", "dispatch")
    graph.add_edge("dispatch", "outcome")
    graph.add_edge("outcome", "report")
    graph.add_edge("report", END)

    graph.set_entry_point("monitor")
    return graph.compile()


def initial_state(run_id: str | None = None, route_request=None) -> RaastaState:
    return RaastaState(
        run_id=run_id or str(uuid.uuid4()),
        trigger_time=datetime.utcnow(),
        raw_candidates=[],
        detected_events=[],
        detection_skipped=False,
        analyses=[],
        max_severity=0,
        route_request=route_request,
        route_response=None,
        dispatch_records=[],
        dispatch_errors=[],
        outcome_simulation=None,
        situation_reports=[],
        run_complete=False,
        agent_traces=[],
    )


# Compiled graph singleton
raasta_graph = build_graph()
ciro_graph = raasta_graph  # backward-compat alias
