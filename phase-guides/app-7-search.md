# App Phase 7 — Search & Filtering

## What this phase is

Making everything findable: a global search bar for quick lookups, structured
filters (date, amount, status, and more) on your lists, sorting, and one-click
saved views like "Overdue" or "Open estimates".

## Why it matters

Once you have real data, scrolling doesn't scale. Search is what turns a pile of
records into a tool you can actually answer questions with — "show me overdue
invoices over $2,000, oldest first."

## Key concepts

- **Filtering vs full-text search:** _filtering_ narrows by exact fields (status =
  overdue, amount > 2000). _Full-text search_ finds words inside longer text (a job
  description, an address). You need both.
- **Postgres full-text search / trigram indexes:** database features that make
  searching _inside_ text fast. A **trigram** index breaks text into 3-character
  chunks so "partial word" and typo-tolerant matches are quick. Without an index,
  the DB scans every row (slow as data grows).
- **Index:** a precomputed lookup structure that makes certain queries fast. You add
  indexes on the columns you filter/search often (status, dates, amounts, plus the
  text fields).
- **Saved views:** predefined filter combinations exposed as one click. They're just
  filters with a name.
- **Pagination:** returning results in pages (e.g. 25 at a time) instead of
  thousands at once, so lists stay fast.

## Task by task

1. **Full-text / trigram indexes** on job-detail and address columns. _Why:_
   searching inside descriptions/addresses must stay fast as records pile up.
2. **Structured filter API.** Accept filters for dates, amount/balance ranges,
   status, type, client, staff, payment method; combine them. _Why:_ one flexible
   endpoint powers every list and saved view.
3. **Global search bar.** Free-text across client, document number, address, job
   detail. _Why:_ the fastest "just find it" path.
4. **Sorting.** Let lists sort by date, amount, status, etc. _Why:_ "oldest overdue
   first" is a real daily need.
5. **Saved quick views.** Overdue, Unpaid, This month's invoices, Open estimates.
   _Why:_ the questions you ask constantly should be one click.
6. **Pagination** on results. _Why:_ keeps responses fast and the UI snappy.

## Common pitfalls

- **No indexes:** search feels instant with 10 rows and crawls with 10,000. Add the
  indexes now, not "later."
- **Rebuilding filter logic per screen:** centralize it in one API so every list and
  saved view shares the same behavior.
- **Returning everything at once:** always paginate; unbounded queries eventually
  time out or freeze the UI.
- **SQL injection:** never build queries by string-concatenating user input. Use
  Prisma's parameterized queries / query builder.
- **Over-engineering:** you don't need Elasticsearch. Postgres full-text/trigram is
  plenty at your scale.

## How to know you're done

You can type a client name or address in the global bar and jump to it, apply
filters to get "overdue invoices over $2k, oldest first," and click a saved
"Overdue" view — all returning fast, paginated results.
