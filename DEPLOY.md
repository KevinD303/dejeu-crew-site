# Dejeu Crew — Go-live guide (dejeucrew.com)

_Last updated: Oct 7, 2026 (PT)_

Scope: **Dejeu Crew only.** This repo has nothing to do with Uplink / KevinD303/uplink / ms-a2.

---

## 1. Status at a glance

| Item | Status |
|------|--------|
| SEO pass (wedding photo + video, California Valley / Bay Area / Sacramento) | ✅ Done, `npm run build` passes |
| Box preview | ✅ `http://127.0.0.1:4173/` (box only) |
| Build tarball | ✅ `/workspace/dejeu-crew-dist.tgz` (contents of `dist/`) |
| Git repo | ✅ **https://github.com/KevinD303/dejeu-crew-site** (public), `main` pushed from `/workspace/dejeu-crew` |
| GitHub Pages | ✅ Enabled (source: GitHub Actions), custom domain `dejeucrew.com` set; first deploy run succeeded Oct 7, 2026 10:14 PM PT |
| GoDaddy DNS | ⏳ **Kevin** — still parked (A → 3.33.130.190 / 15.197.148.33). Site is not reachable until the §4 records are in. |
| Inquiry form → email | ✅ Wired to FormSubmit; ⏳ needs one-time activation click (see §5) |
| Work gallery | ✅ 38 photos (9 original + 29 added Oct 7), "View more" reveal, Weddings/Engagements filters (§2b) |
| Films section | ✅ 3 films from full-quality originals: church wedding highlight, forest/lakeside couple's film, on-the-water engagement film (§2c) |

---

## 2. SEO changes

**Home (`index.html`)**
- `<title>`: _Wedding Photographer & Videographer | California Valley & Bay Area_ (66 chars; Sacramento is in the description — adding it or the brand would push past ~65).
- Meta description: Dejeu Crew — wedding photographer & cinematic wedding videographer serving the California Valley, Bay Area & Sacramento region.
- `robots` meta (`index, follow, max-image-preview:large`), canonical `https://dejeucrew.com/`, `theme-color #0A0A0A`.
- Open Graph + Twitter cards: wedding-focused title/description, `og:locale`, `og:image` (`/assets/og-image.jpg`, 1200×630) with width/height/alt.
- Icons: `favicon.ico` (16/32/48), `favicon.svg` (kept), `favicon-32.png`, `apple-touch-icon.png` (180), `icon-192/512.png`, `site.webmanifest` — all cut from the DC monogram.
- **Single H1**: the hero eyebrow is now the H1 — _"Wedding Photographer & Videographer · California Valley, Bay Area & Sacramento"_ — styled exactly like the old eyebrow. The tagline _"Stories told in light & stillness"_ is now a `<p class="display hero__title">` with the same look/animation. Heading order is H1 → H2 (sections) → H3 (cards/FAQ); footer column labels are no longer `<h4>`.
- New visible copy (same tone/palette): hero lead, Services intro, a 3-up **offerings** row (Wedding Photography / Wedding Videography & Cinematography / Engagement Sessions), package card labels ("Wedding Videography", "Wedding Photography", "10hr Wedding Film" …), About copy (photographs **and films** weddings, based in California’s Central Valley), Contact "Serving: California Valley · Bay Area · Sacramento Region", footer tagline.
- New **FAQ section** (`#faq`, `<details>` accordion) — 7 questions built only from known facts: booking (inquiry → deposit; amount confirmed on reply), photo + video offered, photo count (min 200 on the 8-hr photo package), coverage hours (8/10; engagement 1 hr), engagement sessions ($500/1 hr), where based / travel (California’s Central Valley; California Valley, Bay Area & Sacramento region incl. Stockton, Turlock, Manteca, Merced, San Francisco, Sacramento; other venues confirmed on inquiry), prices are starting rates. No turnaround times or travel fees invented. FAQ link added to mobile menu + footer (desktop navbar untouched).
- **JSON-LD** (`@graph`): `WebSite`; `ProfessionalService`/`LocalBusiness` (name, url, logo, images, phone, email, address = addressRegion CA + country US only (no locality), areaServed = see §2a, `sameAs` Instagram, `priceRange $500–$3,000`, `knowsAbout`, contactPoint, `OfferCatalog` with 5 Offers → Service: Video 10 hr $3,000, Video 8 hr $2,500, Photo 8 hr min 200 photos $2,500, Photo 10 hr $3,000, Engagement 1 hr $500, all as starting prices); `FAQPage` mirroring the visible FAQ text word-for-word.
- Images: descriptive, wedding-context alt text on hero, all 9 gallery images, About photo, logos. All `<img>` have width/height (logo attrs fixed to their real 16:9 ratio). Gallery/About are `loading="lazy" decoding="async"`; hero is eager + `fetchpriority="high"` + `<link rel="preload" imagesrcset>`.
- **Responsive images**: new `public/gallery/w900/*.jpg` (900 px wide, progressive, q80, 55–290 KB) with `srcset`/`sizes`, so phones no longer download the 1800 px files (220 KB–1.25 MB). 1800 px originals are unchanged (already ~q85).
- Small visual fixes: nav monogram now uses a square crop (`logo-monogram-dc-square.png`) instead of squashing the 16:9 PNG; footer lockup no longer stretched (it was being stretched by flexbox).

## 2a. Service-area wording (Kevin, Oct 7, 2026)

Service area everywhere is **"California Valley, Bay Area & Sacramento Region"**: home + book meta descriptions and OG/Twitter descriptions, hero lead, Services intro, About ("California Valley wedding photographer"), FAQ travel answer (visible + JSON-LD, kept identical), Contact, and both footers. Titles: see below. JSON-LD `areaServed` (the only place "Modesto" remains, as one city among many): Modesto, Stockton, Turlock, Manteca, Merced, Tracy, San Francisco, Oakland, San Jose, Sacramento, Elk Grove, Roseville, Folsom, Davis + regions "California Central Valley", "San Francisco Bay Area, California", "Sacramento Region, California" (also on each package Offer).

**Modesto removed as branding/base (Oct 7, 2026, per Kevin):** "Modesto" no longer appears in any title, meta/OG/Twitter tag, visible copy, alt text, film description or sitemap. Base is phrased as "California’s Central Valley"; hero H1 is _Wedding Photographer & Videographer · California Valley, Bay Area & Sacramento_; About stat **California** / Valley · Bay Area · Sacramento; contact "Serving: California Valley · Bay Area · Sacramento Region"; copyright "Dejeu Crew · California Valley · Bay Area · Sacramento · dejeucrew.com". JSON-LD `address` has no `addressLocality` (CA, US only). The only remaining "Modesto" is the `Modesto, CA` City entry in `areaServed`.

**Navbar (Oct 7, 2026):** removed the duplicate plain "Book" link from the desktop `.nav__links` on both pages — the gold `.nav__cta` "Book" button is the single desktop Book link (carries `aria-current="page"` on book.html); the mobile menu keeps its single "Book" entry.

## 2b. Gallery update — Oct 7, 2026 (29 new photos)

- Source: 36 masters in `source-photos/wedding-temp-2026-10-07/` (private; gitignored; never in `dist/`).
- **Added 29** → `public/gallery/<name>.jpg` (1800 px wide, progressive q82, EXIF/GPS stripped, ICC kept) + `public/gallery/w900/<name>.jpg` (900 px, q80) with `srcset`/`sizes`, width/height, `loading="lazy"`, `decoding="async"`, descriptive alt text. Grid order is in `public/gallery/MANIFEST.txt`.
- **Excluded 7** (burst near-duplicates; all were sharp/well exposed): EG0A2141 (≈ EG0A2385 veil-on-staircase), EG0A2436 (≈ EG0A2427/2411 rotunda stairs, less symmetrical), EG0A4691 (bride-solo seated, covered by EG0A4699; kept EG0A4684 from that pair), EG0A4698 (burst of EG0A4699 — 4699 has the better face/light), EG0A4712 + EG0A4715 (same moment as EG0A4716, which has the hand-hold interaction), EG0A9681 (wide proposal set-up, subjects tiny; EG0A9787/9714 show it better).
- None duplicated the original 9 (different shoots).
- Proposal/engagement shots (EG0A9714, 9787, 0566, 9857, 0227) are tagged **Engagements** (not Weddings) with a new "Engagements" filter — they're a beach proposal, so labelling them weddings would be inaccurate.
- Grid: 3-col layout, wide/tall tiles arranged so rows fill with no holes (`grid-auto-flow: dense`; tall tiles now fill both rows). First 12 shown; the other 26 sit behind a **"View more work (26)"** ghost button. All 38 are always in the HTML (crawlable); JS only collapses them, and without JS everything shows. Selecting a filter shows all matches.
- Sitemap now lists all 38 gallery images.
- Hero/About/logos/navbar unchanged.

## 2c. Films (wedding videography showcase)

- `#films` section between Work and Packages: "Cinematic wedding videography" — three films: 3-up on wide desktop (≥1100 px), 2 + 1 centered on tablets/small laptops (700–1099 px), stacked on mobile; footer has a "Films" link.
- All encoded from Kevin's full-quality originals (the third is a 1280×720 29.97 fps master) (1920×1080, 59.94 fps, ~38 Mbps; masters stay private in `source-photos/`, never in git or `dist/`):

| Film | Master | 1080p | 720p | Poster |
|------|--------|-------|------|--------|
| Church Wedding — Highlight Film (26 s) | EG0A4085_2.mp4 | 11.1 MB (CRF 26) | 7.6 MB (CRF 24) | 1.3 s — couple embracing on the church steps, bride smiling to camera |
| Forest & Lakeside — Couple's Film (27 s) | EG0A5361.mp4 | 10.2 MB (CRF 25) | 6.1 MB (CRF 24) | 11.3 s — bride smiling over the groom's shoulder, bouquet, lake + golden light |
| On the Water — Engagement Film (40 s) | EG0A1105.mp4 (720p source) | — (not upscaled) | 9.3 MB (CRF 26) | 35.6 s — couple embracing at the boat rail, both smiling, water + hills behind |

  Files: `public/films/dejeu-crew-church-wedding-film-{1080,720}.mp4` + `-poster.jpg`, `public/films/dejeu-crew-forest-lakeside-film-{1080,720}.mp4` + `-poster.jpg`, `public/films/dejeu-crew-on-the-water-film-720.mp4` + `-poster.jpg` (single 720p `<source>`).
- Encoding: H.264 high, 29.97 fps, AAC 128k stereo, `+faststart`. `<video controls playsinline preload="none" poster=…>`; screens ≤900 px get the 720p `<source media>`, others 1080p. Nothing downloads until play is pressed.
- SEO: three `VideoObject`s in the home JSON-LD (PT26S / PT27S / PT40S, uploadDate 2026-10-07, contentUrl = largest file, thumbnail = poster) and three `<video:video>` entries in `sitemap.xml`.
- Re-encode / replace: `scripts/encode-film.sh <master> <slug> <poster-seconds> [crf1080] [crf720]` keeps the same file names; sources under 1080p get 720p only (no upscaling). Update durations in JSON-LD + sitemap if a film's length changes.

**Book (`book.html`)**: title _Book Wedding Photography & Videography | Dejeu Crew_, new description, OG/Twitter, icons, BreadcrumbList JSON-LD, keyword lead copy; public "Stripe not connected" wording replaced with "No payment is taken on this site — we'll reply with payment details."

**Site files**: `public/robots.txt` (allow all + sitemap), `public/sitemap.xml` (`/` with 9 image entries, `/book.html`), `public/CNAME` (`dejeucrew.com`), `.gitignore` (node_modules, dist, source-photos, *.zip, *.tgz, inquiry log, .env).

**Masters**: `source-photos/` is gitignored and is never in `dist/`. The Pages workflow also fails the build if a zip or `source-photos` path ever shows up in `dist/`.

---

## 3. Hosting — GitHub Pages (free)

### What's ready
- `.github/workflows/deploy.yml`: on push to `main` → `npm ci` → `npm run build` → guard → upload `dist/` → deploy to Pages.
- Vite `base` is `/` (correct for `dejeucrew.com`).
- Local repo committed on `main` in `/workspace/dejeu-crew`.

### Published — Oct 7, 2026 (PT)
- Repo: **https://github.com/KevinD303/dejeu-crew-site** (public). The planned name `dejeu-crew` was taken: Kevin already has a **private 2022 repo `KevinD303/Dejeu-Crew`** (old PHP/Docker site; GitHub names are case-insensitive). It was **not touched**; the new site lives in `dejeu-crew-site`.
- History checked before pushing: no `source-photos/`, zips, video masters, WhatsApp-derived files, `.tgz`, `.env` or inquiry logs in any commit (the earlier WhatsApp-derived film was stripped from the unpushed local history). Largest file ≈ 11 MB.
- Pages: source = GitHub Actions, custom domain `dejeucrew.com` (API: `cname: dejeucrew.com`).
- Actions: "Deploy to GitHub Pages" — every push to `main` builds and deploys (first run 37731327609 ✅ success). Runs: https://github.com/KevinD303/dejeu-crew-site/actions
- **Cloudflare Pages** (Kevin, in progress): the same repo is being connected as Cloudflare Pages project `dejeu-crew` — build command `npm run build`, output directory `dist`. The repo builds cleanly with exactly that (Node 20+; Vite 5; no env vars needed). `public/CNAME` is harmless on Cloudflare. If Cloudflare becomes the host, point GoDaddy DNS per Cloudflare's instructions instead of the GitHub Pages records in §4 (don't mix both), then the GitHub Pages workflow/custom domain can be removed.
- Update flow from the box: `cd /workspace/dejeu-crew && git add -A && git commit -m "…" && git push` (gh is logged in as KevinD303).

### Default Pages URL note
The default URL `https://kevind303.github.io/dejeu-crew-site/` now 301-redirects to `http://dejeucrew.com/` (custom domain is set), so **until GoDaddy DNS is switched the site isn't reachable anywhere public**. Because the build uses base `/` (right for dejeucrew.com), CSS/images **will look broken at that sub-path URL** — that's expected. Don't change Vite `base` to `/dejeu-crew-site/`.

Recommended: verify the domain under **GitHub → Settings (account) → Pages → Add a domain** (adds a TXT record) to prevent domain takeover.

---

## 4. GoDaddy DNS (dejeucrew.com → GitHub Pages)

Values verified against GitHub Docs ("Managing a custom domain for your GitHub Pages site"), Oct 7, 2026.

**Remove first**
- The current **parked** `A` records for `@` — as of Oct 7, 2026 they are **3.33.130.190** and **15.197.148.33** (GoDaddy parking/forwarding).
- Any **Domain Forwarding** on dejeucrew.com (GoDaddy → Domain → Forwarding → delete).
- The existing `CNAME` for `www` (currently `www → dejeucrew.com` / `@`) — replace it with the one below.
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

1. ~~GitHub repo + Pages~~ ✅ done (`KevinD303/dejeu-crew-site`). Optional: archive/rename the old private `KevinD303/Dejeu-Crew` repo if it's no longer needed.
2. **GoDaddy DNS**: remove parked A record + forwarding; add the 4 A records + `www` CNAME (§4).
3. **HTTPS**: tick "Enforce HTTPS" in Pages settings once available.
4. **FormSubmit**: send one test inquiry on the live site and click "Activate Form" in dejeu.crew@gmail.com (§5).
5. Optional: verify the domain in GitHub Pages settings; add the site to Google Search Console (`https://dejeucrew.com/`, submit `sitemap.xml`) and set up a Google Business Profile as a service-area business (California Valley / Bay Area / Sacramento; big local-SEO win; needs her account).
6. Still waiting on the 3 extra Google Photos (need a `photos.app.goo.gl` share link or downloaded files).

## 7. Local commands
```bash
cd /workspace/dejeu-crew
npm install && npm run build
npx vite preview --host 127.0.0.1 --port 4173   # box preview
tar czf /workspace/dejeu-crew-dist.tgz -C dist .
```
