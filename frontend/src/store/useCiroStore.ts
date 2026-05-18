import { create } from "zustand";
import type { CrisisEvent, AlertRecord } from "../types";

interface SystemHealth {
  agentsHealthy: boolean;
  lastRun: string;
  eventsProcessed: number;
  alertsSent: number;
}

interface CiroStore {
  events: CrisisEvent[];
  alerts: AlertRecord[];
  health: SystemHealth;
  connected: boolean;
  addEvent: (event: CrisisEvent) => void;
  updateEvent: (id: string, patch: Partial<CrisisEvent>) => void;
  addAlert: (alert: AlertRecord) => void;
  setHealth: (h: Partial<SystemHealth>) => void;
  setConnected: (c: boolean) => void;
}

export const useCiroStore = create<CiroStore>((set) => ({
  events: [],
  alerts: [],
  health: { agentsHealthy: true, lastRun: "", eventsProcessed: 0, alertsSent: 0 },
  connected: false,

  addEvent: (event) =>
    set((s) => ({
      events: [event, ...s.events.filter((e) => e.id !== event.id)].slice(0, 100),
    })),

  updateEvent: (id, patch) =>
    set((s) => ({
      events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })),

  addAlert: (alert) =>
    set((s) => ({ alerts: [alert, ...s.alerts].slice(0, 200) })),

  setHealth: (h) =>
    set((s) => ({ health: { ...s.health, ...h } })),

  setConnected: (connected) => set({ connected }),
}));
