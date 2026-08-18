# Phase 1 handoff: Scaffold

**Objective:** Running Next.js App Router app on a `development` git line: DESIGN.md tokens as CSS variables, Nunito via `next/font`, PWA shell, lip-button + nav chrome, placeholder screens.

**Branch:** `feat/01-scaffold` (merged into `development` at `878f103`; `main` remains `5a83247`, frozen specs only). Not pushed.

## Commits

- `5a83247` — Start the repo with frozen product and design specs so implementation has a source of truth. (`main` only; docs + `.impeccable/`)
- `c586468` — Add a Next.js App Router app so later phases have a running shell.
- `65019f5` — Load Nunito and DESIGN.md tokens so the Polar shell matches the frozen visual system.
- `87029e7` — Add lip buttons, nav, and placeholder routes so the four screens are reachable with the tactile chrome.
- `9b55576` — Make the app installable online-only so Chromium and iOS can add it without an offline cache.

## Files touched

- `app/layout.tsx` — Nunito, Polar viewport, Apple web-app meta, SW register
- `app/globals.css` — DESIGN.md tokens, lip, nav, shell
- `app/page.tsx` — redirect to `/today`
- `app/manifest.ts`
- `app/(app)/layout.tsx`, `placeholder-screen.tsx`, `today|tomorrow|registry|stats/page.tsx`
- `components/buttons/lip-button.tsx`
- `components/nav/app-nav.tsx`
- `components/pwa/register-service-worker.tsx`
- `public/sw.js` — network-only fetch, no caches
- `public/icons/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`
- `licenses/OFL-Nunito.txt`
- `.env.example`, `.gitignore`, root `README.md`

## What works

- Local app: Polar shell, four tabs, `/` → `/today`.
- Nunito 400/800 via `next/font` (build-time self-host, `--font-nunito`).
- CSS variables match DESIGN.md hex (Feather `#58CC02`, Polar `#F7F7F7`, Eel `#4B4B4B`). Full §3 type scale, radii, spacing, lips, motion tokens, reduced-motion overrides.
- Lip button press 150ms; `prefers-reduced-motion` color-only (no travel).
- Nav: mobile 64px + safe-area; ≥1024px 72px left rail; content max 600px; active Feather, inactive Hare, 11px/800 uppercase.
- Manifest at `/manifest.webmanifest`. Apple web-app meta. Network-only service worker (no offline cache, no background sync).

## What is not in this phase

Auth.js, Neon/Drizzle, task lists from DB, capture/reorder/moves/complete, cron, deploy, RaftLabs. No sign-in/denied screens. Streak pill and empty-state SVGs wait for later phases.

## How to verify

```bash
npm install
npm run dev
```

1. http://localhost:3000 redirects to `/today`. Hit Tomorrow, Registry, Stats.
2. Network: Nunito `.woff2` from origin, not fonts.googleapis.com.
3. Computed `--color-feather` is `#58CC02`; page canvas Polar; ink Eel; no `#000000`.
4. Press the green key: 4px travel, 150ms. Enable reduced motion: color flash only.
5. Width ≥1024px: left rail 72px, content column ≤600px.
6. `/manifest.webmanifest` is valid. DevTools Application: manifest + SW; Cache Storage empty.
7. `npm run lint` and `npm run build`.

## Open questions

None for Phase 1. Later phases still need personal GitHub remote, Vercel Hobby, Neon `DATABASE_URL`, Google OAuth client, and `AUTH_ALLOWLIST_EMAIL` (env only, never commit).
