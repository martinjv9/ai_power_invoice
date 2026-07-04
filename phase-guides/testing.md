# Testing Strategy

A cross-cutting guide referenced by every phase. The implementation plan puts a
small testing task in each phase; this explains *how* to think about testing, what
to write, and which tools to use. Read it once, then refer back per phase.

## Why we test (the payoff)
- **Confidence to change code without fear.** You build across ~12 phases; tests
  re-check the old code every time you touch something, so adding payments doesn't
  silently break invoice numbering.
- **Bugs caught cheap, at your desk** — seconds to notice a failing test vs. a wrong
  invoice already emailed to a client.
- **Protects the scary code** — money math, tax, invoice numbering, auth, DTO
  mappers (so secrets never leak). A silent bug here has real consequences.
- **Living documentation** — a test spells out "given this input, expect this
  output."
- **Makes CI/CD safe** — the pipeline runs the tests and refuses to deploy if any
  fail (see `infra-c-cicd.md`).

## The test pyramid (what to write, how much)
Lots of small fast tests at the bottom, few slow ones at the top.

- **Unit tests** *(most, fastest)* — pure logic in isolation: tax/totals, invoice
  numbering, status-transition rules, DTO mappers, aging buckets. **Best value per
  effort — start here.**
- **Integration tests** *(high value here)* — an API route hitting a test database:
  "create client returns the right DTO," "auth middleware rejects a logged-out
  request," "recording a payment updates the balance." Most real CRUD bugs live here.
- **Component tests** *(some)* — React forms validate, lists render.
- **E2E tests** *(few)* — a real browser doing a full journey (log in → build invoice
  → send). Powerful but slow; reserve for a couple of critical happy paths.

**Don't chase 100% coverage.** Cover money, numbering, auth, and mappers well; skip
trivial glue code. Coverage is a tool, not a goal.

## Tooling (fits this stack)
- **Vitest** — test runner; pairs naturally with Vite + TypeScript. One tool for
  both `web` and `api`.
- **Supertest** — fire fake HTTP requests at the Express API in integration tests.
- **React Testing Library** — component tests (test behavior users see, not
  internals).
- **Playwright** — E2E browser tests, added late (Phase 8).

## How testing maps to each phase
- **Phase 0** — set up Vitest + a heartbeat test in each package (proves the harness).
- **Phase 1** — auth middleware rejects logged-out requests; login/session happy path.
- **Phase 2** — client/project CRUD; DTO mapper leaks no internal fields.
- **Phase 3** — numbering (no dupes/races), tax + totals math, status transitions.
- **Phase 4** — AI output validates against the Zod schema; **mock the AI call**.
- **Phase 5** — PDF totals match the document; send marks status (email mocked).
- **Phase 6** — payment updates balance + status; overdue + aging-bucket logic.
- **Phase 7** — filter API returns correct results; pagination.
- **Phase 8** — coverage audit (fill gaps) + a few Playwright E2E smoke tests.

## Key habits
- **Mock external services** (the AI API, the email provider) in tests — don't make
  real network calls. They're slow, cost money, and make tests flaky. Test *your*
  code, not theirs.
- **Use a separate test database** for integration tests; reset it between runs so
  tests don't depend on each other's data.
- **Test behavior, not implementation** — assert on outputs and effects, not private
  internals, so refactors don't break your tests.
- **A failing test is information, not an annoyance** — it just caught something
  before a client did.

## Common pitfalls
- **Testing everything or nothing** — aim for the middle; cover the risky parts well.
- **Live API calls in tests** — always mock the AI and email providers.
- **Shared state between tests** — reset the DB and mocks so order doesn't matter.
- **Deferring all tests to the end** — they never get written. Write them in each
  phase's slice, while the feature is fresh.
- **Floaty money assertions** — test money as decimals/integer cents, matching how
  it's stored (see the documents/payments guides).
