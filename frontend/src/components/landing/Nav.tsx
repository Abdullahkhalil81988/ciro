import { NavLink, useNavigate } from "react-router-dom";
import { useCiroStore } from "../../store/useCiroStore";

const LINKS = [
  { to: "/",          label: "Overview" },
  { to: "/events",    label: "Events" },
  { to: "/map",       label: "Map" },
  { to: "/alerts",    label: "Alerts" },
  { to: "/simulate",  label: "Simulate" },
];

export function Nav() {
  const nav = useNavigate();
  const { connected, events } = useCiroStore();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-8 md:px-12 py-4 flex items-center justify-between"
      style={{
        backdropFilter: "blur(14px)",
        background: "rgba(10, 10, 10, 0.85)",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <div className="flex items-center gap-3">
        <span className="pulse-dot" />
        <span className="font-mono text-[12px] tracking-[0.18em] uppercase" style={{ color: "var(--fg)" }}>
          Raasta
        </span>
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--fg-3)" }}>
          Crisis Console
        </span>
      </div>

      <nav className="hidden md:flex items-center gap-10">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className={({ isActive }) =>
              `nav-link font-mono text-[12px] tracking-[0.12em] uppercase ${isActive ? "active" : ""}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: connected ? "#4ade80" : "var(--accent)", boxShadow: connected ? "0 0 6px #4ade80" : "none" }}
          />
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase" style={{ color: "var(--fg-3)" }}>
            {connected ? "Live" : "Offline"}
          </span>
        </div>
        {events.length > 0 && (
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase px-3 py-1 rounded" style={{ background: "rgba(232,58,44,0.15)", color: "var(--accent)", border: "1px solid rgba(232,58,44,0.3)" }}>
            {events.length} active
          </span>
        )}
        <button
          onClick={() => nav("/")}
          className="font-mono text-[11px] tracking-[0.12em] uppercase px-4 py-2 rounded"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          ● Console
        </button>
      </div>
    </header>
  );
}
