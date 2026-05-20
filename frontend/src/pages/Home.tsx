import { useNavigate } from "react-router-dom";
import { Reveal, RevealLines, DrawRule } from "../components/landing/Reveal";
import { Magnetic } from "../components/landing/Magnetic";
import { Marquee } from "../components/landing/Marquee";
import { LiveTicker } from "../components/landing/LiveTicker";
import { SeverityColumn, SmallStat, PulseRings } from "../components/landing/Atoms";
import { DashboardMockup } from "../components/landing/DashboardMockup";
import { ClosingCTA } from "../components/landing/ClosingCTA";

export function Home() {
  return (
    <main className="page-enter" data-screen-label="01 Home">
      <HeroSection />
      <SignalsMarquee />
      <PrinciplesSection />
      <LiveDashboardSection />
      <PipelinePreview />
      <CaseStudyTeaser />
      <ClosingCTA />
    </main>
  );
}

/* ===================== HERO ===================== */
function HeroSection() {
  const nav = useNavigate();
  return (
    <section className="px-8 md:px-12 pt-[120px] pb-20" style={{ minHeight: "100vh" }}>
      <div className="max-w-[1600px] mx-auto">
        <Reveal>
          <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: "var(--fg-3)" }}>
            <span>— Index 01 / Overview</span>
            <span className="flex items-center gap-2"><span className="pulse-dot" /> Live · 14 active events</span>
          </div>
        </Reveal>

        <div className="grid grid-cols-12 gap-8 mt-12 md:mt-20">
          <div className="col-span-12 lg:col-span-9">
            <RevealLines
              className="hero-headline"
              stagger={120}
              lines={[
                "Calm at the",
                "center of <em>crisis</em>.",
              ]}
            />
            <Reveal delay={500}>
              <p className="text-2xl md:text-3xl leading-tight mt-10 max-w-[680px]" style={{ color: "var(--fg-2)" }}>
                Raasta is a seven-agent intelligence layer that detects, triages, routes, and dispatches a response —
                <em style={{ color: "var(--accent)", fontStyle: "normal" }}> before the first call lands</em>.
              </p>
            </Reveal>

            <Reveal delay={700}>
              <div className="flex flex-wrap items-center gap-4 mt-12">
                <Magnetic onClick={() => nav("/product")}>
                  See the pipeline <span className="arrow">→</span>
                </Magnetic>
                <Magnetic variant="ghost" onClick={() => nav("/contact")}>
                  Request deploy
                </Magnetic>
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase ml-2" style={{ color: "var(--fg-3)" }}>
                  &nbsp;·&nbsp; 30-day ops trial &nbsp; · &nbsp; SOC 2 II
                </span>
              </div>
            </Reveal>
          </div>

          <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 self-end">
            <Reveal delay={400}>
              <PulseRings />
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-center mt-4 opacity-60">
                Signal pulse · 4 sec
              </p>
            </Reveal>

            <Reveal delay={600}>
              <div className="rounded-sm p-4" style={{ border: "1px solid var(--rule)", background: "rgba(255,255,255,0.02)" }}>
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-60 mb-3">Latest 6 events</p>
                <LiveTicker limit={6} />
              </div>
            </Reveal>
          </div>
        </div>

        <div className="mt-24 flex items-end justify-between">
          <Reveal>
            <div className="flex items-end gap-3">
              {[2, 4, 6, 8, 10].map((v) => (
                <SeverityColumn key={v} value={v} label={`SEV ${v}`} />
              ))}
            </div>
          </Reveal>
          <Reveal delay={300}>
            <div className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-60 flex items-center gap-3">
              <span className="inline-block w-px h-10" style={{ background: "var(--fg-2)" }} />
              Scroll
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ===================== SIGNALS MARQUEE ===================== */
function SignalsMarquee() {
  const items = [
    "Twitter / X firehose", "Pakistan Met Dept.", "PDMA bulletins",
    "EM-DAT", "Reuters Connect", "OpenStreetMap incidents",
    "WHO outbreak feeds", "Sentinel-2 imagery", "USGS seismic",
    "NDMA Pakistan", "FIRMS active fire", "Telegram local channels",
  ];
  return (
    <section className="py-10" style={{ background: "var(--bg-deep)", color: "var(--fg)" }}>
      <Marquee items={items} />
    </section>
  );
}

/* ===================== PRINCIPLES ===================== */
function PrinciplesSection() {
  const items = [
    { n: "01", title: "Detect",   copy: "Five agents stream open and licensed signals continuously. Noise is collapsed to events; events earn a severity from 1 to 10.", meta: "47ms median ingest · 2.3M signals/day" },
    { n: "02", title: "Decide",   copy: "Each event is enriched with population at risk, affected radius, and trajectory. A second-opinion agent flags low-confidence calls before they leave the room.", meta: "94% triage agreement · 6s median" },
    { n: "03", title: "Dispatch", copy: "Routed to the team that can act — by geography, severity tier, and on-call rota. SMS, Slack, Teams, pager, and analog radio bridges.", meta: "Sub-12s end-to-end · 8 channels" },
  ];
  return (
    <section className="px-8 md:px-12 py-32 md:py-48">
      <div className="max-w-[1600px] mx-auto">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-60">— Index 02 / Method</p>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="font-display mt-6" style={{ fontSize: "clamp(48px, 7vw, 130px)" }}>
            Three movements,
            <br />
            <em style={{ color: "var(--accent)" }}>one calm signal.</em>
          </h2>
        </Reveal>

        <div className="mt-24"><DrawRule /></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px mt-px" style={{ background: "var(--rule)" }}>
          {items.map((it, idx) => (
            <Reveal key={it.n} delay={idx * 120} className="p-10 md:p-14 tilt-card" style={{ background: "var(--bg)" }}>
              <div className="flex items-baseline gap-6">
                <p className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-60">{it.n}</p>
                <h3 className="font-display text-[44px] md:text-[64px]" style={{ lineHeight: 1 }}>
                  {it.title}<em style={{ color: "var(--accent)" }}>.</em>
                </h3>
              </div>
              <p className="text-xl md:text-2xl mt-8 leading-snug" style={{ color: "var(--fg-2)" }}>{it.copy}</p>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase mt-10 opacity-60">{it.meta}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== LIVE DASHBOARD ===================== */
function LiveDashboardSection() {
  return (
    <section className="px-8 md:px-12 py-32" style={{ background: "var(--bg-elev)" }}>
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-12 gap-10 items-center">
          <div className="col-span-12 lg:col-span-5">
            <Reveal>
              <p className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-60">— Index 03 / Console</p>
            </Reveal>
            <Reveal delay={120}>
              <h2 className="font-display mt-6" style={{ fontSize: "clamp(40px, 5.6vw, 96px)" }}>
                A console <em style={{ color: "var(--accent)" }}>built for the field</em>.
              </h2>
            </Reveal>
            <Reveal delay={240}>
              <p className="text-xl md:text-2xl mt-8 leading-snug max-w-[480px]" style={{ color: "var(--fg-2)" }}>
                Real WebSocket feeds, sub-second severity updates, and a map that knows the difference between Korangi at 04:00 and Korangi at 14:00.
              </p>
            </Reveal>
            <Reveal delay={360}>
              <div className="grid grid-cols-2 gap-10 mt-12">
                <SmallStat kicker="Median latency" value="6.4" suffix="s" sub="signal → dispatch" />
                <SmallStat kicker="False positives" value="2.1" suffix="%" sub="cross-agent review" />
              </div>
            </Reveal>
          </div>

          <div className="col-span-12 lg:col-span-7">
            <Reveal>
              <DashboardMockup />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================== PIPELINE PREVIEW ===================== */
function PipelinePreview() {
  const nav = useNavigate();
  const agents = [
    { n: "α", name: "Monitor",  copy: "Continuous ingest across open + licensed feeds.",         spec: "2.3M signals / 24h" },
    { n: "β", name: "Detect",   copy: "Pattern + anomaly extraction, dedup by geofence.",        spec: "47ms median" },
    { n: "γ", name: "Analyze",  copy: "Severity, trajectory, population-at-risk model.",          spec: "5–10s reasoning" },
    { n: "δ", name: "Route",    copy: "Real-time route scoring against active crisis zones.",      spec: "Islamabad graph" },
    { n: "ε", name: "Dispatch", copy: "Channel routing by team, region, severity tier.",          spec: "8 channels live" },
    { n: "ζ", name: "Outcome",  copy: "Simulates before/after commuter scenarios post-reroute.",  spec: "Lives-at-risk model" },
    { n: "η", name: "Report",   copy: "Post-incident debrief auto-drafted from telemetry.",       spec: "Markdown · PDF" },
  ];
  return (
    <section className="px-8 md:px-12 py-32 md:py-48">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <Reveal><p className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-60">— Index 04 / Pipeline</p></Reveal>
            <Reveal delay={120}>
              <h2 className="font-display mt-6" style={{ fontSize: "clamp(40px, 5.6vw, 96px)" }}>
                Seven agents,<br />
                <em style={{ color: "var(--accent)" }}>one breath</em>.
              </h2>
            </Reveal>
          </div>
          <Reveal>
            <Magnetic variant="ghost" onClick={() => nav("/product")}>
              Full pipeline <span className="arrow">→</span>
            </Magnetic>
          </Reveal>
        </div>

        <div className="mt-20"><DrawRule /></div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-px mt-px" style={{ background: "var(--rule)" }}>
          {agents.map((a, i) => (
            <Reveal key={a.name} delay={i * 90} className="p-8 tilt-card" style={{ background: "var(--bg)" }}>
              <div className="flex items-center justify-between">
                <span className="font-display text-5xl" style={{ color: "var(--accent)" }}>{a.n}</span>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-60">0{i + 1}</span>
              </div>
              <h3 className="font-display text-3xl mt-6">{a.name}</h3>
              <p className="text-lg mt-3 leading-snug" style={{ color: "var(--fg-2)" }}>{a.copy}</p>
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase mt-6 opacity-60">{a.spec}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== CASE STUDIES ===================== */
function CaseStudyTeaser() {
  const nav = useNavigate();
  const cases = [
    { code: "PK-2025-08", title: "Sindh monsoon, second wave",   region: "Sindh",    sev: 9, lift: "−47% median dispatch" },
    { code: "PK-2025-11", title: "NTC backbone exfiltration",    region: "Federal",  sev: 9, lift: "+18min lead time" },
    { code: "PK-2026-03", title: "Jacobabad heatwave protocol",  region: "Sindh",    sev: 7, lift: "12k SMS reached" },
  ];
  return (
    <section className="px-8 md:px-12 py-32" style={{ background: "var(--bg-deep)", color: "var(--fg)" }}>
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <Reveal><p className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-60">— Index 05 / In the field</p></Reveal>
            <Reveal delay={120}>
              <h2 className="font-display mt-6" style={{ fontSize: "clamp(40px, 5.6vw, 96px)" }}>
                What Raasta saw <em style={{ color: "var(--accent)" }}>first</em>.
              </h2>
            </Reveal>
          </div>
          <Reveal>
            <Magnetic variant="ghost" onClick={() => nav("/intelligence")}>
              All briefs <span className="arrow">→</span>
            </Magnetic>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {cases.map((c, i) => (
            <Reveal key={c.code} delay={i * 100}>
              <a
                href="/intelligence"
                onClick={(e) => { e.preventDefault(); nav("/intelligence"); }}
                className="block tilt-card"
              >
                <div className="editorial-img dark" style={{ aspectRatio: "4 / 5", borderRadius: 4 }}>
                  <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    <p className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-70">{c.code}</p>
                    <div><span className={`sev-glyph sev-${c.sev}`}>SEV {c.sev}</span></div>
                  </div>
                </div>
                <p className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-60 mt-5">{c.region}</p>
                <h3 className="font-display text-2xl md:text-3xl mt-2" style={{ lineHeight: 1.05 }}>{c.title}</h3>
                <p className="text-base mt-3 opacity-70">{c.lift}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
