# Tech Stack & Hosting

Companion to `project-scope.md`. Covers the technical stack, auth approach, and
the AWS hosting/learning path. The scope doc points here instead of inlining all
of this.

## Architecture
Separate frontend and backend, **TypeScript on both sides**, in a monorepo with a
shared types package (pnpm workspaces or Turborepo). Separation is a deliberate
choice to serve the AWS/container learning goals (two deployable services), not a
requirement of the app itself.

## Frontend
- **React + Vite** (SPA — no SSR/SEO needed behind an admin login)
- **Tailwind CSS + shadcn/ui** (own-your-components; strong for data-heavy dashboards)
- Data fetching: **TanStack Query** against the backend REST API

## Backend
- **Express** (TypeScript) — REST API
- **Zod** for request validation; shared types with the frontend
- **Postgres** via **Prisma**
- Hosts the AI, PDF, and email logic as services the frontend calls
- Suggested structure: routes → controllers → services → Prisma (Express is
  unopinionated, so a clean convention is set up from the start)

## Auth — DECIDED: cookie + database sessions
- **Authentication**: email/password for staff (a few users, admin-only).
- **Session mechanism**: **server-side database sessions**, with the session ID
  carried in an **`httpOnly`, `SameSite` cookie** (not JWT).
- **Why (not JWT):**
  - One backend + low traffic → JWT's stateless-scaling advantage is irrelevant.
  - Financial app with staff logins → **instant session revocation / force-logout**
    matters, which DB sessions give for free and JWT makes awkward.
  - Already running Postgres → a sessions table costs nothing.
  - `httpOnly` cookie can't be read by browser JS → closes the most common token
    theft route (XSS), which JWT-in-localStorage does not get for free.
- Since frontend and backend are **separate origins**, configure **CORS** with
  credentials, and set the session cookie appropriately.
- Plumbing via a library such as `express-session` (with a Postgres store) or Lucia.
- Rule of thumb applied: JWT is for many services / third parties verifying
  identity without a shared DB; DB sessions are for a normal first-party web app —
  which this is.

## Other cross-cutting services
- **PDF**: generated **server-side** (e.g. `@react-pdf/renderer` or headless
  Chromium) so the backend owns document generation.
- **Email**: Resend or Postmark (kept off-cloud to avoid SES sandbox friction).
- **AI**: Claude — Opus 4.8 for quality drafting, Haiku 4.5 for cheap/fast
  refinement; structured tool output for line-item generation. Called from the
  backend.

## Cloud & Hosting (AWS) — Progressive Learning Path
A secondary goal is deepening AWS skills, building on prior EC2/LAMP experience.
Rather than jump straight to fully-managed abstractions, start on familiar EC2 and
progressively layer in managed data, networking, IaC, containers, and CI/CD —
ending at container orchestration. Each phase reuses the previous one; no
throwaway work.

**Phase 1 — EC2, leveled up** *(managed data + networking + IaC)*
- Deploy the app on an EC2 instance (familiar ground). Frontend build served as
  static files (via the backend or S3/CloudFront); backend runs as a Node process.
- **RDS for PostgreSQL** instead of a hand-installed DB (managed vs. self-managed).
- Proper **VPC, subnets, security groups, IAM roles**.
- Provision all of it with **Terraform**, not the console — IaC from day one.

**Phase 2 — Containers**
- **Dockerize** the backend (and optionally the frontend) — two images bridge
  directly from LAMP/EC2 experience and give you real multi-service orchestration.
- Push images to **ECR**.

**Phase 3 — CI/CD**
- **GitHub Actions**: build image → push to ECR → auto-deploy. Retire manual SSH
  deploys.

**Phase 4 — Orchestration (graduate)**
- Move to **ECS with the EC2 launch type** (adds orchestration, keeps the EC2
  mental model), then switch the launch type to **Fargate** to drop server
  management entirely. Same containers, same Terraform.

**Supporting services**: S3 (PDFs), Secrets Manager / SSM (secrets), CloudWatch
(logs/metrics). Email stays on **Resend/Postmark** (off-cloud, avoids the SES
sandbox).

**Day-one guardrail**: set an **AWS Budgets alarm** immediately (~$15–40/mo
expected) to avoid surprise bills.
