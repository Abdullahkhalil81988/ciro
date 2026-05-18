import { useEffect } from "react";
import { useCiroStore } from "./store/useCiroStore";
import { useWebSocket } from "./hooks/useWebSocket";
import { CrisisCard } from "./components/CrisisCard";
import { AgentStatusBar } from "./components/AgentStatusBar";
import { SimulatePanel } from "./components/SimulatePanel";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  useWebSocket();
  const { events, alerts, health } = useCiroStore();

  async function triggerPipeline() {
    await fetch(`${API}/trigger`, { method: "POST" });
  }

  const maxSeverity = Math.max(...events.map((e) => e.severity), 0);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-mono">
      {/* Header */}
      <header className="border-b border-slate-700 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-red-500">CIRO</h1>
          <p className="text-xs text-slate-500">Crisis Intelligence & Response Orchestrator</p>
        </div>
        <div className="flex items-center gap-4">
          {maxSeverity > 0 && (
            <div className={`text-sm font-bold ${maxSeverity >= 8 ? "text-red-400 animate-pulse" : "text-orange-400"}`}>
              MAX SEVERITY: {maxSeverity}/10
            </div>
          )}
          <button
            onClick={triggerPipeline}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm"
          >
            ▶ Run Pipeline
          </button>
        </div>
      </header>

      {/* Agent status */}
      <div className="border-b border-slate-800 px-6 py-2">
        <AgentStatusBar />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 border-b border-slate-800 divide-x divide-slate-800">
        {[
          { label: "Active Events", value: events.length },
          { label: "Alerts Sent", value: alerts.length },
          { label: "Pipeline Runs", value: health.eventsProcessed },
        ].map((s) => (
          <div key={s.label} className="px-6 py-3 text-center">
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-12 gap-0 h-[calc(100vh-160px)]">
        {/* Crisis feed */}
        <div className="col-span-4 border-r border-slate-800 overflow-y-auto p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            Active Crisis Events
          </h2>
          {events.length === 0 ? (
            <div className="text-slate-600 text-sm text-center pt-8">
              No active events. Run pipeline or inject a simulation.
            </div>
          ) : (
            events.map((event) => <CrisisCard key={event.id} event={event} />)
          )}
        </div>

        {/* Map placeholder + alerts */}
        <div className="col-span-5 border-r border-slate-800 flex flex-col">
          <div className="flex-1 bg-slate-950 flex items-center justify-center relative overflow-hidden">
            {/* Map placeholder — wire react-leaflet here */}
            <div className="text-slate-700 text-center">
              <p className="text-4xl">🗺️</p>
              <p className="text-sm mt-2">Map — wire React-Leaflet</p>
              <p className="text-xs text-slate-800 mt-1">Pakistan — incident pins by severity</p>
            </div>
            {/* Severity dots for detected events */}
            {events.slice(0, 5).map((e, i) => (
              <div
                key={e.id}
                className={`absolute w-4 h-4 rounded-full animate-ping opacity-75 ${
                  e.severity >= 8 ? "bg-red-500" : e.severity >= 5 ? "bg-orange-500" : "bg-yellow-400"
                }`}
                style={{ left: `${20 + i * 15}%`, top: `${30 + (i % 3) * 20}%` }}
              />
            ))}
          </div>

          {/* Alert log */}
          <div className="h-40 border-t border-slate-800 overflow-y-auto p-3">
            <p className="text-xs text-slate-500 uppercase mb-2">Alert Log</p>
            {alerts.length === 0 ? (
              <p className="text-xs text-slate-700">No alerts dispatched yet.</p>
            ) : (
              alerts.slice(0, 20).map((a, i) => (
                <div key={i} className="text-xs text-slate-400 flex gap-2 py-0.5">
                  <span className="text-slate-600">{new Date(a.time).toLocaleTimeString()}</span>
                  <span className="text-blue-400">[{a.channel}]</span>
                  <span>→ {a.team || "team"}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Simulate + detail panel */}
        <div className="col-span-3 overflow-y-auto p-4 space-y-4">
          <SimulatePanel />

          {/* Latest event detail */}
          {events[0] && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Latest Event Detail</h3>
              <p className="text-xs text-slate-300 mb-2">{events[0].summary}</p>
              <div className="space-y-1">
                {events[0].actions?.map((a, i) => (
                  <div key={i} className="text-xs text-slate-500 flex gap-2">
                    <span className="text-green-500">✓</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
