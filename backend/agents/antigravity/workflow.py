"""
Raasta Antigravity Workflow Definition
Google Antigravity Hackathon 2025 — Challenge 3

This module defines the tool-call interface that Antigravity orchestrates.
Each function is a discrete, observable tool call in the agent pipeline.
"""
import json
import re
from datetime import datetime
from typing import Optional

# ─── Tool: normalize_signals ──────────────────────────────────────────────────

def normalize_signals(raw_signals: list[str]) -> dict:
    """
    Tool: normalize_signals
    Normalizes mixed-language signals (Urdu, Roman-Urdu, English) into
    structured crisis indicators for downstream agents.
    """
    URDU_CRISIS_TERMS = {
        "containers lage": "road_blockage",
        "traffic band": "road_blockage",
        "dharna": "civil_disruption",
        "jaloos": "civil_disruption",
        "seilab": "flood",
        "pani bhar": "flood",
        "hadsa": "accident",
        "aag": "fire",
        "bheed": "crowd",
    }

    normalized = []
    for signal in raw_signals:
        lower = signal.lower()
        crisis_hint = "unknown"
        for term, crisis_type in URDU_CRISIS_TERMS.items():
            if term in lower:
                crisis_hint = crisis_type
                break

        normalized.append({
            "original": signal,
            "normalized": signal.strip(),
            "language": "ur" if any(c in signal for c in "ائپچجحخدذرزسشصضطظعغفقکگلمنوہی") else "en" if re.match(r'^[a-zA-Z\s,\.!]+$', signal) else "roman_ur",
            "crisis_hint": crisis_hint,
            "credibility": 0.7,
            "timestamp": datetime.utcnow().isoformat(),
        })

    return {
        "tool": "normalize_signals",
        "input_count": len(raw_signals),
        "output_count": len(normalized),
        "crisis_signals": [s for s in normalized if s["crisis_hint"] != "unknown"],
        "normalized_signals": normalized,
    }


# ─── Tool: classify_crisis ────────────────────────────────────────────────────

def classify_crisis(normalized_signals: list[dict]) -> dict:
    """
    Tool: classify_crisis
    Classifies the dominant crisis type from normalized signals.
    Uses frequency + credibility weighting.
    """
    type_weights: dict[str, float] = {}
    for sig in normalized_signals:
        hint = sig.get("crisis_hint", "unknown")
        cred = sig.get("credibility", 0.5)
        if hint != "unknown":
            type_weights[hint] = type_weights.get(hint, 0) + cred

    if not type_weights:
        return {"tool": "classify_crisis", "crisis_type": "unknown", "confidence": 0.0, "location": None}

    dominant = max(type_weights, key=lambda k: type_weights[k])
    total = sum(type_weights.values())
    confidence = round(type_weights[dominant] / total, 2) if total > 0 else 0.0

    # Location extraction from signals
    location = None
    location_patterns = [
        r"(?:near|at|in|pe|mein)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)",
        r"([A-Z]-\d+\s+\w+)",
        r"(D-Chowk|Blue Area|Jinnah Avenue|Kashmir Highway|F-\d+|G-\d+|Mall Road|GT Road|Korangi)",
    ]
    for sig in normalized_signals:
        for pattern in location_patterns:
            match = re.search(pattern, sig.get("original", ""), re.IGNORECASE)
            if match:
                location = match.group(1)
                break
        if location:
            break

    return {
        "tool": "classify_crisis",
        "crisis_type": dominant,
        "confidence": confidence,
        "location": location or "Islamabad",
        "type_distribution": type_weights,
        "signal_count": len(normalized_signals),
    }


# ─── Tool: score_severity ─────────────────────────────────────────────────────

def score_severity(crisis_type: str, confidence: float, signal_count: int, location: str) -> dict:
    """
    Tool: score_severity
    Scores crisis severity 1-10 using multi-factor weighted model.
    Factors: signal volume, confidence, location criticality, crisis type, time sensitivity.
    """
    BASE_SEVERITY = {
        "civil_disruption": 7, "road_blockage": 6, "flood": 7,
        "accident": 5, "fire": 8, "vip_movement": 4, "unknown": 3,
    }
    LOCATION_MULTIPLIERS = {
        "D-Chowk": 1.3, "Blue Area": 1.2, "Constitution Avenue": 1.3,
        "Red Zone": 1.4, "Mall Road": 1.1, "GT Road": 1.0,
        "Korangi": 0.9, "G-11": 0.85,
    }

    base = BASE_SEVERITY.get(crisis_type, 5)
    signal_boost = min(signal_count * 0.3, 1.5)
    conf_factor = confidence
    loc_mult = 1.0
    for key, mult in LOCATION_MULTIPLIERS.items():
        if key.lower() in location.lower():
            loc_mult = mult
            break

    raw = base * conf_factor * loc_mult + signal_boost
    severity = max(1, min(10, round(raw)))

    return {
        "tool": "score_severity",
        "severity": severity,
        "factors": {
            "base_type_severity": base,
            "signal_boost": round(signal_boost, 2),
            "confidence_factor": conf_factor,
            "location_multiplier": loc_mult,
        },
        "confidence": round(confidence * 0.95, 2),
        "trajectory": "worsening" if severity >= 7 else "stable",
        "response_tier": 3 if severity >= 8 else (2 if severity >= 5 else 1),
    }


# ─── Tool: generate_route_plan ────────────────────────────────────────────────

def generate_route_plan(origin: str, destination: str, crisis_location: str, severity: int) -> dict:
    """
    Tool: generate_route_plan
    Generates safe alternative route given a crisis zone.
    Uses hardcoded Islamabad road graph for demo reliability.
    """
    ROUTE_DB = {
        ("G-11 Islamabad", "Blue Area Islamabad"): {
            "original": {
                "name": "Via Jinnah Avenue",
                "waypoints": ["G-11", "G-10", "G-9", "Jinnah Ave", "D-Chowk", "Blue Area"],
                "distance_km": 8.2, "eta_minutes": 18,
                "passes_through": ["D-Chowk", "Constitution Avenue"],
            },
            "alternate": {
                "name": "Via Kashmir Highway",
                "waypoints": ["G-11", "Zero Point", "Kashmir Hwy", "F-6", "Blue Area"],
                "distance_km": 11.4, "eta_minutes": 22,
                "passes_through": ["Kashmir Highway", "7th Avenue"],
            },
        },
    }

    key = (origin, destination)
    routes = ROUTE_DB.get(key, ROUTE_DB[("G-11 Islamabad", "Blue Area Islamabad")])

    # Check if original route is affected
    original = routes["original"]
    is_blocked = any(wp.lower() in crisis_location.lower() or crisis_location.lower() in wp.lower()
                     for wp in original["passes_through"])

    original_risk = 70 + severity * 1.5 if is_blocked else 30 + severity * 0.5
    new_risk = max(15, original_risk - 45 - severity * 2)

    return {
        "tool": "generate_route_plan",
        "from": origin,
        "to": destination,
        "crisis_affects_original": is_blocked,
        "originalRoute": {**original, "risk_score": round(original_risk), "risk_level": "blocked" if is_blocked else "caution"},
        "safeRoute": {**routes["alternate"], "risk_score": round(new_risk), "risk_level": "safe"},
        "originalRisk": round(original_risk),
        "newRisk": round(new_risk),
        "delayAvoidedMinutes": abs(original["eta_minutes"] - routes["alternate"]["eta_minutes"]) + severity * 2,
        "recommendation": f"Avoid {crisis_location}. Take {routes['alternate']['name']}.",
    }


# ─── Tool: simulate_alerts ────────────────────────────────────────────────────

def simulate_alerts(location: str, user_count: int, message: str) -> dict:
    """
    Tool: simulate_alerts
    Simulates sending commuter notifications.
    Returns proof of action execution with delivery metrics.
    """
    import random
    delivered = int(user_count * random.uniform(0.88, 0.97))
    return {
        "tool": "simulate_alerts",
        "channel": "push_notification",
        "recipients_targeted": user_count,
        "recipients_delivered": delivered,
        "delivery_rate": round(delivered / user_count, 2),
        "message_preview": message[:100],
        "location": location,
        "status": "sent",
        "executed_at": datetime.utcnow().isoformat(),
    }


# ─── Tool: create_authority_ticket ────────────────────────────────────────────

_ticket_counter = 43

def create_authority_ticket(crisis_type: str, location: str, severity: int, description: str) -> dict:
    """
    Tool: create_authority_ticket
    Creates a simulated authority/emergency management ticket.
    """
    global _ticket_counter
    _ticket_counter += 1
    PREFIXES = {"civil_disruption": "ICT-TRF", "road_blockage": "ICT-ACC", "flood": "ICT-FLD"}
    prefix = PREFIXES.get(crisis_type, "ICT-GEN")
    ticket_id = f"{prefix}-{datetime.utcnow().year}-{str(_ticket_counter).zfill(3)}"
    return {
        "tool": "create_authority_ticket",
        "ticket_id": ticket_id,
        "crisis_type": crisis_type,
        "location": location,
        "severity": severity,
        "description": description,
        "assigned_to": "Islamabad Traffic Police Control Room",
        "status": "open",
        "priority": "critical" if severity >= 8 else ("high" if severity >= 6 else "medium"),
        "created_at": datetime.utcnow().isoformat(),
        "estimated_resolution_minutes": severity * 15,
    }


# ─── Tool: update_mock_map_state ──────────────────────────────────────────────

_map_state: dict = {"blocked_zones": [], "active_routes": []}

def update_mock_map_state(crisis_location: str, safe_route: dict) -> dict:
    """
    Tool: update_mock_map_state
    Updates the mock map layer with blocked zones and safe routes.
    """
    _map_state["blocked_zones"].append({
        "location": crisis_location,
        "radius_km": 0.5,
        "type": "crisis_zone",
        "added_at": datetime.utcnow().isoformat(),
    })
    _map_state["active_routes"].append({
        "route": safe_route.get("name", "Safe Route"),
        "waypoints": safe_route.get("waypoints", []),
        "risk_level": "safe",
        "published_at": datetime.utcnow().isoformat(),
    })
    return {
        "tool": "update_mock_map_state",
        "status": "updated",
        "blocked_zones_count": len(_map_state["blocked_zones"]),
        "active_safe_routes": len(_map_state["active_routes"]),
        "map_state": _map_state,
    }


# ─── Tool: generate_outcome_report ────────────────────────────────────────────

def generate_outcome_report(
    original_risk: int,
    new_risk: int,
    delay_avoided: int,
    users_alerted: int,
    ticket_id: str,
    crisis_summary: str,
) -> dict:
    """
    Tool: generate_outcome_report
    Generates a structured outcome report quantifying Raasta's impact.
    """
    return {
        "tool": "generate_outcome_report",
        "before": {"route_risk": original_risk, "estimated_delay_minutes": "unknown"},
        "after": {"route_risk": new_risk, "delay_avoided_minutes": delay_avoided},
        "impact": {
            "risk_reduction": original_risk - new_risk,
            "risk_reduction_pct": round((original_risk - new_risk) / original_risk * 100, 1),
            "delay_avoided_minutes": delay_avoided,
            "users_alerted": users_alerted,
            "authority_ticket": ticket_id,
            "system_state_changed": True,
        },
        "situation_summary": crisis_summary,
        "limitations": ["Simulated data", "No real government API integration", "Static road graph"],
        "generated_at": datetime.utcnow().isoformat(),
    }


# ─── Full pipeline runner ─────────────────────────────────────────────────────

def run_full_pipeline(
    raw_signals: list[str],
    origin: str = "G-11 Islamabad",
    destination: str = "Blue Area Islamabad",
) -> dict:
    """
    Runs the complete Raasta Antigravity pipeline end-to-end.
    Each step is a discrete tool call — observable and traceable.
    """
    trace = []

    # Step 1
    t1 = normalize_signals(raw_signals)
    trace.append({"step": 1, "tool": "normalize_signals", "output": t1})

    # Step 2
    t2 = classify_crisis(t1["crisis_signals"] or t1["normalized_signals"])
    trace.append({"step": 2, "tool": "classify_crisis", "output": t2})

    # Step 3
    t3 = score_severity(t2["crisis_type"], t2["confidence"], len(raw_signals), t2["location"] or "Islamabad")
    trace.append({"step": 3, "tool": "score_severity", "output": t3})

    # Step 4
    t4 = generate_route_plan(origin, destination, t2["location"] or "D-Chowk", t3["severity"])
    trace.append({"step": 4, "tool": "generate_route_plan", "output": t4})

    # Step 5a
    alert_msg = f"Crisis alert: {t2['crisis_type']} at {t2['location']}. {t4['recommendation']}"
    t5a = simulate_alerts(t2["location"] or "Islamabad", 124, alert_msg)
    trace.append({"step": 5, "tool": "simulate_alerts", "output": t5a})

    # Step 5b
    t5b = create_authority_ticket(t2["crisis_type"], t2["location"] or "Islamabad", t3["severity"], f"Crisis detected via Raasta pipeline.")
    trace.append({"step": 5, "tool": "create_authority_ticket", "output": t5b})

    # Step 6
    t6 = update_mock_map_state(t2["location"] or "Islamabad", t4["safeRoute"])
    trace.append({"step": 6, "tool": "update_mock_map_state", "output": t6})

    # Step 7
    t7 = generate_outcome_report(
        t4["originalRisk"], t4["newRisk"], t4["delayAvoidedMinutes"],
        t5a["recipients_delivered"], t5b["ticket_id"],
        f"{t2['crisis_type']} at {t2['location']}, severity {t3['severity']}/10."
    )
    trace.append({"step": 7, "tool": "generate_outcome_report", "output": t7})

    return {
        "pipeline": "raasta_antigravity",
        "tool_trace": trace,
        "summary": {
            "crisis_type": t2["crisis_type"],
            "location": t2["location"],
            "severity": t3["severity"],
            "confidence": t2["confidence"],
            "original_risk": t4["originalRisk"],
            "new_risk": t4["newRisk"],
            "delay_avoided": t4["delayAvoidedMinutes"],
            "users_alerted": t5a["recipients_delivered"],
            "ticket_id": t5b["ticket_id"],
        },
    }
