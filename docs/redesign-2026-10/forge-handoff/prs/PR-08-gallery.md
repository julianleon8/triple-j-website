# PR 08 — Gallery + lightbox

**Target:** `redesign/forge` · **Depends on:** 03, 04 · **Size:** M

## Files
`src/app/(marketing)/gallery/page.tsx`, `src/app/(marketing)/gallery/[id]/page.tsx` (restyle only), `src/lib/gallery-filters.ts` (keep as the source of truth for filters).

## Reference
`reference/Triple J Site.dc.html` → `#/gallery` (`Gallery · Header`, `Gallery · Grid`) and the lightbox at the bottom of the template.

## Sections
1. **Header** (navy band, no photo).
   - Padding: `clamp(24px,3vw,40px) 0 clamp(48px,5vw,72px)`.
   - Breadcrumb: Home / Company / Gallery.
   - Row (mt `clamp(32px,4vw,56px)`, flex wrap, `align-items: flex-end`, `space-between`, gap 24px 40px):
     - Left (max 760): eyebrow "The Triple J portfolio"; h1 "Built here." / gradient "Built for you."; lede (max 600): "Central Texas projects, from backyard patios to garages and ranch structures. Every one is a Triple J crew job — tap a build to see it up close."
     - Right: white lg "Plan Your Build →", which scrolls to `#quote`.
2. **Grid** (fog, padding `28px 0 clamp(64px,7vw,104px)`).
   - **Filters.** `<nav aria-label="Filter by building type">`, wrapping flex, gap 8.
     - Each filter is a button: 44px tall, padding 0 16, radius 6, 14/600. Its count follows the label (12/600 tabular; steel, or `#9fb0c0` when selected). Selected: navy bg, white text. Transition 250ms.
     - **Use the filter set from `gallery-filters.ts`** (All builds, Carports, Garages, Barns, RV covers, Patios & porches, Custom builds, plus Fencing if it has items). The mock's labels are only illustrative. Hide any filter with 0 items.
     - Sync the selected filter to `?type=` so it can be linked.
   - **Count line** (mt 20, 14px slate): "{n} project(s) · {filter label}".
   - **Grid** (mt 16): `auto-fill minmax(min(100%,300px),1fr)`, gap 20, of `BuildCard variant="gallery"`.
     - Card: 4:3 image. Caption padding 16/18/18: "TYPE · CITY" and the title in Cinzel 700 19, with "View →" (13/600 slate) on the right.
     - Hover: border steel + `--shadow-card-hover`, 300ms.
   - **CTA strip** (mt 48): radius 12, silver border, white, padding 24, wrapping flex `space-between`, gap 16px 24px.
     - Text (15px slate): "New photos are added as our projects take shape. Don't see your build? We probably still build it."
     - Button: navy md "Get a Free Quote →".
3. **Quote:** `<QuoteSection />` (default lede).

## Lightbox (`ForgeLightbox`)
- **Opening.** Every card is an `<a href="/gallery/[id]">` (crawlable). A click calls `preventDefault` and opens the lightbox at that item. The `/gallery/[id]` pages stay and get the Forge styling.
- **Layout.**
  - Overlay: fixed, `rgba(0,12,22,.94)`, column flex.
  - Top bar (padding 14px 20px): counter "{i} / {n}" (13/600/.2em `#9fb0c0`, tabular) and a 44px close button.
  - Middle: 44px round prev/next buttons (bg `rgba(0,24,42,.6)`, border `rgba(255,255,255,.3)`) around the image (`max-width: min(1100px, 100% - 112px)`, `max-height: calc(100vh - 210px)`, contain, radius 8, `--shadow-lightbox`).
  - Bottom (max 1140, padding 18/20/24, wrapping flex `space-between`):
    - "TYPE · CITY" (11/600/.2em `#9fb0c0`) above the title (Cinzel 700 `clamp(20px,2.4vw,28px)`).
    - White md "Quote a build like this →".
- **Behavior.**
  - Clicking the backdrop closes it. Esc closes. ←/→ cycle through the **filtered** list.
  - Focus is trapped inside, scroll is locked, and focus returns to the card on close.
- **"Quote a build like this".** Close, map the item type to a quote service, then scroll to `#quote` on the same page:

  | Item type | Quote service |
  |---|---|
  | Carport, RV cover | carport |
  | Patio, lean-to, porch | lean_to |
  | Enclosed, garage | garage |
  | Barn, equipment | barn |
  | Commercial, other | other |
  | Fencing | fencing |

## Acceptance
- Filters, counts and the lightbox work with live `gallery_items`.
- `/gallery/[id]` is still reachable and indexed.
- Matches the reference at 390 and 1440px.
- The lightbox passes axe (dialog role, label, focus trap).
