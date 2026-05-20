import { useState } from "react";
import { useCiroStore } from "../store/useCiroStore";
import type { CrisisEvent } from "../types";

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

function trajectoryColor(t?: string) {
  if (t === "critical") return "var(--accent)";
  if (t === "worsening") return "#F2C744";
  return "#4ade80";
}

function EventDetail({ event, onClose }: { event: CrisisEvent; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded p-8 space-y-6"
        style={{ background: "var(--bg-elev)", border: "1px solid var(--rule-strong)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 font-mono text-[10px] tracking-[0.18em] uppercase"
          style={{ color: "var(--fg-3)" }}
        >
          ✕ Close
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl capitalize" style={{ lineHeight: 1 }}>
              {event.type.replace("_", " ")}
            </h2>
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase mt-2" style={{ color: "var(--fg-3)" }}>
              {event.location}
            </p>
          </div>
          <span className={`sev-glyph ${sevClass(event.severity)}`} style={{ fontSize: 14, padding: "6px 12px" }}>
            SEV {event.severity}/10
          </span>
        </div>

        <div className="h-px" style={{ background: "var(--rule)" }} />

        <p className="text-base leading-relaxed" style={{ color: "var(--fg-2)" }}>
          {event.summary}
        </p>

        <div className="grid grid-cols-2 gap-4">
          {event.trajectory && (
            <div style={{ border: "1px solid var(--rule)", borderRadius: 4, padding: "12px 16px" }}>
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase mb-1" style={{ color: "var(--fg-3)" }}>Trajectory</p>
              <p className="font-mono text-sm capitalize" style={{ color: trajectoryColor(event.trajectory) }}>
                ↗ {event.trajectory}
              </p>
            </div>
          )}
          {event.population_at_risk && (
            <div style={{ border: "1px solid var(--rule)", borderRadius: 4, padding: "12px 16px" }}>
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase mb-1" style={{ color: "var(--fg-3)" }}>Population at Risk</p>
              <p className="font-mono text-sm" style={{ color: "var(--fg-2)" }}>
                {event.population_at_risk.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {event.actions && event.actions.length > 0 && (
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase mb-3" style={{ color: "var(--fg-3)" }}>
              Recommended Actions
            </p>
            <div className="space-y-2">
              {event.actions.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="font-mono text-[10px] mt-0.5" style={{ color: "var(--accent)" }}>0{i + 1}</span>
                  <span className="text-sm leading-snug" style={{ color: "var(--fg-2)" }}>{a}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="font-mono text-[10px] tracking-[0.12em]" style={{ color: "var(--fg-3)" }}>
          Detected: {new Date(event.detected_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export function EventsPage() {
  const { events } = useCiroStore();
  const [selected, setSelected] = useState<CrisisEvent | null>(null);
  const [filter, setFilter] = useState("all");

  const types = ["all", ...Array.from(new Set(events.map((e) => e.type)))];
  const filtered = filter === "all" ? events : events.filter((e) => e.type === filter);

  return (
    <main className="pt-[72px]" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {selected && <EventDetail event={selected} onClose={() => setSelected(null)} />}

      <section className="px-8 md:px-12 py-10 border-b" style={{ borderColor: "var(--rule)", background: "var(--bg-elev)" }}>
        <div className="max-w-[1600px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--fg-3)" }}>
            — Crisis Events
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(40px, 5vw, 80px)" }}>
            {events.length > 0
              ? <><em style={{ color: "var(--accent)" }}>{events.length}</em> Active Incidents</>
              : <>Event <em style={{ color: "var(--accent)" }}>Feed</em></>
            }
          </h1>
        </div>
      </section>

      <section className="px-8 md:px-12 py-6 border-b" style={{ borderColor: "var(--rule)" }}>
        <div className="max-w-[1600px] mx-auto flex items-center gap-3 flex-wrap">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="chip cursor-pointer transition-colors"
              style={{
                background: filter === t ? "rgba(232,58,44,0.15)" : "transparent",
                borderColor: filter === t ? "rgba(232,58,44,0.5)" : undefined,
                color: filter === t ? "var(--accent)" : undefined,
              }}
            >
              {t === "all" ? "All Types" : (TYPE_LABEL[t] ?? t)}
            </button>
          ))}
        </div>
      </section>

      <section className="px-8 md:px-12 py-8">
        <div className="max-w-[1600px] mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="pulse-rings mx-auto mb-6" style={{ width: 140, height: 140 }}>
                <span /><span /><span /><span />
              </div>
              <p className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: "var(--fg-3)" }}>
                No events detected
              </p>
              <p className="font-mono text-[10px] tracking-[0.12em] uppercase mt-2" style={{ color: "var(--fg-3)" }}>
                Run the pipeline from Overview to begin
              </p>
            </div>
          ) : (
            <div style={{ border: "1px solid var(--rule)", borderRadius: 4, overflow: "hidden" }}>
              {/* Header */}
              <div
                className="ticker-row px-5"
                style={{ gridTemplateColumns: "80px 160px 130px 1fr 70px", borderBottom: "1px solid var(--rule-strong)", animation: "none" }}
              >
                <span style={{ color: "var(--fg-3)" }}>TIME</span>
                <span style={{ color: "var(--fg-3)" }}>LOCATION</span>
                <span style={{ color: "var(--fg-3)" }}>TYPE</span>
                <span style={{ color: "var(--fg-3)" }}>SUMMARY</span>
                <span style={{ color: "var(--fg-3)" }}>SEV</span>
              </div>
              {filtered.map((event, i) => (
                <div
                  key={event.id}
                  onClick={() => setSelected(event)}
                  className="ticker-row cursor-pointer hover:bg-white/5 transition-colors px-5"
                  style={{
                    gridTemplateColumns: "80px 160px 130px 1fr 70px",
                    background: i === 0 ? "rgba(232,58,44,0.05)" : "transparent",
                    animationDelay: `${i * 40}ms`,
                  }}
                >
                  <span style={{ color: "var(--fg-3)" }}>
                    {new Date(event.detected_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span style={{ color: "var(--fg-2)" }}>
                    {event.location.split("/")[0].trim().slice(0, 18)}
                  </span>
                  <span style={{ color: "var(--fg-2)" }}>
                    {TYPE_LABEL[event.type] ?? event.type}
                  </span>
                  <span className="truncate" style={{ color: "var(--fg-3)" }}>
                    {event.summary?.slice(0, 80)}…
                  </span>
                  <span className={`sev-glyph ${sevClass(event.severity)}`}>
                    S{event.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
