# Stock Images Needed — Location Pages

Sourcing checklist for the city landmark + hero photos. Drop final files into `/public/images/locations/{city-slug}/` and update the matching `heroImage` / `landmarks[].imageSrc` paths in `src/lib/locations.ts`.

**Aspect ratios**
- **Hero image** → wide / cinematic. Page renders it full-bleed under a black-to-brand-blue gradient at `opacity: 0.55`, so high-contrast scenes with detail in the lower-third work best. Recommend ~2400×1200 (2:1) or wider.
- **Landmark card** → 4:3, ~1200×900. The card already darkens the bottom 30% with a black-to-transparent gradient, so don't pick photos with critical detail in the lower-third (it'll be obscured by the title block).

**Sources**
- [Unsplash](https://unsplash.com) — first stop. Free, high-quality, large library for Texas landmarks.
- [Pexels](https://pexels.com) — second stop, often has the regional stuff Unsplash misses (small-town Texas, ranch land).
- [Wikimedia Commons](https://commons.wikimedia.org) — for specific Texas landmarks (courthouses, historic depots, university buildings) where editorial credit is acceptable.
- Avoid AI-generated stock — algorithm-detectable and breaks trust on a "we're a real local crew" site.

**Licensing note** — both Unsplash and Pexels licenses are commercial-use friendly with no attribution required, but always confirm the specific photo's license before downloading.

---

## Round Rock — `/locations/round-rock`

**Folder:** `/public/images/locations/round-rock/`

| # | Slot | Filename suggestion | Search terms | Notes |
|---|------|--------------------|--------------|-------|
| 1 | Hero | `round-rock-hero.jpg` | "round rock texas skyline", "round rock dell campus aerial", "williamson county texas suburb" | Wide cinematic shot. Suburban-tech vibe. Currently using `carport-truck-concrete-hero.jpg` as placeholder. |
| 2 | Landmark — Old Settlers Park | `old-settlers-park.jpg` | "old settlers park round rock", "youth baseball complex texas", "sports park aerial texas" | Big green field / pavilion / event grounds reads correctly. |
| 3 | Landmark — Dell Diamond | `dell-diamond.jpg` | "dell diamond round rock", "round rock express stadium", "minor league baseball stadium texas" | Stadium exterior or wide field shot. |
| 4 | Landmark — Round Rock Premium Outlets | `premium-outlets.jpg` | "round rock premium outlets", "outlet mall texas", "shopping center sh-45 texas" | Storefront or aerial. |

---

## Georgetown — `/locations/georgetown`

**Folder:** `/public/images/locations/georgetown/`

| # | Slot | Filename suggestion | Search terms | Notes |
|---|------|--------------------|--------------|-------|
| 1 | Hero | `georgetown-hero.jpg` | "san gabriel river georgetown", "georgetown texas downtown square", "sun city texas aerial" | River shot is the strongest visual — connects to the foundations-engineering angle in copy. Currently using `porch-cover-lean-to.jpg` as placeholder. |
| 2 | Landmark — San Gabriel River | `san-gabriel-river.jpg` | "san gabriel river texas", "georgetown river park", "blue hole georgetown" | Clear river / limestone bank shot. |
| 3 | Landmark — Sun City | `sun-city.jpg` | "sun city texas georgetown", "55 plus community texas", "active adult community aerial" | Aerial of the development, golf-cart paths, or community clubhouse — anything that signals "retirement community." |
| 4 | Landmark — Southwestern University | `southwestern-university.jpg` | "southwestern university georgetown", "cullen building texas", "historic university building texas" | Cullen Building (the iconic limestone tower) is the obvious shot. |

---

## Waco — `/locations/waco`

**Folder:** `/public/images/locations/waco/`

| # | Slot | Filename suggestion | Search terms | Notes |
|---|------|--------------------|--------------|-------|
| 1 | Hero | `waco-hero.jpg` | "waco texas skyline", "alico building waco", "lake waco aerial", "magnolia silos waco" | Either a Waco skyline or the silos work. Currently using `carport-concrete-rural.jpg` as placeholder. |
| 2 | Landmark — Magnolia Market & Silos | `magnolia-silos.jpg` | "magnolia silos waco", "magnolia market", "waco silos chip joanna" | Iconic silos shot. |
| 3 | Landmark — Lake Waco | `lake-waco.jpg` | "lake waco texas", "lake waco shoreline", "waco lake sunset" | Shoreline or open-water shot. |
| 4 | Landmark — Baylor University | `baylor-university.jpg` | "baylor university waco", "pat neff hall baylor", "baylor campus" | Pat Neff Hall (the dome) is the marquee shot. McLane Stadium also works. |

---

## Temple — `/locations/temple` *(already live, photo upgrade pending)*

**Folder:** `/public/images/locations/temple/`

| # | Slot | Filename suggestion | Search terms | Notes |
|---|------|--------------------|--------------|-------|
| 1 | Hero | `temple-hero.jpg` | "lake belton texas", "temple texas skyline", "central texas lake aerial" | Lake Belton is the strongest emotional hook. Currently using `carport-gable-residential.jpg` as placeholder. |
| 2 | Landmark — Lake Belton | `lake-belton.jpg` | "lake belton texas", "belton lake shoreline", "central texas reservoir" | Open water + shoreline. |
| 3 | Landmark — Santa Fe Depot | `santa-fe-depot.jpg` | "santa fe depot temple texas", "1910 train depot texas", "historic train station central texas" | Historic depot exterior. |
| 4 | Landmark — Scott & White | `scott-and-white.jpg` | "baylor scott and white temple", "modern hospital exterior texas", "medical center campus aerial" | Hospital exterior. |

---

## Belton — `/locations/belton` *(already live, photo upgrade pending)*

**Folder:** `/public/images/locations/belton/`

| # | Slot | Filename suggestion | Search terms | Notes |
|---|------|--------------------|--------------|-------|
| 1 | Hero | `belton-hero.jpg` | "bell county courthouse belton", "downtown belton texas", "1885 limestone courthouse texas" | Courthouse is the brand-perfect shot here. Currently using `double-carport-install.jpg` as placeholder. |
| 2 | Landmark — Bell County Courthouse | `bell-county-courthouse.jpg` | "bell county courthouse", "belton texas courthouse", "1885 limestone courthouse" | Same as above — symmetrical limestone facade. |
| 3 | Landmark — Lake Belton & BLORA | `lake-belton-blora.jpg` | "lake belton blora", "belton lake recreation area", "central texas lake army" | Lakeside / dock / recreation area. |
| 4 | Landmark — Pendleton & Ranch Country | `pendleton-ranch.jpg` | "pendleton texas ranch", "central texas pasture", "rural bell county", "texas hay field" | Pasture / fence line / cattle / barn — generic Texas ranch reads correctly. |

---

## Killeen — `/locations/killeen` *(already live, photo upgrade pending)*

**Folder:** `/public/images/locations/killeen/`

| # | Slot | Filename suggestion | Search terms | Notes |
|---|------|--------------------|--------------|-------|
| 1 | Hero | `killeen-hero.jpg` | "fort hood gate", "fort cavazos main gate", "army base entrance texas" | Fort Cavazos signals the military-PCS angle immediately. Currently using `red-iron-frame-hero.jpg` as placeholder. |
| 2 | Landmark — Fort Cavazos | `fort-cavazos.jpg` | "fort hood texas", "fort cavazos sign", "us army base gate" | Gate or base sign. |
| 3 | Landmark — Stillhouse Hollow Lake | `stillhouse-hollow.jpg` | "stillhouse hollow lake", "central texas lake marina", "stillhouse hollow boat ramp" | Marina or open water. |

---

## Cities currently *without* landmarks/hero (lower priority — pages still render fine on the fallback hero, but each could be upgraded to the Temple-grade template later)

These pages currently use the fallback `red-iron-frame-hero.jpg` and skip the landmark grid entirely. If/when you want to flesh them out the same way, here's where to start:

- **Harker Heights** — Stillhouse Hollow Lake, Killeen-Fort Hood Regional Airport, Fort Cavazos
- **Copperas Cove** — Fort Cavazos back gate, Hill Country edge / FM 116, downtown Cove
- **Salado** — Salado Creek, historic Stagecoach Inn, downtown Salado limestone storefronts
- **Lampasas** — Hancock Springs Park, Hill Country pasture, Colorado River
- **Holland** — small-town Texas grain elevator, Elm Creek bottomland
- **Taylor** — historic downtown Taylor, Samsung fab construction site (signals new growth), SH-95 corridor
- **Troy** — Little River, rural FM-road farmland
- **Nolanville** — Sparta Road, Bell County corridor between Temple and Killeen

These don't need photos until the city's `locations.ts` entry has `heroImage` + `landmarks` populated — but the search terms above are the right starting set when you do.

---

## After downloading

1. Resize hero images to ~2400px wide max (jpg, quality 80–85). Resize landmarks to ~1200×900.
2. Drop into `/public/images/locations/{city-slug}/` matching the filename column above.
3. Open `src/lib/locations.ts` and update each city's `heroImage` plus each `landmarks[].imageSrc`. Alt text is already populated and accurate — just attach the file path.
4. Optionally, replace the `// imageSrc TODO:` comment lines with the actual `imageSrc:` keys.
5. Push to `main`. Vercel rebuilds, photos go live.
