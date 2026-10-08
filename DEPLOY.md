# Dejeu Crew — Go-live guide (dejeucrew.com)

_Last updated: Oct 7, 2026 (PT)_

Scope: **Dejeu Crew only.** This repo has nothing to do with Uplink / KevinD303/uplink / ms-a2.

---

## 1. Status at a glance

| Item | Status |
|------|--------|
| SEO pass (wedding photo + video, Modesto / Central Valley) | ✅ Done, `npm run build` passes |
| Box preview | ✅ `http://127.0.0.1:4173/` (box only) |
| Build tarball | ✅ `/workspace/dejeu-crew-dist.tgz` (contents of `dist/`) |
| Local git repo | ✅ `/workspace/dejeu-crew` on branch `main`, committed, **not pushed** |
| GitHub repo `KevinD303/dejeu-crew` | ⛔ **Not created** — no GitHub write access from the box (see §3) |
| GitHub Pages + custom domain | ⛔ Pending the repo |
| GoDaddy DNS | ⏳ Kevin — records in §4 |
| Inquiry form → email | ✅ Wired to FormSubmit; ⏳ needs one-time activation click (see §5) |

---

## 2. SEO changes

**Home (`index.html`)**
- `<title>`: _Modesto Wedding Photographer & Videographer | Dejeu Crew_ (56 chars).
- Meta description (≈158 chars): Modesto wedding photography + cinematic wedding videography, weddings and engagement sessions across the Central Valley.
- `robots` meta (`index, follow, max-image-preview:large`), canonical `https://dejeucrew.com/`, `theme-color #0A0A0A`.
- Open Graph + Twitter cards: wedding-focused title/description, `og:locale`, `og:image` (`/assets/og-image.jpg`, 1200×630) with width/height/alt.
- Icons: `favicon.ico` (16/32/48), `favicon.svg` (kept), `favicon-32.png`, `apple-touch-icon.png` (180), `icon-192/512.png`, `site.webmanifest` — all cut from the DC monogram.
- **Single H1**: the hero eyebrow is now the H1 — _"Wedding Photographer & Videographer · Modesto, CA"_ — styled exactly like the old eyebrow. The tagline _"Stories told in light & stillness"_ is now a `<p class="display hero__title">` with the same look/animation. Heading order is H1 → H2 (sections) → H3 (cards/FAQ); footer column labels are no longer `<h4>`.
- New visible copy (same tone/palette): hero lead, Services intro, a 3-up **offerings** row (Wedding Photography / Wedding Videography & Cinematography / Engagement Sessions), package card labels ("Wedding Videography", "Wedding Photography", "10hr Wedding Film" …), About copy (photographs **and films** weddings, based in Modesto), Contact "Based in Modesto, CA · Serving the Central Valley", footer tagline.
- New **FAQ section** (`#faq`, `<details>` accordion) — 7 questions built only from known facts: booking (inquiry → deposit; amount confirmed on reply), photo + video offered, photo count (min 200 on the 8-hr photo package), coverage hours (8/10; engagement 1 hr), engagement sessions ($500/1 hr), where based / travel (Modesto; Central Valley incl. Stockton, Turlock, Manteca, Merced, Sacramento area; other venues confirmed on inquiry), prices are starting rates. No turnaround times or travel fees invented. FAQ link added to mobile menu + footer (desktop navbar untouched).
- **JSON-LD** (`@graph`): `WebSite`; `ProfessionalService`/`LocalBusiness` (name, url, logo, images, phone, email, Modesto CA address w/o street, areaServed = Modesto/Stockton/Turlock/Manteca/Merced/Sacramento + Central Valley, `sameAs` Instagram, `priceRange $500–$3,000`, `knowsAbout`, contactPoint, `OfferCatalog` with 5 Offers → Service: Video 10 hr $3,000, Video 8 hr $2,500, Photo 8 hr min 200 photos $2,500, Photo 10 hr $3,000, Engagement 1 hr $500, all as starting prices); `FAQPage` mirroring the visible FAQ text word-for-word.
- Images: descriptive, wedding-context alt text on hero, all 9 gallery images, About photo, logos. All `<img>` have width/height (logo attrs fixed to their real 16:9 ratio). Gallery/About are `loading="lazy" decoding="async"`; hero is eager + `fetchpriority="high"` + `<link rel="preload" imagesrcset>`.
- **Responsive images**: new `public/gallery/w900/*.jpg` (900 px wide, progressive, q80, 55–290 KB) with `srcset`/`sizes`, so phones no longer download the 1800 px files (220 KB–1.25 MB). 1800 px originals are unchanged (already ~q85).
- Small visual fixes: nav monogram now uses a square crop (`logo-monogram-dc-square.png`) instead of squashing the 16:9 PNG; footer lockup no longer stretched (it was being stretched by flexbox).

**Book (`book.html`)**: title _Book Wedding Photography & Videography | Dejeu Crew, Modesto CA_, new description, OG/Twitter, icons, BreadcrumbList JSON-LD, keyword lead copy; public "Stripe not connected" wording replaced with "No payment is taken on this site — we'll reply with payment details."

**Site files**: `public/robots.txt` (allow all + sitemap), `public/sitemap.xml` (`/` with 9 image entries, `/book.html`), `public/CNAME` (`dejeucrew.com`), `.gitignore` (node_modules, dist, source-photos, *.zip, *.tgz, inquiry log, .env).

**Masters**: `source-photos/` is gitignored and is never in `dist/`. The Pages workflow also fails the build if a zip or `source-photos` path ever shows up in `dist/`.

---

## 3. Hosting — GitHub Pages (free)

### What's ready
- `.github/workflows/deploy.yml`: on push to `main` → `npm ci` → `npm run build` → guard → upload `dist/` → deploy to Pages.
- Vite `base` is `/` (correct for `dejeucrew.com`).
- Local repo committed on `main` in `/workspace/dejeu-crew`.

### Why it isn't live yet (blocker)
- `gh auth status` → **not logged in** on the box. No Netlify/Vercel/Wrangler CLIs or deploy tokens in the environment.
- The Cursor GitHub connector sees `KevinD303` but has **no create-repository, push, or Pages tools**; `KevinD303/dejeu-crew` doesn't exist / isn't visible.
- So the repo can't be created or pushed from here without Kevin logging in.

### Steps (≈5 min) — either Kevin, or the box after `gh auth login`
```bash
# on the box
gh auth login                      # GitHub.com → HTTPS → login with browser (KevinD303)
cd /workspace/dejeu-crew
gh repo create KevinD303/dejeu-crew --public --source . --remote origin --push
# enable Pages with GitHub Actions as the source
gh api -X POST repos/KevinD303/dejeu-crew/pages -f build_type=workflow
# set the custom domain
gh api -X PUT repos/KevinD303/dejeu-crew/pages -f cname=dejeucrew.com
# watch the deploy
gh run watch --repo KevinD303/dejeu-crew
```
Or in the browser: create public repo `dejeu-crew` (empty) → push → **Settings → Pages → Source: GitHub Actions** → **Custom domain: `dejeucrew.com`** → Save.

### Default Pages URL note
Before the custom domain is set, the site would be at `https://kevind303.github.io/dejeu-crew/`. Because the build uses base `/` (right for dejeucrew.com), CSS/images **will look broken at that sub-path URL** — that's expected. Once the custom domain is saved, `kevind303.github.io/dejeu-crew/` redirects to `https://dejeucrew.com/`. Don't change `base` to `/dejeu-crew/`.

Recommended: verify the domain under **GitHub → Settings (account) → Pages → Add a domain** (adds a TXT record) to prevent domain takeover.

---

## 4. GoDaddy DNS (dejeucrew.com → GitHub Pages)

Values verified against GitHub Docs ("Managing a custom domain for your GitHub Pages site"), Oct 7, 2026.

**Remove first**
- The default **parked** `A` record for `@` (GoDaddy "Parked" / `Websitebuilder` / any other IP).
- Any **Domain Forwarding** on dejeucrew.com (GoDaddy → Domain → Forwarding → delete).
- Any existing `CNAME` for `www` (often points to `@`).
- Leave **MX / TXT / NS** alone (email and verification).

**Add**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | 1 hour (default) |
| A | @ | 185.199.109.153 | 1 hour |
| A | @ | 185.199.110.153 | 1 hour |
| A | @ | 185.199.111.153 | 1 hour |
| CNAME | www | kevind303.github.io | 1 hour |

Optional IPv6 (recommended alongside the A records):

| Type | Name | Value |
|------|------|-------|
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |

- The `www` CNAME points to `kevind303.github.io` **without** the repo name. No wildcard (`*`) records.
- Set the custom domain in the repo's Pages settings **before / at the same time as** changing DNS.
- With apex `dejeucrew.com` as the custom domain, GitHub auto-redirects `www.dejeucrew.com` → `dejeucrew.com`.
- Propagation: minutes to 24 h. Check: `dig dejeucrew.com +noall +answer -t A` should list the four 185.199.x.153 IPs.

**HTTPS**: once DNS resolves, GitHub issues a Let's Encrypt cert automatically (can take up to 24 h). Then tick **Settings → Pages → Enforce HTTPS**.

---

## 5. Inquiry / booking form delivery

**Before**: the form POSTed to `/api/inquiry`, which only exists in the Vite dev/preview server (it appends to `data/inquiries.jsonl` on the box). On any static host that request fails, the script then silently saved to the visitor's browser `localStorage` and still showed "Your inquiry is saved" — **inquiries would have gone nowhere.**

**Now** (`src/main.js`):
- On the live site, submissions go to **FormSubmit** (`https://formsubmit.co/ajax/dejeu.crew@gmail.com`) as a formatted email: subject `Dejeu Crew — Inquiry|Deposit reservation request: <package> · <date>`, reply-to = the couple's email, table template, all fields (name, email, phone, package, starting price, date, location, message, suggested deposit for reservations).
- Honeypot field `_honey` drops bot submissions.
- **Fallback**: if FormSubmit errors or isn't activated yet, the visitor sees "One more step — Send it by email" and their email app opens a pre-filled `mailto:dejeu.crew@gmail.com` with everything filled in, plus links to the email and 209-681-6284. Nothing is lost silently.
- On `localhost` / `127.0.0.1` (box preview), it still uses the local logger only — nothing is emailed from the box.
- Tested with mocked FormSubmit responses (success → "Thank you"; not-activated → mailto fallback). No real submission was sent.

**⚠️ One-time activation (Kevin / Dejeu Crew)**: after the site is live, submit one test inquiry on https://dejeucrew.com/book.html. FormSubmit emails **dejeu.crew@gmail.com** an "Activate Form" message (check Spam/Promotions) — click **Activate Form**. Until then, visitors get the mailto fallback.
Optional hardening afterwards: FormSubmit's activation email includes a random alias string; replacing the email in `FORMSUBMIT_AJAX` in `src/main.js` with that alias hides the address from scrapers.

Deposits: no online payment. Reservation requests arrive as emails flagged "Deposit reservation request" with the suggested 25% amount; payment is arranged on reply (Stripe can be added later).

---

## 6. Pending on Kevin

1. **GitHub**: run `gh auth login` on the box (or create the empty public repo `KevinD303/dejeu-crew` yourself) so the repo can be pushed and Pages turned on (§3).
2. **GoDaddy DNS**: remove parked A record + forwarding; add the 4 A records + `www` CNAME (§4).
3. **HTTPS**: tick "Enforce HTTPS" in Pages settings once available.
4. **FormSubmit**: send one test inquiry on the live site and click "Activate Form" in dejeu.crew@gmail.com (§5).
5. Optional: verify the domain in GitHub Pages settings; add the site to Google Search Console (`https://dejeucrew.com/`, submit `sitemap.xml`) and set up a Google Business Profile for Modesto (big local-SEO win; needs her account).
6. Still waiting on the 3 extra Google Photos (need a `photos.app.goo.gl` share link or downloaded files).

## 7. Local commands
```bash
cd /workspace/dejeu-crew
npm install && npm run build
npx vite preview --host 127.0.0.1 --port 4173   # box preview
tar czf /workspace/dejeu-crew-dist.tgz -C dist .
```
