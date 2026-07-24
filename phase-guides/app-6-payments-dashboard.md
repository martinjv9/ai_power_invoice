# App Phase 6 — Payments & Dashboard

## What this phase is

Recording payments against invoices (full or partial), automatically figuring out
what's still owed and what's overdue, and building the dashboard that answers your
daily question: "who owes me what?"

## Why it matters

This is the feature that came straight from your problem statement — tracking who's
paid, who hasn't, and what's overdue. Without it, the app is just a document maker.
With it, it's a tool you open every morning.

## Key concepts

- **Manual payment tracking:** you record payments by hand (no card processor). A
  payment is: how much, when, method (check/card/cash), and against which invoice.
- **Partial payment:** a client pays part of an invoice. The invoice isn't "paid"
  until the sum of its payments equals its total.
- **Derived balance:** outstanding = invoice total − sum of its payments. You
  compute this rather than storing a "balance" that could drift out of sync.
- **Overdue:** an unpaid (or partially paid) invoice whose due date has passed.
  Computed from the due date + today, so it's always current without a manual flag.
- **Aging buckets:** grouping overdue amounts by how late they are (0–30, 31–60,
  60+ days). This is the standard "accounts receivable" view accountants use.
- **Dashboard:** a summary screen of the numbers that matter, so you don't have to
  go digging.

## Task by task

1. **`Payment` model + migration.** amount, date, method, note, link to invoice.
   _Why:_ one row per payment supports partials and a full payment history.
2. **Payment API.** Record a payment against an invoice. _Why:_ the UI needs to log
   money as it comes in.
3. **Derived balance + auto status.** Recompute outstanding on each payment; flip
   the invoice to `partial` or `paid` automatically. _Why:_ status should reflect
   reality without manual bookkeeping.
4. **Overdue computation.** Mark unpaid invoices past their due date as overdue
   (computed, not manually set). _Why:_ accuracy and zero maintenance.
5. **Dashboard.** Total outstanding, list of overdue invoices, recent activity.
   _Why:_ the at-a-glance answer to "where's my money?"
6. **Aging buckets view.** 0–30 / 31–60 / 60+ days. _Why:_ tells you which debts to
   chase first.

## Common pitfalls

- **Storing a balance field and updating it by hand:** it _will_ drift out of sync.
  Derive it from payments instead.
- **Float math again:** money as decimals/integer cents, never floats (same rule as
  Phase 3).
- **Overpayment/edge cases:** decide what happens if a payment exceeds the balance,
  or is recorded twice — handle it explicitly rather than letting it corrupt totals.
- **"Overdue" as a stored flag:** compute it from the due date so it's never stale.
- **Timezones on due dates:** be consistent (store dates clearly) so "overdue" flips
  on the right day.

## How to know you're done

You record a partial payment on an invoice; its outstanding balance drops, its
status becomes `partial`, and the dashboard's outstanding total and overdue list
update to match. An unpaid invoice past its due date shows as overdue in the right
aging bucket.
