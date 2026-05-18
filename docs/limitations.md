# Known Limitations

## What is Simulated (not real)
- **Government API integration**: No real connection to NDMA, Islamabad Traffic Police, or any government system. All tickets and alerts are simulated.
- **User notifications**: The 124 "alerted users" are a simulated count — no real push notifications sent.
- **Road graph**: The Islamabad road network is simplified (13 key nodes). Not a full routing engine.
- **Social media signals**: Demo uses pre-recorded tweets. No live Twitter/X API integration.
- **Live map rerouting**: The MapPreview component is an SVG visualization, not a real navigation layer.

## Technical Constraints
- **In-memory only**: No persistent database. All incident/trace data resets on server restart.
- **Single city demo**: Route planning is optimized for Islamabad. Other cities use relabeled Islamabad routes.
- **Gemini rate limits**: Free tier API key may throttle under heavy load.
- **No offline mode**: Mobile app requires backend connection for live data (falls back to mock data).

## What's Real
- Gemini 2.0 Flash LLM calls (classification, analysis, routing, simulation, reporting)
- Google Weather API (live weather for 6 Pakistani cities)
- NewsAPI (live Pakistan news ingestion)
- LangGraph state machine (real agent orchestration)
- WebSocket real-time broadcasting
- spaCy NER + Pakistan gazetteer (100+ locations)

## Future Work
- Integration with Pakistan's NTRC (National Traffic & Road Commission)
- Real-time social media ingestion via Twitter Firehose
- Turn-by-turn navigation with Google Maps Directions API
- Persistent PostgreSQL database with incident history
- User authentication and personalized route preferences
- SMS alert integration via Jazz/Telenor APIs
- Urdu language model fine-tuning for better Roman Urdu detection
