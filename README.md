# Dejeu Crew — Wedding & Luxury Photography

Minimal, elegant site for **Dejeu Crew** ([dejeucrew.com](https://dejeucrew.com)): gold / brown / black / white brand, home + book flow (inquiry **and** deposit intent).

**Stack:** Vite · vanilla HTML/CSS/JS · no framework  
**Deploy target:** GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`) → custom domain `dejeucrew.com`. See **DEPLOY.md** for SEO notes, DNS records, form delivery, and what's pending.  
**Do not** touch GoDaddy, Uplink, or KevinD303/uplink from this project.

---

## Quick start

```bash
cd /workspace/dejeu-crew
npm install
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Preview: `http://127.0.0.1:4173/`

| Script            | Purpose                                                       |
|-------------------|---------------------------------------------------------------|
| `npm run dev`     | Local preview + `/api/inquiry` + `/api/deposit-intent` logger |
| `npm run build`   | Production build → `dist/`                                    |
| `npm run preview` | Serve `dist/` locally (API plugin still on)                   |

---

## Site map

| Path          | Content                                                               |
|---------------|-----------------------------------------------------------------------|
| `/`           | Home — photo hero, Work (9 weddings), Packages, About, Contact, CTA   |
| `/book.html`  | Package picker + preferred date · Inquiry **or** Reserve with deposit |

Sparse nav: **Work · Packages · About · Book**.

---

## Brand

| Token       | Value     | Use                                      |
|-------------|-----------|------------------------------------------|
| Black       | `#0A0A0A` | Page background, dark UI                 |
| White       | `#FFFEFA` | Soft highlights, package titles          |
| Bone        | `#F4F0E8` | Body text, About section bg              |
| Soft gold   | `#C4A574` | Accents, CTAs, hairlines                 |
| Brown       | `#5C4033` | Warm accents                             |
| Brown deep  | `#3D2B1F` | Contact band, package card washes        |

**Type:** Cormorant Garamond (headings) · Manrope (UI)  
**Logos:** `public/assets/` — lockup v2 PNG (header/footer), monogram DC clear, SVGs, favicon. See `DESIGN_NOTES.md`.

**Focus:** Mostly weddings (current gallery is all wedding selects).

---

## Photographs (permanent paths)

| Role | Path |
|------|------|
| Gallery (web) | `public/gallery/*.jpg` → served as `/gallery/` |
| Masters | `source-photos/from-zip/Ai website/` (+ `source-photos/Ai-website-1-001.zip`) |
| Hero | `/gallery/EG0A0531.jpg` (Garden Lift) |
| About | `/gallery/EG0A6899.jpg` (Orchard Portrait) |
| Open Graph | `public/assets/og-image.jpg` (1200×630 from EG0A6880) |

Nine wedding selects currently wire the Work grid. Filters: **All** / **Weddings**. More categories can return when non-wedding work lands.

Manifest: `public/gallery/MANIFEST.txt`.

---

## Packages (from rate card)

| Package                         | Starting at | Duration |
|---------------------------------|-------------|----------|
| Video — 10hr Wedding            | $3,000      | 10 hr    |
| Video — 8hr Wedding             | $2,500      | 8 hr     |
| Photo — Minimum 200 pictures    | $2,500      | 8 hr     |
| Photo — 10hr Wedding            | $3,000      | 10 hr    |
| Engagement Session              | $500        | 1 hr     |

Prices shown as “starting at” on the site.

---

## Book flow

1. Select one of the 5 packages (+ preferred date).
2. **Path A — Inquiry:** no payment → `POST /api/inquiry` → success.
3. **Path B — Reserve with deposit:** suggested deposit = 25% of starting price → `POST /api/deposit-intent` with `type: deposit_intent` → success.  
   Stripe Checkout is **not** wired (no keys). UI states that a payment link will follow once Stripe is connected.

Dev/preview middleware appends both to `data/inquiries.jsonl`. On pure static hosts, the client falls back to `localStorage`.

**Contact:** `dejeu.crew@gmail.com` · `209-681-6284` · Instagram [@dejeu.crew](https://instagram.com/dejeu.crew)

---

## Launch checklist (Kevin — blocked on you)

- [ ] **Domain DNS** — In GoDaddy, point **dejeucrew.com** (and `www`) at your host:
  - **Vercel:** add domain in project → DNS → either Vercel nameservers **or** A/`76.76.21.21` + CNAME `www` → `cname.vercel-dns.com`
  - **Netlify:** add domain → A/`75.2.60.5` (or Netlify’s current IP) + CNAME `www` → `<site>.netlify.app`
  - Do **not** mix this with Uplink / ms-a2 hosting.
- [ ] **Deploy this repo** — connect `/workspace/dejeu-crew` (or its Git remote) to Vercel/Netlify as a **separate** project; build command `npm run build`, output `dist`.
- [ ] **Form delivery** — Formspree endpoint or Resend API + serverless (no secrets in this repo).
- [ ] **Stripe** — create Checkout for deposit path; replace deposit-intent stub with a real session; put keys in host env only.
- [ ] **More photos** — drop additional web-sized JPGs into `public/gallery/`, update Work grid (and filters if non-wedding).
- [ ] **Legal** — privacy / terms if collecting inquiries at scale.
- [ ] **Analytics** (optional) — Plausible / GA only if desired.

Site preview is ready for domain wiring; do **not** open Uplink PRs for this.

---

## Key files

```
dejeu-crew/
├── index.html              # Home
├── book.html               # Inquire / Reserve
├── src/
│   ├── main.js             # Nav, filters, book flow, reveal
│   └── style.css           # Brand system
├── public/
│   ├── assets/             # Lockup, logos, favicon, og-image.jpg
│   └── gallery/            # 9 web-sized wedding JPGs + MANIFEST.txt
├── source-photos/          # Masters + zip (not shipped in dist)
├── data/                   # Local inquiry / deposit-intent log (gitignored)
├── vite.config.js          # Multi-page build + booking middleware
├── DESIGN_NOTES.md
└── README.md
```

---

## Notes

- Mobile-first, accessible focus rings, `prefers-reduced-motion` respected.
- No secrets in repo. No real Stripe keys. No GoDaddy / Uplink actions from this workspace.
- SEO: title, description, canonical, theme-color, Open Graph + Twitter card on both pages for dejeucrew.com.
