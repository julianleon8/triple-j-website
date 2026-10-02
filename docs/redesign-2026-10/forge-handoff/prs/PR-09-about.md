# PR 09 — About

**Target:** `redesign/forge` · **Depends on:** 03, 04 · **Size:** S

## Files
`src/app/(marketing)/about/page.tsx`, `src/components/sections/Crew.tsx` (restyle, or replace with Forge markup).

## Reference
`reference/Triple J Site.dc.html` → `#/about`, sections `About · Hero | Crew | Apart | Steel | How we work`. All copy below is verbatim from there.

## Sections
1. **Hero** (photo `/images/red-iron-frame-hero.jpg`, `object-position: 50% 40%`, `--scrim-hero-page`, content max 800).
   - Breadcrumb: Home / Company / About.
   - Eyebrow: "About Triple J".
   - h1: "Temple's metal building family." / gradient "Not a national chain."
   - Lede: "Founded by a Temple family and run out of Temple, TX. We build every structure ourselves — no subcontractors, no kit drops, no hand-offs. One crew. One contract. Done right."
   - No buttons.
   - `FactStrip` (no sublines): Projects → "150+ completed"; On-site → "Mon–Sat"; After approval → "Same-week"; Founded → "2025 · Temple, TX". Pull 150+ and 2025 from `SITE.stats` / `SITE.established`.
2. **Crew** (white). Split, `align-items: stretch`, gap `clamp(32px,4vw,80px)`.
   - Left photo panel: min-height 380, radius 12, `/images/carport-truck-concrete-hero.jpg`. Caption overlay at the bottom: padding 64px 24px 22px, `--scrim-caption`, 15px white: "From the first measurement to the final weld."
   - Right:
     - Eyebrow "Meet Triple J"; h2 "Three names." / slate "One family business."
     - Lede (max 540): "Juan, Julian and Jose Alfredo. The people behind the name, based right here in Temple."
     - Three rows (mt 28, hairline `#e3e9ee` borders, padding 20px 0). Each row: the name in Cinzel 700 24 with the role inline after it (12/600/.16em uppercase slate, baseline-aligned, gap 4px 16px), then the body (15/1.6 slate, mt 8):
       - **Juan** · Co-owner · Relationships — "The family connection behind Triple J. Juan builds relationships with customers across Central Texas."
       - **Julian** · Sales · Operations — "Your point of contact for planning the build, talking through options and keeping the details moving."
       - **Freddy** · Foreman · Fabrication — "Jose Alfredo "Freddy" leads the crew — the measurements, cuts and welds that bring your plans to life."
     - Footer row (mt 20, gap 8px 20px, 15px): the underlined link "Talk with our team · 254-346-7764", then "English & Español" in slate.
3. **What sets us apart** (fog).
   - Eyebrow; h2 "No kits. No subs." / slate "No hand-offs."
   - Six `FeatureCard`s (grid `minmax(300px)`, gap 16, mt 44), titles Cinzel 700 19:
     1. Local crew — not a dealer
     2. Welded or bolted
     3. Concrete on the same contract
     4. Same-week scheduling
     5. Custom dimensions
     6. Permit planning
   - Bodies are verbatim from the reference.
4. **Materials** (white). Split, `align-items: center`.
   - Left: eyebrow "Materials"; h2 "Texas steel." / slate "Texas suppliers."; body (lede, lh 1.65, max 580) verbatim; `RuleList` (mt 26):
     - "Regional Texas suppliers — multi-source"
     - "14-gauge standard · 11-gauge heavy-duty columns"
     - "Galvalume® substrate · 40-year painted finish"
   - Right: a 4:3 image, radius 12, silver border: `/images/carport-residential-completed.jpg`.
   - **Never name a supplier** (AGENTS.md).
5. **How we work** (navy).
   - Eyebrow; h2 "You keep your weekend." / gradient "We keep our word."
   - Grid (mt 40) `minmax(min(100%,420px),1fr)`, column gap `clamp(32px,4vw,72px)`, border-top `rgba(201,211,220,.18)`, holding 5 `NumberedRow`s (dark tone, padding 22px 0):
     1. Show up when we say we will
     2. One company, start to finish
     3. Built to outlast the contract
     4. Permanent, not portable
     5. Honest pricing, no surprises
   - Bodies are verbatim from the reference.
6. **Quote:** `<QuoteSection />`.

## Acceptance
- Matches the reference at 390 and 1440px.
- Existing metadata and any Person/Organization JSON-LD are untouched.
