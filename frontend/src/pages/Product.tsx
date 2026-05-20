import { useEffect, useRef, useState } from "react";
import { Reveal, RevealLines, DrawRule } from "../components/landing/Reveal";
import { ClosingCTA } from "../components/landing/ClosingCTA";

export function Product() {
  return (
    <main className="page-enter" data-screen-label="02 Product">
      <ProductHero />
      <PinnedPipeline />
      <ArchitectureSection />
      <IntegrationsSection />
      <ClosingCTA />
    </main>
  );
}

function ProductHero() {
  return (
    <section className="px-8 md:px-12 pt-[140px] pb-20">
      <div className="max-w-[1600px] mx-auto">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-60">— Product / Pipeline</p>
        </Reveal>
        <div className="grid grid-cols-12 gap-8 mt-10">
          <div className="col-span-12 lg:col-span-8">
            <div style={{ fontSize: "clamp(72px, 13vw, 240px)", lineHeight: 0.92 }}>
              <RevealLines
                className="font-display"
                stagger={110}
                lines={["How Raasta", "<em>thinks</em>."]}
              />
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4 self-end">
            <Reveal delay={300}>
              <p className="text-xl md:text-2xl leading-snug" style={{ color: "var(--fg-2)" }}>
                A continuous loop of seven agents — each with a narrow remit, a clear handoff, and a second-opinion partner. No black box. No surprises in the room.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

interface Stage {
  n: string;
  name: string;
  title: string;
  copy: string;
  stats: [string, string][];
  keyword: string;
}

const STAGES: Stage[] = [
  {
    n: "α", name: "Monitor",
    title: "We listen, narrowly.",
    copy: "Twelve signal feeds — government bulletins, weather, satellite, social — collapse into a single normalized event stream. Geofenced. Deduplicated.",
    stats: [["2.3M", "signals / day"], ["12", "feed sources"], ["47ms", "median ingest"]],
    keyword: "INGEST",
  },
  {
    n: "β", name: "Detect",
    title: "We name what's happening.",
    copy: "Pattern + anomaly extraction names each event by class — flood, fire, cyber, civil, medical, industrial, heatwave, road — with a starting severity from 1 to 10.",
    stats: [["8", "event classes"], ["98.2%", "class accuracy"], ["1.4s", "to first call"]],
    keyword: "CLASSIFY",
  },
  {
    n: "γ", name: "Analyze",
    title: "We do the math.",
    copy: "Severity is re-scored against population at risk, affected radius, and trajectory. A second agent reviews. Low-confidence calls never leave the room.",
    stats: [["94%", "triage agreement"], ["6s", "median reasoning"], ["2.1%", "false positive"]],
    keyword: "REASON",
  },
  {
    n: "δ", name: "Route",
    title: "We find the way.",
    copy: "Real-time route scoring across the road graph. When D-Chowk closes, Kashmir Highway opens — scored for safety, time, and current incident density.",
    stats: [["13", "road nodes"], ["3", "route options"], ["82→29", "risk score drop"]],
    keyword: "REROUTE",
  },
  {
    n: "ε", name: "Dispatch",
    title: "We route to the field.",
    copy: "Alerts land in the channel that can act — by region, severity tier, and on-call rota. SMS, Slack, Teams, pager, radio bridge. Acknowledgement loop closed.",
    stats: [["8", "delivery channels"], ["<12s", "end-to-end"], ["100%", "ack tracking"]],
    keyword: "DISPATCH",
  },
  {
    n: "ζ", name: "Outcome",
    title: "We model the cost.",
    copy: "Before and after the reroute — minutes saved, lives at risk avoided, population exposure reduced. Every decision gets a number.",
    stats: [["31min", "avg saved"], ["18", "lives protected"], ["100%", "incidents scored"]],
    keyword: "SIMULATE",
  },
  {
    n: "η", name: "Report",
    title: "We close the loop.",
    copy: "Every incident generates a Markdown + PDF debrief — timeline, decisions, model confidences, what we'd change. Audit-ready by the next morning.",
    stats: [["100%", "incidents debriefed"], ["<8h", "delivery SLA"], ["MD/PDF", "format"]],
    keyword: "DEBRIEF",
  },
];

function PinnedPipeline() {
  const wrapRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    function onScroll() {
      if (!wrap || !track) return;
      const rect = wrap.getBoundingClientRect();
      const total = wrap.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / total));
      const maxX = track.scrollWidth - window.innerWidth;
      track.style.transform = `translateX(${-progress * maxX}px)`;
      const idx = Math.min(STAGES.length - 1, Math.floor(progress * STAGES.length * 0.999));
      setActive(idx);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      ref={wrapRef}
      className="pin-section"
      style={{ height: `${STAGES.length * 80}vh`, background: "var(--bg-deep)", color: "var(--fg)" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute top-0 left-0 right-0 z-20 px-8 md:px-12 py-6 flex items-center justify-between font-mono text-[11px] tracking-[0.22em] uppercase opacity-80">
          <span>How Raasta thinks · scroll →</span>
          <span>
            {String(active + 1).padStart(2, "0")} / {String(STAGES.length).padStart(2, "0")} · {STAGES[active].keyword}
          </span>
        </div>

        <div className="absolute top-[60px] left-8 right-8 md:left-12 md:right-12 z-20 h-px" style={{ background: "rgba(255,255,255,0.18)" }}>
          <div
            className="h-full"
            style={{
              background: "var(--accent)",
              width: `${((active + 1) / STAGES.length) * 100}%`,
              transition: "width 0.5s cubic-bezier(.2,.7,.2,1)",
            }}
          />
        </div>

        <div ref={trackRef} className="pin-track">
          {STAGES.map((s, i) => (
            <StagePanel key={s.name} stage={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StagePanel({ stage, index }: { stage: Stage; index: number }) {
  return (
    <div className="pin-panel">
      <div className="grid grid-cols-12 gap-10 w-full items-center">
        <div className="col-span-5 lg:col-span-4">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-50">
            Stage {String(index + 1).padStart(2, "0")}
          </p>
          <p
            className="font-display"
            style={{
              fontSize: "clamp(100px, 18vw, 280px)",
              lineHeight: 0.9,
              color: "var(--accent)",
              letterSpacing: "-0.04em",
            }}
          >
            {stage.n}
          </p>
          <p className="font-mono text-[12px] tracking-[0.22em] uppercase opacity-70 mt-4">{stage.keyword}</p>
        </div>

        <div className="col-span-7 lg:col-span-8">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-50">{stage.name} agent</p>
          <h3 className="font-display mt-4" style={{ fontSize: "clamp(48px, 6.5vw, 110px)", lineHeight: 0.98 }}>
            {stage.title}
          </h3>
          <p className="text-2xl md:text-3xl mt-8 leading-snug max-w-[700px] opacity-90">{stage.copy}</p>

          <div className="mt-12 grid grid-cols-3 gap-px max-w-[640px]" style={{ background: "rgba(255,255,255,0.18)" }}>
            {stage.stats.map(([v, k], i) => (
              <div key={i} className="p-5" style={{ background: "var(--bg-deep)" }}>
                <p className="font-display text-4xl md:text-5xl">{v}</p>
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-60 mt-2">{k}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArchitectureSection() {
  const layers = [
    { name: "Edge",      items: ["Twitter/X firehose", "Reuters Connect", "NDMA bulletins", "Sentinel-2 / FIRMS"] },
    { name: "Normalize", items: ["Geo-resolve", "Dedup by 250m geofence", "Class tagger", "Confidence floor"] },
    { name: "Reason",    items: ["Severity scorer", "Trajectory model", "Population-at-risk", "Second-opinion"] },
    { name: "Act",       items: ["Channel router", "On-call rota", "Ack loop", "Escalation tree"] },
    { name: "Learn",     items: ["Post-incident debrief", "Calibration update", "Model drift", "Field reports"] },
  ];
  return (
    <section className="px-8 md:px-12 py-32">
      <div className="max-w-[1600px] mx-auto">
        <Reveal><p className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-60">— Architecture</p></Reveal>
        <Reveal delay={120}>
          <h2 className="font-display mt-6" style={{ fontSize: "clamp(40px, 5.6vw, 96px)" }}>
            Five layers, <em style={{ color: "var(--accent)" }}>narrow remits</em>.
          </h2>
        </Reveal>

        <div className="mt-16"><DrawRule /></div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-px mt-px" style={{ background: "var(--rule)" }}>
          {layers.map((l, i) => (
            <Reveal key={l.name} delay={i * 100} className="p-8" style={{ background: "var(--bg)" }}>
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-60">L{i}</p>
              <h3 className="font-display text-3xl mt-4">{l.name}</h3>
              <ul className="mt-6 space-y-2 text-base" style={{ color: "var(--fg-2)" }}>
                {l.items.map((it) => (
                  <li key={it} className="flex items-baseline gap-2">
                    <span style={{ color: "var(--accent)" }}>·</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function IntegrationsSection() {
  const groups = [
    { kind: "Inputs",  tags: ["Twitter / X", "Reuters", "NDMA", "PDMA", "WHO", "Sentinel-2", "FIRMS", "USGS", "OSM", "Telegram", "Met Dept", "EM-DAT"] },
    { kind: "Outputs", tags: ["SMS (gateway)", "Slack", "MS Teams", "PagerDuty", "Opsgenie", "Webhook", "Email", "Radio bridge"] },
    { kind: "Storage", tags: ["Postgres", "Object store", "Audit log (WORM)", "Vector store"] },
  ];
  return (
    <section className="px-8 md:px-12 py-32" style={{ background: "var(--bg-elev)" }}>
      <div className="max-w-[1600px] mx-auto">
        <Reveal><p className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-60">— Integrations</p></Reveal>
        <Reveal delay={120}>
          <h2 className="font-display mt-6" style={{ fontSize: "clamp(40px, 5.6vw, 96px)" }}>
            Plays well, <em style={{ color: "var(--accent)" }}>quietly</em>.
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          {groups.map((g, i) => (
            <Reveal key={g.kind} delay={i * 120}>
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-60">{g.kind}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {g.tags.map((t) => <span key={t} className="chip">{t}</span>)}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
