# Next Session Primer — Read This First

## Permit scraper — rebuilt on Temple, 2026-09-07

Read the Lead Engine section of `Locked Decisions.md` before touching it. What is true now: `temple` is the only enabled source; `permit_reports` records which PDFs have been processed; permits carry a `lead_class` (accessory / new_home / commercial); Bell County is off for good reasons, not a bug.

**Check first, in this order:**
1. `select job, started_at, ok, yield, error from cron_runs where job = 'scrape-permits' order by started_at desc limit 3;` — the first run after deploy should be `ok = true, yield > 0`; the run after that `yield = 0` with `detail.summary.temple.reportsProcessed = 0` (idempotent).
2. `select lead_class, count(*) from permit_leads group by 1;` and `select label, uploaded_at, permit_count, kept_count, lead_count from permit_reports order by uploaded_at desc;`
3. `/hq/permit-leads` — class pills, Owner / Contractor columns, the expanded row's Permit block.

If `permit_reports` is still empty after a run with `ok = true`, suspect the Claude step (`cron_runs.error`, `detail.summary.temple.reports[].errors`), not the fetch — the fetch and parse path is fixture-tested against the real markup and the real row layout. The 2026-09-07 18:49 UTC `cron_runs` row with `ok IS NULL` is the first live run, killed at `maxDuration` before the time budget existed; it is not a live problem.

**Backlog:** ~110 historical weekly reports. "Load all history" on `/hq/permit-leads` chains runs until they are all read (the 240s budget fits four or five per run at ~50s each); a report costs cents. Or `POST /api/cron/scrape-permits` with `{ "maxReports": 20 }` per run.

**Vocabulary:** `PERMIT_CATEGORIES`, `CLAUDE_TAGS`/`STATUS_TAGS`, `MATERIALS` in `src/lib/jobs/scrape-permits.ts` — add a value there and it exists in Claude's tool schema, the enforcement, and the HQ filters. Rows with `labeled_at IS NULL` (the 79 from the first successful run) are relabelled by the next run, 45 at a time; check `select count(*) from permit_leads where labeled_at is null`.

**Not done, deliberately:** OCR / PDF-vision for Bell County; headless for Harker Heights and the CivicPlus sources; the public `/market-report` (Temple's monthly totals PDFs are aggregate and PII-free — the right input if it is ever built). A local `next dev` scrape throws inside `unpdf` on Node 22; production is on 24.

Still open from earlier today: the `private_lead_photos` migration is applied with no file in the repo.


## `/quote` landing page — shipped 2026-09-07

`/quote` exists now and is the header CTA destination. It coexists with the inline `#quote` sections; do not "tidy up" the asymmetry by repointing `Footer`, `MobileCallBar`, `PreFooterCta` or the ~20 in-page anchors — those still target `/#quote` deliberately, so pages keep converting on their own form.

`QuoteForm` takes a `chrome` prop. It defaults to `true` and must stay that way — fourteen pages depend on it, four of them passing no props at all. In bare mode the card has no dark background of its own; the host page owns it. `src/components/sections/QuoteForm.test.ts` is the guard.

Migrations 029 and 030 are applied and verified in production.

**028 has since been applied** (owner approved, same session). `leads.city` is a city name or NULL across all eight rows — 78664 resolved to Round Rock, and 76877/76566/76577 went NULL with their ZIPs preserved in `leads.zip`. Migrations 028, 029 and 030 are all in the ledger.

**One drift item remains and is worth a decision:** a migration `private_lead_photos` (version 20260907143042) is applied to the database with no corresponding file in `supabase/migrations/`. This is the out-of-band drift `scripts/check-migrations.mjs` exists to catch — the same failure mode that left `gallery_photos` unreproducible. The DDL should be reconstructed into a file so the schema can be rebuilt from the repo.

Unrelated uncommitted work was present in the working tree during this session — a `/login` refactor splitting `LoginForm` into its own file. It was left untouched and not committed.


## Project inquiry feature — local implementation, 2026-09-07

Built the approved next feature: project-page CTA targets its own form; removable inspiration card; building-type-only prefill; optional reference_project_id validated and resolved server-side into lead notes. Owner email already consumes those notes. RelatedProjects shows up to three photographed type/tag matches on service pages, while the existing hybrid gallery moves directly below its hero. No schema changes, no real lead submissions, no customer messages. Typecheck, lint, and 76 tests passed; production build validation reported in the task. Local preview: http://127.0.0.1:3210/gallery/162e4b86-b8d7-4bbb-b828-bc23f90d256d#quote . This feature has not been committed or published.


## Website design pass — 2026-09-07, approved for publication

Owner explicitly requested commit and push to main. First pass includes simplified homepage hero, portfolio immediately below it, shared team introduction on homepage/About, compact gallery header and category filters, service quote shortcuts, and earlier trust/form/attribution cleanup. Integrated newer main changes without reverting SEO, contact-data, database, or scheduled-job fixes. Production deployment follows the push through the existing Vercel integration.

Next requested work is still planning only: project-to-inquiry handoff and related projects on service pages. Owner chose the existing form on the project page and prefilling building type only. No implementation of that next feature yet.

## Earlier marketing changes — 2026-09-07, included in the design publication

Owner requested trust-content cleanup, quote handoff repairs, and attribution persistence; business-fact copy is excluded. Homepage placeholder reviews and Google stars are removed from rendering. Quote shortcuts select the build; Lean-To/Patio and Other/Custom are supported without a database migration. Marketing layout captures first-touch attribution for the tab session. Owner is collecting customer intelligence. These changes are included in the approved design publication.


## Where the last session stopped — 2026-09-07 (ZIP geography)

`src/lib/zip.ts` now answers "where is this ZIP and how far is it" for 4,188 ZIPs across TX and the four
states bordering it, backed by `src/lib/data/zip-geo.json` (U.S. Census, public domain, regenerate with
`node scripts/build-zip-data.mjs`). Read the `Locked Decisions.md` line before touching it — the key
constraint is that it is a layer *under* `locations.ts`, not a replacement: **`cityFromZip()` is still the
only thing allowed to populate `leads.city`.**

Distance is **straight-line, not drive time.** `driveMinutes` is a reserved field, null everywhere. Wire a
routing provider into that seam rather than changing `miles`. Note a Google Maps key already exists in the
project (`GOOGLE_MAPS_STATIC_KEY`, used by the job map hero), so Distance Matrix would not need a new
billing relationship — just a new key scope.

**Two things waiting on Julian:**
1. **A wrong distance in live marketing copy.** `LOCATIONS.georgetown.distanceFromTemple` reads "70 mi
   south" and `round-rock` reads "60 mi", but Georgetown is *closer* than Round Rock (34.5 vs 44.8 mi
   straight-line). The same numbers are duplicated by hand in `src/components/sections/ServiceAreas.tsx`.
   Deriving both from `lat`/`lng` fixes the error and the duplication together — but it changes public copy,
   so it needs his call.
2. **An exact shop coordinate.** `SHOP_ORIGIN` is currently Temple's city point, not the yard at
   3319 Tem-Bel Ln. Distance barely moves, but compass bearings are wrong often enough that they are
   computed and deliberately not displayed. One lat/lng unlocks them.

**Optional hardening:** `npm i server-only` + the import at the top of `src/lib/zip.ts`, so importing the
280 KB dataset from a `'use client'` component becomes a build error instead of a silent bundle bloat.

---

_Handoffs from 2026-09-06 and earlier live in `archive/Next Session Primer — through 2026-09-06.md`. They are history, not current state —
read `Locked Decisions.md` for what is true now. `scripts/check-vault.mjs` keeps this file to one
session's handoff; when you write a new one, the previous blocks move to the archive file.
