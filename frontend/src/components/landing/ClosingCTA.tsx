import { useNavigate } from "react-router-dom";
import { Reveal } from "./Reveal";
import { Magnetic } from "./Magnetic";

export function ClosingCTA() {
  const nav = useNavigate();
  return (
    <section className="px-8 md:px-12 py-32 md:py-48">
      <div className="max-w-[1400px] mx-auto text-center">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-60">— Index 06 / Deploy</p>
        </Reveal>
        <Reveal delay={120}>
          <h2
            className="font-display mt-6"
            style={{ fontSize: "clamp(56px, 9vw, 180px)", lineHeight: 0.92 }}
          >
            Stand up<br />
            in <em style={{ color: "var(--accent)" }}>72 hours</em>.
          </h2>
        </Reveal>
        <Reveal delay={300}>
          <p className="text-2xl md:text-3xl mt-10 max-w-[700px] mx-auto leading-snug" style={{ color: "var(--fg-2)" }}>
            We embed with your operations team for the first deployment. By day three, your dashboard is live.
          </p>
        </Reveal>
        <Reveal delay={450}>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
            <Magnetic onClick={() => nav("/contact")}>
              Request deploy <span className="arrow">→</span>
            </Magnetic>
            <Magnetic variant="ghost" onClick={() => nav("/pricing")}>
              See pricing
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
