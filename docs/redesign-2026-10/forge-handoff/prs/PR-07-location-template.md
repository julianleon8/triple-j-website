# PR 07 — Location page template

**Target:** `redesign/forge` · **Depends on:** 03, 04 · **Size:** M

## Files
`src/app/(marketing)/locations/[slug]/page.tsx`, `src/lib/locations.ts`.

## Reference
`reference/Triple J Site.dc.html`, routes `#/temple` and `#/belton`. Sections are `data-screen-label="Area · …"`. Content is in the logic class `LOC.temple | LOC.belton`.

## Data
Map onto the existing `locations.ts` shape (≈70 KB, many cities). Fields the template reads:
```ts
name, full, menuSub, zip,
eyebrow, h1a, h1b, lede, img, imgAlt, pos, facts: {k, v, s}[],
distance, introEyebrow, introHeading, intro, areas: string[], areaNote,
landHeading, landmarks: {name, blurb, img, alt}[],
whyHeading, why: {t, b}[],
callout: {eyebrow, h, b, cta},
galleryCities: string[]
```
- Port the Temple and Belton copy verbatim from `LOC`.
- Other cities keep their existing copy mapped onto these fields. Sections with no data are skipped.
- Images live at `/images/locations/{city}/…`.

## Sections (in order)
1. **Hero** (photo, `--scrim-hero-page`).
   - Breadcrumb: Home / Service areas / {full}.
   - Eyebrow, h1 `{h1a}` / gradient `{h1b}`, lede.
   - Buttons: white lg "Get a {name} Quote →" and outline "Call 254-346-7764".
   - `FactStrip` (4 facts).
2. **Coverage** (white). Split.
   - Left: eyebrow `introEyebrow`, h2 `introHeading`, `intro` (lede, lh 1.65, max 600).
   - Right panel: radius 12, silver border, fog bg, padding `clamp(20px,2vw,32px)`.
     - Label: "Neighborhoods we cover".
     - Chips (36px pills, gap 8, mt 16).
     - `areaNote` (14px slate, mt 18).
     - Divider (mt 20, pt 18, border-top silver), then a 16px slate pin icon + "Shop: 3319 Tem-Bel Ln, Temple, TX 76502 · **{distance}**".
3. **Know the ground** (fog).
   - Eyebrow "Know the ground", h2 `landHeading`.
   - Grid (mt 44) `minmax(min(100%,300px),1fr)`, gap 20. Each card: radius 12, silver border, white, 16:10 photo, body padding 20/22/24, Cinzel 700 20/1.2 name, 15/1.6 slate blurb.
4. **Why a local crew** (navy). Split.
   - Left: eyebrow "Why a local crew", h2 `whyHeading`, then a `NumberedRow` list (dark tone, mt 32): borders `rgba(201,211,220,.18)`, numerals Cinzel 700 15 steel, titles Cinzel 700 19 white, body 15px at 75% white.
   - Right callout: bg `#0c2538`, border `rgba(201,211,220,.3)`, radius 12, padding `clamp(24px,2.4vw,40px)`.
     - Eyebrow: 11/700/.2em silver.
     - h3: Cinzel 900 `clamp(24px,1vw+16px,32px)`/1.15.
     - Body: 15/1.65 at 80% white.
     - Button: white md "{cta} →" (mt 24) that scrolls to the quote.
5. **What we build in {name}** (white).
   - Eyebrow "What we build in {name}", h2 "Same crew. " + slate "Every build."
   - Grid (mt 36) `minmax(min(100%,280px),1fr)`, gap 16, of `PhotoCard`s for Carports, Metal Fencing and Gates, using the service `menu` / `menuSub` / `thumb`. Each card shows "Explore {label} →" and links to the service page.
6. **Builds near {name}** (fog).
   - Eyebrow, h2 "Built down the road.", "See the full gallery →".
   - Grid of compact `BuildCard`s filtered by `galleryCities`, opening the lightbox. Hide the section if there are fewer than 3.
7. **Quote:** `<QuoteSection initialZip={zip} />` with the location lede.

## Acceptance
- Temple and Belton match the reference at 390 and 1440px.
- At least 3 other cities render cleanly.
- The ZIP is prefilled, but only when the visitor hasn't entered a different one.
- Existing location JSON-LD and metadata are unchanged.
