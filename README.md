# AI-Powered Invoice & Estimate Management System

Admin-only app for a subcontracting business: manage clients and job-site
projects, build estimates and invoices (with AI-assisted line items and
wording), generate branded PDFs, email them to clients, and track payments and
outstanding balances.

**Status:** App Phase 1 (auth & app shell) complete — staff log in with
cookie + database sessions; the app shell and protected routes are in place.
Next up: clients & projects (Phase 2). See the docs below.

## Docs

| Doc                                                | What it covers                                                  |
| -------------------------------------------------- | --------------------------------------------------------------- |
| [`project-scope.md`](project-scope.md)             | What we're building and why (MVP scope, data model, search)     |
| [`tech-stack.md`](tech-stack.md)                   | Stack choices with rationale (auth, hosting, AWS learning path) |
| [`implementation-plan.md`](implementation-plan.md) | Phased task checklist — the working plan                        |
| [`phase-guides/`](phase-guides/README.md)          | Beginner-friendly deep dives for each phase                     |

## Layout

```
apps/web         React 19 + Vite + Tailwind/shadcn frontend
apps/api         Express + TypeScript REST API (Prisma → Postgres)
packages/shared  Types + Zod DTO schemas used by both sides
```

## Prerequisites

- **Node 22+** (see `.nvmrc`)
- **Docker** (for local Postgres)

## Quickstart

```bash
npm install                                # install all workspaces
npm run db:up                              # start Postgres (Docker)
cp apps/api/.env.example apps/api/.env     # local env (defaults work as-is)
npm run prisma:migrate -w @invoice/api     # create/update database tables
npm run db:seed -w @invoice/api            # create the first admin login
npm run dev                                # api on :3000, web on :5173
```

Open <http://localhost:5173> and sign in with the seeded admin —
`admin@example.com` / `change-me-now` by default (set `ADMIN_EMAIL` /
`ADMIN_PASSWORD` in `apps/api/.env` before seeding to use your own). The
dashboard shows a live "API OK" badge (the frontend calling the backend
`/health` through the Vite proxy).

## Scripts (root)

| Command                     | What it does                                                       |
| --------------------------- | ------------------------------------------------------------------ |
| `npm run dev`               | Run api + web together with live reload                            |
| `npm test`                  | Run all workspace tests (Vitest)                                   |
| `npm run lint`              | ESLint across the repo                                             |
| `npm run build`             | Build shared → api (tsup bundle) → web                             |
| `npm run smoke`             | Boot the **built** api and hit `/health` (post-build sanity check) |
| `npm run db:up` / `db:down` | Start/stop local Postgres                                          |

CI (GitHub Actions) runs lint → test → build → smoke on every push and PR.
