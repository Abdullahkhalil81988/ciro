"""Agent 1 — Monitor Agent
Polls news, social, weather sources every 30s and normalizes to CrisisCandidate.
"""
import asyncio
import logging
from datetime import datetime
from typing import List
import uuid

import httpx
import feedparser

from core.models import CrisisCandidate
from core.state import CIROState
from config import settings

logger = logging.getLogger(__name__)

RSS_FEEDS = [
    "https://www.dawn.com/feeds/home",
    "https://www.geo.tv/rss",
    "https://feeds.bbci.co.uk/news/world/rss.xml",
]

NEWSAPI_KEYWORDS = "flood OR earthquake OR fire OR blast OR attack OR disaster OR outbreak OR emergency"


async def _fetch_newsapi(client: httpx.AsyncClient) -> List[CrisisCandidate]:
    if not settings.newsapi_key:
        return []
    try:
        resp = await client.get(
            "https://newsapi.org/v2/everything",
            params={"q": NEWSAPI_KEYWORDS, "language": "en", "pageSize": 20, "apiKey": settings.newsapi_key},
            timeout=10,
        )
        articles = resp.json().get("articles", [])
        return [
            CrisisCandidate(
                source="news",
                raw_text=f"{a.get('title','')} {a.get('description','')}",
                url=a.get("url"),
                timestamp=datetime.utcnow(),
                language="en",
            )
            for a in articles if a.get("title")
        ]
    except Exception as e:
        logger.warning(f"NewsAPI fetch failed: {e}")
        return []


async def _fetch_rss() -> List[CrisisCandidate]:
    candidates = []
    for url in RSS_FEEDS:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:10]:
                candidates.append(
                    CrisisCandidate(
                        source="news",
                        raw_text=f"{entry.get('title','')} {entry.get('summary','')}",
                        url=entry.get("link"),
                        timestamp=datetime.utcnow(),
                        language="en",
                    )
                )
        except Exception as e:
            logger.warning(f"RSS feed {url} failed: {e}")
    return candidates


CITY_COORDS = {
    "Karachi":   (24.8607, 67.0011),
    "Lahore":    (31.5204, 74.3587),
    "Islamabad": (33.6844, 73.0479),
    "Peshawar":  (34.0151, 71.5249),
    "Quetta":    (30.1798, 66.9750),
    "Multan":    (30.1575, 71.5249),
}

async def _fetch_weather(client: httpx.AsyncClient) -> List[CrisisCandidate]:
    if not settings.google_weather_key:
        return []
    candidates = []
    for city, (lat, lng) in CITY_COORDS.items():
        try:
            resp = await client.get(
                "https://weather.googleapis.com/v1/currentConditions:lookup",
                params={"key": settings.google_weather_key,
                        "location.latitude": lat,
                        "location.longitude": lng},
                timeout=5,
            )
            data = resp.json()
            condition = data.get("weatherCondition", {}).get("description", {}).get("text", "")
            feels_like = data.get("feelsLikeTemperature", {}).get("degrees", 0)
            precipitation = data.get("precipitation", {}).get("probability", {}).get("percent", 0)

            extreme = any([
                precipitation > 70,
                feels_like > 45,
                any(w in condition.lower() for w in ["storm", "flood", "heavy rain", "tornado", "cyclone", "thunder"]),
            ])
            if extreme:
                candidates.append(
                    CrisisCandidate(
                        source="weather",
                        raw_text=f"Extreme weather alert in {city}: {condition}. "
                                 f"Feels like {feels_like}°C, precipitation probability {precipitation}%.",
                        location_hint=city,
                        timestamp=datetime.utcnow(),
                        language="en",
                    )
                )
        except Exception as e:
            logger.warning(f"Google Weather fetch for {city} failed: {e}")
    return candidates


async def _load_demo_tweets() -> List[CrisisCandidate]:
    """Fallback: pre-recorded tweet scenarios for demo reliability."""
    demo_tweets = [
        {"text": "Flash flood happening at George Town for past 30 mins, roads completely blocked #flood", "location": "Karachi"},
        {"text": "G-10 mein pani bhar gaya hai, gaariyan phans gayi hain", "location": "Islamabad"},
        {"text": "Heavy rainfall causing major disruption in Lahore, multiple accidents reported", "location": "Lahore"},
    ]
    return [
        CrisisCandidate(
            source="twitter",
            raw_text=t["text"],
            location_hint=t["location"],
            timestamp=datetime.utcnow(),
            language="ur" if any(c in t["text"] for c in ["mein", "hai", "gaya"]) else "en",
        )
        for t in demo_tweets
    ]


async def run(state: CIROState) -> CIROState:
    logger.info("Monitor Agent: starting data collection")
    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(
            _fetch_newsapi(client),
            _fetch_rss(),
            _fetch_weather(client),
            _load_demo_tweets(),
            return_exceptions=True,
        )

    candidates: List[CrisisCandidate] = []
    for r in results:
        if isinstance(r, list):
            candidates.extend(r)
        else:
            logger.error(f"Monitor source error: {r}")

    logger.info(f"Monitor Agent: collected {len(candidates)} candidates")
    state["raw_candidates"] = candidates
    return state
