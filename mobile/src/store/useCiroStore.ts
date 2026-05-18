import { create } from "zustand";

export interface CrisisEvent {
  id: string;
  type: string;
  location: string;
  severity: number;
  trajectory: string;
  summary: string;
  actions: string[];
  detected_at: string;
}

interface CiroStore {
  events: CrisisEvent[];
  connected: boolean;
  addEvent: (e: CrisisEvent) => void;
  setConnected: (c: boolean) => void;
}

export const useCiroStore = create<CiroStore>((set) => ({
  events: [],
  connected: false,
  addEvent: (event) =>
    set((s) => ({ events: [event, ...s.events.filter((e) => e.id !== event.id)].slice(0, 50) })),
  setConnected: (connected) => set({ connected }),
}));
