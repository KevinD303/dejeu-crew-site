# Booking log (local only)

During `npm run dev` / `npm run preview`:

- `POST /api/inquiry` — inquiry (no payment)
- `POST /api/deposit-intent` — deposit reservation intent (no Stripe charge)

Both append JSON lines to `inquiries.jsonl` with a `type` field (`inquiry` or `deposit_intent`).

This file is gitignored. Do not commit real client data.

For production: Formspree / Resend for inquiries; Stripe Checkout for deposits (no keys in this repo).
