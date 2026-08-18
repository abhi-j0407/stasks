# Pending tasks

Owner follow-ups that should not block the current master-plan phase: browser checks, later pickup, things that need a human. Implementors append an item here instead of waiting. Do not put secrets or env values in this file.

Orchestrator and later implementors read this at the start of a phase. Check off or move items when done. Do not delete history of resolved items; mark them **Done**.

## Open

### P2-1. Google allowlist in the local browser

**Phase:** 2  
**Why later:** Owner skipped a local browser run. Server-side checks already passed (logged-out routes redirect to `/signin`; Google OAuth starts with redirect URI `http://localhost:3000/api/auth/callback/google`).

**Still do:**

1. `npm run dev` → http://localhost:3000
2. Allowlisted Gmail (the one in `AUTH_ALLOWLIST_EMAIL`) reaches `/today`.
3. A second Google account that is a GCP OAuth **test user** sees `/denied` (kind copy, no retry spam). If that account is not a test user, Google blocks before our denied screen.

**Env:** `.env.local` is gitignored. Never commit it. Values stay on the owner’s machine.

**Handoff:** [handoffs/phase-02-auth.md](handoffs/phase-02-auth.md)

## Done

None yet.
