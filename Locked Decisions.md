# Locked Decisions — Current State

**What is true right now.** Every line cites the `Decisions.md` date that last set it.

When a decision reverses: append a row to `Decisions.md` (the ledger is append-only, never edited) **and overwrite the affected line here, in the same turn**. Those two writes are the whole protocol. If they disagree, this file is wrong and `Decisions.md` wins — the most recent row for a topic is authoritative.

Do not copy anything from this file into `AGENTS.md`. That duplication is what produced four months of silent drift.

---

## Product

- **Timeline:** "**same-week**", never say "48-hour build". 48 hrs = materials arrival, not build time. Saying otherwise is misleading. (2026-04-15)
- **Frame:** "**welded or bolted**" everywhere. Triple J does both. Never "custom welded" alone. (2026-04-15)
- **Concrete spec:** **3,000 PSI is standard. 4,000 PSI is on request only** — never promised as the default. (2026-05-01 — **REVERSES** the 2026-04-15 lock that made 4,000 PSI a headline differentiator.) Confirmed by Julian 2026-09-06 and now true of the shipped site: all 22 occurrences rewritten, and `scripts/check-vault.mjs` enforces it with no exceptions.
- **Services** include lean-to patios and house additions alongside carports, garages, barns, RV/boat covers, equipment covers, metal porches, ranch structures, barndominiums.
- **Tagline:** "Built right, built fast, built by Triple J." (2026-04-15)
- **Fonts:** Barlow Condensed (headlines) + Inter (body). Geist removed. Barlow is scoped to marketing only — not HQ. (2026-04-24)
- **Design:** WolfSteel-inspired. No dark mode on the public site.
- **TrustBar stats:** Zero Subcontractors · Welded or Bolted · Same-Week · Temple TX.
- **Testimonials:** auto-scroll marquee, CSS `@keyframes`, pause-on-hover, `'use client'`. **`REVIEWS` is empty and the section renders nothing** — the six invented "Verified Project" quotes were removed 2026-09-07. Real reviews only: fill `testimonials.md`, paste them in, and the section returns on its own. Never re-add a `rating` without a real review behind it.
- **Lead form:** multi-step — ZIP → service + type + dimensions → concrete + timeline + military.
- **Interactive brand token in HQ** is `--brand-fg`; Lucide `strokeWidth={2}` is the HQ default. (2026-04-24)
- **Steel color names:** no vendor-specific color names in customer copy. (2026-04-26)
- **`/service-areas` is dead** — 301 → `/locations`. (2026-04-26)
- **County location pages are dead** — all eight 301 → their strongest member city, or `/locations` where
  there is none. Removed from `LOCATIONS`, so they are out of the sitemap and the routing table.
  `/locations` lists counties as plain text derived from `LOCATIONS[slug].county`. (2026-09-07)
- **No `FAQPage` markup** — Google retired the FAQ rich result 2026-05-07. Visible Q&A stays; the JSON-LD
  does not. (2026-09-07)
- **Every route family renders its own OG card** via `src/lib/og-card.tsx` + `opengraph-image.tsx`.
  `/og-default.jpg` is the fallback, not the default. (2026-09-07)
- **No `AggregateRating` or `Review` JSON-LD anywhere** — and none may be added while the GBP is unverified.
  Google treats reviews an entity controls about itself as ineligible regardless. (2026-09-07)

## Pricing

- **Public pricing is ALLOWED** on the website, ads, blog, `llms.txt`, and email. (2026-04-30 — **REVERSES** the earlier no-public-pricing rule)
  - Carve-out: Facebook **group** posts stay quote-based, not price-led.
- **Sheet prices are steel + install ONLY.** Concrete is always a separately-priced add-on. Never attach a sheet price to the word "turnkey". (2026-05-02)
- **"Turnkey" is a real offering** — site prep + concrete + structure on a single contract. Use the word freely when **no specific price is attached to it**. Stripping it entirely was an over-correction and was reverted. (2026-05-02)
- **Welded = bolted total × 1.10.** Replaces the old flat +$600 surcharge, which overcharged small builds and undercharged large ones. Quotes given before 2026-05-02 are honored at +$600. (2026-05-02)
- **Never publish per-sqft concrete pricing.** Internal/competitive intel — quote it by DM or call only. (2026-05-02)
- **2026 price raise:** +13–15% across the board, effective 2026-05-01. (2026-04-30)
- **Anchors** (steel + install, bolted, before tax): 20×20 carport **$3,000** · 25×25 carport **$4,000** · 30×30 garage **$5,500** · 20×40 RV/boat cover **$6,500** · 40×100 commercial/ranch **$29,500**. Walls $70/LF of perimeter.
- **Canonical price sheet:** `dev/sales-pack-2026-04-30.md`. **Do not improvise prices.** If a figure isn't in the sheet, ask.

## Positioning

- **Supplier-agnostic.** Never name a specific steel supplier in the vault, in customer copy, or in AI-facing files. Multi-source by design; purchase orders and invoices are the system of record. (2026-04-23)
- **Zero subcontractors** — owner-operated welders only.
- **Bilingual team** — Juan and Freddy in Spanish, Julian in English. Spanish-language listing variants are live in the sales pack. **Not an uncontested differentiator:** Polo's Carports (Waco) runs a full English/Español site and serves Temple, Belton, and Killeen. State it as a Triple J strength, never as something competitors lack. (2026-09-06)
- **Welded or bolted** is a differentiator **against national kit dealers only.** At least four local operators weld — Central Texas Metal Buildings, Polo's, Laneways, and Hill Country Mobile Welding (which covers Georgetown and Round Rock). Do not claim local competitors cannot weld. (2026-09-06)
- **Competitor lead times are 2–8 weeks**, not "4–16". Verified Sept 2026: Get Carports 4–8, Dayton 4–8, Mayberry 4–6, Cardinal 2–4. Same-week still wins; use the defensible number. (2026-09-06)
- **Canonical competitor roster:** `research/competitors/roster-2026-09.md`. `src/lib/competitors.ts` is the publishable subset, not a second source of truth. (2026-09-06)

## HQ automation

- **Scheduled jobs record every run** to `public.cron_runs` via `withCronRun()` in `src/lib/cron.ts`. That ledger is the only source of "when did this last run / has it gone quiet". Job registry and schedules: `Connectors.md`. (2026-09-07)
- **Nudge cadence: at most ONE push per entity, ever** — `leads.nudged_at`, `quotes.stall_nudged_at`. The push says "you haven't seen this yet"; `NeedsAttentionFeed` stays the durable list. Do not add a re-nag interval. (2026-09-07)
- **Quote staleness is measured from `sent_at`**, never `created_at`. `QUOTE_STALL_HOURS = 72`, beside `COLD_THRESHOLD_HOURS = 12`. Unknown `sent_at` means never stale. (2026-09-07)
- **ZIP geography is a layer *under* the service-area map, never a replacement.** `src/lib/zip.ts` +
  `src/lib/data/zip-geo.json` (4,188 ZIPs across TX/OK/LA/NM/AR, U.S. Census public domain, regenerated by
  `scripts/build-zip-data.mjs`) answers "where is this ZIP and how far is it". `cityFromZip()` remains the
  **only** thing that may populate `leads.city`. Distance is **straight-line, not drive time** —
  `driveMinutes` is a reserved seam and is null everywhere. "Out of area" is shown only past the `outside`
  band (>60 mi), never merely because a ZIP is absent from the curated list. Bearings are computed but
  **not displayed** until `SHOP_ORIGIN` is a surveyed shop coordinate rather than Temple's city point.
  (2026-09-07)
- **ZIP -> city has one owner:** `ZIP_TO_CITY` / `cityFromZip()` in `src/lib/locations.ts`, built from `LOCATIONS`. Never hand-maintain a second map in a route. An unrecognised ZIP resolves to **NULL**, never to the ZIP itself -- `leads.city` is a city name or NULL. Display uses `formatCityOrZip()` ("ZIP 76577"). County surfaces (`name === county`) are excluded from the map -- they carry a city's ZIP (`bell-county` holds Belton's 76513), so including them files Belton leads under "Bell County". Any remaining duplicate ZIP throws at module load. (2026-09-07)

## On hold / descoped

- **Stripe — descoped.** Listed as "phase 4" since 2026-04-13 but never had a dependency, an env var, or a line of code. QuickBooks is the money rail. Revisit only if customer card payment is actually requested. (2026-09-06)
- **ClickUp CRM** — on hold; revisit after live leads validate volume.
- **Native iOS app** — deferred; invest in PWA performance instead. (2026-04-25)
- ~~Migrations 014–020 proposed, not applied~~ — **wrong, corrected 2026-09-06.** All 24 migrations are applied. Verified against `supabase_migrations.schema_migrations`, which is the authoritative record; the vault never was. Run `node scripts/check-migrations.mjs` rather than trusting any file, including this one.
- **CSS-only `SwipeActions`** — deferred. (2026-04-25)

---

## Outstanding

Known gaps between what is locked above and what is actually shipped. `scripts/check-vault.mjs`
reports these on every run. Delete an entry the moment it is closed.

- **The bilingual comparison row on the live site is factually wrong** (found 2026-09-06).
  `LOCAL_ROUNDUP_COMPARISON_ROWS` in `src/lib/competitors.ts` marks "Hablamos Español" as a Triple J-only `yes`.
  Polo's Carports & Metal Buildings serves Temple/Belton/Killeen with a full Spanish site. This is a public
  claim about named competitors. **Highest-priority correction in this list.**

- **The fourteen thin location pages** (found 2026-09-07). Six cities carry landmarks, callouts and
  `topServices`; `salado`, `lampasas`, `holland`, `taylor`, `troy` and `nolanville` carry 28–36 lines of data
  and none of the three, and every city page still shares the same 6-photo gallery strip. The eight county
  pages in the same tier were 301'd away on 2026-09-07; **these six were kept and still need filling.**
  Needs real local knowledge from Julian — landmarks and neighborhoods must not be invented.

- **`Temple Steel Buildings` in `src/lib/competitors.ts` cannot be verified** (found 2026-09-06). No website,
  listing, or trace of the operator or of "Brice Evans" was found. It renders on
  `/best-metal-carport-builders-temple-tx`, whose credibility rests on every competitor claim being publicly
  verifiable. **Remove or re-source.**

- **Google Business Profile is not verified** (found 2026-09-06). `SITE.social.google` is `""`. This blocks the
  local 3-pack — the one search surface national kit dealers cannot occupy without a local address — and blocks
  the review-count gap from ever closing. Highest-leverage unfinished item in local SEO.
