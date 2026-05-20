import { Link } from "react-router-dom";
import { Reveal } from "./Reveal";

export function Footer() {
  return (
    <footer
      style={{ background: "var(--bg-deep)", color: "var(--fg)" }}
      className="px-8 md:px-12 pt-24 pb-10"
    >
      <div className="max-w-[1600px] mx-auto">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase opacity-60">— Index 04</p>
          <h2 className="foot-mega mt-6">
            Calm<em style={{ color: "var(--accent)" }}>,</em>
            <br />delivered.
          </h2>
        </Reveal>

        <div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-10 pt-10"
          style={{ borderTop: "1px solid rgba(255, 255, 255, 0.14)" }}
        >
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-50 mb-4">Product</p>
            <ul className="space-y-2 text-lg">
              <li><Link to="/product"      className="hover:text-[var(--accent)]">Agent pipeline</Link></li>
              <li><Link to="/intelligence" className="hover:text-[var(--accent)]">Intelligence</Link></li>
              <li><Link to="/pricing"      className="hover:text-[var(--accent)]">Pricing</Link></li>
              <li><Link to="/dashboard"    className="hover:text-[var(--accent)]">Dashboard ↗</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-50 mb-4">Signals tracked</p>
            <ul className="space-y-2 font-mono text-[12px] tracking-wider opacity-80">
              <li>Flood &nbsp; Fire &nbsp; Cyber</li>
              <li>Civil &nbsp; Medical &nbsp; Industrial</li>
              <li>Heatwave &nbsp; Road</li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-50 mb-4">Operations</p>
            <ul className="space-y-2 text-lg">
              <li>Karachi · Islamabad</li>
              <li>Singapore · Geneva</li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-50 mb-4">Status</p>
            <ul className="space-y-2 font-mono text-[12px] opacity-80">
              <li className="flex items-center gap-2"><span className="pulse-dot" /> All agents nominal</li>
              <li>99.98% uptime · 30d</li>
              <li>Last incident: 41d</li>
            </ul>
          </div>
        </div>

        <div
          className="mt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-6"
          style={{ borderTop: "1px solid rgba(255, 255, 255, 0.14)" }}
        >
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase opacity-50">
            © 2026 Raasta Intelligence · Built for the field
          </p>
          <p className="text-base opacity-70">
            "The first thirty seconds of a crisis are the only thirty seconds that matter."
          </p>
        </div>
      </div>
    </footer>
  );
}
