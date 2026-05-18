# Raasta — Architecture

## System Overview

```
                    ┌─────────────────────────────────────┐
                    │     Live Signal Sources              │
                    │  NewsAPI · Google Weather · RSS      │
                    │  Mock Social · User Reports          │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
                    │     LangGraph State Machine          │
                    │     (Google Antigravity Core)        │
                    │                                      │
                    │  1. Monitor Agent                    │
                    │      ↓                               │
                    │  2. Detection Agent (Gemini)         │
                    │      ↓ (if crisis detected)          │
                    │  3. Analysis Agent (Gemini)          │
                    │      ↓                               │
                    │  4. Route Agent (Gemini)             │
                    │      ↓                               │
                    │  5. Dispatch Agent                   │
                    │      ↓                               │
                    │  6. Outcome Agent (Gemini)           │
                    │      ↓                               │
                    │  7. Report Agent (Gemini)            │
                    └──────────────┬──────────────────────┘
                                   │
               ┌───────────────────┼───────────────────┐
               │                   │                   │
    ┌──────────▼───────┐  ┌────────▼────────┐  ┌──────▼────────┐
    │   FastAPI REST   │  │   WebSocket     │  │ In-Memory DB  │
    │   /plan-route    │  │   /ws/mobile    │  │ Incidents     │
    │   /incidents     │  │   /ws/dashboard │  │ Traces        │
    │   /agent-traces  │  │   HEARTBEAT     │  │ Routes        │
    │   /simulate      │  │   CRISIS_FOUND  │  └───────────────┘
    │   /alerts/sim    │  └─────────────────┘
    │   /tickets/sim   │
    └──────────────────┘
               │
    ┌──────────▼──────────────────────────────┐
    │            Android App (Kotlin)          │
    │         + Expo React Native App          │
    │                                          │
    │  LiveMapScreen    → Google Maps          │
    │  AgentTraceScreen → Pipeline viz         │
    │  OutcomeScreen    → Before/after         │
    │  IncidentFeed     → Crisis list          │
    │  DemoControl      → Judge panel          │
    └──────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| LLM | Gemini 2.0 Flash | Free, fast, Google-native, satisfies Antigravity |
| Agent Orchestration | LangGraph StateGraph | Observable, typed, conditional edges |
| Backend | FastAPI + Python | Async, fast, excellent for AI demos |
| Mobile | Expo React Native | Cross-platform, fast iteration, shareable via Expo Go |
| Mobile (alt) | Kotlin + Jetpack Compose | Native Android, Google Maps SDK |
| Maps | Google Maps SDK | Native routing visualization |
| Weather | Google Weather API | Live environmental signals |
| News | NewsAPI | Live Pakistan news ingestion |
| NLP | spaCy + Custom Gazetteer | 100+ Pakistan locations, Roman Urdu support |
| State Management | Zustand (mobile) | Minimal, TypeScript-friendly |

## Data Flow

```
User opens app
    → selects G-11 → Blue Area
    → taps "Run Crisis Scan"
    → POST /simulate (or /demo/d-chowk-protest)
        → Monitor Agent polls all signal sources
        → Detection Agent (Gemini) classifies crisis
        → Analysis Agent (Gemini) scores severity
        → Route Agent (Gemini) finds safe alternate
        → Dispatch Agent sends alerts + creates ticket
        → Outcome Agent (Gemini) simulates before/after
        → Report Agent (Gemini) generates situation report
        → WebSocket broadcasts CRISIS_DETECTED event
    → App receives result
    → Displays risk scores (82 → 29)
    → Shows agent trace timeline
    → Shows before/after outcome
    → Shows authority ticket ICT-TRF-2026-044
```

## Agent State

Each pipeline run passes a `RaastaState` TypedDict through all agents:
- `raw_candidates` — ingested signals
- `detected_events` — classified crises
- `analyses` — severity-scored analyses
- `route_request` / `route_response` — route planning
- `dispatch_records` — alert delivery records
- `outcome_simulation` — before/after results
- `agent_traces` — full execution log
- `situation_reports` — final reports
