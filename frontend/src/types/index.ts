export type CrisisType =
  | "flood" | "fire" | "cyber" | "civil"
  | "medical" | "industrial" | "heatwave" | "road_blockage" | "unknown";

export type SeverityLevel = "low" | "medium" | "high" | "critical";
export type Trajectory = "stable" | "worsening" | "critical";

export interface CrisisEvent {
  id: string;
  type: CrisisType;
  location: string;
  severity: number;  // 1-10
  trajectory: Trajectory;
  summary: string;
  actions: string[];
  detected_at: string;
  population_at_risk?: number;
  affected_radius_km?: number;
}

export interface AlertRecord {
  channel: string;
  team: string;
  location: string;
  severity: number;
  time: string;
}

export type WSEventType =
  | "CRISIS_DETECTED"
  | "SEVERITY_UPDATED"
  | "ALERT_DISPATCHED"
  | "HEARTBEAT";

export interface WSMessage {
  event_type: WSEventType;
  data: Record<string, unknown>;
}
