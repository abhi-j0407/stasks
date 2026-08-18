# stasks

Personal task tracker. Nightly Today / Tomorrow / Registry planning.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Signed-in visitors go to `/today`; everyone else sees sign-in.

Copy `.env.example` to `.env.local` and fill `AUTH_*` for Google allowlist plus `DATABASE_URL` (personal Neon, direct/unpooled if Neon shows both). Do not commit secrets.

```bash
npm run db:migrate
npm run db:seed
npm test
```

`db:seed` is local visual QA only. It inserts sample Today / Tomorrow / Registry rows for the allowlisted user if that account has no tasks yet. Sign in once first. It never deletes. Do not run in production.

## Accounts

Personal GitHub, Vercel, Neon, and Google OAuth only. Never RaftLabs orgs, emails, or billing.

## Docs

Product, design, plans, and agent handoffs live under [`docs/`](docs/). Start with [`docs/README.md`](docs/README.md).
