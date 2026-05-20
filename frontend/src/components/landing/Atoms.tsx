/* Small reusable atoms for the landing pages */
import type { CSSProperties } from "react";

export function SeverityColumn({ value = 8, label }: { value?: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="severity-bar"
        style={{ height: 200, ["--fill" as never]: `${value * 10}%` } as CSSProperties}
      />
      <span className="font-mono text-[10px] tracking-wider opacity-60">{label}</span>
    </div>
  );
}

export function SmallStat({
  kicker,
  value,
  suffix,
  sub,
}: {
  kicker: string;
  value: string | number;
  suffix?: string;
  sub: string;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-60">{kicker}</p>
      <p className="num-ticker mt-2">
        {value}
        {suffix && <span className="font-mono text-3xl align-top opacity-60 ml-2">{suffix}</span>}
      </p>
      <p className="text-base mt-1 opacity-70">{sub}</p>
    </div>
  );
}

export function PulseRings() {
  return (
    <div className="pulse-rings mx-auto">
      <span /><span /><span /><span />
    </div>
  );
}
