import { useEffect, useRef, useState } from "react";
import { useCiroStore } from "../../store/useCiroStore";

interface Row {
  type: string;
  loc: string;
  sev: number;
  t: string;
  key?: number;
}

const SEED_EVENTS: Row[] = [
  { type: "FLOOD",      loc: "Sindh / Khairpur",       sev: 8, t: "00:14" },
  { type: "FIRE",       loc: "Karachi / Korangi",      sev: 6, t: "00:42" },
  { type: "CYBER",      loc: "NTC backbone",           sev: 9, t: "01:08" },
  { type: "MEDICAL",    loc: "Lahore / Ravi sector",   sev: 4, t: "01:19" },
  { type: "HEATWAVE",   loc: "Jacobabad",              sev: 7, t: "01:33" },
  { type: "INDUSTRIAL", loc: "Hub / cement belt",      sev: 5, t: "01:51" },
  { type: "CIVIL",      loc: "Islamabad / D-Chowk",    sev: 6, t: "02:04" },
  { type: "ROAD",       loc: "M-2 Salt Range",         sev: 3, t: "02:17" },
  { type: "FLOOD",      loc: "Balochistan / Sibi",     sev: 9, t: "02:38" },
  { type: "FIRE",       loc: "Murree forest belt",     sev: 7, t: "02:51" },
];

function fmtTime(iso: string) {
  try {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  } catch {
    return "00:00";
  }
}

export function LiveTicker({ limit = 6, className = "" }: { limit?: number; className?: string }) {
  const liveEvents = useCiroStore((s) => s.events);
  const cursor = useRef(limit);

  const toRows = (evs: typeof liveEvents): Row[] =>
    evs.slice(0, limit).map((e) => ({
      type: e.type.toUpperCase().replace("_", " "),
      loc: e.location,
      sev: e.severity,
      t: fmtTime(e.detected_at),
    }));

  const [rows, setRows] = useState<Row[]>(
    liveEvents.length >= limit ? toRows(liveEvents) : SEED_EVENTS.slice(0, limit)
  );

  // Keep rows in sync when live events arrive
  useEffect(() => {
    if (liveEvents.length > 0) {
      setRows(toRows(liveEvents));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveEvents, limit]);

  // Animate seed rows when no live data yet
  useEffect(() => {
    if (liveEvents.length > 0) return;
    const id = setInterval(() => {
      const next = SEED_EVENTS[cursor.current % SEED_EVENTS.length];
      cursor.current += 1;
      const minutes = String(Math.floor((Date.now() / 1000) % 60)).padStart(2, "0");
      const seconds = String(Math.floor((Date.now() / 100) % 60)).padStart(2, "0");
      setRows((prev) => [
        { ...next, t: `${minutes}:${seconds}`, key: Math.random() },
        ...prev.slice(0, limit - 1),
      ]);
    }, 2800);
    return () => clearInterval(id);
  }, [liveEvents.length, limit]);

  return (
    <div className={className}>
      {rows.map((r, i) => (
        <div className="ticker-row" key={r.key ?? `${r.type}-${i}`}>
          <span style={{ color: "var(--fg-3)" }}>{r.t}</span>
          <span className={`sev-glyph sev-${r.sev}`}>{r.type}</span>
          <span style={{ color: "var(--fg)" }} className="truncate">{r.loc}</span>
          <span className="font-mono text-[10px]" style={{ color: "var(--fg-3)" }}>{r.sev}/10</span>
        </div>
      ))}
    </div>
  );
}
