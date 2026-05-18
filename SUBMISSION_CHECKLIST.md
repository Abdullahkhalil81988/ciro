# Raasta Submission Checklist
**Google Antigravity Hackathon 2025 — Challenge 3**

---

## Mandatory Deliverables

- [ ] **Mobile app link** — Expo Go QR code or APK download link
- [ ] **GitHub repository link** — public repository
- [ ] **Demo video (3–5 min)** — follow DEMO_SCRIPT.md
- [ ] **Antigravity usage video (2–3 min)** — follow ANTIGRAVITY_USAGE_SCRIPT.md
- [ ] **README / documentation** — README.md complete
- [ ] **Antigravity trace/log ZIP** — include agents/antigravity/trace_example.json

## Optional Deliverables

- [ ] **Web app link** — React dashboard at localhost:3000
- [ ] **Architecture PDF/PPTX** — optional additional docs

---

## Pre-Submission Technical Checklist

### Backend
- [ ] `uvicorn main:app --reload` starts without errors
- [ ] `GET /health` returns `{"status": "ok", "app": "Raasta", "agents_healthy": true}`
- [ ] `POST /demo/d-chowk-protest` returns complete scenario with agentTrace
- [ ] `GET /incidents` returns incident list
- [ ] `POST /alerts/simulate` returns `{"status": "sent"}`
- [ ] `POST /tickets/simulate` returns ticket with ID
- [ ] `GET /agent-traces/{runId}` returns trace array
- [ ] `POST /plan-route` returns `{run_id, request_id}`
- [ ] WebSocket `/ws/mobile` connects and broadcasts HEARTBEAT

### Mobile App (Expo)
- [ ] `npx expo start` starts without errors
- [ ] Splash screen displays correctly
- [ ] Home screen loads with route bar
- [ ] "Run Crisis Scan" button triggers scan and navigates to RouteRisk
- [ ] RouteRisk shows two SafetyScoreRing components (82 → 29)
- [ ] MapPreview shows blocked route (red) and safe route (green)
- [ ] AgentTrace screen shows 6 agent steps with timeline
- [ ] Outcome screen shows ticket ICT-TRF-2026-044
- [ ] IncidentFeed loads mock incidents
- [ ] ReportIncident submission works (success state shown)
- [ ] DemoControl triggers all 4 scenarios

### Repository
- [ ] README.md is complete and accurate
- [ ] .gitignore excludes .env, __pycache__, node_modules
- [ ] .env.example has all required keys documented
- [ ] requirements.txt is up to date
- [ ] No API keys committed to git

---

## Scoring Rubric Alignment

| Criterion | Our Implementation |
|-----------|-------------------|
| **Antigravity (25%)** | Gemini 2.0 Flash in all 5 reasoning agents. LangGraph StateGraph. Exported traces. |
| **Agentic Reasoning (20%)** | 7 discrete agents, conditional edges, typed state, graceful degradation |
| **Action Simulation (20%)** | /alerts/simulate, /tickets/simulate, update_mock_map_state — real side effects |
| **Outcome Visualization (15%)** | SafetyScoreRing 82→29, before/after comparison, time saved metrics |
| **Mobile UX (10%)** | 9 screens, Strava-inspired dark theme, accessibility labels |
| **Documentation (10%)** | README, demo scripts, architecture, team contributions |

---

## Known Limitations (be honest with judges)

- Google Maps route data is simplified (static road graph)
- No real government API integration — all actions are simulated
- Weather data from Google Weather API but not yet in route scoring
- No real user accounts or persistent data (in-memory only)
- Android emulator required for full map experience

---

## Submission Links (fill before submitting)

- GitHub: `https://github.com/___/raasta`
- Mobile app: `exp://___` or APK: `___`
- Demo video: `https://youtu.be/___`
- Antigravity video: `https://youtu.be/___`
