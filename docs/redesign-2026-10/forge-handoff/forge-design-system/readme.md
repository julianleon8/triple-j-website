# Forge — Triple J Metal design system

**Forge** is the 2026-10 visual language of the Triple J Metal public site: Cinzel headlines that read like letters stamped into a steel plate, the lion logo's navy with a range of steel grays, thin metal-rule dividers, and real jobsite photography under navy scrims. It replaces the Barlow Condensed / royal-blue "magazine" system on the public site (and, per the locked scope, later in HQ, customer emails, the quote PDF and OG cards).

- **Brand:** Triple J Metal (legal: Triple J Metal LLC, footer © and legal copy only). Family-owned, Temple, TX. Juan, Julian and Jose Alfredo "Freddy".
- **Tagline (locked):** "Built right, built fast, built by Triple J."
- **Phone:** 254-346-7764 · **Shop:** 3319 Tem-Bel Ln, Temple, TX 76502 · **Hours:** Mon–Sat · 8am–6pm · **Email:** julianleon@triplejmetaltx.com

## Sources
- Repo: `julianleon8/triple-j-website` — `main` (production) and `claude/focused-gates-iu172r` (redesign docs). Token owner in code: `src/app/globals.css`. Product truth: `Locked Decisions.md`.
- Approved hero reference: `docs/redesign-2026-10/hero-mockup.html` (branch `claude/focused-gates-iu172r`).
- Design files (this project): `Triple J Site.dc.html` (every inner page), `Homepage Final Scroll.dc.html` (homepage). Every value in this folder is lifted from those files verbatim.
- Decisions behind the look (`Decisions.md`, 2026-10-01): Cinzel Black chosen to match the lion logo's "TRIPLE J" lettering; navy/slate/silver replaces royal blue; no red accent; light sections alternate with full-width navy bands; brushed-steel gradient on the accent line.

## Index
```
styles.css                 ← entry point (@import list only)
tokens/                    ← fonts, colors, typography, layout, effects, motion
integration/               ← tailwind-v4-globals-snippet.css (paste into the repo in PR 1)
assets/logo-lion.png       ← the brand mark (chrome lion). Never use logo-full.jpg (retired "Metal Buildings" name)
assets/textures/           ← footer textures (brushed steel = default; corrugated panel = alternate)
assets/photos/             ← two sample jobsite photos for specimen cards
guidelines/                ← specimen cards for the Design System tab
SKILL.md                   ← Agent Skill manifest
```

---

## Content fundamentals

**Voice.** A Temple contractor talking across the tailgate: plain, specific, a little dry. Confident about the work, careful about promises. Every claim that depends on the site is hedged in the same breath ("confirmed for your design and site", "Dates are confirmed after scope, materials, site readiness and approvals are reviewed").

**Person.** "We" for Triple J, "you" for the customer. Names do the trust work: "Julian or Juan will text you", "Juan and Freddy run quotes in Spanish".

**Casing.**
- Headlines: **sentence case** in Cinzel. Never `text-transform: uppercase` — Cinzel's lowercase are already small caps, like the logo.
- Two-line headlines: line 1 states, line 2 answers ("Tell us about / your build.", "No kits. No subs. / No hand-offs."). Line 2 is slate `#546678` on light, brushed-steel gradient on navy or photo.
- Eyebrows, micro-labels, footer column heads: UPPERCASE Inter with wide tracking.
- Buttons: Title Case ("Get a Free Quote", "Send a Partner Inquiry", "Quote this").

**Recurring phrases (verbatim).** "Welded or bolted." · "No kits. No subs." · "One crew. One contract." · "A real Texas crew on the other end — not a form into a black hole." · "You keep your weekend. We keep our word." · "Same-week" (never "48-hour") · "Hablamos español con Juan y Freddy." · "Free · no obligation · reply within 24 hours."

**Numbers.** Tabular figures for phone numbers, prices and counts. Prices always carry their basis: "From $3,000 · 20×20 flat roof · 10 ft · steel + install, before tax". Dimensions use × ("20×20", "W × L × H"). Concrete: "3,000 PSI standard · 4,000 PSI on request" — never 4,000 as the default. Steel: "14-gauge standard"; the upgrade is the **heavy-duty upgrade: 11-gauge columns, welded to receivers & purlins** (not "12-gauge storm upgrade", not full-frame 11-gauge).

**Punctuation devices.** `·` separates facts in a line. `→` ends forward CTAs and links; `←` only on "Back". Em dashes for the second clause. `✓` marks selected/confirmed states.

**Emoji.** None. (The old ⚡ "Same-Week Installs" badge is retired with the top bar.)

---

## Visual foundations

**Vibe.** Engraved, not shouted. Heritage serif headlines over navy and steel, real red-iron photography supplying the only warmth. Restrained surfaces, thin rules, very few shadows.

**Color.** Navy `#00182a` is the ink, the dark band and the primary button on light. Slate `#546678` carries secondary text. Steel `#788a9c` is for numerals, rules and placeholders. Silver `#c9d3dc` is every light-surface border and the eyebrow color on navy. Mist `#e3e9ee` and fog `#f4f6f8` are hairlines and off-white bands. **No red anywhere.** No royal blue — one pending exception: the "Related" link buttons on service pages (`#1e6bd6`, hover `#1851b5`), requested by the owner 2026-10-02. Fort Cavazos page adds olive `#4b5320` and tan `#c5b481`.

**Bands.** Light (white or fog) sections alternate with full-width navy bands. Homepage: Hero navy → Builds white → Services navy → Quote fog → Footer navy. Inner pages follow the same rhythm (e.g. service page: hero navy/photo → options white → included fog → builds white → specs navy → FAQ white → related fog → quote fog → footer navy). Long copy and every form sit on light.

**Type.** Cinzel 900 for h1/h2 and the wordmark; Cinzel 700 for h3, card titles, numerals, FAQ questions, tab labels and fact values. Inter 400 body, 500 nav, 600 buttons/links/eyebrows, 700 micro-labels. Letter-spacing on Cinzel: `.01em`. Display line-heights 1.02–1.05.

**Eyebrow.** 12px Inter 600, `.22em`, uppercase, slate on light / silver on navy, preceded by a 32×2px rule fading transparent → steel (48px on the homepage hero; mirrored after the label when centered; tan on the military page).

**Imagery.** Real Triple J jobs only — finished carports, red-iron frames, ranch fencing, Temple/Belton landmarks. Bright Texas daylight, no filters, no b&w. Heroes sit under a navy scrim (radial on the homepage, 100° linear on inner pages, olive-tinted on military). Photo cards use a bottom-up navy scrim. Never stock illustration; when a photo is missing the design shows a striped placeholder — production ships a real photo or omits the slot.

**Backgrounds & texture.** The footer carries a full-bleed steel texture at 55% opacity under a navy top-down scrim. No dot grids, no glows, no camo tile (the old military camo is retired).

**Glass & blur.** Only on navy/photo: the hero fact strip (`rgba(0,24,42,.78)` + 6px blur), the Latest builds ticker (`.72` + 6px), the mobile call bar (`.95` + 8px). Never on light surfaces.

**Cards.** 12px radius, 1px silver border, white (or fog/`#0c2538` on navy), **no shadow at rest**. Hover on clickable build cards: border → steel, shadow `0 18px 36px -20px rgba(0,24,42,.4)`. The form card is the one lifted surface: `0 24px 48px -24px rgba(0,24,42,.3)`. Numbered cards show a Cinzel "01" in steel with a hairline running to the right edge. Military scenario cards get a 3px olive top border.

**Radii.** 6px buttons/inputs/pills · 8px icon buttons and checkbox rows · 10px option tabs and photo chips · 12px cards · 9999px chips, FAQ toggles, progress bars.

**Borders.** Light: `#c9d3dc` for components, `#e3e9ee` for internal dividers. Navy: `rgba(201,211,220, .12/.16/.18/.22)` from faint to strong; white outline controls `rgba(255,255,255,.3)` / `.4`.

**Hover & press.** White button → bg silver `#c9d3dc`. Navy button → `#0c2538`. Outline-on-photo → border white + `rgba(255,255,255,.08)` fill. Text links have a 1px silver underline that darkens to navy. Nav links brighten from 86% white to white; the active page shows a 2px silver underline. Rows wash to fog. No scale-on-press, no bounce.

**Motion.** One curve: `cubic-bezier(.22,1,.36,1)`. Scroll reveals fade + rise 16px over 600ms, once. Cards stagger 90ms. Header hides on scroll-down (after 140px, >6px delta) and returns on scroll-up over 350ms; never hides while a menu is open. Page change fades + rises 10px over 500ms. Homepage hero: headline lines slide up from a mask as you scroll through a pinned hero; the ticker drifts at 40px/s and speeds up with scroll velocity. `prefers-reduced-motion` turns all of it off.

**Layout.** Container 1360px, gutters `clamp(20px,3vw,40px)`, sections `clamp(64px,7vw,104px)` top and bottom. Two-column splits use `repeat(auto-fit, minmax(min(100%,420px),1fr))` so they stack without breakpoints. Card grids `minmax(min(100%,300px),1fr)` with 16px gaps. Sticky header; fixed mobile call bar under 900px with content padding to clear it.

---

## Iconography

- **Inline SVG**, 24×24 viewBox, `stroke: currentColor`, `stroke-width: 2`, round caps and joins, rendered at 14–20px. Matches the repo's `src/components/ui/icons.tsx` set: Phone, Menu, Close, ArrowRight, Pin, Clock, Instagram, Facebook.
- **New in Forge:** ChevronDown (Services mega-menu trigger, rotates 180° open), ArrowLeft (lightbox / carousel previous), Mail (contact row). Use Lucide `chevron-down`, `arrow-left`, `mail` — same stroke geometry.
- **Unicode as icons:** `→` on CTAs (colored slate `#546678` inside white buttons), `←` Back, `✓` selected/confirmed, `+`/`−` FAQ toggles and county chips, `·` separators, `/` breadcrumb separators in steel.
- **Logo:** `assets/logo-lion.png` (44px desktop header, 38px mobile, 56px footer) + "Triple J Metal" set in Cinzel 900 white. Never re-typeset in another face; never `logo-full.jpg`.
- No icon font, no emoji, no PNG icons outside the PWA set.

---

## Components (inventory + exact specs)

The production implementation lives in the repo (Next.js + Tailwind). These are the canonical specs; `guidelines/components-*.html` render them.

**Buttons** — Inter 600, radius 6px, `gap: 8px`, trailing `→` (`aria-hidden`).
| Variant | Surface | Spec |
|---|---|---|
| White (primary on navy/photo) | navy, photo | bg `#fff`, text navy, arrow slate; hover bg `#c9d3dc` |
| Navy (primary on light) | light | bg `#00182a`, text white; hover `#0c2538` |
| Outline-on-dark | navy, photo | 1px `rgba(255,255,255,.4)`, text white; hover border white + `rgba(255,255,255,.08)` |
| Outline-on-light | light | 1px `#c9d3dc`, bg white, text navy (or slate for Back); hover border navy |
| Link accent (Related only) | fog | bg `#1e6bd6`, white, `0 1px 2px rgba(0,0,0,.08)`; hover `#1851b5` |
Sizes: **lg** padding 15px 26px / 16px · **md** 13px 20px / 15px · **sm** 11px 18px / 14px (header CTA) · **tap** height 44px, padding 0 16–18px / 14px. Full-width in forms and mobile menu.

**Icon button** — 44×44 (42 on homepage mock), radius 8px, 1px `rgba(255,255,255,.3)`, white glyph 18–20px. Lightbox/carousel arrows: 44px circle, bg `rgba(0,24,42,.6)`; light-surface variant 44×44, 1px silver, radius 6px.

**Eyebrow** — see Visual foundations. **Section heading** = eyebrow + h2 (`margin-top 16px`) + optional lede (`margin-top 16px`, max-width 520–640px).

**Header** — sticky, navy, bottom border `rgba(201,211,220,.16)`; homepage starts transparent over the hero and turns navy after 40px of scroll. Height 84/72. Left: lion + wordmark (gap 12px). Center nav: 15px Inter 500, `rgba(255,255,255,.86)`, gap `clamp(18px,2vw,30px)`, active = 2px silver underline. Right: phone (16px icon + tabular number, shown ≥1180px) and white sm CTA. Mobile: call + menu icon buttons.

**Mega menu (Services ▾)** — opens on hover or click, panel full-width navy with `--shadow-mega`, padding 28px gutter 32px, 3 columns `1.3fr .9fr 1fr`: "What we build" (72×54 photo thumb radius 6 + Cinzel 17 title + 13px steel-light sub, row hover `#0c2538`), "Where we build" (bordered rows with →), and a 220px-tall military photo card (olive-tinted scrim, tan eyebrow "Fort Cavazos · 7% off", Cinzel 22 headline).

**Mobile menu** — full-height navy sheet under the header; section labels 11px/700/.2em steel-light; rows Cinzel 700 22px, 14px padding, divider `rgba(201,211,220,.16)`; white lg CTA + outline call button at the bottom.

**Breadcrumb** — 13px silver, `/` separators in steel, current page white.

**Hero (inner page)** — min-height `clamp(560px,50vw,700px)`, photo + `--scrim-hero-page`, content bottom-aligned (max-width 780px): eyebrow → h1 (2 lines, line 2 steel gradient) → lede (max 620px) → white lg + outline lg buttons (gap 12px). **Fact strip** pinned to the bottom: glass, top border `rgba(201,211,220,.2)`, auto-fit `minmax(210px,1fr)` cells with 1px left borders, each: 11px/600/.2em steel-light label → Cinzel 700 19px white value → 13px 72%-white subline.

**Hero (homepage)** — centered, `--scrim-hero-home`, h1 3 lines `--type-hero-home` (line 3 steel gradient), eyebrow with rules both sides, lede max 560px, two CTAs, "Scroll" cue, Latest-builds ticker bar at the bottom (label cell navy with right border slate, items 14px with city in steel).

**Option tabs + detail card** — vertical list of 10px-radius buttons (padding 16px 18px): Cinzel number 14px, Cinzel label 18px, `→`. Selected: bg navy, text white, number steel-light. Detail card: 12px radius, `--shadow-lifted`, 16:10 photo, body padding `clamp(20px,2vw,32px)`: label → Cinzel h3 → body → divider → price (Cinzel 20 tabular) + note (12px slate) and navy md "Quote this →".

**Feature card** — padding 24px 24px 26px, number row ("01" Cinzel 14 steel + hairline), Cinzel 19 title, 15px slate body.

**Build card** — button, radius 12, border silver, 4:3 photo, caption padding 14px 16px 16px: 11px/600/.2em slate "TYPE · CITY", Cinzel 17 title. Gallery variant: Cinzel 19 + "View →" right-aligned.

**Photo card** (service/location tiles) — min-height 280px, photo + `--scrim-photo-card`, padding 22px, Cinzel 900 24px title, 14px sub, 14px/600 silver "Explore … →".

**Spec sheet** — panel on navy: bg `#0c2538`, border `rgba(201,211,220,.22)`, header 11px/700 "SPEC SHEET · {SERVICE}", rows grid `.75fr 1.25fr`, padding 16px 22px, key 13px steel-light, value 15px/600 white, row border `rgba(201,211,220,.12)`, footnote 12px steel-light.

**FAQ accordion** — top border silver; rows: Cinzel 700 `--type-faq-q` question + 34px round toggle (`+`/`−`, 1px silver); answer 15px slate, padding-right 54px. First item open by default; one open at a time.

**Rule list** — 28×2px steel bar + 15px text, gap 12px (24×2 tan on military).

**Chips** — neighborhood chip: 36px pill, 1px silver, white, 14px/500. Linked chip: 1px navy border, 600, hover mist. County toggle chip: 38px pill with `+`/`✓`, selected navy fill.

**Selectable pill** — 42px, radius 6, padding 0 16px, 14px/600; unselected 1px silver/white/navy text; selected navy fill + white (olive on military calculator).

**Inputs** — 46px, radius 6, 1px silver, padding 0 14px, 15px navy, placeholder steel; focus border navy, no glow. Textarea padding 12px 14px, min-height 80–110px, vertical resize. Field label 11px/700/.18em slate uppercase, "(optional)" 500 steel, no tracking. Helper 12px steel.

**Service chip (quote step 1)** — 2-column grid gap 12px; tile radius 10, 2px border (silver → navy when selected, bg → fog), 5:4 photo with bottom scrim, 28px navy ✓ badge top-right when selected, Cinzel 15 label + 11px uppercase steel sublabel.

**Step progress** — "STEP 1 OF 2 · YOUR BUILD" 11px/700/.18em, 3px pill track mist with navy fill (50% / 100%, 500ms ease-out).

**Checkbox row** — radius 8, 1px border, padding 12px 14px, 16px checkbox `accent-color: navy`; checked → border navy, bg fog.

**Success state** — 52px navy circle with ✓, Cinzel 900 h3, 15–16px slate body, summary rows (14px, hairline dividers), outline-on-light reset button.

**Footer** — navy + texture; grid `repeat(auto-fit,minmax(200px,1fr))`, brand column spans 2 on desktop: 56px lion + Cinzel wordmark, tagline 17px/600 white, family line 14px, address + phone with steel icons, 36px social chips. Column heads 12px/600/.2em silver; links 14px, hover white. Bottom bar 12px: © 2026 Triple J Metal LLC · hours · languages.

**Mobile call bar** — sticky bottom under 900px, glass `.95`, 2-column, 48px buttons: white "Call Now" + "English · Español" 10px subline; outline "Free Quote →" (label changes per page).

**Lightbox** — fixed overlay `rgba(0,12,22,.94)`; counter "3 / 9" top-left; close 44px; prev/next 44px circles; image max 1100px, radius 8; caption "TYPE · CITY" + Cinzel title; white "Quote a build like this →". Esc closes, ←/→ navigate.

**Map band** — 12px-radius frame `clamp(320px,36vw,460px)` with Google Maps embed; navy callout bottom-left (radius 10, `--shadow-float-dark`).

### Intentional additions
None beyond the source designs. React primitives are not authored in this folder — the production components are built in the repo (handoff PR 2) against these specs.

## Caveats
- Header heights differ between the two design files (homepage 84/72, inner pages 80/64). Forge standardises on **84/72** from the approved hero mockup.
- Desktop/mobile switch differs (homepage 760px, inner pages 900px). Forge standardises on **900px** (nav needs the room once Services becomes a mega menu); phone number in the header from **1180px**.
- Two footer textures are in play (homepage default = brushed steel; inner pages = corrugated panel). Forge default: **brushed steel**.
