# PR 12 — Fort Cavazos (military)

**Target:** `redesign/forge` · **Depends on:** 03, 04 · **Size:** M
**Verify:** D8 (7%), D9 (calculator bases), D18 (testimonial, "stacks with" claim, drive times).

## Files
`src/app/(marketing)/military/page.tsx` (≈25 KB today; keep its `metadata`, JSON-LD and OG image), `src/app/(marketing)/military/opengraph-image.tsx` (restyle in PR 13).

## Reference
`reference/Triple J Site.dc.html` → `#/military`, sections `Military · Hero | PCS | Scenarios | Catchment | Timeline | Family`.

## Theme
Forge with olive `#4b5320`, tan `#c5b481` and tan-light `#e2d6ae` accents.
- **Remove** the `data-theme="military"` wrapper and `bg-mil-camo`.
- Eyebrows on light use olive text with the tan rule (`Eyebrow tone="military"`).

## Sections
1. **Hero** (photo `/images/carport-truck-concrete-hero.jpg`, `--scrim-hero-military`, min-height `clamp(580px,52vw,720px)`, bottom padding `clamp(48px,5vw,80px)`, content max 820). No fact strip.
   - Breadcrumb: Home / Military / Fort Cavazos.
   - Badges (gap 8), both 30px pills at 11/700/.18em uppercase:
     - "Fort Cavazos": border `rgba(197,180,129,.6)`, bg `rgba(75,83,32,.45)`, text `#e2d6ae`.
     - "7% military discount honored": border `rgba(255,255,255,.3)`, bg `rgba(255,255,255,.08)`, white.
   - h1 (mt 20): "Fort Cavazos carports." / gradient "Same-week for PCS families."
   - Lede (max 640): verbatim.
   - Buttons: white lg "Get my PCS quote →" and outline "Call 254-346-7764".
   - Eligibility line (mt 18, 14px, 72% white): "Active-duty · Retired · Reserve/Guard · First responders — all eligible."
2. **PCS** (white). Split.
   - Left: eyebrow "Same-week scheduling"; h2 "PCS orders don't wait." / slate "Neither do we."; two lede paragraphs, verbatim.
   - Right: discount panel (radius 12, silver border, fog, overflow hidden).
     - **Header** (olive bg, white, padding 24/26, gap 16):
       - A 60px ring (2px tan border) holding "7%" in Cinzel 900 20.
       - "OFF EVERY INSTALL" (11/700/.2em `#e2d6ae`).
       - h3 "Fort Cavazos military discount" (Cinzel 900 `clamp(20px,.8vw+14px,26px)`).
     - **Body** (padding 24/26/26):
       - Copy (15/1.65 navy), verbatim.
       - **Calculator box** (mt 22, radius 10, silver border, white, padding 18):
         - Label "See what 7% means".
         - Pills Carport · Garage · Barn (selected = olive fill). Bases: 3,000 / 5,500 / 6,500 (D9).
         - Result row: "On a **$3,000** carport base" (14px slate) on the left; Cinzel 900 `clamp(26px,1.2vw+18px,34px)` olive tabular "**$210 back**" on the right. Savings = `Math.round(base × 0.07)`.
         - Fine print (12px slate): "Starting steel + install, before tax. Your 7% applies to the full quoted job."
         - Navy md full-width "Quote this with my discount →": sets the service and military, then scrolls to the quote.
       - Tan `RuleList` (mt 20, 14px):
         - "Welded, bolted and turnkey-with-concrete builds"
         - "RV covers, boat covers and enclosed garages"
         - "Verified by service ID, military email or DD-214"
   - **D18:** verify the "Stacks with whatever else we're running — no fine print, no expiration…" sentence, or drop it.
3. **PCS scenarios** (fog).
   - Eyebrow "PCS scenarios we build for"; h2 "Every PCS season since we opened."
   - Grid `minmax(300px)`, gap 16, of 3 cards: white, radius 12, silver border, **3px olive top border**, padding 26/26/28. Each card: olive micro-label, then title Cinzel 700 20/1.25, then body.
   - Cards (copy verbatim):
     1. Pre-deployment
     2. TDY-friendly
     3. Overseas tour
4. **Catchment** (white).
   - Eyebrow "Where we build"; h2 "Every city in the Cavazos catchment."; lede verbatim.
   - Grid (mt 40) `minmax(min(100%,200px),1fr)`, gap 12, of tiles (radius 12, silver border, fog, padding 20, Cinzel 700 19 + 13px slate):
     - Harker Heights · 10 min from the main gate
     - Nolanville · 12 min
     - Killeen · 15 min
     - Copperas Cove · 20 min
     - **Belton → · 25 min**: white tile with a navy border, links to `/locations/belton`, hover fog.
   - Link other tiles to their `/locations/[slug]` page when one exists. Verify the drive times (D18).
5. **On a military timeline** (navy).
   - Eyebrow (tan text + tan rule) "On a military timeline"; h2 "Quote to keys," / gradient "built around your orders."
   - Grid of 3 cards: `#0c2538`, border `rgba(201,211,220,.2)`, radius 12, padding 26. Each card: numeral Cinzel 900 44/1 tan, title Cinzel 700 20 (mt 14), body 15/1.65 at 75% white.
   - Cards (copy verbatim):
     1. Same-day callback
     2. Site visit or video walk-through
     3. Build week around your orders
6. **Hablamos español** (fog). Split, center.
   - Left: eyebrow "Hablamos español"; h2 compact (`clamp(26px,2.2vw+12px,44px)`/1.1) "A bilingual crew for a multilingual post."; body verbatim.
   - Right: `<figure>` (white, radius 12, silver border, padding `clamp(24px,2.4vw,40px)`):
     - Olive label "From a Fort Cavazos family".
     - `<blockquote>` in Cinzel 700 `clamp(20px,1vw+14px,26px)`/1.35.
     - Caption (12/600/.18em uppercase slate): "PCS truck cover · Killeen, TX".
     - **D18: the quote must be a real customer review from `testimonials.md`.** If none exists, hide the figure. Never ship a placeholder testimonial.
7. **Quote:** `<QuoteSection initialMilitary />` with the military lede.

## Acceptance
- Matches the reference at 390 and 1440px.
- Calculator values are correct and tabular.
- The quote form arrives with the discount box pre-checked.
- No camo or `data-theme` remains on the page.
