# PR 03 — Site chrome: header, mega menu, mobile menu, footer, call bar

**Target:** `redesign/forge` · **Depends on:** 02 · **Size:** M
**Resolve first:** D2 (nav structure). **Verify:** D8 (7%). **Defaults:** D10, D11, D12, D15.

## Files
`src/components/site/Header.tsx`, `Footer.tsx`, `MobileCallBar.tsx`, `PreFooterCta.tsx`, `src/app/(marketing)/layout.tsx`, `src/lib/site.ts` (nav data), `src/app/globals.css` (call-bar clearance), `public/images/textures/footer-brushed-steel.png` (and `footer-corrugated-panel.png`, kept but unused).

## Reference
- `reference/Triple J Site.dc.html`: `<header>` (top of the template) and `<footer data-screen-label="Footer">`.
- `reference/Homepage Final Scroll.dc.html`: the transparent-over-hero behavior and the footer link lists.

## Header
- **Structure.** Sticky `top:0`, `z-50`, `data-forge`. Inner bar: navy `#00182a`, bottom border `rgba(201,211,220,.16)`, height **84px** (≥900px) / **72px** (<900px). Container 1360px with the Forge gutter.
- **Left.** Lion `/images/logo-lion.png` at 44px (38 mobile) + "Triple J Metal", Cinzel 900 `clamp(19px,1vw+8px,22px)` white, gap 12px. Links to `/`.
- **Nav (≥900px)**, per D2. Default:
  - Items: `Services ▾` · Gallery · About · Partners · Contact.
  - Style: 15px Inter 500 at `rgba(255,255,255,.86)`, gap `clamp(18px,2vw,30px)`, item padding 8px 0. Hover goes white. The active item gets a 2px `#c9d3dc` bottom border; Services counts as active on any service, location or military page.
  - The Services trigger is a `<button aria-expanded>` with a 14px chevron that rotates 180° (300ms ease).
- **Right.**
  - Phone: icon 16px + "254-346-7764", 15px/600 white, tabular. Shown only at ≥1180px.
  - CTA: `ForgeButtonLink` white sm. Label depends on the route:
    - Default: "Get a Free Quote" → `#quote` (or `/quote` if the page has no Quote section).
    - `/contact`: "Send a Message" → `#message`.
    - `/partners`: "Partner Inquiry" → `#inquire`.
- **Mobile (<900px).** Two 44×44 icon buttons (call `tel:+12543467764`, menu toggle, with menu/close glyph swap), gap 10px.
- **Homepage only.** Transparent background and border while `scrollY ≤ 40`; then navy + border `rgba(201,211,220,.18)`. Transition background/border 300ms ease-out. The hero sits underneath with a negative top margin of the header height.
- **Hide on scroll.** Hide (translateY −100%, 350ms `--ease`) when scrolling down more than 6px past y=140. Show on scroll-up of more than 6px. Never hide when y<140 or when the mega/mobile menu is open.
- Remove the old top thin bar (phone + ⚡ badge). This is locked.

## Mega menu (≥900px)
- **Open/close.**
  - Opens on `mouseenter` of the Services trigger and on click (toggle).
  - Closes on `mouseleave` of the header, `mouseenter` of any other nav item or the right cluster, Esc, or route change.
  - Focus moves into the panel on keyboard open.
- **Panel.** Absolute, full width, below the bar. Navy, border-bottom `rgba(201,211,220,.16)`, `--shadow-mega`. Inner padding `28px gutter 32px`. Grid `1.3fr .9fr 1fr`, gap `clamp(24px,3vw,48px)`.
- **Column 1, "What we build".**
  - Label: 11/700/.2em, `#9fb0c0`.
  - Rows (gap 6, padding 8 with −8 margin, radius 8, hover bg `#0c2538`) for Carports, Metal Fencing and Gates (D15).
  - Each row: a 72×54 radius-6 photo thumbnail, a title (Cinzel 700 17), and a subline (13px `#9fb0c0`):
    - Carports — "Welded or bolted · from $3,000" (D9)
    - Metal Fencing — "Privacy, pipe & ranch, ornamental"
    - Gates — "Walk, driveway & ranch entrances"
- **Column 2, "Where we build".**
  - Rows with top/bottom borders `rgba(201,211,220,.14)`, padding 14px 0, a trailing `→` in steel, hover text `#c9d3dc`:
    - Temple, TX — "Home base · 0 mi"
    - Belton, TX — "10 mi south · 15 min from HQ"
  - Note below the rows (13px `#9fb0c0`): "Plus Killeen, Harker Heights, Waco and more — within ~90 minutes of Temple."
- **Column 3: military card.**
  - Box: min-height 220, radius 12, border `rgba(201,211,220,.22)`, photo `/images/carport-truck-concrete-hero.jpg`, `--scrim-mega-military`, padding 20, content bottom-aligned.
  - Eyebrow (tan `#c5b481`): "Fort Cavazos · 7% off" (D8).
  - Headline (Cinzel 900 22/1.15): "Same-week installs for PCS families."
  - Link (14/600 silver): "See the military page →" → `/military`.

## Mobile menu (<900px)
- **Sheet.** Absolute below the bar, `height: calc(100dvh - 72px)`, scrolls, navy, padding `8px 20px 32px`. Lock body scroll while open.
- **Groups.** Labels are 11/700/.2em `#9fb0c0`, with margins 18/24px. Rows are Cinzel 700 22px, padding 14px 0, divider `rgba(201,211,220,.16)`.
  - Services: Carports, Metal Fencing, Gates.
  - Service areas: Temple, TX; Belton, TX.
  - Company: Gallery, About, Partners, Contact, "Fort Cavazos Military" with a right-aligned tan tag "7% off" (11/700/.14em).
- **Bottom.** White lg CTA (label per route) + outline "Call 254-346-7764", stacked, gap 12.

## Footer
- **Shell.** `data-forge`, navy, top border `rgba(201,211,220,.15)`, `overflow:hidden`.
- **Texture.**
  - `/images/textures/footer-brushed-steel.png` absolute-cover, `object-position: 50% 100%`, opacity .55, `aria-hidden`, `pointer-events:none`.
  - Over it: `--scrim-footer`.
- **Grid.** `repeat(auto-fit,minmax(200px,1fr))`, gap `clamp(36px,3vw,48px)`, padding `clamp(56px,5vw,80px) 0`.
- **Brand column** (span 2 at ≥900px):
  - Lion 56px + wordmark, Cinzel 900 `clamp(24px,1vw+16px,30px)`.
  - Tagline (17px/600 white, mt 20): "Built right, built fast, built by Triple J."
  - Family line (14px `#9fb0c0`, mt 10): "Family-owned · Founded 2025 · 150+ jobs across Central Texas".
  - `<address>` (14px `#c9d3dc`, gap 8): pin + "3319 Tem-Bel Ln / Temple, TX 76502"; phone link 16px/700 white, tabular.
  - Social: 36px chips, radius 8, border `rgba(201,211,220,.25)`; hover border and icon go white. Links come from `SITE.social`.
- **Link columns.**
  - Heads: 12/600/.2em `#c9d3dc`. Links: 14px, gap 10, mt 18, hover white.
  - **Services:** driven by `SERVICES` in `site.ts`. List Metal Fencing and Gates as separate items once PR 06 adds Gates (D13).
  - **Service Areas:** driven by `SERVICE_CITIES`.
  - **Company:** Gallery, About, Contact, Blog, Partners, Fort Cavazos Military.
  - Columns may end with the 12px uppercase "View all →" link from the homepage mock.
- **Bottom bar.** Border-top `rgba(201,211,220,.15)`, padding 22px 0, 12px `#9fb0c0`.
  - Left: "© 2026 Triple J Metal LLC. All rights reserved." Compute the year.
  - Right (gap 20): "Mon–Sat · 8am–6pm" (from `SITE.hours`) · "English · Español" · Privacy · Terms.
- **Curtain prop.** Add an optional `curtain` prop (used by the homepage in PR 05): footer content translates from `-(span × depth)` to 0 as the footer enters the viewport. `depth` is .55 desktop, .41 mobile, and `span = min(footerHeight, viewportHeight)`. Off under reduced motion.

## Mobile call bar (<900px)
- **Bar.** Sticky bottom, `data-forge`, `rgba(0,24,42,.95)` + `blur(8px)`, top border `rgba(201,211,220,.2)`, safe-area bottom padding. Grid 1fr 1fr, gap 8, padding 8.
- **Left button** (48px, radius 6, white bg, navy 700): phone icon + "Call Now", with a 10px/500 slate subline "English · Español".
- **Right button** (48px, outline `rgba(255,255,255,.3)`, white 600): "Free Quote →". It becomes "Message →" on `/contact` and "Inquire →" on `/partners`.
- **`globals.css`:** change the call-bar clearance media query from `max-width: 768px` to `max-width: 899px` so 769–899px is padded too.

## Layout
- Remove `<PreFooterCta />` from `src/app/(marketing)/layout.tsx` (D12).
- Add it **explicitly** to every route that won't get a Forge Quote section: blog index and posts, alternatives, best-metal-carport-builders-temple-tx, services index, services/colors, hybrid-projects, pbr-vs-pbu-panels, locations index, privacy, terms, thank-you, quote. Restyle it to Forge: navy band, Cinzel h2, white lg CTA.

## Acceptance
- Matches the reference header, mega, mobile menu and footer at 390, 899, 900, 1179, 1180 and 1440px.
- Keyboard: Tab reaches every item; the mega opens with Enter/Space, closes with Esc and returns focus; the mobile menu traps focus.
- The homepage header is transparent at the top and navy after 40px.
- No layout shift from the header; Lighthouse CLS < 0.1.
