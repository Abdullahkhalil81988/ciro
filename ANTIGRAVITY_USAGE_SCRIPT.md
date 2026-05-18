# Raasta — Antigravity Usage Video Script
**Duration: 2–3 minutes**

---

## 0:00–0:20 — What is Antigravity in Raasta?

> "Google Antigravity is the central orchestrator of everything in Raasta. Every intelligent decision — crisis detection, severity scoring, route safety analysis, outcome simulation — goes through Gemini 2.0 Flash, managed by a LangGraph state machine."

*[Show the architecture diagram or the graph.py file briefly.]*

---

## 0:20–0:50 — Show the Workflow Definition

> "We defined a 7-node LangGraph StateGraph. Each node is an agent. Each agent calls Gemini with a specific structured prompt and gets back structured JSON."

*[Open core/graph.py — show the graph.add_node() calls for all 7 agents.]*

> "The pipeline flows: Monitor → Detect → Analyze → Route → Dispatch → Outcome → Report. Conditional edges mean detection failures skip to route planning — the system degrades gracefully."

---

## 0:50–1:20 — Show Tool Call Definitions

> "Each agent exposes a discrete tool call — normalize_signals, classify_crisis, score_severity, generate_route_plan, simulate_alerts, create_authority_ticket, generate_outcome_report."

*[Open agents/antigravity/workflow.py — show 2-3 function definitions.]*

> "These aren't chatbot messages. They're typed function calls with explicit inputs, outputs, and side effects. The system's reasoning is fully traceable."

---

## 1:20–1:50 — Show the Trace JSON

> "Here's the exported trace from a live pipeline run. Every tool call, its input, output, duration, and reasoning is captured."

*[Open agents/antigravity/trace_example.json in VS Code or similar.]*

*[Scroll through the tool_calls array — highlight step 2 (classify_crisis) and step 4 (generate_route_plan).]*

---

## 1:50–2:20 — Show Agent Trace in App

> "The mobile app surfaces this trace to the user. Every commuter can see exactly why Raasta made its routing decision — which agents ran, what Gemini returned, how confident the system was."

*[Show AgentTraceScreen in app — expand 2-3 agent cards.]*

> "This is observable AI. Not a black box."

---

## 2:20–3:00 — Explain Centrality

> "Antigravity isn't a feature we bolted on. It's the backbone. Without Gemini, we fall back to keyword heuristics. With Gemini, we get nuanced crisis classification that understands Roman Urdu, knows Pakistan geography, and reasons about road safety contextually."

> "The LangGraph StateGraph ensures each agent's output flows cleanly into the next. State is typed. Transitions are conditional. The system is deterministic, reproducible, and exportable as a ZIP."

*[Hold up / show the trace_example.json file or the agents/antigravity/ folder.]*

> "These exported traces are our submission artifacts. They prove Antigravity was central — not peripheral."

---

**Recording notes:**
- This video is for the judges who specifically evaluate Antigravity usage
- Show actual code, not just the app
- Narrate the reasoning clearly
- End by showing the exported trace ZIP
