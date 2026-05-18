# Raasta — Crisis-Aware Route Intelligence

> Google Antigravity Hackathon 2025 · Challenge 3: Crisis Intelligence & Response Orchestrator

**Raasta** is a city-scale crisis detection and route intelligence system for Pakistani commuters. When a protest, flood, or road incident blocks your path, Raasta's 7-agent AI pipeline detects it in real time and reroutes you to safety — before you're stuck.

---

## Demo Scenario

**G-11 Markaz → Blue Area, Islamabad**

D-Chowk (Constitution Avenue) is blocked by a civil protest. Raasta detects it from live news + social signals, scores it severity 8/10, and recommends rerouting via Kashmir Highway — saving 41 minutes and avoiding a high-risk zone.

```
POST /demo/d-chowk-protest   ← one API call triggers the full pipeline
```

---

## Architecture

```
LiveSignals (News/RSS/Weather/Social)
        │
        ▼
┌───────────────────────────────────────────────┐
│           LangGraph State Machine              │
│                                                │
│  Monitor → Detect → Analyze → Route →         │
│  Dispatch → Outcome → Report                   │
│                                                │
│  All agents powered by Gemini 2.0 Flash        │
└───────────────────────────────────────────────┘
        │                     │
        ▼                     ▼
 FastAPI REST            WebSocket
 + Endpoints          (real-time push)
        │                     │
        ▼                     ▼
 Android App (Kotlin)   Web Dashboard
 Google Maps + Compose  (React / Vite)
```

### 7-Agent Pipeline

| # | Agent | Role | LLM |
|---|-------|------|-----|
| 1 | Monitor | Polls NewsAPI, RSS, Google Weather API every 30s | — |
| 2 | Detection | Classifies crisis type, confidence, location | Gemini 2.0 Flash |
| 3 | Analysis | Scores severity 1-10, trajectory, affected radius | Gemini 2.0 Flash |
| 4 | Route | Scores road safety against active crisis zones | Gemini 2.0 Flash |
| 5 | Dispatch | Alerts emergency response teams via Slack/email | — |
| 6 | Outcome | Simulates before/after rerouting scenarios | Gemini 2.0 Flash |
| 7 | Report | Generates situation reports + WebSocket broadcast | Gemini 2.0 Flash |

**Google Antigravity** is satisfied by Gemini 2.0 Flash as the central LLM orchestrating all reasoning steps inside the LangGraph pipeline.

---

## Google APIs Used

| API | Purpose |
|-----|---------|
| **Gemini 2.0 Flash** (AI Studio) | Core LLM for detection, analysis, routing, simulation, reporting |
| **Google Weather API** | Live weather signals for 6 Pakistani cities (extreme weather detection) |
| **Google Maps SDK (Android)** | Map display, route polylines, crisis markers in mobile app |

---

## Project Structure

```
raasta/
├── backend/                    # FastAPI + LangGraph
│   ├── agents/
│   │   ├── monitor_agent.py    # NewsAPI + Google Weather + RSS
│   │   ├── detection_agent.py  # Gemini crisis classifier
│   │   ├── analysis_agent.py   # Gemini severity scorer
│   │   ├── route_agent.py      # Gemini route safety planner
│   │   ├── dispatch_agent.py   # Alert dispatcher
│   │   ├── outcome_agent.py    # Gemini before/after simulator
│   │   └── report_agent.py     # Gemini report generator
│   ├── core/
│   │   ├── graph.py            # LangGraph StateGraph (7 nodes)
│   │   ├── models.py           # Pydantic data models
│   │   └── state.py            # RaastaState TypedDict
│   ├── nlp/
│   │   ├── entity_extractor.py # 3-stage location extraction
│   │   └── pk_gazetteer.json   # 100+ Pakistan locations
│   ├── api/
│   │   ├── routes.py           # REST + WebSocket endpoints
│   │   └── websocket.py        # WS broadcast manager
│   └── main.py                 # FastAPI app entry point
├── mobile/                     # Android app (Kotlin + Jetpack Compose)
│   └── app/src/main/java/com/raasta/app/
│       ├── ui/screens/
│       │   ├── LiveMapScreen.kt      # Google Maps + route overlays
│       │   ├── IncidentFeedScreen.kt # Live crisis feed
│       │   ├── AgentTraceScreen.kt   # 7-agent pipeline trace viewer
│       │   ├── OutcomeScreen.kt      # Before/after comparison
│       │   └── SettingsScreen.kt     # Demo controls + system status
│       ├── viewmodel/RaastaViewModel.kt
│       └── data/{api,models,repository}/
└── frontend/                   # React web dashboard
```

---

## Quick Start

### Prerequisites
- Python 3.11+
- Docker & Docker Compose
- Android Studio (Hedgehog or later) for mobile

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Fill in API keys (see below)
uvicorn main:app --reload --port 8000
```

### 2. Docker (recommended)

```bash
docker-compose up -d
```

Backend available at `http://localhost:8000`  
API docs at `http://localhost:8000/docs`

### 3. Run Demo Scenario

```bash
curl -X POST http://localhost:8000/demo/d-chowk-protest
```

Then poll:
```bash
curl http://localhost:8000/incidents
curl http://localhost:8000/agent-traces/<run_id>
```

### 4. Android App

1. Open `mobile/` in Android Studio
2. In `app/build.gradle.kts`, update `MAPS_API_KEY` with your Google Maps API key
3. For emulator: backend URL is already `http://10.0.2.2:8000`
4. For physical device: update `BACKEND_URL` in `build.gradle.kts` to your machine's local IP
5. Run on device/emulator

---

## API Keys Required

| Key | Where to get | Used for |
|-----|-------------|---------|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) (free) | Core LLM — all agents |
| `GOOGLE_WEATHER_KEY` | Google Cloud → Weather API | Live weather monitoring |
| `NEWSAPI_KEY` | [newsapi.org](https://newsapi.org) (free tier) | Live news ingestion |
| Google Maps API Key | Google Cloud → Maps SDK for Android | Mobile map display |

---

## Key API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | System status + agent list |
| `POST /plan-route` | Plan safe route (triggers full 7-agent pipeline) |
| `GET /routes/{id}` | Get route result + outcome simulation |
| `GET /incidents` | List active crisis incidents |
| `GET /agent-traces/{run_id}` | Full LangGraph execution trace |
| `POST /simulate` | Inject synthetic crisis scenario |
| `POST /demo/d-chowk-protest` | One-click demo scenario |
| `WS /ws/mobile` | Real-time event stream for Android app |

---

## What Makes Raasta Win

1. **Real problem, real city** — D-Chowk protests happen every week in Islamabad. This isn't hypothetical.
2. **Google-first** — Gemini 2.0 Flash + Google Weather API + Google Maps. Antigravity is the core, not an afterthought.
3. **Observable AI** — Agent trace screen shows every LLM call, confidence score, and timing. Judges can see the pipeline thinking.
4. **Before/After proof** — Outcome simulation shows quantified impact: 41 minutes saved, high-risk avoided.
5. **Production-ready architecture** — LangGraph state machine, async FastAPI, typed models, WebSocket real-time.

---

*Built for Google Antigravity Hackathon 2025 — Challenge 3*
