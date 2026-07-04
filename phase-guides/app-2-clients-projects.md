# App Phase 2 — Clients & Projects

## What this phase is
Your first real feature: managing clients (the companies you invoice) and their
projects (the jobs at specific addresses). This is classic **CRUD** — Create, Read,
Update, Delete — and it's the pattern almost every screen in the app repeats.

## Why it matters
Invoices and estimates attach to a client and a project, so this data has to exist
first. It's also the perfect place to learn the full **vertical slice**: database →
API → UI. Once you've done it cleanly once, the harder phases are variations on it.

## Key concepts
- **CRUD:** the four basic operations on data. Most of a business app is CRUD with
  rules layered on top.
- **Vertical slice:** building one feature through *every* layer (DB table → API
  endpoint → UI screen) instead of building all tables, then all endpoints, then all
  screens. Slices keep the app working and testable at every step.
- **Migration:** a versioned change to your database structure. When you add a
  `Client` table, Prisma generates a migration file so the change is repeatable and
  the database can be rebuilt from scratch. *Never* edit the DB by hand.
- **Validation:** checking incoming data before you trust it (e.g. email looks like
  an email, required fields present). We use **Zod** schemas, shared between
  frontend and backend so both validate the same way.
- **Relation / foreign key:** a Project *belongs to* a Client. The database stores
  the client's id on each project row (a foreign key) to link them.

## Task by task
1. **`Client` model + migration.** Fields: name, contact person, email, phone,
   billing address. *Why:* the billing address lives on the client (one "Bill To").
2. **`Project` model + migration.** Fields: link to client, description, status,
   notes, **job-site address**, `created_by`. *Why:* each project has its own
   physical location — that's the subcontract reality we designed for.
3. **Zod schemas in `packages/shared`.** Define the shape + rules once. *Why:*
   frontend form validation and backend request validation stay identical.
4. **Client CRUD API.** Endpoints to create, list, get one, update. *Why:* the UI
   needs these; each is a small, focused controller → service → Prisma call.
5. **Project CRUD API (nested under client).** e.g. `/clients/:id/projects`. *Why:*
   projects only make sense in the context of a client.
6. **Client UI.** A table/list, a create/edit form, a detail view. *Why:* this is
   the reusable pattern (table + form + detail) you'll copy for documents later.
7. **Project UI under a client.** List + form including the job-site address. *Why:*
   you manage a client's jobs from that client's page.
8. **Basic client search.** Filter the list by name/contact. *Why:* even with a few
   clients, scanning is annoying; this seeds the bigger search work in Phase 7.

## Common pitfalls
- **Skipping validation on the backend** because the form already validates:
  never trust the client. Always validate on the server too (same Zod schema makes
  this free).
- **Editing the database directly** instead of writing a migration: your teammates
  and production won't get the change, and it's unrepeatable.
- **Putting the address in the wrong place:** billing address = client; job-site
  address = project. Mixing them breaks the "Bill To vs Job Site" on invoices later.
- **Building all models before any UI:** do one full slice (client end-to-end)
  before starting projects, so you catch wiring issues early.

## How to know you're done
You can create a client, add multiple projects at different job-site addresses to
that client, edit them, and search your client list — all through the UI, with the
data persisting in Postgres.
