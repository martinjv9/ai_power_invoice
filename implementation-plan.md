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
*Goal: an empty but fully-wired monorepo that runs end-to-end.*
- [x] Init monorepo (npm workspaces): `apps/web`, `apps/api`, `packages/shared`
- [x] Shared TypeScript config + Prettier at the root *(ESLint deferred)*
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

## App Phase 1 — Auth & app shell
*Goal: staff can log in; protected routes work.*
- [ ] Prisma `User` model + migration; seed script for a first admin user
- [ ] Password hashing (argon2 or bcrypt)
- [ ] Sessions table + `express-session` with a Postgres store
- [ ] `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- [ ] Auth middleware to protect routes; return 401 when unauthenticated
- [ ] CORS configured with credentials for the separate frontend origin
- [ ] `httpOnly`, `SameSite` session cookie set correctly
- [ ] Frontend: login page, auth context/provider, `useAuth` hook
- [ ] Frontend: protected-route wrapper + redirect to login
- [ ] App shell: nav/sidebar layout, logout button, current-user display
- [ ] Tests: auth middleware rejects logged-out requests; login + session happy path
- **Done when:** you log in, land on an empty dashboard, refresh keeps you in, logout works.

## App Phase 2 — Clients & Projects (core data)
*Goal: manage the people and jobs the documents attach to.*
- [ ] Prisma `Client` model (billing address + contact) + migration
- [ ] Prisma `Project` model (job-site address, status, `created_by`) + migration
- [ ] Zod schemas in `packages/shared` for client + project
- [ ] Client CRUD API (create/read/update/list) with validation
- [ ] Project CRUD API (nested under client)
- [ ] Client list + search UI (table, create/edit form, detail view)
- [ ] Project list + form UI under a client (with job-site address)
- [ ] Basic client search (name/contact) wired to the list
- [ ] Tests: client/project CRUD endpoints; DTO mapper leaks no internal fields
- **Done when:** you can create a client, add projects at different addresses, edit/search them.

## App Phase 3 — Estimates & Invoices (documents)
*Goal: the heart of the app — build documents with line items.*
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
*Goal: AI assists on line items and wording.*
- [ ] Anthropic SDK integrated in the backend; API key via env/secrets
- [ ] `POST /ai/line-items` — plain-language description → structured line items (tool/structured output)
- [ ] `POST /ai/refine` — clean up / professionalize description text
- [ ] Model selection (Opus 4.8 for drafting, Haiku 4.5 for cheap refine); error + timeout handling
- [ ] Frontend: "generate from description" flow — user reviews/edits AI output before saving
- [ ] Frontend: "refine wording" action on descriptions
- [ ] Tests: AI output validated against Zod schema; AI call mocked (no live API in tests)
- **Done when:** you type a job description and get editable line items you can accept into a document.

## App Phase 5 — PDF & Email
*Goal: turn a document into a PDF and send it.*
- [ ] Server-side PDF generation (branded template: Bill To + Job Site, line items, totals)
- [ ] PDF preview + download endpoint
- [ ] Company/branding config (logo, business info, terms) for the header
- [ ] Email provider integration (Resend or Postmark)
- [ ] "Send to client" action: emails the PDF, records `sent` status + sent date
- [ ] Frontend: preview PDF, send button, sent-state indicator
- [ ] Tests: PDF totals match the document; "send" marks status sent (email provider mocked)
- **Done when:** you generate a real PDF and email it to yourself as a test client.

## App Phase 6 — Payments & Dashboard
*Goal: track money and surface what matters.*
- [ ] Prisma `Payment` model (amount, date, method, note) + migration
- [ ] Payment API: record full/partial payment against an invoice
- [ ] Derived outstanding balance + auto status (paid/partial)
- [ ] Overdue computation from due date (auto)
- [ ] Dashboard: outstanding total, overdue list, recent activity
- [ ] Aging buckets view (0–30 / 31–60 / 60+)
- [ ] Tests: partial/full payment updates balance + status; overdue + aging-bucket logic
- **Done when:** recording a partial payment updates the balance and the dashboard reflects it.

## App Phase 7 — Search & filtering
*Goal: find anything fast.*
- [ ] Postgres full-text / trigram indexes on job detail + address columns
- [ ] Structured filter API (dates, amount/balance ranges, status, type, client, staff, payment method)
- [ ] Global search bar (client, number, address, job detail)
- [ ] Sort options on the dashboard/list
- [ ] Saved quick views: Overdue, Unpaid, This month's invoices, Open estimates
- [ ] Tests: filter API returns correct results for key filter combinations; pagination
- **Done when:** you can filter to "overdue invoices over $2k, oldest first" in a couple clicks.

## App Phase 8 — Hardening (pre-deploy)
*Goal: safe enough to run for real.*
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
*(Can start after App Phase 3. Builds: managed data + networking + Terraform.)*
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
