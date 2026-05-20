import { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../hooks/useWebSocket";
import { useCiroStore } from "../store/useCiroStore";
import type { CrisisEvent, AlertRecord } from "../types";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const AGENTS = [
  { n: "α", name: "Monitor" },
  { n: "β", name: "Detect" },
  { n: "γ", name: "Analyze" },
  { n: "δ", name: "Route" },
  { n: "ε", name: "Dispatch" },
  { n: "ζ", name: "Outcome" },
  { n: "η", name: "Report" },
];

const TYPE_LABEL: Record<string, string> = {
  flood: "Flood", fire: "Fire", cyber: "Cyber", civil: "Civil Unrest",
  medical: "Medical", industrial: "Industrial", heatwave: "Heatwave",
  road_blockage: "Road Block", unknown: "Unknown",
};

function sevClass(s: number) {
  if (s >= 9) return "sev-9";
  if (s >= 7) return "sev-7";
  if (s >= 4) return "sev-4";
  return "sev-1";
}

export function Dashboard() {
  useWebSocket();
  const nav = useNavigate();
  const { events, alerts, health, connected, addEvent, addAlert, setHealth } = useCiroStore();
  const [pipelineStatus, setPipelineStatus] = useState<"idle" | "running" | "done">("idle");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(`${API}/dashboard/summary`);
      if (!res.ok) return;
      const data = await res.json();
      (data.recent_incidents ?? []).forEach((inc: CrisisEvent) => addEvent(inc));
      (data.recent_alerts ?? []).forEach((a: { channel?: string; team?: string; location?: string; severity?: number; time?: string; sent_at?: string }) => {
        addAlert({
          channel: a.channel ?? "sms",
          team: a.team ?? "responders",
          location: a.location ?? "",
          severity: a.severity ?? 0,
          time: a.time ?? a.sent_at ?? new Date().toISOString(),
        } as AlertRecord);
      });
      setHealth({ agentsHealthy: true, eventsProcessed: data.active_incidents ?? 0 });
    } catch {}
  }, [addEvent, addAlert, setHealth]);

  useEffect(() => {
    fetchSummary();
    pollRef.current = setInterval(fetchSummary, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchSummary]);

  async function triggerPipeline() {
    setPipelineStatus("running");
    try {
      await fetch(`${API}/trigger`, { method: "POST" });
      setTimeout(() => { fetchSummary(); setPipelineStatus("done"); }, 5000);
      setTimeout(() => setPipelineStatus("idle"), 8000);
    } catch { setPipelineStatus("idle"); }
  }

  async function runDemo() {
    setPipelineStatus("running");
    try {
      await fetch(`${API}/demo/d-chowk-protest`, { method: "POST" });
      setTimeout(() => { fetchSummary(); setPipelineStatus("done"); }, 2000);
      setTimeout(() => setPipelineStatus("idle"), 5000);
    } catch { setPipelineStatus("idle"); }
  }

  const maxSev = Math.max(...events.map((e) => e.severity), 0);
  const latest = events[0];

  return (
    <main className="pt-[72px]" style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* Hero stats bar */}
      <section
        className="px-8 md:px-12 py-10 border-b"
        style={{ borderColor: "var(--rule)", background: "var(--bg-elev)" }}
      >
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-8">
            <div>
              <p className="font-mono text-[11px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--fg-3)" }}>
                — Raasta · Crisis Overview
              </p>
              <h1
                className="font-display"
                style={{ fontSize: "clamp(40px, 5vw, 80px)", color: "var(--fg)" }}
              >
                {maxSev >= 8
                  ? <><em style={{ color: "var(--accent)" }}>Critical</em> Alert Active</>
                  : events.length > 0
                    ? <><em style={{ color: "var(--accent)" }}>{events.length}</em> Event{events.length !== 1 ? "s" : ""} Live</>
                    : <>System <em style={{ color: "var(--accent)" }}>Standby</em></>
                }
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {pipelineStatus === "running" && (
                <span className="font-mono text-[11px] tracking-[0.12em] uppercase animate-pulse" style={{ color: "#F2C744" }}>
                  ● Running agents…
                </span>
              )}
              {pipelineStatus === "done" && (
                <span className="font-mono text-[11px] tracking-[0.12em] uppercase" style={{ color: "#4ade80" }}>
                  ✓ Pipeline complete
                </span>
              )}
              <button
                onClick={runDemo}
                disabled={pipelineStatus === "running"}
                className="magnetic ghost font-mono text-[11px] tracking-[0.12em] uppercase"
                style={{ padding: "10px 20px" }}
              >
                D-Chowk Demo
              </button>
              <button
                onClick={triggerPipeline}
                disabled={pipelineStatus === "running"}
                className="magnetic font-mono text-[11px] tracking-[0.12em] uppercase"
                style={{ padding: "10px 20px" }}
              >
                {pipelineStatus === "running" ? "⏳ Running…" : "▶ Run Pipeline"}
              </button>
            </div>
          </div>

          {/* Big stats */}
          <div className="grid grid-cols-3 gap-px" style={{ background: "var(--rule)" }}>
            {[
              { label: "Active Events", value: events.length, sub: "live crisis incidents" },
              { label: "Alerts Sent", value: alerts.length, sub: "dispatches this session" },
              { label: "Max Severity", value: maxSev > 0 ? `${maxSev}/10` : "—", sub: maxSev >= 8 ? "critical — action required" : maxSev >= 5 ? "elevated response" : "nominal" },
            ].map((s) => (
              <div key={s.label} className="px-8 py-6" style={{ background: "var(--bg-elev)" }}>
                <p className="num-ticker" style={{ fontSize: "clamp(48px, 6vw, 96px)", color: maxSev >= 8 && s.label === "Max Severity" ? "var(--accent)" : "var(--fg)" }}>
                  {s.value}
                </p>
                <p className="font-mono text-[11px] tracking-[0.18em] uppercase mt-1" style={{ color: "var(--fg-3)" }}>
                  {s.label}
                </p>
                <p className="font-mono text-[10px] tracking-[0.12em] mt-0.5" style={{ color: "var(--fg-3)" }}>
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent pipeline status */}
      <section className="px-8 md:px-12 py-5 border-b" style={{ borderColor: "var(--rule)" }}>
        <div className="max-w-[1600px] mx-auto flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 mr-4">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: connected ? "#4ade80" : "var(--accent)" }}
            />
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--fg-3)" }}>
              {connected ? "WebSocket Live" : "Polling"}
            </span>
          </div>
          {AGENTS.map((a) => (
            <div key={a.name} className="chip">
              <span style={{ color: "var(--accent)" }}>{a.n}</span>
              <span>{a.name}</span>
              <span style={{ color: "#4ade80", fontSize: 10 }}>●</span>
            </div>
          ))}
          {health.lastRun && (
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase ml-auto" style={{ color: "var(--fg-3)" }}>
              Last run {new Date(health.lastRun).toLocaleTimeString()}
            </span>
          )}
        </div>
      </section>

      {/* Main console grid */}
      <section className="px-8 md:px-12 py-8">
        <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-6">

          {/* Crisis feed */}
          <div className="col-span-12 lg:col-span-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: "var(--fg-3)" }}>
                — Live Event Feed
              </p>
              <button
                onClick={() => nav("/events")}
                className="font-mono text-[10px] tracking-[0.12em] uppercase"
                style={{ color: "var(--accent)" }}
              >
                View all →
              </button>
            </div>

            {events.length === 0 ? (
              <div
                className="rounded p-10 text-center"
                style={{ border: "1px solid var(--rule)", background: "var(--bg-elev)" }}
              >
                <div className="pulse-rings mx-auto mb-6" style={{ width: 120, height: 120 }}>
                  <span /><span /><span /><span />
                </div>
                <p className="font-mono text-[11px] tracking-[0.18em] uppercase" style={{ color: "var(--fg-3)" }}>
                  Awaiting signal
                </p>
                <p className="font-mono text-[10px] tracking-[0.12em] uppercase mt-2" style={{ color: "var(--fg-3)" }}>
                  Run D-Chowk Demo or Pipeline
                </p>
              </div>
            ) : (
              <div style={{ border: "1px solid var(--rule)", borderRadius: 4, overflow: "hidden" }}>
                {events.slice(0, 8).map((event, i) => (
                  <div
                    key={event.id}
                    onClick={() => nav("/events")}
                    className="ticker-row cursor-pointer hover:bg-white/5 transition-colors px-4"
                    style={{
                      gridTemplateColumns: "70px 110px 1fr 55px",
                      animationDelay: `${i * 60}ms`,
                      background: i === 0 ? "rgba(232,58,44,0.06)" : "transparent",
                    }}
                  >
                    <span className="font-mono text-[10px]" style={{ color: "var(--fg-3)" }}>
                      {new Date(event.detected_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="font-mono text-[11px]" style={{ color: "var(--fg-2)" }}>
                      {event.location.split("/")[0].trim().slice(0, 12)}
                    </span>
                    <span className="font-mono text-[11px] truncate" style={{ color: "var(--fg-2)" }}>
                      {TYPE_LABEL[event.type] ?? event.type}
                    </span>
                    <span className={`sev-glyph ${sevClass(event.severity)} text-right`}>
                      S{event.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="col-span-12 lg:col-span-4">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: "var(--fg-3)" }}>
                — Pakistan · Live Map
              </p>
              <button
                onClick={() => nav("/map")}
                className="font-mono text-[10px] tracking-[0.12em] uppercase"
                style={{ color: "var(--accent)" }}
              >
                Expand →
              </button>
            </div>
            <div
              className="relative overflow-hidden rounded"
              style={{ border: "1px solid var(--rule)", background: "var(--bg-elev)", aspectRatio: "4/3" }}
            >
              <svg viewBox="0 0 400 320" className="absolute inset-0 w-full h-full p-6 opacity-30">
                <path
                  d="M80,60 L130,40 L190,38 L250,52 L300,80 L320,130 L315,185 L280,230 L230,265 L180,270 L140,245 L105,200 L85,155 L75,110 Z"
                  fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeDasharray="4 5"
                />
                <text x="175" y="155" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="11" fontFamily="Geist Mono, monospace" letterSpacing="2">PAKISTAN</text>
              </svg>
              {events.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--fg-3)" }}>
                    No incidents
                  </p>
                </div>
              ) : (
                events.slice(0, 8).map((e, i) => (
                  <div
                    key={e.id}
                    className="absolute"
                    style={{ left: `${20 + (i % 4) * 18}%`, top: `${28 + Math.floor(i / 4) * 30}%`, transform: "translate(-50%, -50%)" }}
                  >
                    <div className="map-dot" />
                    <span
                      className="absolute top-5 left-1/2 font-mono text-[8px] whitespace-nowrap"
                      style={{ transform: "translateX(-50%)", color: "var(--fg-3)" }}
                    >
                      {e.location.split("/")[0].trim().slice(0, 10)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Latest event detail */}
          <div className="col-span-12 lg:col-span-3">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase mb-4" style={{ color: "var(--fg-3)" }}>
              — Latest Incident
            </p>
            {latest ? (
              <div
                className="rounded p-5 space-y-4"
                style={{ border: "1px solid var(--rule)", background: "var(--bg-elev)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-2xl capitalize" style={{ lineHeight: 1 }}>
                      {latest.type.replace("_", " ")}
                    </h3>
                    <p className="font-mono text-[10px] tracking-[0.12em] uppercase mt-1" style={{ color: "var(--fg-3)" }}>
                      {latest.location}
                    </p>
                  </div>
                  <span className={`sev-glyph ${sevClass(latest.severity)}`}>
                    SEV {latest.severity}
                  </span>
                </div>

                <div
                  className="h-px w-full"
                  style={{ background: "var(--rule)" }}
                />

                <p className="text-sm leading-relaxed" style={{ color: "var(--fg-2)" }}>
                  {latest.summary}
                </p>

                {latest.trajectory && (
                  <div className="chip" style={{ display: "inline-flex" }}>
                    <span style={{ color: latest.trajectory === "critical" ? "var(--accent)" : latest.trajectory === "worsening" ? "#F2C744" : "#4ade80" }}>●</span>
                    <span className="capitalize">{latest.trajectory}</span>
                  </div>
                )}

                {latest.actions && latest.actions.length > 0 && (
                  <div className="space-y-1.5">
                    {latest.actions.slice(0, 3).map((a, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="font-mono text-[9px] mt-0.5" style={{ color: "var(--accent)" }}>✓</span>
                        <span className="font-mono text-[10px] leading-snug" style={{ color: "var(--fg-3)" }}>{a}</span>
                      </div>
                    ))}
                  </div>
                )}

                {latest.population_at_risk && (
                  <p className="font-mono text-[10px] tracking-[0.1em] uppercase pt-2" style={{ color: "var(--fg-3)", borderTop: "1px solid var(--rule)" }}>
                    Pop. at risk: <span style={{ color: "var(--fg-2)" }}>{latest.population_at_risk.toLocaleString()}</span>
                  </p>
                )}
              </div>
            ) : (
              <div
                className="rounded p-5"
                style={{ border: "1px solid var(--rule)", background: "var(--bg-elev)" }}
              >
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--fg-3)" }}>
                  No incidents detected
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
