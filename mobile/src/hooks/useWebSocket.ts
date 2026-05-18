import { useEffect, useRef } from "react";
import { useCiroStore } from "../store/useCiroStore";

const WS_URL = "ws://10.0.2.2:8000/ws/dashboard"; // Android emulator → host

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const retryDelay = useRef(1000);
  const { addEvent, setConnected } = useCiroStore();

  useEffect(() => {
    let alive = true;

    function connect() {
      if (!alive) return;
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        setConnected(true);
        retryDelay.current = 1000;
      };

      ws.current.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.event_type === "CRISIS_DETECTED") {
            addEvent(msg.data);
          }
        } catch {}
      };

      ws.current.onclose = () => {
        setConnected(false);
        if (alive) {
          setTimeout(connect, retryDelay.current);
          retryDelay.current = Math.min(retryDelay.current * 2, 15000);
        }
      };

      ws.current.onerror = () => ws.current?.close();
    }

    connect();
    return () => {
      alive = false;
      ws.current?.close();
    };
  }, []);
}
