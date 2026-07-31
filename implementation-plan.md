# Implementation Plan

Companion to `project-scope.md` and `tech-stack.md`. Work is broken into small
tasks grouped into phases. Each phase is sequenced to build on the previous one
and to end in something you can run and see working.

> **Deep-dive guides:** each phase below has a beginner-friendly walkthrough in
> `phase-guides/` (what/why/how, key concepts, pitfalls). Read the matching guide
> before starting a phase. Start at `phase-guides/README.md`.

**Legend:** `[ ]` todo · group = phase. Check items off as you go.

**Guiding principles**

- Build in **vertical slices** (DB → API → UI for one feature) so you always have
  a working app, not half-finished layers.
- Get the app working **locally first**, then deploy — debug app and infra
  separately, never both at once.
- **Infra can interleave:** you don't have to finish the whole app before touching
  AWS. Recommended: do **App Phases 0–3** locally, then start **Infra Phase A** to
  deploy the skeleton early and learn cloud in parallel, then continue.
- **Test as you build:** each phase includes a small testing task — write tests
  alongside the feature, not in a big batch at the end. Strategy, tooling, and the
  test pyramid live in `phase-guides/testing.md`.

---

## App Phase 0 — Foundation & scaffolding ✅ DONE

_Goal: an empty but fully-wired monorepo that runs end-to-end._

- [x] Init monorepo (npm workspaces): `apps/web`, `apps/api`, `packages/shared`
- [x] Shared TypeScript config + Prettier at the root
- [x] `packages/shared` for shared types/Zod schemas; wired into both apps (incl. example Client DTOs)
- [x] Backend skeleton: Express + TypeScript (`createApp` factory; folder convention grows in Phase 1+)
- [x] Frontend skeleton: React 19 + Vite + TypeScript
- [x] Tailwind v4 + shadcn configured (`components.json` + `cn` util; theme tokens land with first component)
- [x] Prisma installed + client generates; Postgres via Docker Compose (`npm run db:up`)
- [x] `.env` handling (dotenv) for the api; `.env.example` documents required vars
- [x] Backend `/health` endpoint; frontend fetches it (via Vite proxy) and renders status
- [x] Vitest set up in `web` + `api`; heartbeat test passing in each
- [x] Root scripts: `npm run dev` (api + web together) and `npm test`
- **Done when:** `npm run dev` starts everything and the frontend shows a live "API OK". ✅ met

**Phase 0 follow-up (post-review hardening)** — added after a repo review:

- [x] Fix production build: api bundled with **tsup** (plain `tsc` emitted ESM
      Node couldn't run — no `.js` extensions, and `@invoice/shared` ships raw TS).
      `npm start` now works on build output.
- [x] `npm run smoke` — boots the _built_ api and hits `/health`, so dev tooling
      (tsx/vitest) can never again hide a broken production build
- [x] ESLint (flat config: typescript-eslint + react-hooks) — un-deferred; root `npm run lint`
- [x] Minimal CI (GitHub Actions): lint → test → build → smoke on every push/PR.
      _(Deploy automation still lands in Infra Phase C — this is the test gate only.)_
- [x] CORS locked to an explicit frontend origin via `CORS_ORIGIN` env (was: reflect any origin)
- [x] Node version pinned (`.nvmrc` + `engines`); README quickstart written
- [x] Postgres healthcheck in docker-compose (lets later migrate/seed scripts wait on readiness)

## App Phase 1 — Auth & app shell ✅ DONE

_Goal: staff can log in; protected routes work._

- [x] Prisma `User` model + migration; seed script for a first admin user (`npm run db:seed`)
- [x] Password hashing (bcrypt, cost 12; timing-equalized login so unknown emails
      aren't detectable)
- [x] Sessions table + `express-session` with a Postgres store (`connect-pg-simple`;
      the store owns its table — deliberately outside the Prisma schema)
- [x] `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` (+ session
      regeneration on login against fixation; central JSON error handler)
- [x] Auth middleware to protect routes; return 401 when unauthenticated
- [x] CORS: `CORS_ORIGIN` allowlist + credentials confirmed working with the
      session cookie (never reflect arbitrary origins)
- [x] `httpOnly`, `SameSite=lax` session cookie; `secure` + `trust proxy` in
      production; boot refuses to start in production without `SESSION_SECRET`
- [x] Frontend: login page, auth context/provider, `useAuth` hook
- [x] Frontend: protected-route wrapper + redirect to login (returns you to the
      page you were headed to after login)
- [x] App shell: nav/sidebar layout, logout button, current-user display
- [x] Tests: auth middleware rejects logged-out requests; login + session happy path
      (integration tests against real Postgres, in CI too via a service container)
- **Done when:** you log in, land on an empty dashboard, refresh keeps you in, logout works. ✅ met

## App Phase 2 — Clients & Projects (core data) ✅ DONE

_Goal: manage the people and jobs the documents attach to._

- [x] Prisma `Client` model (billing address + contact) + migration
- [x] Prisma `Project` model (job-site address, status, `created_by`) + migration
      (also: `Session` modeled in Prisma so the store's table no longer looks
      like schema drift to `prisma migrate dev`)
- [x] Zod schemas in `packages/shared` for client + project (create/update/response)
- [x] Client CRUD API (create/read/update/list) with validation — no DELETE on
      purpose; the archival policy is decided once documents reference clients
- [x] Project CRUD API (nested under client: `/clients/:clientId/projects`;
      `created_by` stamped from the session, never from the request body)
- [x] Client list + search UI (table, create/edit form, detail view) —
      TanStack Query introduced here for data fetching/invalidation
- [x] Project list + form UI under a client (with job-site address + status badge)
- [x] Basic client search (name/contact, case-insensitive) wired to the list
- [x] Tests: client/project CRUD endpoints; DTO mapper leaks no internal fields
      (exact-key assertion on the response shape)
- **Done when:** you can create a client, add projects at different addresses, edit/search them. ✅ met

## App Phase 3 — Estimates & Invoices (documents)

_Goal: the heart of the app — build documents with line items._

- [ ] Prisma `Document` (type estimate|invoice, status, dates, totals) + migration
- [ ] Prisma `LineItem` (structured rows) + migration
- [ ] Sequential document-numbering logic (safe against races)
- [ ] Tax + totals calculation (subtotal → tax → total)
- [ ] Document CRUD API: create estimate/invoice, add/edit/remove line items
- [ ] Status transition logic (draft → sent → approved/rejected/paid/partial)
- [ ] Estimate → invoice conversion endpoint (assigns a real invoice number)
- [ ] Document builder UI: line-item editor with live totals
- [ ] Document list + detail views; "convert to invoice" action
- [ ] Tests: numbering (no dupes/races), tax + totals math, status-transition rules
- **Done when:** you create an estimate, add line items, convert it to a numbered invoice.

## App Phase 4 — AI features

_Goal: AI assists on line items and wording._

- [ ] Anthropic SDK integrated in the backend; API key via env/secrets
- [ ] `POST /ai/line-items` — plain-language description → structured line items (tool/structured output)
- [ ] `POST /ai/refine` — clean up / professionalize description text
- [ ] Model selection (Opus 4.8 for drafting, Haiku 4.5 for cheap refine); error + timeout handling
- [ ] Frontend: "generate from description" flow — user reviews/edits AI output before saving
- [ ] Frontend: "refine wording" action on descriptions
- [ ] Tests: AI output validated against Zod schema; AI call mocked (no live API in tests)
- **Done when:** you type a job description and get editable line items you can accept into a document.

## App Phase 5 — PDF & Email

_Goal: turn a document into a PDF and send it._

- [ ] Server-side PDF generation (branded template: Bill To + Job Site, line items, totals)
- [ ] PDF preview + download endpoint
- [ ] Company/branding config (logo, business info, terms) for the header
- [ ] Email provider integration (Resend or Postmark)
- [ ] "Send to client" action: emails the PDF, records `sent` status + sent date
- [ ] Frontend: preview PDF, send button, sent-state indicator
- [ ] Tests: PDF totals match the document; "send" marks status sent (email provider mocked)
- **Done when:** you generate a real PDF and email it to yourself as a test client.

## App Phase 6 — Payments & Dashboard

_Goal: track money and surface what matters._

- [ ] Prisma `Payment` model (amount, date, method, note) + migration
- [ ] Payment API: record full/partial payment against an invoice
- [ ] Derived outstanding balance + auto status (paid/partial)
- [ ] Overdue computation from due date (auto)
- [ ] Dashboard: outstanding total, overdue list, recent activity
- [ ] Aging buckets view (0–30 / 31–60 / 60+)
- [ ] Tests: partial/full payment updates balance + status; overdue + aging-bucket logic
- **Done when:** recording a partial payment updates the balance and the dashboard reflects it.

## App Phase 7 — Search & filtering

_Goal: find anything fast._

- [ ] Postgres full-text / trigram indexes on job detail + address columns
- [ ] Structured filter API (dates, amount/balance ranges, status, type, client, staff, payment method)
- [ ] Global search bar (client, number, address, job detail)
- [ ] Sort options on the dashboard/list
- [ ] Saved quick views: Overdue, Unpaid, This month's invoices, Open estimates
- [ ] Tests: filter API returns correct results for key filter combinations; pagination
- **Done when:** you can filter to "overdue invoices over $2k, oldest first" in a couple clicks.

## App Phase 8 — Hardening (pre-deploy)

_Goal: safe enough to run for real._

- [ ] Review every route for auth + input validation
- [ ] Rate-limit login; basic security headers
- [ ] Ensure `created_by` recorded on all documents/projects
- [ ] Seed/demo data script
- [ ] Test coverage audit: fill gaps left from earlier phases
- [ ] Add a couple of Playwright E2E smoke tests (login → build invoice → send)
- [ ] Production env/secrets strategy documented
- **Done when:** a fresh clone + seed gives a working, secured app.

---

## Infra Phase A — AWS: EC2, RDS, networking, IaC

_(Can start after App Phase 3. Builds: managed data + networking + Terraform.)_

- [ ] AWS account hygiene: non-root IAM user, MFA, **Budgets alarm**
- [ ] Terraform project skeleton (state backend, providers)
- [ ] VPC, subnets, security groups, IAM roles in Terraform
- [ ] RDS PostgreSQL provisioned via Terraform
- [ ] EC2 instance via Terraform; deploy backend (Node process) + built frontend
- [ ] Point app at RDS via env/secrets; confirm it runs in the cloud
- **Done when:** the app is reachable on AWS, backed by RDS, all provisioned by Terraform.

## Infra Phase B — Containers

- [ ] Dockerfile for backend (and optionally frontend)
- [ ] Local `docker compose` parity with the cloud setup
- [ ] ECR repositories; push images
- [ ] Run the container(s) on the EC2 host
- **Done when:** the app runs as containers, images live in ECR.

## Infra Phase C — CI/CD

_(A test-only CI workflow — lint/test/build/smoke — already exists from the Phase 0
follow-up. This phase extends it with image build + deploy; don't start a new one.)_

- [ ] GitHub Actions: on push → run tests → build image → push to ECR (tests gate the deploy)
- [ ] Automated deploy step (replace running container)
- [ ] Retire manual SSH deploys
- **Done when:** merging to main ships automatically.

## Infra Phase D — Orchestration (graduate)

- [ ] ECS cluster (EC2 launch type) via Terraform; run the services
- [ ] Move behind a load balancer; wire logging to CloudWatch
- [ ] Switch launch type to **Fargate**; drop server management
- **Done when:** the app runs on ECS/Fargate, fully IaC + CI/CD, no hand-managed servers.

---

## Suggested milestones

1. **Skeleton runs** (App 0) — proves the whole stack is wired.
2. **Login works** (App 1).
3. **Clients + projects** (App 2).
4. **First numbered invoice** (App 3) — the core is real.
5. **First cloud deploy** (Infra A) — start cloud learning early.
6. **AI + PDF + email** (App 4–5) — the "wow" features.
7. **Payments + dashboard + search** (App 6–7) — the daily-use value.
8. **Hardened + containerized + CI/CD + Fargate** (App 8, Infra B–D).
