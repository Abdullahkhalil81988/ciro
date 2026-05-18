from typing import TypedDict, List, Optional
from datetime import datetime
from .models import (
    CrisisCandidate, CrisisEvent, CrisisAnalysis,
    DispatchRecord, SituationReport
)


class CIROState(TypedDict):
    # Input
    trigger_time: datetime
    raw_candidates: List[CrisisCandidate]

    # After Detection
    detected_events: List[CrisisEvent]
    detection_skipped: bool

    # After Analysis
    analyses: List[CrisisAnalysis]
    max_severity: int

    # After Dispatch
    dispatch_records: List[DispatchRecord]
    dispatch_errors: List[str]

    # After Report
    situation_reports: List[SituationReport]
    run_complete: bool
    run_id: str
