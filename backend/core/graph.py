"""LangGraph state machine — wires all 5 agents."""
import uuid
from datetime import datetime

from langgraph.graph import StateGraph, END

from .state import CIROState
from agents import monitor_agent, detection_agent, analysis_agent, dispatch_agent, report_agent


def _should_analyze(state: CIROState) -> str:
    if state.get("detection_skipped") or not state.get("detected_events"):
        return END
    return "analyze"


def build_graph() -> StateGraph:
    graph = StateGraph(CIROState)

    graph.add_node("monitor", monitor_agent.run)
    graph.add_node("detect", detection_agent.run)
    graph.add_node("analyze", analysis_agent.run)
    graph.add_node("dispatch", dispatch_agent.run)
    graph.add_node("report", report_agent.run)

    graph.add_edge("monitor", "detect")
    graph.add_conditional_edges("detect", _should_analyze, {"analyze": "analyze", END: END})
    graph.add_edge("analyze", "dispatch")
    graph.add_edge("dispatch", "report")
    graph.add_edge("report", END)

    graph.set_entry_point("monitor")
    return graph.compile()


def initial_state(run_id: str | None = None) -> CIROState:
    return CIROState(
        trigger_time=datetime.utcnow(),
        raw_candidates=[],
        detected_events=[],
        detection_skipped=False,
        analyses=[],
        max_severity=0,
        dispatch_records=[],
        dispatch_errors=[],
        situation_reports=[],
        run_complete=False,
        run_id=run_id or str(uuid.uuid4()),
    )


# Compiled graph singleton
ciro_graph = build_graph()
