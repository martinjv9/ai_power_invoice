# AI-Powered Invoice & Estimate Management System — Scope v2

> This is the active build spec. The original draft is preserved in
> `project-scope-v1-original-DO-NOT-USE.md` for reference only.
>
> **Companion docs:** `tech-stack.md` (stack, auth, AWS hosting) ·
> `implementation-plan.md` (phased task breakdown).

## Problem

Invoices and estimates are written out manually for each client and job. There's
no system to store them, and each one has to be manually converted to PDF and
sent to an email or phone number. There's no reliable way to track who owes what,
what projects have been done for which client, or which payments have come in vs.
are still outstanding. Following up on unpaid invoices depends on memory.

## Users & Roles

- **Admin-only application.** Only the business owner and a few staff log in.
- **Clients never log in.** They receive finished PDFs by email (SMS later).
- **A few staff members** each have their own login. Documents record who created
  them (`created_by`) for basic accountability.

## Context

- Subcontract work for clients (often general contractors).
- A single client can have **many projects at different job-site addresses**.
- The client is billed at **one billing address**; each project has its own
  **job-site address**. Invoices show both ("Bill To" vs. "Job Site").
- US-based. USD. Sales tax by state. Sequential document numbering for tracking.

## MVP Scope

1. **Auth** — staff login; a few users.
2. **Client management** — create/edit/search clients (billing address + contact).
3. **Project management** — create/edit projects under a client, each with its own
   job-site address; one site per project.
4. **AI: generate line items** — from a plain-language job description, produce
   structured line items (description, qty, unit price).
5. **AI: refine wording** — clean up and professionalize descriptions/text.
6. **Estimates & invoices** — create either; both share one document model.
7. **Estimate → invoice conversion** — approve an estimate, convert it to an
   invoice with a real sequential invoice number.
8. **Numbering & tax** — sequential document numbers; sales-tax line.
9. **PDF generation** — branded invoice/estimate PDF with Bill To + Job Site.
10. **Email sending** — send the PDF to the client via email.
11. **Manual payment recording** — record full/partial payments against invoices.
12. **Dashboard** — outstanding balances, overdue invoices, recent activity.
13. **Search & filtering** — see dedicated section below.

## Phase 2 (deliberately deferred)

- **SMS sending** — send a link to the PDF via Twilio (requires a purchased
  number + A2P 10DLC registration). Note: SMS sends a _link_, not an attachment.
- **AI pricing suggestions from past jobs** — deferred because it needs
  historical data the system won't have on day one. The data model is built to
  support it now (structured line items) so it can be added without migration.
- **AI-drafted send messages** — auto-write the email/SMS body when sending.
- **Reusable saved locations per client** — only if repeat sites become common.

## Data Model

- **Client** — name, contact person, email, phone, **billing address**.
- **Project** — client, description, status, notes, **job-site address**,
  created_by. (One job-site per project.)
- **Document** (type: `estimate` | `invoice`) — number, type, status, client,
  project, subtotal, tax, total, issue/due/sent/paid dates, created_by.
- **LineItem** — document, description, qty, unit price, line total.
  _Stored as structured rows (not a text blob)_ so search and the future pricing
  AI can query them.
- **Payment** — invoice, amount, date, method (check/card/cash), note.
- **User** — staff login.

**Statuses**

- Estimate: `draft` → `sent` → `approved` / `rejected`
- Invoice: `draft` → `sent` → `partial` / `paid`, plus `overdue` (auto-computed
  from due date)

## Search & Filtering

A global search bar for quick free-text lookup, plus structured filters + sort on
the dashboard, plus saved quick views.

**Filter dimensions**

- **Dates** — created, sent, due, paid (with ranges: this month, last quarter, etc.)
- **Amount** — total and **outstanding balance**, with >, <, between
- **Job detail** — free-text across project description + line-item text
- **Address** — job-site and billing
- **Client** — name or contact person
- **Status** — draft / sent / approved / rejected / partial / paid / overdue
- **Type** — estimate vs. invoice
- **Document number** — exact lookup
- **Created-by / staff**
- **Payment method**
- **Aging buckets** — 0–30 / 31–60 / 60+ days overdue (accounts-receivable view)

**Saved quick views** — Overdue, Unpaid, This month's invoices, Open estimates.

**Technical note:** free-text search over job detail and addresses uses Postgres
full-text / trigram indexes; status, dates, and amounts are indexed columns.
Designed in from the start.

## Tech Stack & Hosting

Moved to **`tech-stack.md`** to keep this doc readable. In brief: separate
React/Vite frontend + Express backend (TypeScript throughout, monorepo), Postgres
via Prisma, Tailwind + shadcn/ui, cookie + database-session auth, and a phased
AWS hosting path (EC2 → containers → CI/CD → ECS/Fargate). See that file for
details and rationale.

## Open Questions (non-blocking)

- Exact status set — proposed above; confirm during build.
- Whether "overdue" is auto-computed from due date (recommended) or manual.
- PDF storage: regenerate on demand (recommended, no storage) vs. store in S3.
- Company/branding details for the PDF header (logo, business info, terms).
- Default payment terms / due-date window (e.g. Net 30).
