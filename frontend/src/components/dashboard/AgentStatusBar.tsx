import { useCiroStore } from "../../store/useCiroStore";

const AGENTS = ["Monitor", "Detect", "Analyze", "Route", "Dispatch", "Outcome", "Report"];

export function AgentStatusBar() {
  const { connected, health } = useCiroStore();

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-red-500"}`} />
        <span className="text-xs text-slate-400">{connected ? "Live" : "Reconnecting..."}</span>
      </div>
      {AGENTS.map((name) => (
        <div key={name} className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${health.agentsHealthy ? "bg-green-400" : "bg-red-500"}`} />
          <span className="text-xs text-slate-500">{name}</span>
        </div>
      ))}
      {health.lastRun && (
        <span className="text-xs text-slate-600 ml-auto">
          Last run: {new Date(health.lastRun).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
