# Handoff: Forge redesign — Triple J Metal public site

## Overview
This package moves the Triple J Metal public site (`julianleon8/triple-j-website`, Next.js 16 / React 19 / Tailwind v4) from the Barlow Condensed + royal-blue "magazine" look to **Forge**: Cinzel headlines, the lion logo's navy/slate/silver palette, alternating light and navy bands, and real jobsite photography. The work is split into **14 sequenced PRs** (`prs/PR-00…PR-13`). Each PR file stands on its own: it has its goal, dependencies, the files to touch, exact specs, where the copy comes from, how it behaves, and acceptance criteria.

Screens covered: Homepage · Service pages (Carports, Metal Fencing, Gates) · Location pages (Temple, Belton) · Gallery · About · Contact · Partners · Fort Cavazos (military) · shared Header, Mega menu, Mobile menu, Footer, Mobile call bar, Quote form, Lightbox.

## About the design files
The files in `reference/` are **design references built in HTML**. They are prototypes that show the intended look and behavior. They are **not production code to copy**. The task is to **rebuild them in the existing repo** using its patterns: App Router pages, `src/lib/*.ts` data files, Tailwind utilities, `next/image`, and the existing API routes. Open either `.dc.html` file directly in a browser. Keep `support.js` and `assets/` next to it.

- `reference/Triple J Site.dc.html` contains every inner page as one app with hash routes: `#/carports`, `#/fencing`, `#/gates`, `#/temple`, `#/belton`, `#/gallery`, `#/about`, `#/contact`, `#/partners`, `#/military`. Its logic class holds the **content data**, which ports straight into the repo's data files:
  - `SVC` (carports / fencing / gates)
  - `LOC` (temple / belton)
  - `GAL` (gallery sample)
  - `CHIPS` (quote services)
  - `ZIPS` (ZIP→city sample)

  Sections are tagged `data-screen-label="Service · Hero"` and so on, so you can search for them.
- `reference/Homepage Final Scroll.dc.html` is the homepage, including its pinned-hero scroll choreography (`applyHero`, `update`, `tick` in the logic class).
- In the design files, type and spacing use container units on a full-width root. **Read every `cqw` as `vw`.**

## Fidelity
**High fidelity.** Colors, type, spacing, radii, shadows, motion and copy are final, except where `§ Deltas` below says otherwise. Rebuild pixel-for-pixel against the reference at 390px, 768px, 1280px and 1440px wide.

## Read order (for each Claude Code session)
1. This README: the rules, branch strategy and deltas.
2. `forge-design-system/readme.md`: the visual foundations and **every component spec** (the single source of component values).
3. `forge-design-system/integration/tailwind-v4-globals-snippet.css`: tokens ready to paste into `globals.css`.
4. The `prs/PR-NN-*.md` file you are executing.
5. Repo `AGENTS.md`, then `Locked Decisions.md`. For **process**, repo rules win. For **look and copy**, this package wins wherever `§ Deltas` marks a decision as resolved.

## Ground rules (every PR)
- **Repo contract.** Follow `AGENTS.md`. Read `node_modules/next/dist/docs/` before using a Next API. Run `npm run typecheck && npm run lint && npm run test` and `node scripts/check-vault.mjs` before every commit.
- **Sources of truth.**
  - NAP, nav, services and cities go in `src/lib/site.ts`.
  - Service content goes in `src/lib/services.ts`; location content in `src/lib/locations.ts`.
  - Tokens go in `src/app/globals.css`.
  - Port the design copy **into those files**. Never hard-code it in components.
- **Prices.** `dev/sales-pack-2026-04-30.md` is canonical. Every price in the design must be checked against it (see D9). **Never improvise a price.**
- **Vault sync.** Any PR that changes a product fact or reverses a lock must, in the same PR, append a row to `Decisions.md` **and** overwrite the line in `Locked Decisions.md`.
- **The `data-forge` attribute.** Put it on the root of every migrated surface: Header, Footer, MobileCallBar, and each redesigned page wrapper. It is what lets Forge escape the unlayered legacy rules in `globals.css` (see PR 01).
- **Images.**
  - Reference `assets/<name>.jpg` maps to repo `/images/<name>.jpg`.
  - `assets/sm-*.jpg` are mock thumbnails. Use the full `/images/<name>.jpg` with `next/image` and a correct `sizes`.
  - `assets/locations/**` maps to `/images/locations/**`.
  - Gallery and ticker content always comes from **live `gallery_items`** (the existing gallery API/queries), never the `GAL` sample.
- **Accessibility.**
  - Hit targets are at least 44px (the design already complies).
  - The mega menu and mobile menu use `aria-expanded` and handle Esc and focus.
  - Option tabs use `role="tablist"`/`tab`. FAQ rows use `aria-expanded` + `aria-controls`.
  - The lightbox is `role="dialog" aria-modal`, closes on Esc and navigates with ←/→.
  - Selectable pills use `aria-pressed` (or radio semantics).
  - Use the Forge focus ring.
  - `prefers-reduced-motion` turns off every animation and the hero pin.
- **No new emoji, no red, no royal blue.** The one exception, pending confirmation, is D5.

## Branch & deploy strategy
`main` is production: Vercel auto-deploys it in about a minute. **Recommended:**
1. Create `redesign/forge` from `main`.
2. Point PRs 01–12 at it. Every push gets a Vercel preview URL for owner review.
3. Merge `redesign/forge` into `main` once the owner signs off.

PR 00 is a factual fix and goes **straight to `main`**. PR 13 runs after the merge.

The alternative is to merge each PR to `main` in order. That ships continuously, but from PR 03 until PR 12 the Forge header and footer will wrap old Barlow page bodies in production.

## PR plan
| PR | Title | Target | Depends on | Size |
|---|---|---|---|---|
| 00 | Vault sync + heavy-duty upgrade correction | `main` | — | S |
| 01 | Forge foundations: Cinzel, tokens, legacy-rule escapes (no visual change) | `redesign/forge` | — | S |
| 02 | Forge primitives in `src/components/forge/` (unused yet) | `redesign/forge` | 01 | L |
| 03 | Site chrome: header, mega menu, mobile menu, footer, call bar | `redesign/forge` | 02 | M |
| 04 | Shared Quote section + 2-step Quote form | `redesign/forge` | 02 | M |
| 05 | Homepage | `redesign/forge` | 03, 04 | L |
| 06 | Service page template + `/services/gates` | `redesign/forge` | 03, 04 | L |
| 07 | Location page template | `redesign/forge` | 03, 04 | M |
| 08 | Gallery + lightbox | `redesign/forge` | 03, 04 | M |
| 09 | About | `redesign/forge` | 03, 04 | S |
| 10 | Contact (message form + map) | `redesign/forge` | 03 | M |
| 11 | Partners | `redesign/forge` | 03 | M |
| 12 | Fort Cavazos (military) | `redesign/forge` | 03, 04 | M |
| 13 | Retire Barlow + royal blue; OG, emails, PDF (scope note) | `main` | merge | L |

Once 03 and 04 have landed, PRs 05–12 don't depend on each other and can run in parallel sessions.

## § Deltas vs Locked Decisions / current repo
Each delta has a status:
- **OPEN**: the owner must pick before that PR starts.
- **VERIFY**: check against the vault or the owner before merge.
- **DEFAULT**: proceed with the recommendation and log it.
- **OWNER**: the owner already asked for it (2026-10-02). Just log it.

| ID | Topic | Today (lock / repo) | Design | Recommendation | Status | PR |
|---|---|---|---|---|---|---|
| D1 | Steel upgrade | `services.ts`: "12-gauge storm upgrade" | **Heavy-duty upgrade: 11-gauge columns, welded to receivers & purlins** (the rest of the frame stays 14-gauge) | Replace everywhere | OWNER; confirm exact wording with Freddy | 00 |
| D2 | Header nav | 5 links: Services, Fencing, Gallery, About, Contact. Blog + Partners in footer | Inner-page mock: **Services ▾ (mega)**, Gallery, About, Partners, Contact. The homepage mock matches the lock | Use the mega-menu version (newer; Fencing and Gates live in the mega). Log the reversal | **OPEN** | 03 |
| D3 | Hero subhead | Lock: "Carports, garages, barns, and patios. Welded or bolted, built on your property by our Central Texas crew." | Mock uses the unapproved one-sentence rewrite | **Use the locked line** | DEFAULT | 05 |
| D4 | Hero CTAs | Lock: label "Start Your Free Quote" + 3 white buttons Carport / Barn / Metal Fencing (`/quote?service=…`) + "or see our builds ↓" | "Get a Free Quote →" + outline "See Our Builds" | Owner pick | **OPEN** | 05 |
| D5 | Royal blue | Lock: no `#1e6bd6` anywhere | Service-page "Related" buttons are `#1e6bd6` / hover `#1851b5` | Ship as the single documented exception; log it | OWNER; confirm it's meant as an exception | 06 |
| D6 | Quote section layout | Two-column (homepage mock) | **Centered single column**, card max 760px | Centered on every page (one shared component) | OWNER | 04 |
| D7 | Quote form fields | Timeline has 4 options (incl. "This week"). Budget bands go to "$40k+". `current_surface` follow-up, best-time-to-call and `FenceFields` exist. No permits | Timeline: ASAP / This month / Just planning. Budget: Under $5k / $5k–$10k / $10k–$20k / $20k+ / Not sure yet. **Adds "Do you need permits?"** The mock omits the 3 conditional fields | Adopt the design's options. **Keep** the 3 conditional fields, restyled. Store permits in lead notes (no migration) | DEFAULT | 04 |
| D8 | Military % | Lock: the discount is a checkbox | "7% off" in the mega card, mobile menu, form helper and military page | Check 7% in the sales pack. If unconfirmed, drop the number ("Discount applied to your quote.") | **VERIFY** | 03, 04, 12 |
| D9 | Prices in design | The sales pack is canonical | Carport from **$3,000** bolted / **$3,300** welded (20×20 flat, 10 ft, steel + install, before tax). Garage from **$5,500** (30×30 bolted). Barn from **$6,500**. Military calculator bases are the same | Check each one | **VERIFY** | 05, 06, 12 |
| D10 | Footer texture | — | Homepage: brushed steel. Inner pages: corrugated panel | Brushed steel everywhere | DEFAULT | 03 |
| D11 | Header size / breakpoint | Hero mockup: 84/72 @ 760px | Site mock: 80/64 @ 900px | **84/72**; desktop nav ≥ 900px; phone number ≥ 1180px | DEFAULT | 03 |
| D12 | PreFooterCta | In the marketing layout | Not in the design (the Quote section comes before the footer) | Remove it from the layout; keep it only on un-migrated routes | DEFAULT | 03 |
| D13 | Gates page | `site.ts`: "Metal Fencing & Gates" → `/services/metal-fencing` | New **`/services/gates`** page | Add a `gates` service, sitemap entry and OG image. List Fencing and Gates separately | VERIFY | 06 |
| D14 | Contact form | `/contact` renders `QuoteForm` | Separate "Send a message" form + map; no Quote section on `/contact` | Post to `/api/leads` (read its zod schema first) with the topic/reach-by/language in notes | VERIFY | 10 |
| D15 | Mega-menu services | `site.ts` SERVICES has 7 entries | The mega shows 3 (Carports, Metal Fencing, Gates); the footer lists them all | As designed | DEFAULT | 03 |
| D16 | Process lock | "Owner designs the rest of the site in Figma" | These design files are the reference now | Log that this package supersedes the Figma plan | DEFAULT | 00 |
| D17 | Homepage hero reveal | — | Headline lines 2–3, subhead, CTAs and ticker **reveal as the visitor scrolls** through a pinned hero (only the eyebrow + "Built right." show at load) | Build as designed. Confirm the owner accepts CTAs hidden at load. Fallback: show everything at load and keep only the parallax | **OPEN** | 05 |
| D18 | Copy claims | — | "Emergency quotes available by phone"; "2 in-house welders · Julian + Freddy"; "Stacks with whatever else we're running"; the Fort Cavazos testimonial; drive times to the main gate | Check against `Business Profile.md`, `Operational Notes.md` and `testimonials.md`. Remove anything unconfirmed. **The testimonial must be a real review** | **VERIFY** | 10, 11, 12 |

## Design tokens (summary — full set in `forge-design-system/tokens/`)
- **Colors.**
  - Core: navy `#00182a` · navy-raised `#0c2538` · slate `#546678` · steel `#788a9c` · steel-light `#9fb0c0` · silver `#c9d3dc` · mist `#e3e9ee` · fog `#f4f6f8` · highlight `#e9eef2`.
  - Military: olive `#4b5320` · tan `#c5b481` · tan-light `#e2d6ae`.
  - Pending exception: link-accent `#1e6bd6` / `#1851b5`.
- **Accent gradient.** `linear-gradient(180deg,#e9eef2 0%,#9fb0c0 45%,#788a9c 55%,#c9d3dc 100%)`, applied with `background-clip:text`.
- **Type.**
  - Faces: Cinzel 900/700 for display (sentence case, `.01em`); Inter 400/500/600/700 for body.
  - Display sizes: home hero `clamp(35px,7.4vw,104px)`/1.02 · h1 `clamp(34px,4.4vw+6px,76px)`/1.04 · h2 `clamp(30px,3vw+12px,56px)`/1.05.
  - Body sizes: lede `clamp(16px,.3vw+14px,18px)` · body 15/1.6–1.65.
  - Labels: eyebrow 12/600/.22em · micro 11/700/.18–.2em.
- **Layout.** Container 1360px · gutter `clamp(20px,3vw,40px)` · section `clamp(64px,7vw,104px)` · split `repeat(auto-fit,minmax(min(100%,420px),1fr))` · cards `minmax(min(100%,300px),1fr)`, gap 16.
- **Radii.** 6 (control) · 8 (icon) · 10 (tile) · 12 (card) · 9999 (pill).
- **Shadows.**
  - Lifted `0 24px 48px -24px rgba(0,24,42,.3)` · card-hover `0 18px 36px -20px rgba(0,24,42,.4)` · cta `0 10px 24px -12px rgba(0,24,42,.45)` · mega `0 30px 60px -20px rgba(0,10,20,.7)`.
  - Cards rest flat.
- **Motion.** `cubic-bezier(.22,1,.36,1)` · reveal 600ms/16px · stagger 90ms · header 350ms · page-enter 500ms/10px.

## Assets
- **Already in the repo:** `public/images/*.jpg|webp` and `public/images/locations/**`, including `logo-lion.png`. Never use `logo-full.jpg` (it carries the retired name).
- **New:** `forge-design-system/assets/textures/footer-brushed-steel.png` (default) and `footer-corrugated-panel.png` go into `public/images/textures/` in PR 03.
- **Homepage hero photo:** the live gallery item `f548bede-4068-4f8a-9f45-541bec33c5c4/1790436675921.jpg` on Supabase storage (the Rogers 23×35 carport, matching the lock). The Supabase host must be in `next.config` `images.remotePatterns`.
- **Photos still needed** (the design shows a striped placeholder; production must ship a real photo or leave the image out): Fencing → Privacy, Ornamental; Gates → Pedestrian, Driveway.
- **Icons:** inline SVG, 24 viewBox, stroke 2, round caps (as in `src/components/ui/icons.tsx`). Add ChevronDown, ArrowLeft and Mail (Lucide geometry).

## Files in this package
```
README.md                         ← you are here
prs/PR-00 … PR-13                 ← one file per PR
forge-design-system/              ← tokens, component specs, specimen cards, Tailwind snippet, SKILL.md
reference/Triple J Site.dc.html   ← all inner pages (hash routes) + content data
reference/Homepage Final Scroll.dc.html ← homepage + scroll choreography
reference/support.js, reference/assets/ ← needed to open the references offline
```
