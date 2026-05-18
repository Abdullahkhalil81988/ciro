export interface AgentTraceStep {
  agent: string;
  status: 'complete' | 'running' | 'pending' | 'error';
  detail: string;
  durationMs?: number;
}

export interface CrisisInfo {
  type: string;
  location: string;
  severity: number; // 1-10
  confidence: number; // 0-1
  summary: string;
}

export interface RouteInfo {
  from: string;
  to: string;
  originalRisk: number; // 0-100
  newRisk: number;
  delayAvoidedMinutes: number;
  recommendation: string;
}

export interface SimulateResult {
  runId: string;
  crisis: CrisisInfo;
  route: RouteInfo;
  actions: string[];
  agentTrace: AgentTraceStep[];
  ticketId?: string;
  usersAlerted?: number;
}

export interface Incident {
  id: string;
  type: string;
  location: string;
  severity: number;
  confidence: number;
  summary: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'monitoring';
}
