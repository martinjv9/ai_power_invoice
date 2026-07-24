# App Phase 4 — AI Features

## What this phase is

Adding the "AI-powered" part: turn a plain-language job description into structured
line items, and clean up / professionalize wording. The AI _assists_; the human
always reviews before anything is saved.

## Why it matters

This is the feature that makes the app more than a fancy form. It's also your
introduction to calling a large language model (LLM) from a backend and turning its
output into reliable, structured data your app can use.

## Key concepts

- **LLM (large language model):** an AI (here, Claude) that takes text and produces
  text. You send a _prompt_; it returns a completion.
- **Anthropic SDK:** the official library for calling Claude from your backend. You
  authenticate with an API key (kept in env/secrets, never in the frontend).
- **Structured output / tool use:** instead of hoping the model returns tidy JSON,
  you define the exact shape you want (line items: description, qty, unit price) and
  the model fills it in. This makes the output reliable enough to use in code.
- **Model choice:** bigger models (Opus 4.8) are smarter but cost more; smaller ones
  (Haiku 4.5) are cheap and fast. Use the expensive one for hard drafting, the cheap
  one for quick cleanup.
- **Human-in-the-loop:** the AI proposes; the user edits and approves. You never
  auto-save AI output into a financial document.
- **Why call it from the backend:** your API key is a secret. If the frontend called
  Claude directly, anyone could steal the key from the browser.

## Task by task

1. **Integrate the Anthropic SDK (backend).** API key via env/secrets. _Why:_
   keeps the key server-side and centralizes AI logic in one service.
2. **`POST /ai/line-items`.** Take a description, return structured line items using
   tool/structured output. _Why:_ structured output means the result drops straight
   into the document builder, no fragile text parsing.
3. **`POST /ai/refine`.** Take text, return a cleaned-up version. _Why:_ fast, cheap
   polish for descriptions and notes.
4. **Model selection + error/timeout handling.** Opus for line items, Haiku for
   refine; handle slow or failed calls gracefully. _Why:_ network calls to an AI can
   be slow or error — the UI must not hang or crash.
5. **Frontend: generate-from-description flow.** User types a description → sees
   proposed line items → edits → accepts into the document. _Why:_ human-in-the-loop
   keeps the numbers trustworthy.
6. **Frontend: refine-wording action.** A button that rewrites a description in
   place, with the option to undo. _Why:_ low-risk assist the user stays in control
   of.

## Common pitfalls

- **Putting the API key in the frontend:** never. It's a secret; keep it on the
  backend.
- **Trusting AI output blindly:** always let the user review, and validate the
  structure (Zod) before saving — models can occasionally return odd values.
- **No loading/error states:** AI calls take seconds. Show a spinner and handle
  failures, or the app feels broken.
- **Ignoring cost:** every call costs money. Use Haiku for cheap tasks and don't
  call the AI on every keystroke — trigger it on an explicit action.
- **Over-promising pricing AI:** "suggest prices from past jobs" is deliberately
  Phase 2 — it needs historical data you won't have yet. Don't build it now.

## How to know you're done

You type a rough job description, the app returns sensible editable line items you
can accept into a document, and the "refine wording" button visibly improves a
description — both driven by backend calls with proper loading/error handling.
