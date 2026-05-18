# Raasta Demo Video Script
**Duration: 3–5 minutes**

---

## 0:00–0:25 — Problem Hook

> "Every week in Pakistan, thousands of commuters get stuck for hours — not because of traffic, but because of a protest, flood, or road blockage they had no warning about. There's no real-time system that detects these crises and reroutes you before you're trapped."

*[Show map of Islamabad with no incident markers — a normal morning commute.]*

---

## 0:25–0:45 — What Raasta Does

> "Raasta is a crisis-aware route intelligence app powered by a 7-agent AI pipeline. It monitors live signals, detects emerging crises using Gemini 2.0 Flash, and reroutes you to safety — before you reach the danger zone."

*[Show the Raasta app splash screen and home screen with the G-11 → Blue Area route loaded.]*

---

## 0:45–1:20 — Show Normal Route

> "Our demo commuter is travelling from G-11 to Blue Area, Islamabad. The default route goes via Jinnah Avenue — straight through D-Chowk."

*[Show MapPreview with the normal route. No crisis markers yet.]*

*[Show the route card: 8.2km, 18 min ETA, risk score pending.]*

---

## 1:20–1:55 — Trigger Crisis Scan

> "The user taps 'Run Crisis Scan'. Our Signal Monitor agent immediately ingests 4 live signals — including a Roman Urdu tweet: 'D Chowk pe containers lage hain, traffic band hai.'"

*[Tap the Run Crisis Scan button. Show the loading state with "7-agent LangGraph pipeline" caption.]*

> "The Crisis Detection agent — powered by Gemini 2.0 Flash — classifies it as civil_disruption at D-Chowk with 91% confidence."

*[The scan completes. Show the alert banner: "⚠️ Crisis detected: D-Chowk, Islamabad"]*

---

## 1:55–2:30 — Show Risk Zone + Safer Route

> "Raasta immediately highlights D-Chowk as a high-risk zone and recommends rerouting via Kashmir Highway."

*[Navigate to Route Risk screen. Show the two SafetyScoreRing components: 82 → 29.]*

*[Show the map with the red dashed blocked route and the green alternate route.]*

> "Original risk score: 82 out of 100. Raasta's recommended route: 29 out of 100. 53 points safer."

*[Show RouteCard for both routes side by side.]*

---

## 2:30–3:10 — Show Agent Pipeline

> "Let's look under the hood. The Agent Trace screen shows every step of our 7-agent LangGraph pipeline."

*[Navigate to Agent Trace screen. Show the timeline of agent steps.]*

> "Signal Monitor → Crisis Detection (Gemini) → Severity Analysis (Gemini) → Route Planner (Gemini) → Dispatch → Outcome Simulation (Gemini) → Report. Total pipeline time: under 5 seconds."

*[Expand one agent card to show input, output, duration, and LLM calls.]*

---

## 3:10–3:45 — Show Actions + Ticket

> "The Dispatch Agent automatically generated a commuter alert sent to 124 simulated nearby users. And created an official traffic authority ticket: ICT-TRF-2026-044."

*[Navigate to Outcome screen. Show ActionLogCard with all actions checked.]*

*[Show the orange ticket card: ICT-TRF-2026-044.]*

> "This is action simulation — not just recommendations. The system acts."

---

## 3:45–4:20 — Outcome Report

> "The Outcome screen shows the full before/after simulation. 18 minutes of delay avoided. Risk reduced by 64.6%. 124 commuters protected."

*[Show the comparison: 82 risk → 29 risk. Show MetricPill row.]*

---

## 4:20–5:00 — Closing

> "Raasta is built on Google's Gemini 2.0 Flash, LangGraph for agent orchestration, Google Weather API for environmental signals, and Google Maps for route visualization."

> "It's not a chatbot. It's an autonomous, observable, action-taking AI system — purpose-built for crisis-aware mobility in Pakistan."

> "Raasta. Navigate. Detect. Reroute."

*[Show splash screen with Urdu script logo.]*

---

**Recording notes:**
- Record on physical Android device or high-quality emulator
- Use the Demo Control screen to trigger scenarios cleanly
- Record Route Risk → Agent Trace → Outcome in sequence
- Keep captions short and visible
- No need to show code — show working app
