import { useNavigate } from "react-router-dom";
import { Reveal, RevealLines } from "../components/landing/Reveal";
import { Magnetic } from "../components/landing/Magnetic";
import { ClosingCTA } from "../components/landing/ClosingCTA";

interface Tier {
  name: string;
  kicker: string;
  price: string;
  cadence: string;
  copy: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

const TIERS: Tier[] = [
  {
    name: "Field",
    kicker: "For single-region ops",
    price: "$2.4k",
    cadence: "/ month",
    copy: "One operating region, three response teams. All five agents. Standard channels.",
    features: ["1 region · 3 teams", "All 5 agents", "SMS / Slack / Teams", "30-day audit retention", "Email support · 24h"],
    cta: "Start trial",
  },
  {
    name: "Operations",
    kicker: "For provincial command",
    price: "$9.8k",
    cadence: "/ month",
    copy: "Multi-region, unlimited teams. Custom channels and second-opinion routing. The most chosen tier.",
    features: ["Up to 6 regions", "Unlimited teams", "All channels + pager + radio", "1-year audit retention", "Embedded engineer · 1 day / week", "Custom severity calibration"],
    cta: "Request deploy",
    featured: true,
  },
  {
    name: "Federal",
    kicker: "For national posture",
    price: "On request",
    cadence: "",
    copy: "Air-gapped or hybrid. Sovereign cloud. Custom event classes. Dedicated response engineer.",
    features: ["Unlimited regions", "Air-gapped deploy", "Custom event classes", "WORM audit log · 7y", "Dedicated SRE · 24/7", "SOC 2 II + on-request audits"],
    cta: "Speak to founders",
  },
];

export function Pricing() {
  const nav = useNavigate();
  return (
    <main className="page-enter" data-screen-label="04 Pricing">
      <section className="px-8 md:px-12 pt-[140px] pb-16">
        <div className="max-w-[1600px] mx-auto">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-60">— Pricing / Deploy</p>
          </Reveal>
          <div className="grid grid-cols-12 gap-8 mt-10">
            <div className="col-span-12 lg:col-span-9">
              <div style={{ fontSize: "clamp(72px, 13vw, 240px)", lineHeight: 0.92 }}>
                <RevealLines
                  className="font-display"
                  stagger={110}
                  lines={["Priced by", "<em>posture</em>."]}
                />
              </div>
            </div>
            <div className="col-span-12 lg:col-span-3 self-end">
              <Reveal delay={300}>
                <p className="text-xl leading-snug" style={{ color: "var(--fg-2)" }}>
                  Three tiers, transparent ceilings, no per-alert billing. Pilots are funded by Raasta for the first 30 days.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 md:px-12 py-16">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "var(--rule)" }}>
          {TIERS.map((t, i) => (
            <Reveal
              key={t.name}
              delay={i * 100}
              className="p-10 md:p-14 tilt-card"
              style={t.featured ? { background: "var(--bg-deep)" } : { background: "var(--bg)" }}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-4xl md:text-5xl">{t.name}</h3>
                {t.featured && (
                  <span
                    className="font-mono text-[9px] tracking-[0.22em] uppercase px-2 py-1 rounded-sm"
                    style={{ background: "var(--accent)", color: "#fff" }}
                  >
                    Most chosen
                  </span>
                )}
              </div>
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-60 mt-2">{t.kicker}</p>

              <div className="mt-10 flex items-end gap-2">
                <p
                  className="font-display"
                  style={{
                    fontSize: "clamp(56px, 7vw, 110px)",
                    lineHeight: 0.9,
                    color: t.featured ? "var(--accent)" : "var(--fg)",
                  }}
                >
                  {t.price}
                </p>
                {t.cadence && <p className="font-mono text-sm tracking-wider mb-3 opacity-60">{t.cadence}</p>}
              </div>

              <p className="text-lg md:text-xl mt-6 leading-snug" style={{ color: "var(--fg-2)" }}>{t.copy}</p>

              <ul className="mt-10 space-y-3 text-base">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-3" style={{ color: "var(--fg-2)" }}>
                    <span style={{ color: "var(--accent)" }}>+</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-12">
                <Magnetic variant={t.featured ? "solid" : "ghost"} onClick={() => nav("/contact")}>
                  {t.cta} <span className="arrow">→</span>
                </Magnetic>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-8 md:px-12 py-32" style={{ background: "var(--bg-elev)" }}>
        <div className="max-w-[1400px] mx-auto">
          <Reveal><p className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-60">— Quiet print</p></Reveal>
          <Reveal delay={120}>
            <h2 className="font-display mt-6" style={{ fontSize: "clamp(40px, 5.6vw, 96px)" }}>
              Things we <em style={{ color: "var(--accent)" }}>won't</em> do.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
            {[
              ["Bill per alert", "It would put your operators in the wrong incentive. Pricing is a flat tier."],
              ["Hide model failures", "Every false positive and missed call lands in the next post-incident debrief — yours and ours."],
              ["Sell your data", "Operational telemetry stays in your tenant. We never resell or share."],
              ["Touch your dispatch decisions", "Raasta routes information to the team. The decision is always the operator's."],
            ].map(([h, c], i) => (
              <Reveal key={h} delay={i * 100}>
                <h3 className="font-display text-3xl md:text-4xl">
                  {h}<em style={{ color: "var(--accent)" }}>.</em>
                </h3>
                <p className="text-lg md:text-xl mt-4 leading-snug max-w-[520px]" style={{ color: "var(--fg-2)" }}>{c}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ClosingCTA />
    </main>
  );
}
