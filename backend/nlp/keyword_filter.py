"""Stage 1 — keyword pre-filter (zero LLM cost)."""

CRISIS_KEYWORDS: dict[str, float] = {
    # Tier 1 — strong signals
    "flood": 0.4, "earthquake": 0.4, "explosion": 0.4,
    "blast": 0.4, "outbreak": 0.4, "evacuate": 0.4,
    "tsunami": 0.4, "tornado": 0.4, "wildfire": 0.4,
    # Urdu/Roman-Urdu transliterations
    "sailab": 0.4, "zorlzla": 0.4, "dhmaaka": 0.4,
    "pani bhar": 0.35, "baarish": 0.2,
    # Tier 2 — moderate
    "emergency": 0.2, "disaster": 0.2, "attack": 0.2,
    "injured": 0.2, "casualties": 0.2, "rescue": 0.2,
    "stranded": 0.2, "blocked": 0.2, "fire": 0.2,
    "heatwave": 0.2, "accident": 0.2, "collapse": 0.2,
    # Tier 3 — weak
    "warning": 0.1, "alert": 0.1, "risk": 0.1, "threat": 0.1,
    "damage": 0.1, "disruption": 0.1,
}


def keyword_score(text: str) -> float:
    text_lower = text.lower()
    score = sum(w for kw, w in CRISIS_KEYWORDS.items() if kw in text_lower)
    return min(score, 1.0)
