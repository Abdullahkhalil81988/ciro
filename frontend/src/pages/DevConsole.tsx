import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

const FILES = {
  "analysis_agent.py": `"""Agent 3 — Analysis Agent
Enriches CrisisEvent with severity scoring, escalation trajectory, and response tier.
Uses Claude Sonnet for deep reasoning.
"""
import asyncio
import json
import logging
from datetime import datetime
from typing import List

import google.generativeai as genai

from core.models import CrisisAnalysis, CrisisEvent, CrisisType, ResponseTier
from core.state import CIROState
from nlp.keyword_filter import keyword_score
from config import settings

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.gemini_api_key)
_model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-lite",
    generation_config={"temperature": 0.2, "max_output_tokens": 512},
)

ANALYSIS_PROMPT = """You are a crisis analysis expert for Pakistan urban emergency management.
Return ONLY valid JSON — no prose, no markdown fences.

Schema:
{{
  "severity_score": <int 1-10>,
  "escalation_trajectory": <"stable"|"worsening"|"critical">,
  "recommended_response_tier": <1|2|3>,
  "affected_radius_km": <float>,
  "population_at_risk": <int estimate>,
  "executive_summary": <string 2-3 sentences>,
  "recommended_actions": [<string>, ...]
}}

Response tiers: 1=local (district), 2=regional (province), 3=national (federal/army).

{event_details}"""`,

  "graph.py": `"""LangGraph state machine — 7-agent Raasta pipeline."""
import time
import uuid
from datetime import datetime

from langgraph.graph import StateGraph, END

from .state import RaastaState
from agents import (
    monitor_agent, detection_agent, analysis_agent,
    dispatch_agent, report_agent,
)
from agents import route_agent, outcome_agent

def build_graph() -> StateGraph:
    graph = StateGraph(RaastaState)

    graph.add_node("monitor",  _traced(monitor_agent,    "monitor_agent",    1))
    graph.add_node("detect",   _traced(detection_agent,  "detection_agent",  2))
    graph.add_node("analyze",  _traced(analysis_agent,   "analysis_agent",   3))
    graph.add_node("route",    _traced(route_agent,      "route_agent",      4))
    graph.add_node("dispatch", _traced(dispatch_agent,   "dispatch_agent",   5))
    graph.add_node("outcome",  _traced(outcome_agent,    "outcome_agent",    6))
    graph.add_node("report",   _traced(report_agent,     "report_agent",     7))

    graph.add_edge("monitor", "detect")
    graph.add_conditional_edges(
        "detect",
        _should_analyze,
        {"analyze": "analyze", "route": "route"},
    )
    graph.add_edge("analyze", "route")
    graph.add_edge("route", "dispatch")
    graph.add_edge("dispatch", "outcome")
    graph.add_edge("outcome", "report")
    graph.add_edge("report", END)

    graph.set_entry_point("monitor")
    return graph.compile()`,

  "workflow.py": `"""
Raasta Antigravity Workflow Definition
Challenge 3 — Discrete Tool Interface
"""

def normalize_signals(raw_signals: list[str]) -> dict:
    # Ingests Urdu, Roman-Urdu, and English alerts
    ...

def classify_crisis(normalized_signals: list[dict]) -> dict:
    # Uses Gemini 2.0 Flash to classify crisis
    ...

def score_severity(crisis_type: str, confidence: float, location: str) -> dict:
    # Rates severity score on a 1 to 10 scale
    ...

def generate_route_plan(origin: str, destination: str, severity: int) -> dict:
    # Reroutes commuters dynamically avoiding risk zones
    ...`,

  "trace_example.json": `{
  "pipeline": "raasta_antigravity",
  "run_id": "9509c474-5b9c-4044-9c05-c599ae55eded",
  "tool_trace": [
    {
      "step": 1,
      "tool": "normalize_signals",
      "status": "complete",
      "duration_ms": 312
    },
    {
      "step": 2,
      "tool": "classify_crisis",
      "model": "gemini-2.0-flash-lite",
      "confidence": 0.91,
      "location": "D-Chowk, Islamabad"
    },
    {
      "step": 3,
      "tool": "score_severity",
      "severity": 8,
      "trajectory": "worsening",
      "response_tier": 3
    }
  ]
}`
};

export function DevConsole() {
  const [selectedFile, setSelectedFile] = useState<keyof typeof FILES>("analysis_agent.py");
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const isAutoplay = queryParams.get("autoplay") === "true";

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalHistory]);

  const simulateLogs = [
    "2026-05-20 20:33:05,102 raasta.api INFO Initiating live crisis simulation demo for D-Chowk",
    "2026-05-20 20:33:05,103 raasta.core INFO Scheduled pipeline run: demo-chowk-protest-99",
    "2026-05-20 20:33:05,105 raasta.agents.monitor INFO [Monitor Agent] Ingesting live traffic signals...",
    "2026-05-20 20:33:05,417 raasta.agents.monitor INFO [Monitor Agent] 4 signals collected. Roman-Urdu text found: 'D Chowk pe containers lage hain...'",
    "2026-05-20 20:33:05,419 raasta.agents.detect INFO [Detection Agent] Calling Google Gemini API (gemini-2.0-flash-lite)...",
    "2026-05-20 20:33:06,266 raasta.agents.detect INFO [Detection Agent] Gemini returned model classification: 'civil_disruption' with 91% confidence",
    "2026-05-20 20:33:06,268 raasta.agents.analyze INFO [Analysis Agent] Calling Gemini API for multi-factor severity analysis...",
    "2026-05-20 20:33:06,891 raasta.agents.analyze INFO [Analysis Agent] Severity scored: 8/10. Trajectory: worsening. Recommended tier: 3",
    "2026-05-20 20:33:06,892 raasta.agents.route INFO [Route Agent] Calculating alternate routes avoiding Jinnah Avenue (D-Chowk)...",
    "2026-05-20 20:33:07,825 raasta.agents.route INFO [Route Agent] Alternate path Zero Point -> Kashmir Highway computed successfully. Risk: 82 -> 29.",
    "2026-05-20 20:33:07,827 raasta.agents.dispatch INFO [Dispatch Agent] Simulated alerting activated. 124 users notified. Traffic Authority ticket ICT-TRF-2026-044 generated.",
    "2026-05-20 20:33:08,271 raasta.agents.outcome INFO [Outcome Agent] Running post-incident outcome simulation...",
    "2026-05-20 20:33:08,984 raasta.agents.outcome INFO [Outcome Agent] Simulation results: 18 min delay avoided. 124 commuters saved.",
    "2026-05-20 20:33:08,985 raasta.agents.report INFO [Report Agent] Compiling final situation briefing...",
    "2026-05-20 20:33:09,500 raasta.agents.report INFO [Report Agent] Done. Situation report published.",
    "2026-05-20 20:33:09,502 raasta.core INFO Pipeline run demo-chowk-protest-99 completed in 4.40s"
  ];

  const simulateCommand = async (command: string) => {
    if (isTyping) return;
    setIsTyping(true);
    setCurrentInput("");

    // Simulate typing character by character
    for (let i = 0; i <= command.length; i++) {
      setCurrentInput(command.slice(0, i));
      await new Promise(r => setTimeout(r, 30));
    }
    await new Promise(r => setTimeout(r, 300));

    setTerminalHistory(prev => [...prev, `abdullah@macbook-pro ciro % ${command}`]);
    setCurrentInput("");

    if (command.includes("demo/d-chowk-protest")) {
      // Print logs step by step to simulate live execution
      for (const log of simulateLogs) {
        setTerminalHistory(prev => [...prev, log]);
        await new Promise(r => setTimeout(r, 150));
      }
      setTerminalHistory(prev => [...prev, "{\"status\": \"success\", \"run_id\": \"demo-chowk-protest-99\"}"]);
    } else if (command.includes("dashboard/summary")) {
      await new Promise(r => setTimeout(r, 200));
      setTerminalHistory(prev => [...prev, JSON.stringify({
        active_incidents: 18,
        max_severity: 8,
        recent_alerts: [
          { channel: "slack", team: "Provincial Disaster Auth", location: "Islamabad", severity: 8 }
        ],
        recent_incidents: [
          { id: "demo-chowk-protest-99", type: "civil_disruption", location: "D-Chowk, Islamabad", severity: 8, population_at_risk: 25000 }
        ]
      }, null, 2)]);
    } else if (command.includes("ls -la")) {
      await new Promise(r => setTimeout(r, 100));
      setTerminalHistory(prev => [
        ...prev,
        "-rw-r--r--  1 abdullah  staff  2232 May 20 20:30 raasta_logs.zip"
      ]);
    }

    setIsTyping(false);
  };

  // Autoplay Logic
  useEffect(() => {
    if (!isAutoplay) return;

    let active = true;

    const runAutoplay = async () => {
      // 1. Initial wait
      await new Promise(r => setTimeout(r, 2000));
      if (!active) return;

      // 2. Select graph.py
      setSelectedFile("graph.py");
      await new Promise(r => setTimeout(r, 3000));
      if (!active) return;

      // 3. Select workflow.py
      setSelectedFile("workflow.py");
      await new Promise(r => setTimeout(r, 3000));
      if (!active) return;

      // 4. Select trace_example.json
      setSelectedFile("trace_example.json");
      await new Promise(r => setTimeout(r, 3000));
      if (!active) return;

      // 5. Trigger D-Chowk Demo
      await simulateCommand("curl -X POST http://localhost:8000/demo/d-chowk-protest");
      await new Promise(r => setTimeout(r, 2000));
      if (!active) return;

      // 6. Get Summary
      await simulateCommand("curl -s http://localhost:8000/dashboard/summary");
      await new Promise(r => setTimeout(r, 2000));
      if (!active) return;

      // 7. Check ZIP
      await simulateCommand("ls -la raasta_logs.zip");
      await new Promise(r => setTimeout(r, 2000));
      if (!active) return;

      // 8. Select analysis_agent.py again to wrap up
      setSelectedFile("analysis_agent.py");
    };

    runAutoplay();

    return () => {
      active = false;
    };
  }, [isAutoplay]);

  return (
    <main className="pt-[72px] h-screen bg-[#0A0A0A] flex flex-col font-mono text-[13px] text-white">
      {/* DevConsole Sub-header */}
      <section className="bg-[#121212] px-8 py-3 border-b border-white/10 flex justify-between items-center">
        <div>
          <span className="text-[#E83A2C] font-bold">● ANTIGRAVITY ENGINE</span>
          <span className="text-white/40 ml-2">/ trace logs & source definitions</span>
          {isAutoplay && <span className="text-green-400 animate-pulse ml-4">[AUTOPLAY RECORDING LIVE]</span>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => simulateCommand("curl -X POST http://localhost:8000/demo/d-chowk-protest")}
            disabled={isTyping}
            className="px-3 py-1 bg-white/5 border border-white/15 rounded hover:bg-white/10 text-[11px] disabled:opacity-50"
          >
            [1] Trigger D-Chowk
          </button>
          <button
            onClick={() => simulateCommand("curl -s http://localhost:8000/dashboard/summary")}
            disabled={isTyping}
            className="px-3 py-1 bg-white/5 border border-white/15 rounded hover:bg-white/10 text-[11px] disabled:opacity-50"
          >
            [2] Get Summary
          </button>
          <button
            onClick={() => simulateCommand("ls -la raasta_logs.zip")}
            disabled={isTyping}
            className="px-3 py-1 bg-white/5 border border-white/15 rounded hover:bg-white/10 text-[11px] disabled:opacity-50"
          >
            [3] Check ZIP
          </button>
        </div>
      </section>

      {/* Main Workspace Split Pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: VS Code Editor Mock */}
        <div className="w-[55%] flex border-r border-white/10 overflow-hidden bg-[#0A0A0A]">
          {/* File explorer sidebar */}
          <div className="w-48 bg-[#111111] border-r border-white/5 p-4 flex flex-col gap-2 shrink-0">
            <div className="text-[10px] tracking-wider text-white/30 uppercase font-bold mb-2">Workspace Explorer</div>
            <div className="text-white/50 text-[11px]">📁 backend</div>
            <div className="pl-4 flex flex-col gap-1 text-[12px]">
              <div className="text-white/50">📁 agents</div>
              <div className="pl-4 flex flex-col gap-1">
                {(["analysis_agent.py", "graph.py", "workflow.py", "trace_example.json"] as const).map(file => (
                  <button
                    key={file}
                    onClick={() => setSelectedFile(file)}
                    className={`text-left truncate py-0.5 ${selectedFile === file ? "text-[#E83A2C] font-bold" : "text-white/70 hover:text-white"}`}
                  >
                    📄 {file}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0E0E0E]">
            <div className="bg-[#121212] px-4 py-2 border-b border-white/5 text-[11px] text-white/50 flex items-center justify-between">
              <span>{selectedFile}</span>
              <span className="text-[10px] text-green-400">● Python (Gemini 2.0 Flash)</span>
            </div>
            <pre className="flex-1 p-5 overflow-auto text-[12px] leading-relaxed text-white/80 whitespace-pre">
              <code>{FILES[selectedFile]}</code>
            </pre>
          </div>
        </div>

        {/* Right Pane: Terminal Mock */}
        <div className="w-[45%] flex flex-col bg-[#050505] overflow-hidden">
          <div className="bg-[#121212] px-4 py-2 border-b border-white/10 text-[11px] text-white/50">
            💻 terminal (zsh)
          </div>
          <div className="flex-1 p-4 overflow-auto font-mono text-[12px] text-white/90 space-y-2">
            {terminalHistory.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.startsWith("abdullah@")
                    ? "text-[#E83A2C] font-bold"
                    : line.startsWith("2026-")
                    ? "text-white/60"
                    : line.startsWith("{")
                    ? "text-blue-400 whitespace-pre"
                    : "text-green-400"
                }
              >
                {line}
              </div>
            ))}
            <div className="flex items-center text-[#E83A2C] font-bold">
              <span>abdullah@macbook-pro ciro % </span>
              <span className="text-white ml-2">{currentInput}</span>
              <span className="w-1.5 h-4 bg-white animate-pulse ml-1" />
            </div>
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </main>
  );
}
