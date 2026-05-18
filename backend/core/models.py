from pydantic import BaseModel, Field
from typing import Optional, List, Tuple
from datetime import datetime
from enum import Enum
import uuid


class CrisisType(str, Enum):
    flood = "flood"
    fire = "fire"
    cyber = "cyber"
    civil = "civil"
    medical = "medical"
    industrial = "industrial"
    heatwave = "heatwave"
    road_blockage = "road_blockage"
    unknown = "unknown"


class SeverityLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class ResponseTier(int, Enum):
    local = 1
    regional = 2
    national = 3


# ─── Ingestion ────────────────────────────────────────────────────────────────

class CrisisCandidate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source: str
    raw_text: str
    url: Optional[str] = None
    location_hint: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    language: str = "en"


# ─── Detection ────────────────────────────────────────────────────────────────

class DetectionResult(BaseModel):
    p_crisis: float
    crisis_type: str
    location: Optional[str] = None
    severity_hint: SeverityLevel = SeverityLevel.medium
    confidence: float = 0.5


class CrisisEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    candidate_id: str
    crisis_type: CrisisType
    location: str
    p_crisis: float
    severity_hint: SeverityLevel
    detected_at: datetime = Field(default_factory=datetime.utcnow)
    raw_sources: List[str] = []


# ─── Analysis ─────────────────────────────────────────────────────────────────

class CrisisAnalysis(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    crisis_type: CrisisType
    location: str
    severity_score: int
    escalation_trajectory: str
    recommended_response_tier: ResponseTier
    affected_radius_km: Optional[float] = None
    population_at_risk: Optional[int] = None
    executive_summary: str = ""
    recommended_actions: List[str] = []
    detected_at: datetime = Field(default_factory=datetime.utcnow)
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)


# ─── Dispatch ─────────────────────────────────────────────────────────────────

class DispatchRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    analysis_id: str
    team_name: str
    channel: str
    status: str = "pending"
    sent_at: Optional[datetime] = None
    error: Optional[str] = None
    message_preview: str = ""


# ─── Report ───────────────────────────────────────────────────────────────────

class SituationReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    analysis_id: str
    report_text: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    pdf_url: Optional[str] = None


# ─── Route Planning ───────────────────────────────────────────────────────────

class RouteRequest(BaseModel):
    origin: str
    destination: str
    city: str = "Islamabad"
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))


class RouteCoordinate(BaseModel):
    lat: float
    lng: float
    label: Optional[str] = None


class RouteOption(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    waypoints: List[str]
    coordinates: List[RouteCoordinate]
    distance_km: float
    eta_minutes: int
    risk_level: str  # 'safe' | 'caution' | 'blocked'
    crisis_on_path: List[str] = []
    recommended: bool = False
    color: str = "#22c55e"  # green=safe, yellow=caution, red=blocked


class RouteResponse(BaseModel):
    request_id: str
    origin: str
    destination: str
    recommended_route: RouteOption
    alternative_routes: List[RouteOption] = []
    avoided_crises: List[str] = []
    active_crises: List[str] = []
    generated_at: datetime = Field(default_factory=datetime.utcnow)


# ─── Outcome Simulation ───────────────────────────────────────────────────────

class OutcomeScenario(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    scenario_type: str  # 'without_rerouting' | 'with_rerouting'
    route_name: str
    outcome_headline: str
    outcome_detail: str
    delay_minutes: int
    risk_exposure: str  # 'none' | 'low' | 'medium' | 'high' | 'critical'
    confidence: float


class OutcomeSimulation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    route_request_id: str
    without_rerouting: OutcomeScenario
    with_rerouting: OutcomeScenario
    time_saved_minutes: int
    lives_at_risk_avoided: int
    generated_at: datetime = Field(default_factory=datetime.utcnow)


# ─── Agent Trace ──────────────────────────────────────────────────────────────

class AgentTrace(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    run_id: str
    agent_name: str
    step_number: int
    input_summary: str
    output_summary: str
    duration_ms: int
    llm_calls: int = 0
    confidence: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ─── Simulation input ─────────────────────────────────────────────────────────

class CrisisScenario(BaseModel):
    crisis_type: CrisisType
    location: str
    severity_override: Optional[int] = None
    description: str
    source: str = "simulation"


# ─── WebSocket message types ──────────────────────────────────────────────────

class WSMessage(BaseModel):
    event_type: str
    data: dict
