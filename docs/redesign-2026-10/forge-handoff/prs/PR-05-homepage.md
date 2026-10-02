# PR 05 — Homepage

**Target:** `redesign/forge` · **Depends on:** 03, 04 · **Size:** L
**Resolve first:** D4 (hero CTAs), D17 (scroll-reveal hero). **Defaults:** D3 (locked subhead). **Verify:** D9 (card prices).

## Files
`src/app/(marketing)/page.tsx`, plus new `src/components/forge/home/{HomeHero,LatestBuildsTicker,BuildsStrip,ServicesBand}.tsx`. Reuse the existing gallery data access for builds and the ticker.

## Reference
`reference/Homepage Final Scroll.dc.html`. Choreography lives in the logic class: `layout()`, `update()`, `applyHero()`, `tick()`.

## Page order (locked)
Hero (navy) → Builds (white) → Services (navy) → Quote (fog, shared PR 04) → Footer (navy, `curtain`).

Remove `Gallery`, `Services`, `HowItWorks` and `ServiceAreas` from the homepage. Keep `metadata` as it is.

**Band color.** The sections are transparent. `<main>`'s background crossfades over 800ms `--ease`: `#fff` by default, `#00182a` once the Services section top is above 35% of the viewport, `#f4f6f8` once the Quote section top is. A simpler fallback is fine: give each section its own background.

## 1 · Hero
- **Wrapper.** Height = hero height + `pinDist`, where `pinDist = viewportHeight × 0.9` (desktop) or `× 0.63` (mobile), and 0 under reduced motion. The hero inside is `position: sticky; top: 0`.
  - Hero min-height: viewport height (min 600px) on desktop; viewport height − 72px (call bar, min 560) on mobile.
  - The wrapper's `margin-top` is minus the header height, so the hero sits under the transparent header.
- **Photo.** `next/image` `priority`, fill, cover. Use the live gallery file `…/gallery/items/f548bede-4068-4f8a-9f45-541bec33c5c4/1790436675921.jpg` (Rogers 23×35 carport).
  - `object-position`: 50% 50% desktop, 40% 50% mobile.
  - Base `scale(1.06)`, `transform-origin: 50% 40%`.
  - Fallback: `/images/carport-gable-residential.jpg`.
  - Alt: "23×35 carport with gutters built by Triple J Metal in Rogers, Texas".
- **Scrim.** `--scrim-hero-home`.
- **Content.** Centered column; padding-top = header height + 36px, bottom 64px, side 20px.
  - **Eyebrow:** "Family-owned · Temple, Texas". `clamp(11px,.3vw+9px,13px)`/600/.22em silver, with 2px rules of `clamp(20px,3vw,48px)` on both sides (mirrored).
  - **h1** (mt 22): Cinzel 900 `clamp(35px,7.4vw,104px)`/1.02, `.01em`, white, three block lines:
    - "Built right."
    - "Built fast."
    - "Built by Triple J." in the steel gradient.
    - Each line sits in an overflow-hidden mask with `padding:.06em .14em .2em; margin:-.06em -.14em -.2em` so the descenders and the gradient aren't clipped.
  - **Subhead** (mt 22, max 560, `clamp(16px,.4vw+14px,18px)`/1.55, 86% white): **use the locked line** (D3): "Carports, garages, barns, and patios. Welded or bolted, built on your property by our Central Texas crew."
  - **CTAs** (mt 32, gap 12, centered, wrapping). Per D4, either:
    - (a) Design: white lg "Get a Free Quote →" (scrolls to `#quote-card`) + outline-dark lg "See Our Builds" (scrolls to `#gallery`); or
    - (b) Lock: label "Start Your Free Quote" (13/700/.22em white) above three white lg buttons, min-width 150 (Carport → / Barn → / Metal Fencing →, preselecting the service), then a 15px silver underlined link "or see our builds ↓".
  - **Scroll cue:** absolute bottom 14px, "Scroll" 10/600/.22em silver above a 1×34 line fading silver → transparent.
- **Ticker bar.** Pinned to the bottom of the hero.
  - Bar: border-top `rgba(201,211,220,.22)`, `rgba(0,24,42,.72)` + `blur(6px)`, 14px text at 88% white.
  - Label cell: "LATEST BUILDS", 12/700/.2em silver, navy bg, right border slate, padding `14px 22px 14px gutter`.
  - Track: items gap 44px, padding-left 28. Each item is `{title}` followed by `{city}` in steel with margin-left 6.
  - Content: **real active `gallery_items`, newest first** (locked). Duplicate the list for a seamless loop.
  - Speed: 40px/s plus `min(|scrollVelocity| × 0.5, 520)` px/s. Pauses when the hero is off-screen. Static under reduced motion.
- **Scroll choreography** (`p` = 0→1 across `pinDist`; each segment eases out with `1-(1-v)²`):
  - Eyebrow and line 1 are visible from load.
  - Line 2 rises from a 110% translateY over p .04–.34; line 3 over .28–.58.
  - Subhead fades in and rises 24px over .52–.78; CTAs the same over .62–.88.
  - The ticker bar slides up from 100% over .72–1.
  - The scroll cue fades out over 0–.12.
  - The image scales from 1.06 to 1.16.
  - Load entrance: every piece transitions into its p=0 state over 900ms `--ease`, staggered 100ms; after 1.8s transitions switch off so scrolling feels direct.
  - Drive transforms from a single rAF loop, without re-rendering React.
  - **D17:** if the owner rejects the reveal-on-scroll, render everything at p=1 on load and keep only the image scale and the ticker.

## 2 · Builds (`id="gallery"`, white)
- **Padding.** `clamp(40px,7vw,104px) 0`.
- **Header row** (flex, wrap, `align-items: flex-end`, `space-between`, gap 20px 32px):
  - Left, max 720:
    - Eyebrow: "Our builds".
    - h2: "Real jobs, real addresses." / slate "Built down the road."
    - Lede (max 600): "Every photo is a Triple J crew job in Central Texas, pulled straight from our live gallery with the title and city we filed it under."
  - Right (gap 18): link "See the full gallery →" (15/600 navy, 1px silver underline, padding-bottom 2, hover underline navy) → `/gallery`. On desktop, also 44×44 prev/next buttons (radius 6, silver border, hover navy border) that scroll the strip by 80% of its width, smooth.
- **Strip** (mt 40).
  - Horizontal scroller: `scroll-snap-type: x mandatory`, scrollbar hidden.
  - Bleeds to the viewport edges: negative side margins equal to the gutter; padding `4px gutter 12px`.
  - Track: flex, gap 16.
  - Card: `flex: 0 0 min(380px,80vw)`, snap start, radius 12, 1px silver border, 4:3 photo. Caption on white, padding 16/18/18: city in 11/600/.2em uppercase steel, then the title in Cinzel 700 18/1.2 navy. The card links to `/gallery/[id]`.
- **Drift on enter.** The track `translateX` eases from `drift` to 0 while the section top moves from the viewport bottom to 10% of the viewport. `drift = min(overflow × .35, 480)` on desktop; `min(overflow × .25, 300)` on mobile. Off under reduced motion.
- **Data.** Active `gallery_items`, newest first. 8 items in the mock.

## 3 · Services (`id="services"`, navy band)
- **Header** (max 760):
  - Eyebrow (dark): "What we build".
  - h2: "Welded or bolted." / steel-gradient "Built whole, by us."
  - Lede (80% white, max 640): "Every structure is sold welded, bolted, or turnkey — with turnkey, site prep, concrete and installation sit on one contract. No kits, no subcontractors."
- **Grid** (mt 48): `repeat(auto-fit,minmax(260px,1fr))`, gap 20. Cards stagger in at 90ms.
- **Three service cards.**
  - Card: `<a>`, radius 12, border `rgba(201,211,220,.22)`, bg `#0c2538`, 5:4 photo.
  - Body (padding 18/20/20): eyebrow 11/600/.2em silver → headline Cinzel 700 20/1.2 white (mt 8) → blurb 14/1.55 at 72% white (mt 10) → footer row (mt auto, pt 14, border-top `rgba(201,211,220,.18)`, 13px). The footer row reads: "From **$X** steel + install" (silver, with the amount in white tabular) on the left; "See builds →" (silver 600) on the right.
  - Card copy and targets (D9):

    | Eyebrow | Headline | Blurb | Price | Links to |
    |---|---|---|---|---|
    | Carports & RV Covers | Welded or bolted, residential or ranch. | Single, double, triple, custom spans — or extra-tall clearance for RVs, boats and trailers. Built and installed by our crew, usually within the week. | 3,000 | `/services/carports` |
    | Garages | Enclosed shop space — your spec, our crew. | 30×30 bolted steel-and-install base starts here. Walls, roll-up doors, walk-throughs, and insulation are quoted on top per your spec. | 5,500 | `/services/metal-garages` |
    | Barns | Pole, equipment, hay — built to span. | Long clear-spans for ag and ranch use. Welded red-iron primary, sheet on the skin. | 6,500 | `/services/barns` |

- **Fencing feature card** (4th cell).
  - Box: photo `/images/metal-fence-ranch-wire.webp` at `object-position: 60% 50%`, `--scrim-photo-card-strong`, border `rgba(201,211,220,.45)`, content at the bottom with padding 20.
  - Eyebrow: "Now quoting fencing".
  - h3 (Cinzel 900 `clamp(24px,1.2vw+14px,30px)`/1.1): "Metal fences. Gates. " followed by "A better boundary." in the steel gradient.
  - Body (14px, 80% white): "Privacy, pipe and ranch, and ornamental metal fencing for Temple, Belton, Killeen and nearby."
  - Buttons (stacked, gap 8):
    - White md "Explore fencing & gates →" → `/services/metal-fencing`.
    - Outline-dark md "Get a fencing quote": preselects fencing and scrolls to `#quote-card`.

## 4 · Quote
`<QuoteSection />` from PR 04 with the default lede. **Centered** (D6).

## 5 · Footer
`<Footer curtain />`. `<main>` gets `position:relative; z-index:1; box-shadow: var(--shadow-curtain)` so it reads as lifting off the footer.

## Acceptance
- Visual parity with the reference at 390 and 1440px, at scroll positions 0, mid-pin and post-pin.
- No React re-render per scroll frame (verify with React Profiler).
- 60fps on a mid-range Android, or degrade gracefully.
- LCP is the hero image, < 2.5s on 4G.
- Reduced motion: no pin, every element visible, ticker static.
- With JS disabled, the headline, subhead and CTAs are all readable. Render the final state on the server; apply the initial hidden transforms only after hydration, to avoid a flash and keep SEO.
