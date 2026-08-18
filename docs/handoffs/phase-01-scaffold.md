# Phase 1 handoff: Scaffold

**Objective:** Running Next.js App Router app on a `development` git line: DESIGN.md tokens as CSS variables, Nunito via `next/font`, PWA shell, lip-button + nav chrome, placeholder screens.

**Branch:** `feat/01-scaffold` (from `development`)

## Commits

- `5a83247` — Start the repo with frozen product and design specs so implementation has a source of truth. (`main` only; docs + `.impeccable/`)
- `c586468` — Add a Next.js App Router app so later phases have a running shell.
- Tokens + font (this commit) — Load Nunito and DESIGN.md tokens so the Polar shell matches the frozen visual system.

## Files touched

- `app/layout.tsx` — Nunito 400/800 via `next/font/google`, `--font-nunito`
- `app/globals.css` — full DESIGN.md palette, §3 type scale, radii, spacing, lips, motion
- `licenses/OFL-Nunito.txt`

## What works

- Polar canvas (`#F7F7F7`) and Eel ink (`#4B4B4B`). Nunito self-hosted at build time. CSS variables match DESIGN.md hex. Tailwind `@theme` maps to those variables.

## What is not in this phase

Auth.js, Neon/Drizzle, task lists, capture/reorder/moves/complete, cron, deploy, RaftLabs. Lip-button, nav, four routes, and PWA are still upcoming in this phase.

## How to verify

```bash
npm run dev
```

Confirm page background is Polar and computed `--color-feather` is `#58CC02`. Network: Nunito `.woff2` from origin, not fonts.googleapis.com.

## Open questions

None for this sub-step. Personal GitHub remote, Vercel, Neon, and Google OAuth wait for later phases.
