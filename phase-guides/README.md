# Phase Guides

Deep-dive companions to `implementation-plan.md`, written for someone newer to
full-stack + cloud work. The plan tells you _what_ to check off; these guides
explain _what it means, how to do it, and why it's done that way_.

Each guide follows the same shape:

1. **What this phase is** — in plain English.
2. **Why it matters** — where it fits in the bigger picture.
3. **Key concepts** — jargon defined simply.
4. **Task by task** — the how _and_ the why behind each item in the plan.
5. **Common pitfalls** — mistakes beginners hit here.
6. **How to know you're done** — the concrete signal to move on.

## Order

Do them roughly in order; each builds on the last.

**App (build the product locally)**

- `app-0-foundation.md` — scaffolding a monorepo that runs end-to-end
- `app-1-auth.md` — logging in and staying logged in
- `app-2-clients-projects.md` — your first real data (CRUD)
- `app-3-documents.md` — estimates & invoices (the core)
- `app-4-ai.md` — AI-assisted line items and wording
- `app-5-pdf-email.md` — generating PDFs and sending them
- `app-6-payments-dashboard.md` — tracking money
- `app-7-search.md` — finding anything fast
- `app-8-hardening.md` — making it safe to run for real

**Infra (put it on AWS, as a learning path)**

- `infra-a-ec2-rds.md` — servers, managed databases, infrastructure-as-code
- `infra-b-containers.md` — Docker and image registries
- `infra-c-cicd.md` — automated build & deploy
- `infra-d-orchestration.md` — ECS/Fargate

**Cross-cutting**

- `testing.md` — testing strategy, the test pyramid, tooling, and what to test in
  each phase. Referenced throughout; testing is woven into every phase, not saved
  for the end.

## How to use them

Read the guide for a phase _before_ you start coding it. Keep the
`implementation-plan.md` open beside it to check off tasks. Don't skip the "Key
concepts" sections even if they look basic — they're the vocabulary the rest of
the phase assumes.
