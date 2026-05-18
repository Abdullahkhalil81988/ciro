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


async def _fetch_weather(client: httpx.AsyncClient) -> List[CrisisCandidate]:
    if not settings.openweathermap_key:
        return []
    cities = ["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta", "Multan"]
    candidates = []
    for city in cities:
        try:
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={"q": f"{city},PK", "appid": settings.openweathermap_key},
                timeout=5,
            )
            data = resp.json()
            weather_main = data.get("weather", [{}])[0].get("main", "")
            description = data.get("weather", [{}])[0].get("description", "")
            # Only surface extreme weather
            extreme = {"Thunderstorm", "Tornado", "Squall", "Ash", "Dust", "Sand"}
            if weather_main in extreme or "heavy" in description.lower():
                candidates.append(
                    CrisisCandidate(
                        source="weather",
                        raw_text=f"Weather alert {city}: {weather_main} - {description}",
                        location_hint=city,
                        timestamp=datetime.utcnow(),
                        language="en",
                    )
                )
        except Exception as e:
            logger.warning(f"Weather fetch for {city} failed: {e}")
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
