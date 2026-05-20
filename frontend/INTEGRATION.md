# CIRO — Renewed frontend integration

This is the **`v1.0` frontend** with a premium animated marketing site added in front of it. Your dashboard is **unchanged** — it has just moved from `/` to `/dashboard`.

```
Visitor flow
  / ─────────────────► Marketing site (Home, Product, Intelligence, Pricing, Contact)
  /dashboard ────────► The original CIRO operations console (unchanged)
```

---

## What changed

| Area | Change |
|---|---|
| **Router** | New `react-router-dom` setup in `main.tsx` + `App.tsx` |
| **Dashboard** | Old `App.tsx` body moved to `src/pages/Dashboard.tsx` (mounted at `/dashboard`) |
| **Existing components** | Moved from `src/components/` → `src/components/dashboard/` (same files, new path) |
| **Tailwind config** | Adds the Crisis24-inspired dark palette + Anton/Inter/Geist Mono font families |
| **Global CSS** | `src/index.css` replaced — adds all landing animations (reveals, pulse, magnetic, marquee, etc.) |
| **`index.html`** | Adds Google Fonts (`Anton`, `Inter`, `Geist Mono`) |
| **`package.json`** | Adds `react-router-dom@^6.26.0` (only new dep) |

Nothing in `src/types`, `src/hooks`, or `src/store` was modified.

---

## To run

```bash
cd frontend-renewed
npm install
npm run dev    # http://localhost:3000  → marketing
               # http://localhost:3000/dashboard → console
```

Build & preview:

```bash
npm run build
npm run preview
```

---

## File map

```
frontend-renewed/
├── index.html                 ← + Google Fonts <link>
├── package.json               ← + react-router-dom
├── tailwind.config.js         ← + colors + fontFamily
├── vite.config.ts             (unchanged)
├── tsconfig.json              (unchanged)
├── postcss.config.js          (unchanged)
├── Dockerfile                 (unchanged — see "Production deploy" below)
└── src/
    ├── main.tsx               ← now wraps <App/> in <BrowserRouter/>
    ├── App.tsx                ← REPLACED — router with marketing + /dashboard
    ├── index.css              ← REPLACED — full theme + animations
    ├── types/index.ts         (unchanged)
    ├── hooks/useWebSocket.ts  (unchanged)
    ├── store/useCiroStore.ts  (unchanged)
    │
    ├── components/dashboard/  ← your originals, just moved
    │   ├── AgentStatusBar.tsx
    │   ├── CrisisCard.tsx
    │   ├── SeverityBadge.tsx
    │   └── SimulatePanel.tsx
    │
    ├── components/landing/    ← NEW — all marketing UI
    │   ├── Atoms.tsx              (SeverityColumn, SmallStat, PulseRings)
    │   ├── ClosingCTA.tsx
    │   ├── CursorHalo.tsx
    │   ├── DashboardMockup.tsx    (stylized preview of /dashboard for the Home page)
    │   ├── Footer.tsx
    │   ├── LiveTicker.tsx         (faux real-time event feed; swap to live data — see below)
    │   ├── Magnetic.tsx
    │   ├── Marquee.tsx
    │   ├── Nav.tsx
    │   ├── Reveal.tsx             (Reveal, RevealLines, DrawRule)
    │   └── useReveal.ts
    │
    └── pages/
        ├── Dashboard.tsx       ← your old App.tsx body
        ├── Home.tsx
        ├── Product.tsx         (pinned horizontal-scroll agent pipeline)
        ├── Intelligence.tsx
        ├── Pricing.tsx
        └── Contact.tsx
```

---

## Design system tokens

All landing colors come from CSS variables on `:root` in `src/index.css`. To tweak the palette in one place:

```css
:root {
  --bg:        #0A0A0A;   /* page background */
  --bg-elev:   #161616;   /* slightly elevated cards / alt sections */
  --bg-deep:   #000000;   /* full-bleed dark sections (CTA, footer) */
  --bg-line:   #1F1F1F;   /* card borders */
  --fg:        #FFFFFF;
  --fg-2:      rgba(255, 255, 255, 0.72);
  --fg-3:      rgba(255, 255, 255, 0.45);
  --accent:    #E83A2C;   /* signature red — change for a different vibe */
  --accent-2:  #FF5A48;
}
```

Tailwind also exposes them as `bg-bg`, `bg-bg-elev`, `bg-bg-deep`, `text-fg`, `text-accent`, etc. (see `tailwind.config.js`).

Type system:
- `font-display` → Anton (Druk-style condensed heavy sans, all-caps)
- `font-sans` (default) → Inter
- `font-mono` → Geist Mono (matches your existing dashboard mono)

---

## Wiring the LiveTicker to real data

`src/components/landing/LiveTicker.tsx` ships with a faux feed (`FAKE_EVENTS`) on a 2.8s interval. To make the marketing Home page show real events, read from your existing Zustand store:

```tsx
import { useCiroStore } from "../../store/useCiroStore";

export function LiveTicker({ limit = 6 }: { limit?: number }) {
  const events = useCiroStore((s) => s.events).slice(0, limit);
  // ...render the same .ticker-row markup
}
```

(Pair it with `useWebSocket()` mounted somewhere above the ticker, e.g. in `App.tsx` for the marketing branch, if you want the public Home page to stream live.)

---

## Production deploy (nginx / Docker)

Your existing `Dockerfile` uses nginx. For a single-page app, you need to add a fallback so `/product`, `/pricing`, etc. don't 404 on direct refresh. Easiest fix — replace `Dockerfile` with this version and add an `nginx.conf` next to it:

**`Dockerfile`**
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

**`nginx.conf`**
```nginx
server {
  listen 3000;
  root /usr/share/nginx/html;
  index index.html;
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

Vite's dev server handles this automatically — only nginx (or whatever you serve `dist/` from) needs the fallback.

---

## Environment variables

Unchanged from your v1.0:

```
VITE_API_URL=http://localhost:8000          # Used by Dashboard + SimulatePanel
VITE_WS_URL=ws://localhost:8000/ws/dashboard # Used by useWebSocket
```

---

## What I'd polish next

- **Live data on Home** — point `LiveTicker` and the `DashboardMockup`'s stats at the real store
- **Real screenshots** — `DashboardMockup` is hand-drawn; swap to an `<iframe src="/dashboard">` or an actual screenshot for the Home page preview
- **Map** — drop in `react-leaflet` (already in `package.json`) on `/intelligence` to show real incident locations on the editorial briefs
- **Speaker-notes / case study detail** — `/intelligence` is currently a teaser grid; expand each card into its own `/intelligence/PK-2025-08`-style route
- **Form backend** — `/contact` form just sets local state; wire to your lead capture endpoint
- **Accessibility audit** — animations honor `prefers-reduced-motion` already, but a focus-ring pass on the magnetic buttons + nav links is worth a sweep

If you want me to do any of these, just say which.
