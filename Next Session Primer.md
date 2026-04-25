# Next Session Primer — Read This First

_Created: 2026-04-21 evening · Last updated 2026-04-24 · For any Claude session picking up after 2026-04-24_

---

## What shipped 2026-04-24 (latest) — HQ Phase 4.2: receipt OCR → QBO

Final Phase 4 piece. Tap **Receipt** on `/hq/jobs/[id]` → iOS native camera sheet → Claude Sonnet 4.6 vision extracts vendor/date/totals/line items + confidence → editable confirmation sheet (auto-opens) → Post to QuickBooks → Purchase posted to the configured expense account + image attached as an Attachable.

**Strategy locked:** single-account category (`qbo_tokens.expense_account_id` configured once on `/hq/settings/quickbooks`). Save-local + retry-button failure mode — confirmed receipts never lose data even if QBO is down/disconnected. Settings page shows pending count + "Push pending" batch retry. Confidence < 0.7 surfaces an amber "Verify" pill but never blocks posting.

**Files:** `src/lib/receipt-extractor.ts` (Claude vision wrapper) · `src/lib/qbo.ts` (extended with `listExpenseAccounts` + `createExpense` + `uploadAttachable`) · `src/app/api/hq/receipt/route.ts` · `src/app/api/hq/receipt/[id]/confirm/route.ts` · `src/app/api/hq/receipts/push-all/route.ts` · `src/app/api/qbo/accounts/route.ts` · `src/app/api/qbo/expense-account/route.ts` · `src/components/hq/JobReceiptStrip.tsx` · `src/app/hq/settings/quickbooks/components/ExpenseAccountPicker.tsx` · `src/app/hq/settings/quickbooks/components/PendingReceiptsCard.tsx` · rewrote `src/app/hq/settings/quickbooks/page.tsx` (also fixes Phase 3 token cleanup that this page missed) · `supabase/migrations/013_job_receipts.sql`. Modified `src/app/hq/jobs/[id]/page.tsx` to render the receipt strip below the photo strip.

**⚠️ Pending Julian actions (Phase 4.2 specific):**
- Apply `supabase/migrations/013_job_receipts.sql` in Supabase SQL editor BEFORE deploy hits prod, otherwise `/api/hq/receipt` 500s on the missing table.
- After deploy, pick the QBO posting account on `/hq/settings/quickbooks` — receipts won't push without one.
- Test round-trip on iPhone 16 Pro: snap a Lowe's / MetalMax receipt, verify auto-populated fields, edit if wrong, Post to QuickBooks, confirm Purchase + Attachable in QBO. Test low-confidence (blurry photo) → amber banner. Test offline (Wi-Fi off mid-confirm) → row saves locally, Settings shows pending count.

**Phase 4 complete:** voice memo (4) + camera (4.1) + receipt OCR (4.2). Phase 5 (Twilio SMS + offline queue + push categories) is the next mobile-app surface and merges with strategic Phase 2 work (review velocity + speed-to-response).

---

## What shipped 2026-04-24 (later) — HQ Phase 4.1: camera-first job photos

Stacked on top of Phase 4 voice-memo. Tap **Camera** on `/hq/jobs/[id]` → iOS native camera sheet → shoot 1-N photos → Done → each gets EXIF-rotated + resized to 2048px + JPEG 85% compressed client-side → uploaded to Supabase Storage → bound to the job via a new `gallery_items.job_id` FK. Photos default `is_active = false` so they stay private to HQ.

**Files:** `src/lib/hq/image-prep.ts` (OffscreenCanvas pipeline) · `src/components/hq/JobPhotoStrip.tsx` (camera button + thumbnail strip + per-file upload chips + Lightbox) · `src/app/api/hq/job-photo/route.ts` (POST: validate, upload to `jobs/{job_id}/{timestamp}.jpg`, find-or-create `gallery_items`, append `gallery_photos`, rollback on failure) · `supabase/migrations/012_gallery_items_job_id.sql` (additive, idempotent FK + filtered index). Modified `src/app/hq/jobs/[id]/page.tsx` to fetch job photos server-side and render `<JobPhotoStrip>` above the header card.

Design call: skipped the originally-planned `job_photos_log` audit table (phase-tagging, lat/lng). Not requested yet — easy to add if ever needed. One `gallery_items` per job with many `gallery_photos` under it.

**⚠️ Pending Julian actions (Phase 4.1 specific):**
- Apply migration `supabase/migrations/012_gallery_items_job_id.sql` in Supabase SQL editor BEFORE deploy goes live, otherwise the endpoint will 500 on the `job_id` column.
- Test multi-upload: open a job, tap Camera, shoot 3-5 photos in a burst, release. Verify chips cycle prepping → uploading → done ✓, thumbnails appear, Lightbox works, photos DON'T appear on the public `/gallery`.

---

## What shipped 2026-04-24 (late) — HQ Phase 4 voice-only slice: hold-to-record voice memo → lead

Voice-only scope for Phase 4: the other two Phase 4 features (camera-first job photos, receipt OCR → QBO) defer to Phase 4.1 / 4.2. Plan revision in-session: Claude Messages API doesn't accept direct audio input, so we wired a two-step pipeline — OpenAI Whisper transcribes, Claude Sonnet 4.6 extracts structured lead fields.

**Press the `+` button in HqHeader for ≥500ms → voice memo overlay → speak → release → lead.** Short press still opens `CreatePopover`. Full flow: `onPointerDown` arms long-press timer · long-press fires · `getUserMedia` · MediaRecorder + WebAudio level meter · release → stop + upload to `/api/hq/voice-lead` · Whisper transcribes · Claude extracts `{name, phone, email, zip, city, service_type, structure_type, width/length/height, timeline, is_military, notes}` · Zod validates · insert into `leads` with `source='voice_memo'` · navigate to `/hq/leads/[id]`.

**New files:** `src/lib/hq/audio-recorder.ts` · `src/lib/openai.ts` (fetch-based Whisper client, no SDK) · `src/lib/voice-lead-extractor.ts` (Claude prompt + Zod schema + prompt-caching via `cache_control: ephemeral`) · `src/app/api/hq/voice-lead/route.ts` · `src/components/hq/VoiceRecordingOverlay.tsx`. **Modified:** `src/app/hq/components/HqHeader.tsx` (Plus button rewired to support hold-to-record) · `.env.example` (new `OPENAI_API_KEY` section).

**Fallback-on-failure policy locked:** if Claude extraction fails, we still insert a lead with the raw transcript so no voice memo is ever lost — client navigates, Julian edits inline.

**Cost sanity:** ~$1.30/mo at 100 memos/mo (Whisper $0.30 + Claude $1). Both Whisper and Anthropic have prompt-cache savings baked in.

**⚠️ Pending Julian actions (new):**
- Add `OPENAI_API_KEY` to Vercel Production env. Otherwise the endpoint returns 503 with a clear setup message.
- Confirm `ANTHROPIC_API_KEY` is in Vercel env (already used silently by `permit-extractor.ts`).
- Test on iPhone 16 Pro standalone PWA: hold `+` → speak "Hey this is John Smith, 254-555-1234, 30 by 50 carport in Killeen, ASAP" → release → verify lead appears in `/hq/leads` with populated fields within ~5s.
- First-time mic permission prompt: tap Allow. If denied accidentally, re-enable via iOS Settings → Safari → Microphone.

---

## What shipped 2026-04-24 (HQ Phase 3 — design-language tightening + Gallery restyle)

The original Phase 3 scaffolding (More tab + Stats screen + GroupedList primitive + 4-step Quote wizard + Quote list/detail restyle + Settings grouped-list restyle + Lightbox) had already been built uncommitted but drifted on the design language. This session tightened + shipped.

**Four locked design calls (see `Decisions.md` 2026-04-24 for full rows):**
- **Barlow Condensed scoped to `.marketing`** — stopped leaking into HQ headings via globals.css `:root`-level rule. Marketing layout wraps its tree in `className="marketing"`. HQ inherits iOS stack cleanly.
- **`.tap-solid` + `.tap-list`** utilities in globals.css — two locked tap-feedback rules for all HQ interactive elements. 39 call sites migrated; no more ad-hoc `active:scale-95|[0.99]|[0.98]` drift.
- **HQ interactive brand token = `--brand-fg`** (theme-aware, lifts from #1e6bd6 → #4d8dff in dark for OLED contrast). Raw `brand-600` reserved for marketing + decorative accents. 25+ sites swept.
- **Lucide `strokeWidth={2}` HQ default** — only `BottomTabBar` active-state (2.3) and `HqHeader` Plus CTA (2.3) are intentional exceptions.

**Gallery restyle (commit 4) — the biggest single chunk:** `GalleryManager.tsx` (1433 lines) had been untouched by the earlier scaffold — still full of dashboard-era `bg-white` / `border-gray-300` / `text-gray-600` / `text-blue-400` / `bg-blue-50`. 158+ raw-color references swept to semantic tokens + dark-mode-aware forks. `Lightbox.tsx` transitions now include the locked easing curve `[0.22, 1, 0.36, 1]`. Upload / CRUD / HEIC / folder-drop / multi-select-bundle logic preserved intact.

**Explicitly deferred to Phase 3.1** (small cleanup session): Lucide-ify the ↑/↓/✕ ascii controls in project cards, convert upload form to `<GroupedList>` sections, iOS-style multi-col project grid layout (the current single-col on iPhone is actually the right density for the power-user view).

**Verification:** `npx tsc --noEmit` clean. 0 `active:scale-*`, 0 `bg-brand-600`, 0 `text-gray-*` / `bg-gray-*` residue in `src/app/hq` + `src/components/hq` + GalleryManager.

---

## What shipped 2026-04-23 (Phase B — full session)

Latest prod: commit `005bfba`, Vercel deployment `dpl_98A4EooFWQ3jcVxR7vwPtWKwZveU` (READY).

**HQ → iOS PWA (Phase B0-B5):** two-tab IA (Now/Funnel) · unified `PipelineList` across 5 entity types · swipe actions · pull-to-refresh · offline-first reads · install prompt · push notifications · settings hub · streaming shell + Suspense (kills 2-5s blank) · SW StaleWhileRevalidate · dark mode via iOS `prefers-color-scheme` (reverses the 2026-04-14 "no dark mode" lock — HQ-only, marketing stays light).

**Public-site magazine redesign:** Hero v2 "BUILT RIGHT. BUILT FAST." (finally kills the stale "48-hour" homepage centerpiece) · Services / WhyTripleJ / Testimonials / ServiceAreas all redesigned to the magazine language · route-aware Header + upgraded wordmark · new `<PreFooterCta />` bookends every marketing page · restrained motion language (hero choreography + scroll reveals via `useReveal`, no framer-motion in public bundle) · QuoteForm redesigned as cinematic 2-step glass card (revises 3-step lock) redirecting to new `/thank-you` page · `/services` list redesigned.

**Per-city location pages:** `/locations/[slug]` template redesigned with new `LocationData` shape (`customHeadline`, `heroSubhead`, `distanceFromTemple`, `habla`, `localIntro`, `landmarks[]`, `neighborhoods[]`, `topServices[]`, `whyLocalBullets[]`, `callouts[]`). 3 cities personalized: **Killeen** (military-first), **Temple** (HQ-pride + lakeside), **Belton** (county-seat authority + 2 stacked callouts). Other 11 cities still render via legacy fallbacks.

**SEO foundation:** 8 new `/locations/[county-slug]` county pages (Bell / McLennan / Coryell / Williamson / Lampasas / Falls / Milam / Burnet) — now 14 cities + 8 counties = 22 location surfaces. Root Organization schema + BreadcrumbList + canonical fix + og:image + image sitemap + ImageGallery JSON-LD + llms.txt rewrite for GEO.

**Positioning shifts:**
- **Supplier-agnostic** — removed all customer-facing MetalMax / WeatherXL / Turnium / Sheffield / MaxSeam mentions. Reads as "leading regional Texas suppliers — multi-source". `gallery_items.panel_color_line` keeps internal `'turnium' | 'sheffield'` IDs; user-facing labels are "Standard Line" / "Premium Line".
- **Lone-Star color names canonical** — 39 colors use Texas-evocative names everywhere. Exception: Galvalume + Acrylic-Coated Galvalume stay functional (cheapest-panel price signal, "Best Value" emerald badge added).
- **"Welded" = welded + bolted** (engineering reality, new Decisions.md row) — red-iron is bolted into position first, then welded; bolts stay (rubber gaskets). Copy line: "welded structures are reinforced with permanent bolts" — credibility upgrade, not contradiction.

**New pages:**
- `/services/hybrid-projects` — catch-all for non-standard builds, auto-pulls `gallery_items WHERE type = 'Hybrid'`.
- `/partners` — B2B install-partnership funnel in main nav. `partner_inquiries` table (`011_partner_inquiries.sql` applied to prod), HQ inbox at `/hq/partners`.
- `/thank-you` — noindex, QuoteForm redirect target.

**Security:** hCaptcha (over Turnstile) on both lead forms + server-side verify + per-IP rate limiting (5/hr leads, 3/hr partners). Harker Heights `48-hour` → `same-week` copy fix. CSP enforced-mode flip deferred (separate commit after 24h report monitoring).

**Nav/chrome polish:** Service Areas demoted main nav → footer-only (Partners took the 7th slot). "English · Español" tag under phone. Logo circular mask + trim. "Clients" stat → "Mon–Sat".

## Pending Julian actions (carried from 2026-04-22 + new)

- **Resend domain verification** — still critical; silent bounce otherwise
- **Fire `Run Scrape Now`** to validate Lead Engine end-to-end
- **Rotate hCaptcha secret** — sent through chat during integration; re-add via `vercel env add HCAPTCHA_SECRET_KEY production --sensitive`
- **Source real photos** into `/public/images/locations/{killeen,temple,belton}/` (hero + landmark). Current placeholders use `red-iron-frame-hero.jpg` / `carport-gable-residential.jpg`; landmarks render as typography-only cards intentionally until real photos arrive.
- Sanity-check `/hq` KPI numbers against Supabase
- Review welded-vs-bolted blog post against the "welded always includes bolts" reality (currently frames them as mutually exclusive)

## What's actually queued next

1. **Personalize remaining 11 cities** (Harker Heights → Copperas Cove → Waco → Salado → Georgetown → Round Rock → Lampasas → Holland → Taylor → Troy → Nolanville) using the Killeen/Temple/Belton template
2. **Spanish `/es/`** landing + carports/garages/barns
3. **`/pricing`** page with transparent ranges + calculator from `jobs` table
4. **Quote templates UI** at `/hq/quotes/templates`
5. **Twilio SMS speed-to-response** + post-job review velocity (Phase 2 core — still unbuilt)
6. CivicPlus jurisdiction expansion for Lead Engine (Killeen, Copperas Cove, Waco, McLennan Co.) — needs Firecrawl + headless
7. Real-photo sourcing across all 14 cities

Reminder: `FB Marketplace Intel.md`, `Financing Research.md`, `Decisions.md` remain authoritative for strategy. Decisions.md is up to date through 2026-04-23 (rows 56-79 document all Phase B calls).

---

This document is the condensed context any new Claude session needs to skip the warm-up and start executing. It references the deeper vault files for full detail; read this first, then dive into specifics as needed.

---

## Who you're working with

**Julian Leon Alvarez, 18 years old**, son of Juan (owner of Triple J Metal LLC). Tech lead, sales closer, welder, English speaker. Moves at AI-native pace — long-form Claude sessions, executes fast, doesn't need hand-holding on 10-week plans. Compress timelines.

Juan (father, 40% equity) — investor/relationships, no jobsite labor, Spanish-primary, funds family businesses.

Freddy (Jose Alfredo, 40% equity, not just foreman — co-owner) — master welder, jobsite skills, Spanish-primary. Team trust anchor.

Julian owns 20% equity per LegalZoom formation (paperwork verification pending — Julian to pull Operating Agreement and review with a TX business attorney eventually).

## Current state of the world (2026-04-21 evening)

**Triple J:**
- ~150+ jobs completed since 2025 founding
- Real net margins: 50-60% small jobs, 35-45% medium, 25-35% large (textbook contractor 15-25% was WRONG)
- Reference data point: Copperas Cove job (closed in 48 hrs) — $8,600 rev / $3,036 materials / $100 diesel = $5,464 net (63% margin)
- Asset base: skid steer, Ram 2500, trailers all paid off. F350 at ~$900/mo. Lean overhead.
- Team capacity: 2 in-house welders (Julian + Freddy). Can scale to $3-5M before hiring 3rd welder.
- Cash: ~$16K incoming from recent contracts. Not broke. Full execution greenlit.
- Domain: triplejmetaltx.com (migration DONE) · Email: julianleon@triplejmetaltx.com
- Lead Engine V1 MVP built (commit 2e273b5) — NOT YET DEPLOYED. Sitting on branch `claude/setup-new-project-wA6jt`.

**Parallel family business — Mexicano Grill:**
- Address: 812 East Central Ave, Belton TX
- Under rebuild, target reopen **mid-July 2026** (~10 weeks out from 2026-04-21)
- Juan-funded (consuming family cash + Juan's attention)
- Julian contributes welding labor (drive-through framework) but not capital
- When restaurant opens + stabilizes → cash flow loops back to fund Triple J expansion

**Julian's physical state:**
- Recent car accident — physically recovering, can't work jobsite right now
- Cognitive bandwidth fully intact — pouring into Triple J tech buildout
- Recovery timing aligns with Triple J tech-work window perfectly

## The revenue/wealth thesis (revised with real margins)

| Year | Age | Revenue (realistic) | Net profit | Julian's 20% |
|---|---|---|---|---|
| Year 1 (2025, partial stall) | 18 | $600K | $280K | $56K |
| Year 2 (post-restaurant refocus) | 19 | $2.2M | $850K | **$170K** |
| Year 3 | 20 | $4.5M | $1.6M | **$320K** |
| Year 5 | 22 | $10M | $3M | **$600K** |
| Year 10 | 27-28 | $28M | $6.5M | **$1.3M/yr** |

**Cumulative 10-year distributions: ~$7M**
**Plus potential PE exit at Year 10: 20% of $25-35M sale = $5-7M pre-tax**
**Realistic net worth at age 28: $10-20M. Aggressive (equity growth + exit): $20-35M.**

## Strategic frameworks (internalize these)

### Framework 1 — The 5 Market Edges (prioritized)

1. **Speed-to-response automation** — 60-sec SMS auto-reply on lead submit. Twilio, ~$25/mo. Doubles close rate. **Next session build.**
2. **Spanish-language site** — Juan/Freddy take Spanish calls; Julian takes English. Bilingual team is an unfair advantage, not a gap. Zero competitor coverage on Spanish metal-buildings SEO.
3. **Review velocity engine** — post-job SMS + Google review link. Solves Triple J's biggest gap (~0 reviews vs competitors' 20-100+). **Next session build alongside speed-to-response.**
4. **Transparent pricing page** — `/pricing` with ranges from real job data + calculator. Zero competitors publish pricing. SEO + trust win.
5. **Permit-data content flywheel** — `/market-report/[year-month]` auto-generated from `permit_leads`. Public authority angle + SEO backlinks. **Needs 30 days of permit data first.**

### Framework 2 — Moat honesty

**Tech advantage = 18-36 month window, NOT a permanent moat.**

Decaying moats (12-36mo): SEO, automation, scraper infrastructure.
Durable moats (10+ years): brand, Google reviews, crew quality (Freddy), supplier relationships (MetalMax volume discounts), bonding capacity, local trust.

**Strategy: use tech head start to build durable moats before window closes ~2028.**

Who actually builds this stuff:
- Capital / local TX competitors: ~0% threat (not AI-native, adapt in years)
- Regional mid-size (Austin/DFW): ~10% threat
- Permit SaaS (BuildZoom etc.): target $1M+ commercial, won't compete down-market
- **22-yo AI-native founder in Austin: ~30% threat within 24 months** ← real risk
- Irvin's nephew: ~5% threat

Defense against AI-native newcomer: crew + trust + tenure + local brand (they have none of these).

### Framework 3 — Permit data public/private split

- **Public** `/market-report/[year-month]`: aggregate stats (counts, valuations by city, type breakdowns, contractor names). Strips individual addresses, homeowner names, wheelhouse scores.
- **Private** `/hq/permit-leads`: full rows with addresses, scores, reasoning, outreach status. Julian-only via auth.
- **Rule: publish the narrative, hoard the leads.**

### Framework 4 — Capital strategy (debt-only, no equity dilution)

- Year 1-2: Zero outside capital. Bootstrap on customer deposits.
- Year 2-3: Equipment financing (truck, welder). Small bank LOC ($50-150K) for cash flow.
- Year 3-5: SBA 7(a) or 504 for facility purchase. Build bonding capacity.
- Year 5-10: Bank term loans, active bonding for commercial work.
- Year 7-10: Evaluate PE bolt-on offers only at $5M+ revenue.
- **NEVER: merchant cash advances, equity dilution pre-exit, personal guarantees on ballooning debt.**

### Framework 5 — Phase sequencing

- **Phase 1 — Lead generation (BUILT):** Permit scraper, FB Marketplace strategy, site SEO.
- **Phase 2 — Conversion + trust (NEXT):** Speed-to-response automation, review velocity, Spanish pages, pricing transparency. Pre-financing.
- **Phase 3 — Margin expansion (LATER):** Financing (Hearth), upsells, bigger tickets. Trigger: 20+ leads/mo + 10+ reviews + current COIs.

Doing financing before conversion = turbo on a car with no wheels.

## The 2-night execution plan

Julian moves fast. Compressed from 10 weeks to 2 long-form Claude sessions.

### Night 1 solo (no Claude needed — Julian alone, ~2 hrs)
- [ ] 15 min: deploy branch (push to main, Vercel env vars, run `004_permit_leads.sql`)
- [ ] 20 min: claim Google Business Profile, fill every field, push 20 jobsite photos
- [ ] 30 min: text 10 past customers for Google reviews
- [ ] 30 min: FB Marketplace recon on Capital (additional screenshots — ProStructures already covered in `FB Marketplace Intel.md`)
- [ ] 20 min: pull LegalZoom LLC docs, paste Operating Agreement text into next session for review

### Night 2 (long Claude session, ~3-4 hrs Opus)
- Twilio SMS speed-to-response automation (every new lead + permit-lead "called" → auto-text with calendar link)
- Post-job review velocity (24hr after job marked complete → Google review link text)
- Spanish landing page (`/es/` homepage + carports/garages/barns)
- Pricing transparency page (`/pricing` + per-service ranges + simple calculator from `jobs` table averages)
- Market-report template at `/market-report/[year-month]` (auto-generate from permit_leads, ready to publish once 30 days of data accumulates)
- First 2-3 Triple J FB Marketplace listings using template in `FB Marketplace Intel.md`

### Night 3 (if Julian wants to push further)
- CivicPlus jurisdiction expansion for Lead Engine: Killeen, Copperas Cove, Waco, McLennan County — Firecrawl + headless rendering
- FB Marketplace listing-template generator tool (pulls photos from `/hq/gallery` + builds template with 1 click)
- LLC Operating Agreement gap review + attorney-follow-up drafting
- Permit-lead outreach automation (DM-style templates for FB, SMS for direct)

### Between-session checklist (ongoing Julian solo)
- Insurance COI check (GL + WC PDFs with agent)
- FB Marketplace posting cadence — 2-3 new listings/week using template
- GBP weekly posts (jobsite photos + updates)
- Review pipeline — text every completed-job customer for Google review
- Restaurant work (drive-through welds continue during stall)

## Competitive landscape (snapshot)

**Capital Metal Buildings** (Troy TX, owner Irvin Jimenez)
- Decision: **Both** — use as secondary supplier ≤30% spend + pitch installer-partnership for Capital's overflow jobs
- MetalMax stays primary supplier unchanged

**ProStructures of Belton** (Joseph Zeluff, 5500 W FM 93 Temple)
- Tier 1 FB Marketplace competitor, full details in `FB Marketplace Intel.md`
- Head-to-head: 30x50x14 garage — ProStructures $33,855 vs Triple J $31,200 + stronger product (welded, same-week, zero subs)

**WolfSteel Buildings**
- Paid-ad tier, commercial target, ignore until $3M+ revenue

## Tactical decisions locked (see Decisions.md for full list)

- Lead Engine V1 = 3 Revize jurisdictions only (Temple, Bell County, Harker Heights). CivicPlus deferred to Night 3.
- Tagline locked: "Built right, built fast, built by Triple J."
- "Same-week" messaging (not 48-hour — 48hr = materials arrival time)
- "Welded OR bolted" (never "only welded")
- 4,000 PSI concrete (above 3,000 PSI standard)
- Financing: Hearth primary + Enhancify fallback when ready (Phase 3, not yet)
- 3D Builder: deferred indefinitely
- `/hq` route (renamed from `/dashboard`) with Supabase Auth
- Julian's language role: English sales + tech; Juan/Freddy: Spanish calls + jobsite

## Things Julian hasn't done yet

- Deploy the Lead Engine branch (#1 critical)
- Claim Google Business Profile
- Collect any Google reviews (~0 currently — biggest trust gap)
- Verify LegalZoom Operating Agreement has 20/40/40 split documented
- Enable Supabase 2FA (Julian self-service)
- Apply for Hearth (explicitly WAITING — Phase 3 trigger conditions not met)
- Insurance COI organization (GL + WC PDFs)
- Reach out to Irvin on installer-partnership angle

## What NOT to do

- **Don't delay** — Julian moves fast, match the pace
- **Don't over-engineer** — ship, validate, iterate
- **Don't build financing CTAs** until Julian has Hearth referral link (he doesn't yet, intentionally)
- **Don't copy FB Marketplace spammers** ($1/$15 placeholder price listings) — premium positioning wins
- **Don't compete with WolfSteel on sponsored ads** — not Triple J's league yet
- **Don't Firecrawl/scrape without asking Julian first** (CLAUDE.md rule — token cost high)
- **Don't query NotebookLM from sandbox** — not authenticated (CLAUDE.md rule)
- **Don't give up equity** — Juan is generous, equity will grow over time with performance

## Files to check at start of new session

1. `CLAUDE.md` + `AGENTS.md` — always read first (project rules)
2. This file — for where we left off
3. `Decisions.md` — for locked strategic calls
4. `Session Notes.md` — for chronological context
5. `FB Marketplace Intel.md` — for competitive intel + listing template
6. `Financing Research.md` — for Phase 3 reference (don't act on it yet)
7. `Project Context.md` — for business details + env vars

## One-line summary

_Triple J is a margin-rich, lean-overhead, family-owned Central TX metal-buildings contractor with a freshly-built permit-lead scraper, a 10-week window before restaurant cash refocuses on it, an 18-year-old tech-native closer with 20% equity, and a realistic path to $10-20M personal net worth by age 28 if execution stays disciplined. Next move: deploy + GBP + reviews manually → Phase 2 automation → Phase 3 financing._
