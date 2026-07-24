# App Phase 8 — Hardening (Pre-Deploy)

## What this phase is

The pass you make before trusting the app with real client and financial data:
double-checking security, validation, and error handling, adding a bit of test
coverage on the riskiest logic, and preparing how secrets are handled in production.

## Why it matters

Everything so far optimized for "does it work?" This phase asks "is it safe and
trustworthy?" It's the difference between a demo and something you'd actually run
your business on. Skipping it is how small apps leak data or corrupt money.

## Key concepts

- **Defense in depth:** don't rely on a single safeguard. The frontend validates
  _and_ the backend validates; the UI hides admin actions _and_ the API enforces
  auth. Layers cover each other's gaps.
- **Least privilege:** every part of the system gets only the access it needs —
  applies to database users, API routes, and (later) AWS IAM roles.
- **Rate limiting:** capping how often an action can be tried (e.g. login attempts)
  to blunt brute-force guessing.
- **Security headers:** HTTP response headers (via a library like `helmet`) that
  tell browsers to behave more safely.
- **Secrets management:** production API keys and DB passwords live in a secure store
  (env vars from AWS Secrets Manager/SSM), never in code or committed files.
- **Test coverage on critical paths:** you don't need to test everything — you need
  tests on the parts that _hurt_ if wrong (money math, invoice numbering, auth).

## Task by task

1. **Audit every route for auth + validation.** Confirm no endpoint is accidentally
   public and every input is validated. _Why:_ one unguarded route can expose
   everything.
2. **Rate-limit login + add security headers.** _Why:_ slows password guessing and
   closes common browser-side attack vectors cheaply.
3. **Verify `created_by` everywhere.** Ensure documents/projects record who made
   them. _Why:_ accountability across your few staff.
4. **Seed/demo data + critical-path tests.** A script to populate a fresh DB, plus
   tests for numbering, totals, and auth. _Why:_ fast confidence that the scary parts
   still work after changes.
5. **Production secrets strategy.** Document how prod gets its secrets (Secrets
   Manager/SSM), separate from your local `.env`. _Why:_ the deploy phases will need
   this, and secrets must never be committed.

## Common pitfalls

- **Assuming the frontend protects you:** anyone can call your API directly with
  `curl`. The backend must enforce every rule itself.
- **Leaving debug endpoints or verbose errors on in production:** they leak
  internals. Return generic errors to clients; log details server-side.
- **Testing everything or nothing:** aim for the middle — cover money, numbering,
  and auth well; don't chase 100%.
- **Committing a real `.env`:** check your git history; rotate any secret that ever
  got committed.
- **Treating hardening as one-and-done:** re-audit when you add features later.

## How to know you're done

A fresh clone + seed script yields a working app where every route requires auth and
validates input, login is rate-limited, critical-path tests pass, and you have a
written, code-free plan for supplying secrets in production.
