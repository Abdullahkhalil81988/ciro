"""Seed data and deterministic demo scenarios for Raasta."""
from datetime import datetime
import uuid

DEMO_SCENARIOS = {
    "d-chowk-protest": {
        "runId": "raasta-demo-001",
        "inputSignals": [
            "D Chowk pe containers lage hain, traffic band hai",
            "Heavy congestion reported near Red Zone",
            "Political gathering expected near D-Chowk",
            "Normal weather in Islamabad",
        ],
        "crisis": {
            "type": "civil_disruption",
            "location": "D-Chowk, Islamabad",
            "severity": 8,
            "confidence": 0.91,
            "summary": "Political blockage and container placement detected near D-Chowk. Constitution Avenue fully blocked.",
            "detected_at": datetime.utcnow().isoformat(),
        },
        "analysis": {
            "severity_score": 8,
            "escalation_trajectory": "worsening",
            "affected_radius_km": 2.5,
            "population_at_risk": 85000,
            "response_tier": 2,
            "executive_summary": "High-severity civil disruption at D-Chowk. Constitution Avenue and adjacent roads blocked. Immediate rerouting required for all commuters heading to Blue Area / F-6.",
        },
        "routePlan": {
            "from": "G-11 Islamabad",
            "to": "Blue Area Islamabad",
            "originalRisk": 82,
            "newRisk": 29,
            "delayAvoidedMinutes": 18,
            "originalRoute": {
                "name": "Via Jinnah Avenue (BLOCKED)",
                "waypoints": ["G-11", "G-10", "Jinnah Ave", "D-Chowk", "Blue Area"],
                "eta_minutes": 18,
                "distance_km": 8.2,
                "risk_level": "blocked",
            },
            "safeRoute": {
                "name": "Via Kashmir Highway (RAASTA RECOMMENDED)",
                "waypoints": ["G-11", "Zero Point", "Kashmir Highway", "F-6", "Blue Area"],
                "eta_minutes": 22,
                "distance_km": 11.4,
                "risk_level": "safe",
            },
            "recommendation": "Avoid D-Chowk. Take Kashmir Highway → 7th Avenue approach to Blue Area.",
        },
        "actions": [
            {"type": "commuter_alert", "description": "Commuter alert generated", "status": "sent", "recipients": 124},
            {"type": "authority_ticket", "description": "Traffic authority ticket created", "ticketId": "ICT-TRF-2026-044", "status": "created"},
            {"type": "route_update", "description": "Alternate route published to map layer", "status": "published"},
            {"type": "user_notification", "description": "124 nearby users notified", "status": "delivered"},
        ],
        "outcome": {
            "riskReduction": 53,
            "delayAvoidedMinutes": 18,
            "usersAlerted": 124,
            "ticketId": "ICT-TRF-2026-044",
            "ticketStatus": "open",
            "systemStateChanged": True,
            "summary": "Risk reduced from 82 to 29 (53 points). 18 minutes of delay avoided. 124 simulated commuters rerouted.",
        },
        "agentTrace": [
            {"agent": "Signal Monitor", "step": 1, "status": "complete", "detail": "4 signals ingested. 3 crisis-relevant. Urdu/Roman-Urdu normalized.", "duration_ms": 312, "llm_calls": 0},
            {"agent": "Crisis Detection", "step": 2, "status": "complete", "detail": "Civil disruption at D-Chowk. Type: civil_disruption. Confidence: 0.91", "duration_ms": 847, "llm_calls": 1},
            {"agent": "Severity Analysis", "step": 3, "status": "complete", "detail": "Severity 8/10. Worsening trajectory. 85K population at risk.", "duration_ms": 623, "llm_calls": 1},
            {"agent": "Route Planner", "step": 4, "status": "complete", "detail": "Safer route via Kashmir Highway. Original risk 82 → new risk 29.", "duration_ms": 934, "llm_calls": 1},
            {"agent": "Dispatch Agent", "step": 5, "status": "complete", "detail": "124 users alerted. Ticket ICT-TRF-2026-044 created.", "duration_ms": 445, "llm_calls": 0},
            {"agent": "Outcome Agent", "step": 6, "status": "complete", "detail": "Risk reduced by 53 pts. 18 min delay avoided. System state updated.", "duration_ms": 712, "llm_calls": 1},
            {"agent": "Report Agent", "step": 7, "status": "complete", "detail": "Situation report generated. WebSocket broadcast sent.", "duration_ms": 543, "llm_calls": 1},
        ],
    },
    "lahore-protest": {
        "runId": f"raasta-lahore-{uuid.uuid4().hex[:6]}",
        "crisis": {"type": "civil_disruption", "location": "Mall Road, Lahore", "severity": 5, "confidence": 0.72,
                   "summary": "Protest march on Mall Road. Partial road closure affecting Liberty to GPO stretch."},
        "routePlan": {"from": "DHA Lahore", "to": "Gulberg Lahore", "originalRisk": 55, "newRisk": 22,
                      "delayAvoidedMinutes": 12, "recommendation": "Use MM Alam Road via Jail Road instead of Mall Road."},
        "outcome": {"riskReduction": 33, "delayAvoidedMinutes": 12, "usersAlerted": 67, "ticketId": "LHR-TRF-2026-112"},
    },
    "karachi-flood": {
        "runId": f"raasta-khi-{uuid.uuid4().hex[:6]}",
        "crisis": {"type": "flood", "location": "Korangi, Karachi", "severity": 7, "confidence": 0.85,
                   "summary": "Urban flooding in Korangi industrial area after 40mm rainfall. Multiple roads submerged."},
        "routePlan": {"from": "Clifton Karachi", "to": "Korangi Industrial Area", "originalRisk": 78, "newRisk": 35,
                      "delayAvoidedMinutes": 25, "recommendation": "Use Shahrah-e-Faisal → National Highway instead of Korangi Road."},
        "outcome": {"riskReduction": 43, "delayAvoidedMinutes": 25, "usersAlerted": 203, "ticketId": "KHI-FLD-2026-089"},
    },
    "rawalpindi-accident": {
        "runId": f"raasta-rwp-{uuid.uuid4().hex[:6]}",
        "crisis": {"type": "road_blockage", "location": "GT Road, Rawalpindi", "severity": 6, "confidence": 0.78,
                   "summary": "Multi-vehicle accident near Faizabad interchange. Two lanes blocked, recovery operation ongoing."},
        "routePlan": {"from": "Saddar Rawalpindi", "to": "Islamabad", "originalRisk": 65, "newRisk": 28,
                      "delayAvoidedMinutes": 15, "recommendation": "Use Murree Road → Kashmir Highway instead of GT Road."},
        "outcome": {"riskReduction": 37, "delayAvoidedMinutes": 15, "usersAlerted": 89, "ticketId": "RWP-ACC-2026-034"},
    },
}

# In-memory alert log
ALERT_LOG: list[dict] = []
TICKET_LOG: list[dict] = []
