# App Phase 5 — PDF & Email

## What this phase is
Turning a document into a professional PDF (with your branding, the client's "Bill
To", and the "Job Site"), then emailing that PDF to the client and recording that
it was sent.

## Why it matters
This closes the loop on the original pain point: no more manually formatting and
converting documents before sending. It's also your first taste of generating files
and integrating a third-party sending service.

## Key concepts
- **Server-side generation:** the PDF is built on the backend, not the browser.
  *Why:* consistent output, access to all the data, and the source file never
  depends on the user's device.
- **PDF library options:** `@react-pdf/renderer` lets you describe the PDF with
  React-like components; *headless Chromium* (e.g. Puppeteer) renders an HTML
  template to PDF. Either works; pick one and template it.
- **Transactional email:** automated one-to-one email (like "here's your invoice"),
  as opposed to marketing blasts. Providers: **Resend** or **Postmark**.
- **Deliverability:** whether your email actually lands (vs spam). Providers handle
  the hard parts, but you'll verify your sending domain (SPF/DKIM records) so
  mailboxes trust you.
- **Why not AWS SES yet:** SES starts "sandboxed" (can only email verified
  addresses) and needs approval to send to real clients. We keep email on
  Resend/Postmark to avoid that friction (see `tech-stack.md`).
- **Idempotency / status:** sending marks the document `sent` with a timestamp so
  you don't accidentally re-send or lose track.

## Task by task
1. **PDF template.** Header with your logo/business info, Bill To (client) + Job
   Site (project), line-item table, subtotal/tax/total, terms. *Why:* this is what
   the client sees — it represents your business.
2. **Branding config.** Store logo, business details, and default terms in config.
   *Why:* one place to update your letterhead; used by every document.
3. **Preview + download endpoint.** Generate the PDF on demand and return it. *Why:*
   you (and later the UI) can review before sending; regenerating on demand avoids
   storing files (see the open question in the scope doc).
4. **Email provider integration.** Wire up Resend/Postmark with an API key in
   env/secrets. *Why:* reliable sending + deliverability handled for you.
5. **"Send to client" action.** Attach/link the PDF, send it, and record `sent`
   status + sent date. *Why:* one click replaces the whole manual export-and-email
   dance.
6. **Frontend: preview, send, sent-state.** Show the PDF, a send button, and a clear
   "sent on <date>" indicator. *Why:* the user needs confidence it went out.

## Common pitfalls
- **Money/layout differences between screen and PDF:** the PDF is the legal record —
  double-check totals and formatting match the document exactly.
- **Sending from an unverified domain:** emails land in spam. Verify your domain
  (SPF/DKIM) in the provider before real sends.
- **Hardcoding branding in the template:** put it in config so you're not editing
  code to change a phone number.
- **No test send path:** always send to yourself first; never test on a real client.
- **Storing every generated PDF unnecessarily:** regenerating on demand is simpler
  and avoids storage/versioning headaches unless you specifically need archives.

## How to know you're done
You open a document, preview a correctly-formatted branded PDF showing Bill To and
Job Site, click send, receive it in your own inbox as a test, and the document shows
"sent on <date>".
