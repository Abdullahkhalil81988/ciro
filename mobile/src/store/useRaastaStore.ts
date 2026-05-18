import { create } from 'zustand';
import { SimulateResult, Incident } from '../types';

interface RaastaStore {
  // Demo state
  isScanning: boolean;
  scanResult: SimulateResult | null;
  scanError: string | null;

  // Route planner
  origin: string;
  destination: string;
  setOrigin: (v: string) => void;
  setDestination: (v: string) => void;

  // Incidents
  incidents: Incident[];
  isLoadingIncidents: boolean;

  // Actions
  setScanning: (v: boolean) => void;
  setScanResult: (r: SimulateResult | null) => void;
  setScanError: (e: string | null) => void;
  setIncidents: (i: Incident[]) => void;
  setLoadingIncidents: (v: boolean) => void;
  reset: () => void;
}

export const useRaastaStore = create<RaastaStore>((set) => ({
  isScanning: false,
  scanResult: null,
  scanError: null,
  origin: 'G-11 Islamabad',
  destination: 'Blue Area Islamabad',
  incidents: [],
  isLoadingIncidents: false,

  setScanning: (v) => set({ isScanning: v }),
  setScanResult: (r) => set({ scanResult: r }),
  setScanError: (e) => set({ scanError: e }),
  setOrigin: (v) => set({ origin: v }),
  setDestination: (v) => set({ destination: v }),
  setIncidents: (i) => set({ incidents: i }),
  setLoadingIncidents: (v) => set({ isLoadingIncidents: v }),
  reset: () => set({ isScanning: false, scanResult: null, scanError: null }),
}));
