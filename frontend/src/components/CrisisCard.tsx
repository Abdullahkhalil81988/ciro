import { SeverityBadge } from "./SeverityBadge";
import type { CrisisEvent } from "../types";

const TYPE_EMOJI: Record<string, string> = {
  flood: "🌊", fire: "🔥", cyber: "💻", civil: "👥",
  medical: "🏥", industrial: "🏭", heatwave: "☀️",
  road_blockage: "🚧", unknown: "⚠️",
};

const TRAJECTORY_COLOR: Record<string, string> = {
  stable: "text-green-400", worsening: "text-orange-400", critical: "text-red-400",
};

export function CrisisCard({ event, onClick }: { event: CrisisEvent; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-red-500 cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{TYPE_EMOJI[event.type] ?? "⚠️"}</span>
          <div>
            <p className="font-semibold text-white capitalize">{event.type.replace("_", " ")}</p>
            <p className="text-sm text-slate-400">📍 {event.location}</p>
          </div>
        </div>
        <SeverityBadge score={event.severity} />
      </div>
      <p className={`text-xs mt-1 font-medium ${TRAJECTORY_COLOR[event.trajectory] ?? "text-slate-400"}`}>
        ↗ {event.trajectory}
      </p>
      <p className="text-xs text-slate-400 mt-2 line-clamp-2">{event.summary}</p>
      <p className="text-xs text-slate-600 mt-1">{new Date(event.detected_at).toLocaleTimeString()}</p>
    </div>
  );
}
