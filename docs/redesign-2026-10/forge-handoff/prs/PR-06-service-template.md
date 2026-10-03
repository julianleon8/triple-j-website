# PR 06 — Service page template + `/services/gates`

**Target:** `redesign/forge` · **Depends on:** 03, 04 · **Size:** L
**Owner-requested:** D5 (blue Related buttons). **Verify:** D9 (prices), D13 (gates).

## Files
`src/app/(marketing)/services/[slug]/page.tsx` (+ `opengraph-image.tsx` for gates), `src/lib/services.ts`, `src/app/sitemap.ts`, `src/lib/site.ts` (`SERVICES` gains Gates).

## Reference
`reference/Triple J Site.dc.html`, routes `#/carports`, `#/fencing`, `#/gates`. Sections are `data-screen-label="Service · …"`. Content is in the logic class `SVC.carports | SVC.fencing | SVC.gates`. Reference key `fencing` = repo slug `metal-fencing`.

## Data
Extend each `services.ts` entry. Reuse existing fields where they already hold the same thing; add the rest:
```ts
menu, menuSub, thumb, thumbPos,                 // nav + mega + cards
eyebrow, h1a, h1b, lede, img, imgAlt, pos,      // hero
facts: {k, v, s}[],                             // 4 hero facts
optEyebrow, optHeading, optLede,
options: {label, title, body, price, note, img?, structure?, concrete?}[],
featuresHeading, features: {title, description}[],
techHeading, tech, trust: string[],
specs: {k, v}[],
faqs: {q, a}[],
related: ServiceSlug[], quoteService, galleryTypes: string[]
```
- Port the carports, metal-fencing and gates content **verbatim** from the reference `SVC`. Exceptions: prices go through D9, and gauge copy follows D1 (already applied in the reference: "Heavy-duty upgrade · 11-gauge columns, welded to receivers & purlins").
- Undesigned slugs (`metal-garages`, `barns`, `rv-covers`, HOA, etc.) render with the same template. **A section with no data does not render.** Never invent copy to fill one.

## Sections (in order)
1. **Hero** (`PageHero` photo variant, `--scrim-hero-page`).
   - Breadcrumb: Home / Services / {menu}.
   - Eyebrow, then h1 `{h1a}` / steel-gradient `{h1b}` (`text-wrap:balance`), then the lede (max 620).
   - Buttons (gap 12): white lg "Get a Free Quote →" (scrolls to `#quote`) and outline-dark lg "Call 254-346-7764".
   - `FactStrip` with the 4 `facts`.
2. **Options** (white).
   - Split grid `minmax(min(100%,420px),1fr)`, gap `clamp(32px,4vw,72px)`, `align-items:start`.
   - Left: `SectionHeading` (optEyebrow / optHeading / optLede, max 560), then `OptionTabs` (mt 32, gap 10).
   - Right: `OptionCard` for the selected option. "Quote this →" prefills service + structure/concrete and scrolls to the quote.
   - Options with no photo render without the image area (Assets needed: fencing Privacy/Ornamental, gates Pedestrian/Driveway).
3. **What's included** (fog).
   - Heading (max 760): eyebrow "What's included", h2 `featuresHeading`.
   - Grid (mt 44): `minmax(min(100%,300px),1fr)`, gap 16, of `FeatureCard`s numbered 01–06.
4. **Recent builds** (white). Render only if at least 3 live gallery items match `galleryTypes`.
   - Header row: eyebrow "Recent builds", h2 "Real jobs, real addresses.", and on the right "See the full gallery →".
   - Grid (mt 36): `auto-fill minmax(min(100%,260px),1fr)`, gap 16, of compact `BuildCard`s. Each opens `ForgeLightbox`.
5. **Specs** (navy).
   - Split. Left: eyebrow "Built for Central Texas", h2 `techHeading`, body `tech` (80% white, max 600), and a `RuleList` of `trust` (mt 28).
   - Right: `SpecSheet` with the title "Spec sheet · {menu}", the `specs` rows, and the footnote "Final gauge, anchoring and engineering are confirmed for your design and site."
6. **FAQ** (white).
   - Split `minmax(min(100%,360px),1fr)`.
   - Left: eyebrow "Questions", h2 "What people" / slate "ask us.", and the line "Still unsure? Call **254-346-7764**. A real person from our Temple crew picks up." (the number is an underlined `tel:` link).
   - Right: `FaqAccordion` with the first item open.
7. **Related** (fog, padding 32px 0, border-top `#e3e9ee`).
   - One wrapping row (gap 14px 24px): the label "RELATED" (11/700/.2em slate), then the link buttons (gap 10).
   - Buttons: `linkAccent` tap size (44px, padding 0 18px, 14/600, radius 6, `#1e6bd6`, hover `#1851b5`, shadow `0 1px 2px rgba(0,0,0,.08)`, transition 150ms).
   - Button order: the two `related` services ("{menu} →"), then "Project gallery →", "Temple, TX →", "Belton, TX →", "About our crew →", "Fort Cavazos military discount →".
   - If D5 is rejected, use navy-filled buttons (`#00182a`, hover `#0c2538`) instead.
8. **Quote:** `<QuoteSection initialService={quoteService} />` with the service-page lede.

## SEO
- Keep the existing `generateMetadata`, canonical, `BreadcrumbJsonLd` and service JSON-LD. Use the FAQ data for FAQ JSON-LD if the route already emits it.
- Gates: add it to `generateStaticParams`, `sitemap.ts`, `SERVICES` in `site.ts`, and add an OG image modeled on the existing one.

## Acceptance
- `/services/carports`, `/services/metal-fencing` and `/services/gates` match the reference at 390 and 1440px.
- Every other slug renders without empty sections or console errors.
- Copy diff: rendered text equals the reference `SVC` strings, apart from the D-items.
- `node scripts/check-vault.mjs` passes: no "48-hour", no 4,000 PSI default, no 12-gauge.
