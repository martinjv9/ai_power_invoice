# App Phase 0 — Foundation & Scaffolding

## What this phase is
Setting up an empty project that already has all its pieces wired together: a
frontend, a backend, a shared code area, a database, and a way to run them all at
once. No features yet — just proof that the plumbing works end to end.

## Why it matters
The single most demoralizing way to build a project is to write a bunch of
features and *then* discover the frontend can't talk to the backend, or the
database won't connect. Phase 0 flushes out all those wiring problems while there's
nothing to break. When it's done, every later phase is "just" adding features onto
a skeleton you trust.

## Key concepts
- **Monorepo**: one repository holding multiple projects (our `web`, `api`, and
  `shared`) instead of three separate repos. Easier to share code and keep
  versions in sync.
- **npm workspaces**: npm's built-in monorepo support — lets `web` and `api` each
  have their own dependencies while sharing the `shared` package. (We chose npm
  over pnpm because corepack's pnpm was broken on this machine; pnpm/Turborepo
  remain options later.)
- **Package**: a folder with its own `package.json` (list of dependencies + name).
  Our three packages are `apps/web`, `apps/api`, `packages/shared`.
- **Prisma**: an ORM — a library that lets you talk to the Postgres database using
  TypeScript objects instead of raw SQL. It also manages your table structure.
- **Docker Compose**: a way to run supporting services (here, a local Postgres
  database) in a container with one command, so you don't install Postgres by hand.
- **Environment variables (`.env`)**: config values (like the database URL) kept
  out of the code so they can differ between your laptop and production.

## Task by task
1. **Init the monorepo.** Create the folder layout `apps/web`, `apps/api`,
   `packages/shared`. *Why:* clear separation — UI, server, and shared types each
   have a home. The shared package is where types used by *both* sides live.
2. **Root ESLint/Prettier/tsconfig.** One set of formatting + linting rules for the
   whole repo. *Why:* consistent code from day one is far easier than retrofitting.
3. **`packages/shared`.** Put a throwaway shared type here and import it from both
   apps. *Why:* proves the sharing mechanism works — this is what keeps frontend and
   backend types in sync later.
4. **Backend skeleton.** Express + TypeScript with the folder convention
   routes → controllers → services → prisma. *Why:* Express gives you no structure,
   so imposing one now prevents a spaghetti pile of route handlers later.
   (routes = URLs, controllers = handle the request/response, services = business
   logic, prisma = database access.)
5. **Frontend skeleton.** React + Vite. *Why:* Vite gives instant dev reloads and a
   simple build; perfect for a single-page admin app.
6. **Tailwind + shadcn/ui.** Install and theme them. *Why:* set up styling before
   building screens so components look right immediately.
7. **Prisma + local Postgres.** Add Prisma; run Postgres via Docker Compose. *Why:*
   a real database locally means no surprises when you deploy to a real one.
8. **`.env` handling.** Load env vars in both apps; commit a `.env.example`
   listing required vars (no secrets). *Why:* teammates (and future you) know what
   config is needed without leaking real values.
9. **`/health` end to end.** Backend returns `{status:"ok"}`; frontend fetches it
   and shows it. *Why:* this single request proves the browser → API → (and soon
   DB) path works. It's the heartbeat of the whole setup.
10. **One command to run everything.** A root `npm run dev` that starts web + api.
    *Why:* low friction to start working = you actually work.
11. **Test harness heartbeat.** Install Vitest in both `web` and `api`; write one
    trivial passing test in each and a root `npm test`. *Why:* same idea as the
    `/health` check — prove the testing setup works while there's nothing to test,
    so every later phase can just add tests. See `testing.md` for the full strategy.

## Common pitfalls
- **CORS confusion later:** frontend (e.g. `localhost:5173`) and backend
  (`localhost:3000`) are *different origins*. You'll configure CORS in Phase 1 —
  just know now that they're separate.
- **Committing secrets:** never commit a real `.env`. Add it to `.gitignore`;
  commit only `.env.example`.
- **Skipping the health check:** it feels pointless, but it's the cheapest possible
  test of your wiring. Don't skip it.

## How to know you're done
`npm run dev` starts the frontend and backend together, and the frontend page
shows a live "API OK" pulled from the backend. `npm test` runs and the heartbeat
tests pass. Nothing else — that's success.
