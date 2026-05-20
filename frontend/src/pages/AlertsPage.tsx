import { useCiroStore } from "../store/useCiroStore";

const CHANNEL_COLOR: Record<string, string> = {
  sms: "#4ade80",
  slack: "#818cf8",
  whatsapp: "#4ade80",
  email: "#60a5fa",
  radio: "#F2C744",
  pager: "var(--accent)",
};

export function AlertsPage() {
  const { alerts, health } = useCiroStore();

  return (
    <main className="pt-[72px]" style={{ background: "var(--bg)", minHeight: "100vh" }}>

      <section className="px-8 md:px-12 py-10 border-b" style={{ borderColor: "var(--rule)", background: "var(--bg-elev)" }}>
        <div className="max-w-[1600px] mx-auto flex items-end justify-between flex-wrap gap-6">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--fg-3)" }}>
              — Dispatch Log
            </p>
            <h1 className="font-display" style={{ fontSize: "clamp(40px, 5vw, 80px)" }}>
              <em style={{ color: "var(--accent)" }}>{alerts.length}</em> Alerts Sent
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div style={{ border: "1px solid var(--rule)", borderRadius: 4, padding: "16px 24px" }}>
              <p className="num-ticker" style={{ fontSize: "clamp(32px, 4vw, 56px)" }}>{alerts.length}</p>
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase mt-1" style={{ color: "var(--fg-3)" }}>
                Total dispatches
              </p>
            </div>
            <div style={{ border: "1px solid var(--rule)", borderRadius: 4, padding: "16px 24px" }}>
              <p className="num-ticker" style={{ fontSize: "clamp(32px, 4vw, 56px)" }}>{health.eventsProcessed}</p>
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase mt-1" style={{ color: "var(--fg-3)" }}>
                Events processed
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 md:px-12 py-8">
        <div className="max-w-[1600px] mx-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-24">
              <div className="pulse-rings mx-auto mb-6" style={{ width: 140, height: 140 }}>
                <span /><span /><span /><span />
              </div>
              <p className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: "var(--fg-3)" }}>
                No alerts dispatched
              </p>
              <p className="font-mono text-[10px] tracking-[0.12em] uppercase mt-2" style={{ color: "var(--fg-3)" }}>
                Run pipeline to begin dispatch
              </p>
            </div>
          ) : (
            <div style={{ border: "1px solid var(--rule)", borderRadius: 4, overflow: "hidden" }}>
              {/* Header row */}
              <div
                className="ticker-row px-5"
                style={{ gridTemplateColumns: "90px 80px 160px 1fr 70px", animation: "none", borderBottom: "1px solid var(--rule-strong)" }}
              >
                <span style={{ color: "var(--fg-3)" }}>TIME</span>
                <span style={{ color: "var(--fg-3)" }}>CHANNEL</span>
                <span style={{ color: "var(--fg-3)" }}>TEAM</span>
                <span style={{ color: "var(--fg-3)" }}>LOCATION</span>
                <span style={{ color: "var(--fg-3)" }}>STATUS</span>
              </div>

              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className="ticker-row px-5"
                  style={{
                    gridTemplateColumns: "90px 80px 160px 1fr 70px",
                    background: i === 0 ? "rgba(255,255,255,0.03)" : "transparent",
                    animationDelay: `${i * 30}ms`,
                  }}
                >
                  <span style={{ color: "var(--fg-3)" }}>
                    {new Date(alert.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <span
                    className="font-mono text-[10px] tracking-[0.1em] uppercase"
                    style={{ color: CHANNEL_COLOR[alert.channel] ?? "var(--fg-2)" }}
                  >
                    [{alert.channel}]
                  </span>
                  <span style={{ color: "var(--fg-2)" }}>{alert.team ?? "responders"}</span>
                  <span className="truncate" style={{ color: "var(--fg-3)" }}>
                    {alert.location || "—"}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.1em] uppercase" style={{ color: "#4ade80" }}>
                    Sent
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
