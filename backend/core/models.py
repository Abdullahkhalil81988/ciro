from pydantic import BaseModel, Field
from typing import Optional, List
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
    source: str  # 'twitter' | 'news' | 'weather' | 'simulation'
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
    severity_score: int  # 1-10
    escalation_trajectory: str  # 'stable' | 'worsening' | 'critical'
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
    channel: str  # 'slack' | 'email' | 'sms' | 'dashboard'
    status: str = "pending"  # 'sent' | 'failed' | 'pending'
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


# ─── Simulation input ─────────────────────────────────────────────────────────

class CrisisScenario(BaseModel):
    crisis_type: CrisisType
    location: str
    severity_override: Optional[int] = None  # 1-10
    description: str
    source: str = "simulation"


# ─── WebSocket message types ──────────────────────────────────────────────────

class WSMessage(BaseModel):
    event_type: str
    data: dict
