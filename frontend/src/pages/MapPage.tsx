import { useState, useEffect, useRef, useCallback } from "react";
import { useCiroStore } from "../store/useCiroStore";
import type { CrisisEvent, AlertRecord } from "../types";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

function sevClass(s: number) {
  if (s >= 9) return "sev-9";
  if (s >= 7) return "sev-7";
  if (s >= 4) return "sev-4";
  return "sev-1";
}

function sevColor(s: number) {
  if (s >= 9) return "#E83A2C";
  if (s >= 7) return "#E83A2C";
  if (s >= 4) return "#F2C744";
  return "#6FBF6F";
}

// Pre-defined route paths (SVG coordinate space 0 0 400 320)
const ROUTES: Array<{
  id: string;
  label: string;
  from: string;
  to: string;
  blockedPath: string;   // SVG path for original/blocked route
  safePath: string;      // SVG path for safe alternative
  crisisPoint: [number, number];
  keywords: string[];    // match against event locations
}> = [
  {
    id: "g11-bluearea",
    label: "G-11 → Blue Area",
    from: "G-11, Islamabad",
    to: "Blue Area, Islamabad",
    blockedPath: "M 200,108 L 210,100 L 215,92 L 220,88",
    safePath: "M 200,108 L 205,115 L 218,110 L 225,100 L 222,90 L 220,88",
    crisisPoint: [215, 92],
    keywords: ["islamabad", "d-chowk", "rawalpindi", "constitution"],
  },
  {
    id: "karachi-port",
    label: "Korangi → Port",
    from: "Korangi, Karachi",
    to: "Karachi Port",
    blockedPath: "M 148,250 L 140,248 L 132,242",
    safePath: "M 148,250 L 145,258 L 136,255 L 132,242",
    crisisPoint: [140, 248],
    keywords: ["karachi", "korangi", "hub"],
  },
];

// SVG viewBox is 0 0 400 320 — coordinates are within that space
const CITY_COORDS: Record<string, [number, number]> = {
  "pakistan": [190, 155],
  "islamabad": [215, 95],
  "rawalpindi": [212, 100],
  "lahore": [238, 132],
  "faisalabad": [212, 138],
  "karachi": [138, 248],
  "hyderabad": [155, 238],
  "peshawar": [168, 82],
  "quetta": [118, 188],
  "multan": [192, 168],
  "gujranwala": [228, 120],
  "d-chowk": [215, 92],
  "hub": [128, 232],
  "sukkur": [168, 205],
  "larkana": [155, 215],
  "sialkot": [232, 112],
};

function cityCoord(location: string): [number, number] {
  const loc = location.toLowerCase();
  for (const [key, coord] of Object.entries(CITY_COORDS)) {
    if (loc.includes(key)) return coord;
  }
  // Deterministic fallback inside Pakistan border
  let hash = 0;
  for (let i = 0; i < location.length; i++) hash = (hash * 31 + location.charCodeAt(i)) & 0xffff;
  return [130 + (hash % 110), 95 + ((hash >> 4) % 130)];
}

export function MapPage() {
  const { events, addEvent, addAlert, setHealth } = useCiroStore();
  const [hovered, setHovered] = useState<CrisisEvent | null>(null);
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

  return (
    <main className="pt-[72px]" style={{ background: "var(--bg)", minHeight: "100vh" }}>

      <section className="px-8 md:px-12 py-10 border-b" style={{ borderColor: "var(--rule)", background: "var(--bg-elev)" }}>
        <div className="max-w-[1600px] mx-auto flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--fg-3)" }}>
              — Pakistan · Live Map
            </p>
            <h1 className="font-display" style={{ fontSize: "clamp(40px, 5vw, 80px)" }}>
              Crisis <em style={{ color: "var(--accent)" }}>Coverage</em>
            </h1>
          </div>
          <div className="flex items-center gap-5 flex-wrap">
            {[
              { label: "Critical / High", color: "#E83A2C" },
              { label: "Medium", color: "#F2C744" },
              { label: "Low", color: "#6FBF6F" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                <span className="font-mono text-[10px] tracking-[0.12em] uppercase" style={{ color: "var(--fg-3)" }}>
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 md:px-12 py-8">
        <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-6">

          {/* Map canvas */}
          <div className="col-span-12 lg:col-span-8">
            <div
              className="relative rounded overflow-hidden"
              style={{ border: "1px solid var(--rule)", background: "var(--bg-elev)", aspectRatio: "4/3" }}
            >
              <svg viewBox="0 0 400 320" className="absolute inset-0 w-full h-full">
                {/* Background grid */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="400" height="320" fill="url(#grid)" />

                {/* Pakistan outline */}
                <path
                  d="M80,60 L130,40 L190,38 L250,52 L300,80 L320,130 L315,185 L280,230 L230,265 L180,270 L140,245 L105,200 L85,155 L75,110 Z"
                  fill="rgba(255,255,255,0.015)"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1.5"
                  strokeDasharray="4 5"
                />

                {/* Active route overlays */}
                {ROUTES.filter(r =>
                  events.some(e => r.keywords.some(k => e.location.toLowerCase().includes(k)))
                ).map(r => (
                  <g key={r.id}>
                    {/* Blocked original route — red dashed */}
                    <path
                      d={r.blockedPath}
                      fill="none"
                      stroke="#E83A2C"
                      strokeWidth={2.5}
                      strokeDasharray="4 3"
                      opacity={0.7}
                    />
                    {/* Safe alternative route — green solid */}
                    <path
                      d={r.safePath}
                      fill="none"
                      stroke="#4ade80"
                      strokeWidth={2}
                      opacity={0.85}
                    />
                    {/* Crisis zone marker */}
                    <circle
                      cx={r.crisisPoint[0]}
                      cy={r.crisisPoint[1]}
                      r={6}
                      fill="#E83A2C22"
                      stroke="#E83A2C"
                      strokeWidth={1}
                    />
                    {/* Route labels */}
                    <text
                      x={r.crisisPoint[0] + 10}
                      y={r.crisisPoint[1] - 8}
                      fill="#E83A2C"
                      fontSize="6"
                      fontFamily="monospace"
                    >
                      BLOCKED
                    </text>
                    <text
                      x={r.crisisPoint[0] + 10}
                      y={r.crisisPoint[1] + 2}
                      fill="#4ade80"
                      fontSize="6"
                      fontFamily="monospace"
                    >
                      ALT ROUTE
                    </text>
                  </g>
                ))}

                {/* City dot markers */}
                {Object.entries(CITY_COORDS).slice(1, 9).map(([city, [x, y]]) => (
                  <g key={city}>
                    <circle cx={x} cy={y} r={1.5} fill="rgba(255,255,255,0.15)" />
                    <text x={x} y={y - 5} textAnchor="middle" fill="rgba(255,255,255,0.1)" fontSize="6" fontFamily="monospace">
                      {city.charAt(0).toUpperCase() + city.slice(1)}
                    </text>
                  </g>
                ))}

                {/* Live event pins */}
                {events.map((e, idx) => {
                  const [x, y] = cityCoord(e.location);
                  const color = sevColor(e.severity);
                  const dur = 2 + (idx % 3) * 0.5;
                  return (
                    <g
                      key={e.id}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHovered(e)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {/* Outer pulse ring */}
                      <circle cx={x} cy={y} r={14} fill="none" stroke={color} strokeWidth={0.8} opacity={0.3}>
                        <animate attributeName="r" values={`8;20;8`} dur={`${dur + 0.5}s`} repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.4;0;0.4" dur={`${dur + 0.5}s`} repeatCount="indefinite" />
                      </circle>
                      {/* Inner pulse ring */}
                      <circle cx={x} cy={y} r={8} fill={`${color}18`} stroke={color} strokeWidth={1}>
                        <animate attributeName="r" values={`5;10;5`} dur={`${dur}s`} repeatCount="indefinite" />
                      </circle>
                      {/* Core dot */}
                      <circle cx={x} cy={y} r={4} fill={color}>
                        <animate attributeName="opacity" values="1;0.7;1" dur={`${dur}s`} repeatCount="indefinite" />
                      </circle>
                      {/* Severity label */}
                      <text x={x + 8} y={y + 4} fill={color} fontSize="7" fontFamily="monospace" fontWeight="bold">
                        S{e.severity}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Live counter */}
              <div className="absolute top-3 left-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: events.length > 0 ? "#E83A2C" : "#4ade80" }} />
                <span className="font-mono text-[9px] tracking-[0.22em] uppercase" style={{ color: "var(--fg-3)" }}>
                  {events.length > 0 ? `${events.length} active` : "monitoring"}
                </span>
              </div>

              <p className="absolute top-3 right-4 font-mono text-[9px] tracking-[0.18em] uppercase" style={{ color: "var(--fg-3)" }}>
                PK · LIVE
              </p>

              {/* Route legend */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#E83A2C" strokeWidth="2" strokeDasharray="4 2"/></svg>
                  <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: "var(--fg-3)" }}>Blocked route</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#4ade80" strokeWidth="2"/></svg>
                  <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: "var(--fg-3)" }}>Safe route</span>
                </div>
              </div>

              {/* Hover tooltip */}
              {hovered && (
                <div
                  className="absolute bottom-4 left-4 rounded p-4 pointer-events-none"
                  style={{
                    background: "rgba(10,10,10,0.95)",
                    border: "1px solid var(--rule-strong)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
                    maxWidth: 280,
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <p className="font-display text-xl capitalize" style={{ lineHeight: 1 }}>
                      {hovered.type.replace(/_/g, " ")}
                    </p>
                    <span className={`sev-glyph ${sevClass(hovered.severity)}`}>S{hovered.severity}</span>
                  </div>
                  <p className="font-mono text-[10px] tracking-[0.12em] uppercase mb-2" style={{ color: "var(--fg-3)" }}>
                    {hovered.location}
                  </p>
                  <p className="font-mono text-[10px] leading-snug" style={{ color: "var(--fg-2)" }}>
                    {hovered.summary?.slice(0, 120)}
                  </p>
                  {hovered.population_at_risk && (
                    <p className="font-mono text-[9px] mt-2" style={{ color: "var(--fg-3)" }}>
                      Pop. at risk: {hovered.population_at_risk.toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {events.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: "var(--fg-3)" }}>
                    Awaiting incidents…
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-3">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: "var(--fg-3)" }}>
              — Incident Index
            </p>
            {events.length === 0 ? (
              <div
                className="rounded p-5"
                style={{ border: "1px solid var(--rule)", background: "var(--bg-elev)" }}
              >
                <p className="font-mono text-[10px] tracking-[0.12em] uppercase" style={{ color: "var(--fg-3)" }}>
                  No incidents plotted
                </p>
              </div>
            ) : (
              events.slice(0, 12).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 px-4 py-3 rounded cursor-pointer transition-colors"
                  style={{
                    border: `1px solid ${hovered?.id === e.id ? sevColor(e.severity) + "60" : "var(--rule)"}`,
                    background: hovered?.id === e.id ? `${sevColor(e.severity)}08` : "transparent",
                  }}
                  onMouseEnter={() => setHovered(e)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: sevColor(e.severity), boxShadow: `0 0 6px ${sevColor(e.severity)}` }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[11px] capitalize truncate" style={{ color: "var(--fg-2)" }}>
                      {e.type.replace(/_/g, " ")} · {e.location.split("/")[0].trim().slice(0, 20)}
                    </p>
                    <p className="font-mono text-[9px] mt-0.5" style={{ color: "var(--fg-3)" }}>
                      {new Date(e.detected_at).toLocaleTimeString()}
                      {e.trajectory && ` · ${e.trajectory}`}
                    </p>
                  </div>
                  <span className={`sev-glyph ${sevClass(e.severity)}`}>S{e.severity}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
