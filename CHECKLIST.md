# CIRO — Build Checklist
> Deadline: Wednesday 20 May 2026 EOD

## Legend: ✅ Done | 🔲 TODO | ⚡ Priority

---

## PHASE 0 — Setup ✅
- ✅ Project directory structure (backend / frontend / mobile / docker)
- ✅ `requirements.txt`, `package.json`, `app.json`
- ✅ `.env.example` with all API key placeholders
- ✅ Docker Compose (postgres + redis + backend + frontend)
- ✅ `.gitignore` — Python, Node, `.env`, build outputs, OS files
- 🔲 Copy `.env.example` → `.env` and fill in your `ANTHROPIC_API_KEY`
- 🔲 `pip install -r backend/requirements.txt`
- 🔲 `python -m spacy download en_core_web_sm`
- 🔲 `cd frontend && npm install`
- 🔲 `cd mobile && npm install`

---

## PHASE 1 — Backend Core ✅
- ✅ `config.py` — settings with pydantic-settings
- ✅ `core/models.py` — all Pydantic schemas (CrisisCandidate → SituationReport)
- ✅ `core/state.py` — CIROState TypedDict for LangGraph
- ✅ `main.py` — FastAPI app with CORS + APScheduler lifespan

---

## PHASE 2 — Detection Pipeline
- ✅ `nlp/keyword_filter.py` — tiered keyword scorer (Urdu + English)
- ✅ `agents/monitor_agent.py` — NewsAPI + RSS + Weather + demo tweets
- ✅ `agents/detection_agent.py` — keyword pre-filter + Claude Haiku LLM
- ✅ `nlp/pk_gazetteer.json` — 100+ Pakistani cities, sectors (G-10, F-7 etc.), neighbourhoods
- ✅ `nlp/entity_extractor.py` — 3-stage location extraction (gazetteer → spaCy NER → regex)
- ✅ `detection_agent.py` — old inline `_extract_location` removed, now uses `extract_location` from `nlp.entity_extractor`
- 🔲 Test detection with sample crisis texts

---

## PHASE 3 — Analysis ✅
- ✅ `agents/analysis_agent.py` — Claude Sonnet severity scoring + escalation
- 🔲 Wire historical events fallback data (mock JSON for demo)
- 🔲 Test analysis output format

---

## PHASE 4 — Dispatch ✅
- ✅ `dispatch/routing_table.py` — crisis_type × tier → teams
- ✅ `dispatch/channels.py` — Slack (real + simulated) + Email (simulated)
- ✅ `agents/dispatch_agent.py`
- 🔲 ⚡ Set `SLACK_WEBHOOK_URL` in `.env` for real Slack alerts in demo
- 🔲 Wire Twilio SMS (optional, for WOW factor)

---

## PHASE 5 — LangGraph Orchestration ✅
- ✅ `core/graph.py` — StateGraph with conditional edge (skip if no events)
- ✅ All 5 agents wired as nodes
- ✅ `agents/report_agent.py` — Claude Sonnet report + WebSocket broadcast
- 🔲 ⚡ End-to-end smoke test: `POST /trigger` → watch logs

---

## PHASE 6 — FastAPI Endpoints ✅
- ✅ `GET /health`
- ✅ `POST /trigger` — manual pipeline run
- ✅ `GET /events` — paginated event list
- ✅ `GET /dashboard/summary`
- ✅ `POST /simulate` — ⚡ DEMO CRITICAL — injects synthetic crisis
- ✅ `GET /logs`
- ✅ `WS /ws/dashboard` — live WebSocket feed
- 🔲 `GET /report/{id}` — PDF download (nice to have)

---

## PHASE 7 — React Dashboard ✅
- ✅ Zustand store (`useCiroStore`)
- ✅ WebSocket hook with auto-reconnect
- ✅ `CrisisCard` component with severity badge
- ✅ `AgentStatusBar` — live/offline + agent health
- ✅ `SimulatePanel` — form to inject simulations
- ✅ `App.tsx` — main layout (feed + map area + simulate panel)
- 🔲 ⚡ Wire `react-leaflet` map with incident pins
- 🔲 Add Recharts timeline (events per 5-min window)
- 🔲 Add D3 severity gauge
- 🔲 Crisis detail modal (click card → full report)
- 🔲 `cd frontend && npm run dev` — verify it runs

---

## PHASE 8 — Expo Mobile App ✅
- ✅ `HomeScreen` — live crisis feed with severity colors
- ✅ `SimulateScreen` — chip pickers + severity slider
- ✅ `LogsScreen` — alert dispatch log
- ✅ Expo Router tab layout
- ✅ Zustand store + WebSocket hook
- 🔲 ⚡ `cd mobile && npx expo start` — verify it runs on device/emulator
- 🔲 Update `WS_URL` in `useWebSocket.ts` for physical device (use your machine IP)
- 🔲 Build APK: `npx eas build --platform android --profile preview`

---

## PHASE 9 — Demo Polish ⚡
- 🔲 Script the demo scenario (Karachi flood, severity 8)
- 🔲 Pre-warm Slack webhook — test it sends
- 🔲 Record Antigravity trace / logs for submission
- 🔲 Run full end-to-end: trigger → detect → analyze → dispatch → dashboard updates
- 🔲 Randomize severity ±1 on simulate to make demo feel live
- 🔲 Dark mode dashboard looks great on screen share

---

## PHASE 10 — Submission Materials
- 🔲 Upload mobile APK to Google Drive (accessible link)
- 🔲 GitHub repo (public)
- 🔲 Demo video 3-5 min (input → insight → action → simulation → result)
- 🔲 Antigravity usage screen recording 2-3 min
- 🔲 README.md (architecture, APIs used, agents, how Antigravity is used)
- 🔲 Antigravity trace/logs zip
- 🔲 CNIC photos of all team members (front + back)

---

## NEXT IMMEDIATE STEPS (do these first):
1. `cp backend/.env.example backend/.env` → add your `ANTHROPIC_API_KEY`
2. `pip install -r backend/requirements.txt && python -m spacy download en_core_web_sm`
3. `cd backend && uvicorn main:app --reload`
4. `curl -X POST http://localhost:8000/simulate -H "Content-Type: application/json" -d '{"crisis_type":"flood","location":"Karachi","severity_override":8,"description":"Flash flood test"}'`
5. Check logs — confirm Detection + Analysis + Dispatch agents ran
6. `cd frontend && npm install && npm run dev` — open http://localhost:3000
7. Watch dashboard update in real time
