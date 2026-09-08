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
- **Fonts:** Barlow Condensed (headlines) + Inter (body). Geist removed. Barlow is scoped to marketing only — not HQ. (2026-04-24) HQ body text is the iOS system stack, applied as `font-(family-name:--font-ios)` — the `family-name:` prefix is required, because Tailwind v4 reads the bare `font-()` shorthand as font-weight and that silently left HQ on Inter from the day the class was written. (fix 2026-09-07)
- **Design:** Industrial charcoal/white/steel-blue identity; public site stays light. First design pass brings the portfolio directly after a simplified hero, adds a shared Juan/Julian/Freddy introduction, and shortens the gallery header with URL-based building filters. Use actual jobsite imagery until a real crew portrait is supplied. Implementation approved for publication to main. (2026-09-07)
- **TrustBar stats:** Zero Subcontractors · Welded or Bolted · Same-Week · Temple TX.
- **Testimonials:** auto-scroll marquee, CSS `@keyframes`, pause-on-hover, `'use client'`. **`REVIEWS` is empty and the section renders nothing** — the six invented "Verified Project" quotes were removed 2026-09-07. Real reviews only: fill `testimonials.md`, paste them in, and the section returns on its own. Never re-add a `rating` without a real review behind it.
- **Lead form:** two steps: project + ZIP, then contact + details. Offer Lean-To / Patio and Other / Custom; homepage shortcuts preselect the build. Lean-To maps to the existing `other` lead category with its label preserved in notes. One component with a `chrome` prop — `chrome={false}` renders the card alone for `/quote` and the host page must supply the dark ground it is styled against. `best_time_to_call` is part of the field set on every instance. Implemented; approved for publication 2026-09-07.
- **`/quote` is the dedicated quote landing page** — an ad target, a short link, and the header CTA destination. It **coexists** with the inline `#quote` sections; those are not removed and only the Header CTAs repoint. Indexed at sitemap priority 0.9 with its own OG card. Prefills from `?service`, `?city`/`?zip` and `?project`, dropping anything unrecognised, and sends `source: 'quote_page'`. `/free-quote`, `/estimate`, `/services/lean-to-patios` and `/services/house-additions` redirect there. (2026-09-07)
- **Response promise:** `/quote` and `/thank-you?from=quote` say **"Same day, guaranteed within 24 hours."** Both figures in one line, so no downstream surface contradicts it. Everywhere else keeps "within 24 hours"; nothing may say "most replies". (2026-09-07)
- **Phone on the quote page:** `/quote` shows a tracked tap-to-call CTA at equal weight beside the form. A deliberate carve-out from the 2026-04-23 "phone hidden inside the form" rule, which still governs the fourteen inline forms. (2026-09-07)
- **Military / first-responder discount is a checkbox on the form**, not an eyebrow line only. The shipped code is authoritative; this ends the conflict with the 2026-04-23 design note. (2026-09-07)
- **Permits are advisory only** — "Building permits? We'll talk you through it." Never promise to pull, file, or guarantee one. (2026-09-07)
- **`/quote` carries no prices, no deposit or payment language, and no stars or reviews.** (2026-09-07)
- **Campaign attribution:** preserve the first marketing landing and campaign parameters for the browser-tab session across navigation and reloads; use memory if session storage is blocked. (2026-09-06)
- **HQ is forced dark, always.** `.hq-ui`, applied to the wrapper in `src/app/hq/layout.tsx`, remaps the
  semantic tokens for that subtree to the "Shop floor" direction — page `#0b0d0f`, card `#14181c`, raised
  `#1b2126`, ink `#f2f4f5`. HQ does **not** follow `prefers-color-scheme`; the marketing site still does.
  `dark:` is redefined in `src/app/globals.css` to mean "inside `.hq-ui`" rather than "the OS is dark", so
  the ~144 existing `dark:` utilities fire unconditionally in HQ with no file edits. **Only custom
  properties may go in the `.hq-ui` block** — hand-written rules in that file are emitted unlayered and
  would outrank every Tailwind utility inside HQ; `color-scheme: dark` is the one documented exception.
  (2026-09-07)
- **Two interactive tokens in HQ, not one:** `--brand-fg` is the gold action colour `#f5a524`, and text on
  it is `--text-on-brand` `#0b0d0f` — **never `text-white`**, which lands at ~1.9:1. `--link-fg` is the blue
  used for links, back affordances and secondary buttons. Outside HQ `--link-fg` is simply `--brand-fg`, so
  nothing changes there. Lucide `strokeWidth={2}` is still the HQ default. (2026-09-07 — **REVERSES** the
  2026-04-24 single-brand-token rule.)
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

## Project inquiries

- **The `leads.source` allowlist is owned by the database CHECK** (`leads_source_check`, migration 029). The public `POST /api/leads` accepts only `website_form | quote_page` from a client, as a closed zod enum — a bad value is a 400, never a constraint violation surfacing as a 500 and a lost lead. Every other source value is set server-side by its own ingest path. (2026-09-07)

- **Project handoff:** use the existing project-page quote form, prefill building type only, and show a removable project-reference card. Reference removal preserves user edits. Resolve submitted reference IDs server-side against active projects, and append canonical reference details to existing lead notes for HQ and owner email; no migration. (2026-09-07)
- **Related projects:** show up to three active photographed matches on standard service pages, featured first. Turnkey requires Carport + Turnkey tag. HOA has no matching section without verified metadata. The existing Hybrid gallery moves above descriptive content. Approved for publication before property-photo work. (2026-09-07)

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

## Lead Engine

- **`temple` is the only enabled permit source** (2026-09-07 — **REVERSES** the same-day lock that made `bell_county` the only one). The City of Temple weekly building-permit report is static HTML, per-permit, weekly and current; the "JS-hydrated accordion" note that kept it off was wrong. `bell_county` is off for three independent reasons: scanned PDFs with no text layer, a page stale since the 2026-04-21 meeting, and court agendas are not building permits. `harker_heights` (Cloudflare 403) and the CivicPlus/Granicus sources still need headless work — re-enable them together, not before.
- **Resolve PDF hrefs against the page's `<base href>`, never the index URL.** Revize emits root-relative hrefs with no leading slash; resolving against the index URL doubles the path and 404s. `baseHrefOf()` / `resolvePdfUrl()` in `src/lib/jobs/scrape-permits.ts`. (2026-09-07)
- **The `?t=` cache-buster is the recency signal.** It is the publisher's upload timestamp; Temple's filenames ("Aug 21-27.pdf") carry no parseable date. `PDF_HREF_PATTERN` captures it as group 2 and `listReports()` sorts on it. (2026-09-07)
- **One shared `PDF_HREF_PATTERN`** in `src/lib/permit-sources.ts`. Never inline a per-source copy again — seven copies of a subtly wrong regex is how the scraper yielded zero from day one. Report-vs-noise is decided by each source's `pathFilter` / `exclude` against the **full path**, not the filename. (2026-09-07)
- **Three lead classes, stored side by side:** `accessory` (call on it), `new_home` (future secondary-structure prospect + the builder list), `commercial` (< $500K). Trades are dropped by job-type code before Claude sees a row (`KEEP_CODES` / `DROP_CODES`). A permit re-sighted in a later report updates only `job_status`, `source_url`, `source_report_date`; the owner's `status`, `notes` and `called_*` are never overwritten. (2026-09-07)
- **`permit_reports` is the processed-document ledger** (migration 031); `cron_runs` records runs, not documents. Backfill drains 3 reports per run; a manual POST may carry `{ maxReports }` up to 20. Dedup key is a full `unique (jurisdiction, permit_number)` — the code suffix is part of the number because Temple reuses the sequence across codes. (2026-09-07)
- **The scraper returning HTTP 200 does not mean it worked.** Zero-yield with a clean status is its normal failure mode — and over a weekly source it is also its normal *success* six days in seven. Check `permit_reports.uploaded_at`, not the yield streak; the stall alarm fires after 14 quiet days, on Mondays only. (2026-09-07)
- **Owner names from permit reports are public record, HQ-only, never rendered publicly.** Consistent with the 2026-04-21 publish-the-narrative, hoard-the-leads split. (2026-09-07)
- **Claude's extraction output is a forced tool call, never free-text JSON.** The first live run got a ```json fence plus an array truncated at the 8k output cap — unparseable, so two reports were recorded with zero leads. A tool call cannot be fenced; truncation is detected via `stop_reason` and the batch is halved. Batches are 15 rows (`ROWS_PER_CALL`) against a 16k cap. (2026-09-07)
- **The Lead Engine vocabulary lives in `src/lib/jobs/scrape-permits.ts` and nowhere else:** `PERMIT_CATEGORIES` (20 categories under the three classes), `CLAUDE_TAGS` + `STATUS_TAGS`, `MATERIALS`. Claude picks from it, code enforces it (`normalizeCategory`, `mergeTags`, `normalizeMaterial`), HQ renders it. Deliberately no CHECK constraint — a new value is a code change, not a migration. Rows with `labeled_at IS NULL` are relabelled from stored `raw_source_text`, 45 per run, without refetching a PDF; class and score are never re-judged by that pass. (2026-09-07)
- **Measured facts are columns, not prose:** `sqft`, `dimensions` (WxL), `height_ft`, `material`, `applied_at` (the City's date stamp). Builders are grouped on `contractor_key` (`contractorKey()` — lower-case, no punctuation, no LLC/LTD/INC) and named by their most common spelling; Claude supplies `contractor_company` with the person stripped. (2026-09-07)
- **"Load all history" chains detached runs from the page** — a localStorage flag, `maxReports: 20` per POST, the next run starts when one finishes with reports still deferred — until nothing is left. The 240s budget decides how many reports each run actually reads. (2026-09-07)
- **A manual scrape is detached from the browser.** `POST /api/cron/scrape-permits` answers **202** at once and does the work in `after()`; **409** while a run is already open. The page shows the latest `cron_runs` row and polls `/api/cron/scrape-permits/status` every 5s while one is open. A tab is never what keeps a job alive — leaving it changed nothing on 2026-09-07 except what the owner could see. The Vercel Cron `GET` stays synchronous. (2026-09-07)
- **A run stops starting new reports after 240s** (`REPORT_TIME_BUDGET_MS`) so it is never killed at the 300s `maxDuration`. A killed run leaves `cron_runs.ok IS NULL` forever — the 2026-09-07 18:49 UTC row is exactly that, not a live problem. Unstarted reports wait for the next run and show as "left for next run" in the HQ panel. (2026-09-07)

## HQ access

- **"Is this the owner?" has exactly one definition:** `isOwnerEmail()` in `src/lib/owner.ts`, read from
  `OWNER_EMAIL`. It is enforced by `src/proxy.ts` (pages), by `requireOwner()` / `checkOwner()` /
  `getOwner()` in `src/lib/auth.ts` (**every** route under `src/app/api`), and by `cronAuth()`'s session
  branch. Never re-check `auth.getUser()` in a route — "signed in" is not "authorized", and that gap is
  what this replaced. Deny is **401** when nobody is signed in, **403** when signed in but not an owner.
  (2026-09-07)
- **An unset `OWNER_EMAIL` deliberately admits any authenticated user.** A missing env var must not lock
  the owner out of a live business tool; disabled signups and RLS are the real control. `owner.test.ts`
  pins this — if it fails, the trade-off changed. (2026-09-07)
- **A background and a text colour are set together, or neither is set.** `globals.css` opts the document
  into `color-scheme: light dark`, so a bare `bg-white` with no `text-*` renders near-white-on-white in OS
  dark mode — that is exactly how `/login` and `/setup` became unusable. Outside `(marketing)` (which locks
  `colorScheme: "light"`) every surface pairs `--surface-*` with `--text-*`. `src/app/(auth)/layout.tsx`
  owns that pairing for the auth pages; put new auth screens inside that group rather than restyling them.
  (2026-09-07)
- **Public endpoints carry no session check and must not gain one:** `POST /api/leads` and
  `POST /api/partner-inquiries` (hCaptcha + rate limit), `POST /api/quotes/[id]/accept` (bearer is the
  `accept_token`), `GET /api/gallery`, `/api/setup` (`SETUP_KEY`), and both webhooks (HMAC). (2026-09-07)

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
