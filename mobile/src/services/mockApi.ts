import { SimulateResult, Incident } from '../types';

const BACKEND_URL = 'http://localhost:8000';

export const MOCK_RESULT: SimulateResult = {
  runId: 'raasta-demo-001',
  crisis: {
    type: 'civil_disruption',
    location: 'D-Chowk, Islamabad',
    severity: 8,
    confidence: 0.91,
    summary: 'Political blockage and container placement detected near D-Chowk. Constitution Avenue fully blocked.',
  },
  route: {
    from: 'G-11 Islamabad',
    to: 'Blue Area Islamabad',
    originalRisk: 82,
    newRisk: 29,
    delayAvoidedMinutes: 18,
    recommendation: 'Avoid D-Chowk. Take Kashmir Highway → 7th Avenue approach to Blue Area.',
  },
  actions: [
    'Commuter alert generated',
    'Mock traffic authority ticket created: ICT-TRF-2026-044',
    'Alternate route published',
    '124 nearby users notified',
  ],
  ticketId: 'ICT-TRF-2026-044',
  usersAlerted: 124,
  agentTrace: [
    { agent: 'Signal Monitor', status: 'complete', detail: '4 signals ingested. 3 crisis-relevant.', durationMs: 312 },
    { agent: 'Crisis Detection', status: 'complete', detail: 'Civil disruption at D-Chowk. Confidence: 0.91', durationMs: 847 },
    { agent: 'Severity Analysis', status: 'complete', detail: 'Severity 8/10. Route impact critical.', durationMs: 623 },
    { agent: 'Route Planner', status: 'complete', detail: 'Safer route via Kashmir Highway. Risk: 82→29.', durationMs: 934 },
    { agent: 'Dispatch Agent', status: 'complete', detail: '124 users alerted. Ticket ICT-TRF-2026-044 created.', durationMs: 445 },
    { agent: 'Outcome Agent', status: 'complete', detail: 'Risk reduced 53 pts. 18 min delay avoided.', durationMs: 712 },
  ],
};

export const MOCK_INCIDENTS: Incident[] = [
  { id: '1', type: 'civil_disruption', location: 'D-Chowk, Islamabad', severity: 8, confidence: 0.91, summary: 'Political blockage, Constitution Avenue blocked.', timestamp: new Date().toISOString(), status: 'active' },
  { id: '2', type: 'road_blockage', location: 'GT Road, Rawalpindi', severity: 6, confidence: 0.78, summary: 'Multi-vehicle accident. Two lanes blocked.', timestamp: new Date(Date.now() - 900000).toISOString(), status: 'active' },
  { id: '3', type: 'flood', location: 'Karachi, Korangi', severity: 7, confidence: 0.85, summary: 'Urban flooding after heavy rain. Roads submerged.', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'monitoring' },
  { id: '4', type: 'civil_disruption', location: 'Mall Road, Lahore', severity: 5, confidence: 0.72, summary: 'Protest march. Partial road closure.', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'resolved' },
];

async function tryBackend<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) return await res.json() as T;
    return fallback;
  } catch {
    return fallback;
  }
}

export async function simulateCrisis(): Promise<SimulateResult> {
  try {
    const res = await fetch(`${BACKEND_URL}/demo/d-chowk-protest`, {
      method: 'POST',
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      // Backend responded — enrich with mock data for consistent demo shape
    }
  } catch {}
  // Simulate pipeline delay
  await new Promise(r => setTimeout(r, 2200));
  return MOCK_RESULT;
}

export async function getIncidents(): Promise<Incident[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/incidents`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      const raw: any[] = Array.isArray(data) ? data : (data.incidents ?? []);
      return raw.slice(0, 20).map((i: any) => ({
        id: i.id,
        type: i.type ?? 'unknown',
        location: i.location ?? '',
        severity: i.severity ?? 5,
        confidence: i.confidence ?? 0.8,
        summary: i.summary ?? '',
        timestamp: i.detected_at ?? i.timestamp ?? new Date().toISOString(),
        status: i.trajectory === 'stable' ? 'resolved' : 'active',
      }));
    }
  } catch {}
  return MOCK_INCIDENTS;
}

export async function planRoute(from: string, to: string): Promise<SimulateResult> {
  await new Promise(r => setTimeout(r, 1800));
  return { ...MOCK_RESULT, route: { ...MOCK_RESULT.route, from, to } };
}
