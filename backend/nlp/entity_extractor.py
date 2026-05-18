"""Location + crisis entity extraction.

Strategy (fastest → slowest, stops at first hit):
  1. Pakistan gazetteer exact-match (zero cost, handles sectors like G-10)
  2. spaCy NER GPE/LOC entities → gazetteer lookup
  3. Regex sector pattern (G-\d+, F-\d+, I-\d+, DHA, etc.)
  4. Fallback: return hint or 'Pakistan (national)'
"""
import json
import logging
import re
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# ── Gazetteer ──────────────────────────────────────────────────────────────────
_GAZETTEER_PATH = Path(__file__).parent / "pk_gazetteer.json"
with _GAZETTEER_PATH.open() as _f:
    _GAZETTEER: dict[str, str] = json.load(_f)

# ── spaCy (optional — graceful fallback if not installed) ──────────────────────
try:
    import spacy
    _nlp = spacy.load("en_core_web_sm", disable=["parser", "lemmatizer"])
    _SPACY_AVAILABLE = True
    logger.info("spaCy NER loaded (en_core_web_sm)")
except Exception:
    _nlp = None
    _SPACY_AVAILABLE = False
    logger.warning("spaCy not available — using gazetteer + regex only")

# ── Sector regex (e.g. G-10, F-7, I-9) ────────────────────────────────────────
_SECTOR_RE = re.compile(r"\b([GFIEHDJ]-\d{1,2})\b", re.IGNORECASE)


def _gazetteer_lookup(text: str) -> Optional[str]:
    text_lower = text.lower()
    # Longer keys first to avoid partial matches
    for key in sorted(_GAZETTEER, key=len, reverse=True):
        if key in text_lower:
            return _GAZETTEER[key]
    return None


def _spacy_ner(text: str) -> Optional[str]:
    if not _SPACY_AVAILABLE or _nlp is None:
        return None
    doc = _nlp(text[:500])  # cap to keep it fast
    for ent in doc.ents:
        if ent.label_ in ("GPE", "LOC"):
            candidate = ent.text.lower().strip()
            if candidate in _GAZETTEER:
                return _GAZETTEER[candidate]
            # Partial match — check if any gazetteer key starts with the entity
            for key, city in _GAZETTEER.items():
                if key.startswith(candidate) or candidate.startswith(key):
                    return city
    return None


def _sector_regex(text: str) -> Optional[str]:
    match = _SECTOR_RE.search(text)
    if match:
        sector = match.group(1).upper()
        key = sector.lower()
        if key in _GAZETTEER:
            return _GAZETTEER[key]
        # G/F/I/E/H sectors are Islamabad; D/J are often Karachi
        first_letter = sector[0]
        if first_letter in ("G", "F", "I", "E", "H"):
            return "Islamabad"
        if first_letter in ("D", "J"):
            return "Karachi"
    return None


def extract_location(text: str, hint: Optional[str] = None) -> str:
    """Return the best-guess Pakistani city/region for the given text."""
    full_text = f"{text} {hint or ''}"

    location = (
        _gazetteer_lookup(full_text)
        or _spacy_ner(full_text)
        or _sector_regex(full_text)
        or (hint.strip() if hint else None)
    )
    return location or "Pakistan (national)"
