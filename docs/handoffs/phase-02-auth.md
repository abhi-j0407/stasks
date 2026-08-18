# Phase 2 handoff: Google allowlist auth

**Objective:** Only the allowlisted Gmail gets a session; everyone else sees the DESIGN.md denied screen. Unauthenticated visitors never see lists.

**Branch:** `feat/02-auth` (merged into `development` at `44f1068`; `main` remains `5a83247`, frozen specs only). Not pushed.

## Commits

- `f72c178` — Add Auth.js with Google and a JWT session so allowlist can run without a database.
- `f35cc41` — Add Polar sign-in and denied screens so visitors meet kind DESIGN.md copy.
- `1f9d523` — Gate app routes behind a session so logged-out visitors never see lists.
- `d6cea9f` — Record the Phase 2 auth handoff so a cold session can verify the gate.
- `123920c` — Record the Phase 2 handoff commit hash so a cold session can verify the work.
- `44f1068` — Track deferred browser auth checks in pending tasks so Phase 2 can close without a local Google click.

## Files touched

- `package.json`, `package-lock.json` — `next-auth@5.0.0-beta.32`
- `lib/auth.ts` — Auth.js v5, Google provider, JWT session, allowlist `signIn` callback
- `app/api/auth/[...nextauth]/route.ts` — `GET`/`POST` handlers
- `app/(auth)/layout.tsx` — Polar shell, no app nav
- `app/(auth)/signin/page.tsx` — Headline, Wolf one-liner, one primary Google LipButton
- `app/(auth)/denied/page.tsx` — Eel title, Wolf explanation, quiet different-account link
- `app/globals.css` — auth-screen Wolf line and quiet link
- `proxy.ts` — Next.js 16 Proxy; public `/signin` and `/denied`; everything else needs a session
- `app/(app)/layout.tsx` — authoritative `auth()` check
- `app/page.tsx` — `/` → `/today` or `/signin`
- `README.md` — localhost entry matches the gate
- `docs/handoffs/phase-02-auth.md` — this file
- `docs/PENDING.md` — standing list for owner browser tests and later pickup

## What works

- Auth.js v5 Google + JWT. No Clerk, no Drizzle adapter, no Neon.
- `signIn` callback: email must equal `AUTH_ALLOWLIST_EMAIL` (trim, case-insensitive). Google `email_verified` must be true. Missing env or email fails closed to `/denied`.
- Logged out: `/`, `/today`, `/tomorrow`, `/registry`, `/stats` redirect to `/signin`. `/signin` and `/denied` return 200. No list nav on those pages.
- Google sign-in starts: 302 to `accounts.google.com` with `redirect_uri=http://localhost:3000/api/auth/callback/google` and `prompt=select_account`. Google accepted the client (no `invalid_client` or `redirect_uri_mismatch`).
- `npm run lint` and `npm run build` pass. Proxy is registered.
- `.env.local` exists locally (gitignored): `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_ALLOWLIST_EMAIL`, `AUTH_URL`, `AUTH_TRUST_HOST` are set. Never commit this file.

## What is not in this phase

Neon, Drizzle adapter, task lists from DB, capture/reorder/moves/complete, cron, deploy, RaftLabs, Clerk/Auth0.

## Localhost Google OAuth (owner, personal GCP only)

- Authorized JavaScript origin: `http://localhost:3000`
- **Authorized redirect URI:** `http://localhost:3000/api/auth/callback/google`
- Consent screen in Testing: allowlisted Gmail **and** a second Google as test users.

## How to verify

```bash
npm install
npm run dev
```

1. Logged out: http://localhost:3000 and `/today` (and Tomorrow, Registry, Stats) show sign-in only. No list chrome.
2. Allowlisted Google account reaches `/today`.
3. Other Google account (must be a GCP test user) sees `/denied`. Kind copy. No retry spam.
4. `npm run lint` and `npm run build`.
5. `git status` does not include `.env.local`.

Steps 2–3 are **not done in a browser**. Owner deferred them. Tracked as **P2-1** in [docs/PENDING.md](../PENDING.md).

## Open questions

- None for Phase 2 code. Browser allowlist/denied check is P2-1, not a blocker for Phase 3.
