import { useEffect, useRef } from "react";
import { useCiroStore } from "../store/useCiroStore";
import type { WSMessage, CrisisEvent } from "../types";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/dashboard";

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const retryDelay = useRef(500);
  const { addEvent, updateEvent, addAlert, setHealth, setConnected } = useCiroStore();

  useEffect(() => {
    let alive = true;

    function connect() {
      if (!alive) return;
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        setConnected(true);
        retryDelay.current = 500;
      };

      ws.current.onmessage = (e) => {
        try {
          const msg: WSMessage = JSON.parse(e.data);
          handleMessage(msg);
        } catch {}
      };

      ws.current.onclose = () => {
        setConnected(false);
        if (alive) {
          setTimeout(connect, retryDelay.current);
          retryDelay.current = Math.min(retryDelay.current * 2, 10000);
        }
      };

      ws.current.onerror = () => ws.current?.close();
    }

    function handleMessage(msg: WSMessage) {
      if (msg.event_type === "CRISIS_DETECTED") {
        addEvent(msg.data as unknown as CrisisEvent);
      } else if (msg.event_type === "SEVERITY_UPDATED") {
        const d = msg.data as { id: string; new_severity: number; trajectory: string };
        updateEvent(d.id, { severity: d.new_severity, trajectory: d.trajectory as CrisisEvent["trajectory"] });
      } else if (msg.event_type === "ALERT_DISPATCHED") {
        const d = msg.data as { crisis_id: string; team: string; channel: string; status: string };
        addAlert({ channel: d.channel, team: d.team, location: "", severity: 0, time: new Date().toISOString() });
      } else if (msg.event_type === "HEARTBEAT") {
        const d = msg.data as { agents_healthy: boolean; last_run: string; events_processed: number; alerts_sent?: number };
        setHealth({ agentsHealthy: d.agents_healthy, lastRun: d.last_run, eventsProcessed: d.events_processed });
      }
    }

    connect();
    return () => {
      alive = false;
      ws.current?.close();
    };
  }, []);
}
