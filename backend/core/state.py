from typing import TypedDict, List, Optional
from datetime import datetime
from .models import (
    CrisisCandidate, CrisisEvent, CrisisAnalysis,
    DispatchRecord, SituationReport,
    RouteRequest, RouteResponse, OutcomeSimulation, AgentTrace,
)


class RaastaState(TypedDict):
    # Run metadata
    run_id: str
    trigger_time: datetime

    # Monitor output
    raw_candidates: List[CrisisCandidate]

    # Detection output
    detected_events: List[CrisisEvent]
    detection_skipped: bool

    # Analysis output
    analyses: List[CrisisAnalysis]
    max_severity: int

    # Route planning
    route_request: Optional[RouteRequest]
    route_response: Optional[RouteResponse]

    # Dispatch output
    dispatch_records: List[DispatchRecord]
    dispatch_errors: List[str]

    # Outcome simulation
    outcome_simulation: Optional[OutcomeSimulation]

    # Report output
    situation_reports: List[SituationReport]
    run_complete: bool

    # Tracing
    agent_traces: List[AgentTrace]


# Backward-compat alias
CIROState = RaastaState
