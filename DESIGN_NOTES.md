# Design notes — Dejeu Crew

## Intent

Quiet luxury. Sparse type, generous negative space, gold used as punctuation — never decoration overload. Warm brown accents for depth. Motion is soft (fade/rise), never bounce. Mostly weddings; open to all photography.

---

## Palette

| Name        | Hex       | Role |
|-------------|-----------|------|
| Black       | `#0A0A0A` | Primary ground, header, footer, Work |
| White       | `#FFFEFA` | Soft highlight text on dark cards |
| Bone        | `#F4F0E8` | Text on black; About section ground |
| Soft gold   | `#C4A574` | CTAs, eyebrows, hairlines, focus rings, logo |
| Brown       | `#5C4033` | Warm accents, borders |
| Brown deep  | `#3D2B1F` | Contact band, package washes |

Gold at ~35% opacity (`--gold-dim`) for borders and the hero frame. Soft wash (`--gold-soft`) for active chips / selected cards.

**Do not** introduce additional accent colors without a deliberate brand update.

---

## Typography

| Role     | Family                 | Weight        | Notes |
|----------|------------------------|---------------|-------|
| Display / H1–H3 | Cormorant Garamond | 300–400 | Letter-spacing ~0.02em; italic sparingly |
| UI / body | Manrope                | 400–600       | Eyebrows: 0.2–0.28em tracking, uppercase |

Eyebrow pattern: sans, ~0.7rem, gold, uppercase, wide tracking — always paired with a short gold hairline (3rem × 1px) before major headings.

---

## Logo usage

Files in `public/assets/`:

| File | Use on |
|------|--------|
| `logo-lockup-gold.svg` | **Header** (preferred), footer brand |
| `logo-lockup-dark.svg` | Bone / light backgrounds |
| `logo-monogram-gold.svg` | Hero, accents on black |
| `logo-monogram-dark.svg` | Bone backgrounds (About panel) |
| `logo-wordmark-gold.svg` | Dark lockups, OG, print |
| `logo-wordmark-dark.svg` | Bone / light lockups |
| `favicon.svg` | Tab icon (gold DC on black) |

**Rules**

1. Prefer the **lockup** in the fixed nav.
2. Hero may use monogram alone above the display line.
3. Never place gold logo on bone, or dark logo on black.
4. Clear space: ≥ ½ the monogram’s diameter on all sides.
5. Minimum monogram size: 24px digital / ~8mm print.
6. These are brand-aligned **placeholders**. When a final custom mark arrives, drop it in and keep the same filenames (or update references in HTML).

---

## Spacing & layout

- Content max: `72rem` (`--content`)
- Section padding: `clamp(4rem, 10vw, 8rem)`
- Horizontal gutter: `1.25rem` mobile → content width on desktop
- Nav height: `4.5rem`
- Portfolio: 1 → 2 → 3 columns; tall/wide spans at ≥960px
- Packages: 1 → 2 → 3 cards
- Form max width: `44rem`, centered

---

## Motion

- Hero: staggered `fadeUp` (~1s, ease-out)
- Scroll reveal: IntersectionObserver, 0.8s rise
- Header: blur + gold hairline after 40px scroll
- Portfolio hover: soft scale + caption fade
- `prefers-reduced-motion: reduce` collapses animations

---

## Accessibility

- Skip link, visible `:focus-visible` gold outline
- Filter buttons expose `aria-pressed`
- Package / path options use native radios with custom chrome
- Form errors via `aria-invalid` + `role="alert"`
- Success panel is focusable and announced with `aria-live`

---

## Form UX

Two paths after package + date:

1. **Inquiry** — no payment → `/api/inquiry`
2. **Reserve with deposit** — suggested 25% of starting price → `/api/deposit-intent` (`type: deposit_intent`). Stripe not connected; UI is explicit.

Required: package, preferred date, name, email, message. Optional: phone, location.

## Primary mark (2026-09-27)

- **Primary:** lockup v2 PNG (`logo-lockup-v2.png`) — clearer DC + wordmark (header + footer)
- **Accent:** side-by-side DC (`logo-monogram-dc-clear.png`) — hero monogram
- SVG lockups/monograms remain as alternates for light/dark contexts

## Portfolio photos (permanent)

| Path | Role |
|------|------|
| `public/gallery/*.jpg` | Web gallery (served `/gallery/`) — **permanent home** |
| `source-photos/from-zip/Ai website/` | Full-res masters |
| `source-photos/Ai-website-1-001.zip` | Original zip archive |
| `public/assets/og-image.jpg` | Social / OG 1200×630 (from EG0A6880) |

### Current selects (all weddings)

| File | Orientation | Site use |
|------|-------------|----------|
| EG0A0531.jpg | Portrait | Hero background + Work (tall) |
| EG0A6899.jpg | Portrait | About panel + Work |
| EG0A6880.jpg | Landscape | OG source + Work (wide) |
| EG0A0450.jpg | Landscape | Work (wide) |
| EG0A0570.jpg | Landscape | Work |
| EG0A0559.jpg | Portrait | Work |
| EG0A6852.jpg | Portrait | Work |
| EG0A6906.jpg | Portrait | Work (tall) |
| EG0A6935.jpg | Portrait | Work |

Captions are short / generic — do **not** invent couple names as fact.

Work filters: **All** / **Weddings** only (empty Portraits/Events/Brand chips removed until those galleries exist).

Safe to delete Vulcan `A:\Kevin\temp\Ai website-1-001.zip` once Kevin confirms masters on this box are enough.

## Remaining Kevin actions (handoff)

1. **GoDaddy DNS → hosting** — point dejeucrew.com at a **new** Vercel or Netlify project for this folder only (not Uplink / ms-a2).
2. **Stripe keys** — env vars on the host; wire Checkout into deposit path (stub stays until then).
3. **Form delivery** — Formspree / Resend / equivalent for inquiry email to `dejeu.crew@gmail.com`.
4. **More photos later** — add to `public/gallery/`, extend Work HTML, restore category filters when ready.
