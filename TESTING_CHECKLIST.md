# Raasta Testing Checklist

## Backend API Tests

Run: `cd backend && pytest tests/ -v`

| Test | Expected | Status |
|------|----------|--------|
| GET /health | status=ok, 7 agents | ☐ |
| GET /incidents | incidents array | ☐ |
| POST /alerts/simulate | status=sent | ☐ |
| POST /tickets/simulate | ticket_id present | ☐ |
| POST /plan-route | run_id + request_id | ☐ |
| POST /demo/d-chowk-protest | full scenario response | ☐ |
| WS /ws/mobile | connects + HEARTBEAT | ☐ |

## Manual Demo Flow

1. Start backend: `uvicorn main:app --reload --port 8000`
2. Start mobile: `cd mobile && npx expo start`
3. Open on device/emulator
4. [ ] Splash screen → auto-navigates to Home after 2.2s
5. [ ] Home → tap "Run Crisis Scan" → loading state shows
6. [ ] After 2s → navigates to Route Risk screen
7. [ ] Route Risk → shows 82 (red ring) and 29 (green ring)
8. [ ] Route Risk → tap "View Agent Trace" → shows 6 steps
9. [ ] Agent Trace → tap "View Outcome" → shows ticket
10. [ ] Outcome → ticket ICT-TRF-2026-044 visible in orange
11. [ ] Demo Control → all 4 scenarios run without crash
12. [ ] Incident Feed → 4 incidents shown, sorted by severity
13. [ ] Report Incident → submit form → success state shown

## Edge Cases

- [ ] No backend connection → mock data loads correctly
- [ ] Empty incidents → "All clear" empty state shows
- [ ] Re-run scan → replaces previous result
- [ ] Navigate back → state preserved

## Performance

- [ ] Splash → Home transition < 3s
- [ ] Crisis scan (mock) completes in 2–2.5s
- [ ] No blank/white screens during navigation
- [ ] No console errors in Expo developer tools
