import { Reveal, RevealLines } from "../components/landing/Reveal";
import { ClosingCTA } from "../components/landing/ClosingCTA";

interface Brief {
  code: string;
  title: string;
  region: string;
  sev: number;
  traj: string;
  lift: string;
  lead: string;
  blurb: string;
  tags: string[];
}

const BRIEFS: Brief[] = [
  {
    code: "PK-2025-08", title: "Sindh monsoon, second wave",
    region: "Sindh", sev: 9, traj: "critical",
    lift: "−47% median dispatch", lead: "+18min",
    blurb: "Indus tributary breach detected from satellite + ground sensors 24 minutes before official bulletin. 12,400 SMS dispatched in first 90 seconds.",
    tags: ["flood", "monsoon", "rural"],
  },
  {
    code: "PK-2025-11", title: "NTC backbone exfiltration",
    region: "Federal", sev: 9, traj: "worsening",
    lift: "+18min lead time", lead: "First-mover",
    blurb: "Anomalous egress pattern correlated against three known APT signatures. Federal CERT notified before the lateral move completed.",
    tags: ["cyber", "infra"],
  },
  {
    code: "PK-2026-03", title: "Jacobabad heatwave protocol",
    region: "Sindh", sev: 7, traj: "stable",
    lift: "12k SMS reached", lead: "T-6h",
    blurb: "48°C trajectory predicted six hours ahead. Pre-position of cooling stations and Rescue 1122 protocol activated automatically.",
    tags: ["heatwave", "public-health"],
  },
  {
    code: "PK-2026-02", title: "Murree forest belt fire",
    region: "Punjab", sev: 7, traj: "worsening",
    lift: "−2h to containment", lead: "T-22min",
    blurb: "FIRMS thermal anomaly cross-referenced with wind vector and dry-canopy index — escalated to SEV-7 22 minutes before visual confirmation.",
    tags: ["fire", "forest"],
  },
  {
    code: "PK-2026-01", title: "Lahore civil mobilization, D-Chowk",
    region: "Punjab", sev: 6, traj: "stable",
    lift: "Zero injuries", lead: "T-3h",
    blurb: "Crowd-density projections fused with route closures and ambulance staging. Resulted in a calm dispersal protocol coordinated across three districts.",
    tags: ["civil", "logistics"],
  },
  {
    code: "PK-2025-12", title: "Hub industrial belt — chlorine leak",
    region: "Balochistan", sev: 8, traj: "critical",
    lift: "5km clear in 11min", lead: "T-4min",
    blurb: "Plume model fused with wind data routed evacuation orders to four schools in the downwind cone before visual confirmation reached operators.",
    tags: ["industrial", "hazmat"],
  },
];

export function Intelligence() {
  return (
    <main className="page-enter" data-screen-label="03 Intelligence">
      <section className="px-8 md:px-12 pt-[140px] pb-16">
        <div className="max-w-[1600px] mx-auto">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-60">— Intelligence / Briefs</p>
          </Reveal>
          <div className="grid grid-cols-12 gap-8 mt-10">
            <div className="col-span-12 lg:col-span-9">
              <div style={{ fontSize: "clamp(72px, 13vw, 240px)", lineHeight: 0.92 }}>
                <RevealLines
                  className="font-display"
                  stagger={110}
                  lines={["What Raasta", "saw <em>first</em>."]}
                />
              </div>
            </div>
            <div className="col-span-12 lg:col-span-3 self-end">
              <Reveal delay={300}>
                <p className="text-xl leading-snug" style={{ color: "var(--fg-2)" }}>
                  Selected post-incident briefs. Names anonymized where required. All published with operator consent.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section
        className="px-8 md:px-12 py-8"
        style={{ borderTop: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)" }}
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex flex-wrap gap-2">
            {["All", "Flood", "Fire", "Cyber", "Heatwave", "Civil", "Industrial"].map((t, i) => (
              <span
                key={t}
                className="chip"
                style={i === 0 ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : {}}
              >
                {t}
              </span>
            ))}
          </div>
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-60">2025 — 2026 · 142 briefs</p>
        </div>
      </section>

      <section className="px-8 md:px-12 py-20">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: "var(--rule)" }}>
          {BRIEFS.map((b, i) => (
            <Reveal key={b.code} delay={(i % 2) * 80} className="p-8 md:p-12 tilt-card" style={{ background: "var(--bg)" }}>
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-60">{b.code} · {b.region}</p>
                <span className={`sev-glyph sev-${b.sev}`}>SEV {b.sev}</span>
              </div>
              <h3
                className="font-display mt-6"
                style={{ fontSize: "clamp(32px, 3.4vw, 54px)", lineHeight: 1.02 }}
              >
                {b.title}<em style={{ color: "var(--accent)" }}>.</em>
              </h3>
              <p className="text-lg md:text-xl mt-6 leading-snug" style={{ color: "var(--fg-2)" }}>{b.blurb}</p>
              <div className="mt-8 flex items-end justify-between flex-wrap gap-4">
                <div className="flex gap-10">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-60">Lift</p>
                    <p className="font-display text-3xl mt-1">{b.lift}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-60">Lead</p>
                    <p className="font-display text-3xl mt-1">{b.lead}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {b.tags.map((t) => <span key={t} className="chip">{t}</span>)}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <ClosingCTA />
    </main>
  );
}
