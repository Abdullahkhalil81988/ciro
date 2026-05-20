/* DashboardMockup — a stylized preview of the real Raasta console, used on /
 * It mirrors your real dashboard's information density but adapted to the
 * editorial dark theme. Static data — replace with live store reads if you
 * want a live preview on the landing.
 */
export function DashboardMockup() {
  return (
    <div className="dash-card">
      {/* Top chrome */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ borderBottom: "1px solid var(--bg-line)" }}
      >
        <div className="flex items-center gap-3">
          <span className="pulse-dot" />
          <span className="font-mono text-[12px] tracking-[0.18em] uppercase">Raasta · Operations</span>
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-50">Pakistan · 24h</span>
        </div>
        <div className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-60">MAX SEV 9/10</div>
      </div>

      {/* Agent row */}
      <div
        className="flex items-center gap-6 px-6 py-2 font-mono text-[10px] tracking-[0.18em] uppercase opacity-80"
        style={{ borderBottom: "1px solid var(--bg-line)" }}
      >
        {["Monitor", "Detect", "Analyze", "Route", "Dispatch", "Outcome", "Report"].map((a) => (
          <div key={a} className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
            {a}
          </div>
        ))}
        <span className="ml-auto opacity-50">last run · 02:38</span>
      </div>

      {/* Stat row */}
      <div
        className="grid grid-cols-3 px-6 py-4"
        style={{ borderBottom: "1px solid var(--bg-line)" }}
      >
        {[
          { l: "Active events", v: "14" },
          { l: "Alerts sent",   v: "37" },
          { l: "Pipeline runs", v: "2,409" },
        ].map((s) => (
          <div key={s.l}>
            <p className="font-display text-3xl">{s.v}</p>
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-50">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="grid grid-cols-12 h-[420px]">
        {/* Crisis list */}
        <div
          className="col-span-4 p-4 space-y-3 overflow-hidden"
          style={{ borderRight: "1px solid var(--bg-line)" }}
        >
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-60">Active events</p>
          {[
            { type: "Flood",    loc: "Sindh / Khairpur",   sev: 9, traj: "critical" },
            { type: "Cyber",    loc: "NTC backbone",       sev: 9, traj: "worsening" },
            { type: "Fire",     loc: "Murree forest belt", sev: 7, traj: "worsening" },
            { type: "Heatwave", loc: "Jacobabad",          sev: 7, traj: "stable" },
          ].map((e) => (
            <div
              key={e.loc}
              className="p-3 rounded-sm"
              style={{ background: "var(--bg-elev)", border: "1px solid var(--bg-line)" }}
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] tracking-wider uppercase">{e.type}</p>
                <span className={`sev-glyph sev-${e.sev}`}>SEV {e.sev}</span>
              </div>
              <p className="text-sm mt-1 opacity-80">{e.loc}</p>
              <p className="font-mono text-[9px] tracking-[0.18em] uppercase opacity-50 mt-1">↗ {e.traj}</p>
            </div>
          ))}
        </div>

        {/* Map */}
        <div
          className="col-span-5 dot-grid dark relative"
          style={{ borderRight: "1px solid var(--bg-line)" }}
        >
          <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full p-6 opacity-40">
            <path
              d="M70,80 L120,55 L180,50 L240,60 L290,90 L310,140 L300,190 L260,230 L210,260 L160,250 L120,220 L90,180 L70,130 Z"
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
          </svg>
          <p className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.2em] uppercase opacity-60">
            PK · Live map
          </p>
          <div className="map-dot" style={{ left: "32%", top: "62%" }} />
          <div className="map-dot" style={{ left: "55%", top: "38%" }} />
          <div className="map-dot" style={{ left: "68%", top: "55%" }} />
          <div className="map-dot" style={{ left: "40%", top: "45%" }} />
        </div>

        {/* Detail */}
        <div className="col-span-3 p-4">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-60">Detail · Sindh</p>
          <p className="text-base mt-2 opacity-90 leading-snug">
            "Indus tributary breach SE of Khairpur. ~12,400 population in 5km radius. Trajectory: critical."
          </p>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-60 mt-4">Actions</p>
          <div className="mt-2 space-y-1.5 font-mono text-[11px] opacity-80">
            <p>✓ PDMA Sindh notified</p>
            <p>✓ Rescue 1122 dispatched</p>
            <p>✓ SMS cluster · 12,400</p>
            <p className="opacity-60">⟳ Drone survey requested</p>
          </div>
        </div>
      </div>
    </div>
  );
}
