import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CRISIS_TYPES = ["flood", "fire", "cyber", "civil", "medical", "industrial", "heatwave", "road_blockage"];
const PK_CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar", "Quetta", "Multan", "Faisalabad"];

export function SimulatePanel({ onSimulated }: { onSimulated?: () => void }) {
  const [type, setType] = useState("flood");
  const [location, setLocation] = useState("Karachi");
  const [severity, setSeverity] = useState(8);
  const [desc, setDesc] = useState("Simulated crisis event for demonstration.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crisis_type: type, location, severity_override: severity, description: desc }),
      });
      const data = await res.json();
      const display = data.simulated_event ?? data;
      setResult(JSON.stringify(display, null, 2));
      // Refresh incident feed after backend processes the simulation
      setTimeout(() => onSimulated?.(), 2500);
    } catch (err) {
      setResult("Error: " + err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <h3 className="text-white font-semibold mb-3">🎯 Inject Simulation</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-slate-700 text-white rounded px-2 py-1 text-sm"
          >
            {CRISIS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-slate-700 text-white rounded px-2 py-1 text-sm"
          >
            {PK_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 w-20">Severity: {severity}</label>
          <input
            type="range" min={1} max={10} value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            className="flex-1"
          />
        </div>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          className="w-full bg-slate-700 text-white rounded px-2 py-1 text-sm resize-none"
          placeholder="Description..."
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white rounded py-1.5 text-sm font-medium transition-colors"
        >
          {loading ? "Dispatching..." : "🚨 Trigger Crisis"}
        </button>
      </form>
      {result && (
        <pre className="mt-3 text-xs text-green-400 bg-slate-900 rounded p-2 overflow-auto max-h-32">
          {result}
        </pre>
      )}
    </div>
  );
}
