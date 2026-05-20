import { useState } from "react";
import { useCiroStore } from "../store/useCiroStore";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CRISIS_TYPES = [
  { id: "flood",        label: "Flood",        icon: "🌊", desc: "Flash flood or monsoon surge" },
  { id: "fire",         label: "Fire",          icon: "🔥", desc: "Urban or industrial fire event" },
  { id: "cyber",        label: "Cyber",         icon: "💻", desc: "Infrastructure cyber attack" },
  { id: "civil",        label: "Civil Unrest",  icon: "👥", desc: "Protest or public disturbance" },
  { id: "medical",      label: "Medical",       icon: "🏥", desc: "Mass casualty or outbreak" },
  { id: "industrial",   label: "Industrial",    icon: "🏭", desc: "Factory or plant incident" },
  { id: "heatwave",     label: "Heatwave",      icon: "☀️", desc: "Extreme heat event" },
  { id: "road_blockage",label: "Road Block",    icon: "🚧", desc: "Route obstruction or closure" },
];

const PK_CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar", "Quetta", "Multan", "Faisalabad", "Hyderabad", "Gujranwala"];

type SimStatus = "idle" | "loading" | "done" | "error";

export function SimulatePage() {
  const { addEvent } = useCiroStore();
  const [selectedType, setSelectedType] = useState("flood");
  const [location, setLocation] = useState("Karachi");
  const [severity, setSeverity] = useState(8);
  const [desc, setDesc] = useState("Simulated crisis for demonstration.");
  const [status, setStatus] = useState<SimStatus>("idle");
  const [result, setResult] = useState<string | null>(null);

  async function handleSimulate(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setResult(null);
    try {
      const res = await fetch(`${API}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crisis_type: selectedType, location, severity_override: severity, description: desc }),
      });
      const data = await res.json();
      const ev = data.simulated_event ?? data;
      if (ev?.id) addEvent(ev);
      setResult(JSON.stringify(data, null, 2));
      setStatus("done");
    } catch (err) {
      setResult(String(err));
      setStatus("error");
    }
  }

  async function runDemo() {
    setStatus("loading");
    setResult(null);
    try {
      await fetch(`${API}/demo/d-chowk-protest`, { method: "POST" });
      setStatus("done");
      setResult("D-Chowk protest scenario dispatched. Check Overview for results.");
    } catch (err) {
      setResult(String(err));
      setStatus("error");
    }
  }

  function sevColor(s: number) {
    if (s >= 8) return "var(--accent)";
    if (s >= 5) return "#F2C744";
    return "#4ade80";
  }

  return (
    <main className="pt-[72px]" style={{ background: "var(--bg)", minHeight: "100vh" }}>

      <section className="px-8 md:px-12 py-10 border-b" style={{ borderColor: "var(--rule)", background: "var(--bg-elev)" }}>
        <div className="max-w-[1600px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--fg-3)" }}>
            — Inject Scenario
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(40px, 5vw, 80px)" }}>
            Simulate <em style={{ color: "var(--accent)" }}>Crisis</em>
          </h1>
          <p className="font-mono text-sm mt-3 max-w-xl" style={{ color: "var(--fg-3)" }}>
            Inject a synthetic crisis event into the pipeline to test detection, routing, and dispatch in real-time.
          </p>
        </div>
      </section>

      <section className="px-8 md:px-12 py-8">
        <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8">

          {/* Preset scenarios */}
          <div className="col-span-12 lg:col-span-8">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase mb-5" style={{ color: "var(--fg-3)" }}>
              Crisis Type
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {CRISIS_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className="text-left p-4 rounded transition-all"
                  style={{
                    border: selectedType === t.id ? "1px solid var(--accent)" : "1px solid var(--rule)",
                    background: selectedType === t.id ? "rgba(232,58,44,0.1)" : "var(--bg-elev)",
                  }}
                >
                  <p className="text-2xl mb-2">{t.icon}</p>
                  <p className="font-display text-lg">{t.label}</p>
                  <p className="font-mono text-[9px] tracking-[0.1em] uppercase mt-1" style={{ color: "var(--fg-3)" }}>
                    {t.desc}
                  </p>
                </button>
              ))}
            </div>

            <form onSubmit={handleSimulate} className="space-y-6">
              {/* Location + severity */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="font-mono text-[10px] tracking-[0.18em] uppercase block mb-2" style={{ color: "var(--fg-3)" }}>
                    Location
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded px-4 py-3 font-mono text-sm"
                    style={{ background: "var(--bg-elev)", border: "1px solid var(--rule)", color: "var(--fg)" }}
                  >
                    {PK_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[10px] tracking-[0.18em] uppercase block mb-2" style={{ color: "var(--fg-3)" }}>
                    Severity: <span style={{ color: sevColor(severity) }}>{severity}/10</span>
                  </label>
                  <input
                    type="range" min={1} max={10} value={severity}
                    onChange={(e) => setSeverity(Number(e.target.value))}
                    className="w-full mt-2"
                    style={{ accentColor: sevColor(severity) }}
                  />
                  <div className="flex justify-between font-mono text-[9px] mt-1" style={{ color: "var(--fg-3)" }}>
                    <span>Low</span><span>Critical</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-mono text-[10px] tracking-[0.18em] uppercase block mb-2" style={{ color: "var(--fg-3)" }}>
                  Description
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded px-4 py-3 font-mono text-sm resize-none"
                  style={{ background: "var(--bg-elev)", border: "1px solid var(--rule)", color: "var(--fg)" }}
                  placeholder="Describe the crisis scenario..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="magnetic font-mono text-[11px] tracking-[0.12em] uppercase"
                  style={{ padding: "12px 28px", opacity: status === "loading" ? 0.6 : 1 }}
                >
                  {status === "loading" ? "⏳ Dispatching…" : "🚨 Inject Crisis"}
                </button>
                <button
                  type="button"
                  onClick={runDemo}
                  disabled={status === "loading"}
                  className="magnetic ghost font-mono text-[11px] tracking-[0.12em] uppercase"
                  style={{ padding: "12px 28px", opacity: status === "loading" ? 0.6 : 1 }}
                >
                  D-Chowk Preset →
                </button>
              </div>
            </form>
          </div>

          {/* Result panel */}
          <div className="col-span-12 lg:col-span-4">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase mb-4" style={{ color: "var(--fg-3)" }}>
              — Response Output
            </p>
            <div
              className="rounded p-5"
              style={{ border: "1px solid var(--rule)", background: "var(--bg-elev)", minHeight: 300 }}
            >
              {status === "idle" && (
                <p className="font-mono text-[10px] tracking-[0.12em] uppercase" style={{ color: "var(--fg-3)" }}>
                  Configure and inject a scenario to see the pipeline response here.
                </p>
              )}
              {status === "loading" && (
                <div className="flex items-center gap-3">
                  <span className="animate-pulse font-mono text-[11px] tracking-[0.12em] uppercase" style={{ color: "#F2C744" }}>
                    ● Agents processing…
                  </span>
                </div>
              )}
              {status === "done" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] tracking-[0.12em] uppercase" style={{ color: "#4ade80" }}>
                      ✓ Scenario injected
                    </span>
                  </div>
                  {result && (
                    <pre className="font-mono text-[10px] leading-relaxed overflow-auto max-h-64 p-3 rounded" style={{ background: "var(--bg)", color: "var(--fg-2)", border: "1px solid var(--rule)" }}>
                      {result}
                    </pre>
                  )}
                </div>
              )}
              {status === "error" && (
                <div className="space-y-2">
                  <p className="font-mono text-[10px] tracking-[0.12em] uppercase" style={{ color: "var(--accent)" }}>
                    ✕ Error
                  </p>
                  <pre className="font-mono text-[10px] p-3 rounded overflow-auto" style={{ background: "var(--bg)", color: "var(--accent)", border: "1px solid rgba(232,58,44,0.3)" }}>
                    {result}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
