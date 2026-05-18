# Team Contributions

## Person 1 — Mobile App / UI Lead
**Deliverables:**
- Complete Expo React Native TypeScript app (9 screens)
- Components: RiskBadge, RouteCard, IncidentCard, AgentStep, MetricPill, SafetyScoreRing, ActionLogCard, MapPreview, PrimaryButton
- Mock API service layer with real backend fallback
- Zustand state management
- Strava-inspired dark theme with orange/red risk accents
- Demo Control screen for judge-facing demos

## Person 2 — Backend / API Lead
**Deliverables:**
- FastAPI backend with 12+ endpoints
- /alerts/simulate and /tickets/simulate with proof-of-action
- Deterministic demo mode (exact expected outputs)
- Seed data: 4 city scenarios (Islamabad, Lahore, Karachi, Rawalpindi)
- Lightweight pytest test suite
- CORS, structured logging, in-memory persistence

## Person 3 — Agent Orchestration Lead
**Deliverables:**
- 7-node LangGraph StateGraph pipeline
- All Gemini 2.0 Flash agent prompts (detection, analysis, routing, outcome, report)
- Tool-call workflow: normalize_signals → classify_crisis → score_severity → generate_route_plan → simulate_alerts → create_authority_ticket → update_mock_map_state → generate_outcome_report
- Exported trace JSON (agents/antigravity/trace_example.json)
- Pakistan-specific NLP: Roman Urdu normalization, 100+ location gazetteer
- Antigravity workflow definition

## Person 4 — QA / Docs / Demo Lead
**Deliverables:**
- Complete README.md
- DEMO_SCRIPT.md (3-5 min video script)
- ANTIGRAVITY_USAGE_SCRIPT.md (2-3 min video script)
- SUBMISSION_CHECKLIST.md
- TESTING_CHECKLIST.md
- docs/architecture.md
- docs/team-contributions.md
- docs/limitations.md
