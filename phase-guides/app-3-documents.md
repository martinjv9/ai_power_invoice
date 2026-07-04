# App Phase 3 — Estimates & Invoices

## What this phase is
The heart of the product: building documents (estimates and invoices) made of line
items, with correct numbering, tax, and totals — and turning an approved estimate
into an invoice.

## Why it matters
Everything else (AI, PDF, email, payments) revolves around these documents. It's
also the phase with the most *business rules*, so it's where careful thinking pays
off. Get the data model and the money math right here and the rest is smooth.

## Key concepts
- **One model for two things:** estimates and invoices are almost identical, so we
  use a single `Document` table with a `type` field (`estimate` | `invoice`). Less
  duplicated code, and conversion becomes easy.
- **Line item:** one row on the document (description, quantity, unit price, line
  total). Stored as *structured rows*, not a blob of text, so we can search them and
  later feed them to the pricing AI.
- **Sequential numbering:** invoices need human-friendly, gap-free numbers
  (INV-1001, INV-1002…). This is surprisingly tricky under concurrency (two
  invoices created at once must not get the same number).
- **Status / state machine:** a document moves through allowed states (draft → sent
  → approved/paid…). Encoding the *allowed* transitions prevents nonsense like a
  paid invoice going back to draft.
- **Derived vs stored values:** the line total is derived from qty × unit price.
  Decide what you compute on the fly vs store — generally compute money at save time
  and store it, so a historical invoice never changes if prices change later.

## Task by task
1. **`Document` model + migration.** type, status, links to client + project,
   subtotal, tax, total, dates (issue/due/sent/paid), `created_by`. *Why:* captures
   a full document; storing totals freezes history.
2. **`LineItem` model + migration.** Linked to a document; description, qty, unit
   price, line total. *Why:* structured rows power search and future AI pricing.
3. **Sequential numbering logic.** Generate the next number safely (e.g. a dedicated
   counter row or DB sequence, handled in a transaction). *Why:* avoids duplicate or
   skipped invoice numbers, which cause real accounting problems.
4. **Tax + totals calculation.** subtotal = sum of line totals; tax = subtotal ×
   rate; total = subtotal + tax. Compute on the server. *Why:* never trust the
   browser with money math; the server is the source of truth.
5. **Document CRUD API.** Create an estimate/invoice, add/edit/remove line items,
   recompute totals on change. *Why:* the builder UI drives all of this.
6. **Status transition logic.** Enforce allowed moves; reject invalid ones. *Why:*
   protects data integrity (see state machine above).
7. **Estimate → invoice conversion.** Copy an approved estimate into a new invoice
   with a real invoice number. *Why:* matches how the business actually works —
   quote first, bill after approval.
8. **Document builder UI.** Add/edit line items with live-updating totals. *Why:*
   this is the screen you'll use most; make it pleasant.
9. **List + detail views + "convert" action.** *Why:* find, open, and act on
   documents.

## Common pitfalls
- **Doing money math in JavaScript floats:** `0.1 + 0.2 !== 0.3`. Use integer cents
  or a decimal library, and store money as a decimal type in Postgres — never a
  float.
- **Race conditions in numbering:** generating "max number + 1" with a plain read
  then write can hand two invoices the same number. Use a transaction or DB sequence.
- **Not freezing totals:** if you always recompute from current prices, old invoices
  silently change. Store the numbers at creation time.
- **Letting any status go to any status:** enforce transitions or you'll get
  impossible states.

## How to know you're done
You can create an estimate, add several line items and watch totals update, set it
to approved, and convert it into an invoice that gets its own sequential number —
with tax and totals correct and unchanged afterward.
