## 2026-04-22 — Functional pass: email unify, manual customer create, manual scrape, `/hq` KPI grid

**Context:** Site is live, dashboard is live, but Julian hit a string of bugs and friction points. This session was a functional pass (no design polish) that cleaned the rough edges and unlocked the dashboard as a daily command center.

**What shipped:**

1. **QuoteForm bypass (BUG FIX)** — Form was auto-submitting after Step 2, skipping the concrete/timeline/military step. Root cause: browser implicit-submit via Enter key / autofill / iOS "Go" button. Fix: removed `<form>` element entirely; converted to `<div>` with `onClick` handler on the submit button. Nuclear but correct — `step !== 3` guards alone weren't enough because the native form was still triggerable.
2. **Lead delete + convert-to-customer** — Added two-click delete-confirm pattern on `/hq` leads table + `→ Customer` button that POSTs to a new `/api/customers` endpoint and auto-flips lead status to `quoted`. Unblocked the quote builder (customer dropdown was empty because there was no way to create customers).
3. **Email sender unified to `@triplejmetaltx.com`** — Previously `quotes@triplejmetalllc.com` (3 L's, no `tx`) which didn't match the Resend-verified domain. All three send paths now use the same domain with `reply_to: julianleon@triplejmetaltx.com`. **Julian action required:** confirm `triplejmetaltx.com` shows "Verified" in resend.com dashboard (DKIM/SPF/DMARC green) — without this, every send bounces silently.
4. **Old `triplejmetal.com` references scrubbed** — Blog metadata canonicals, QBO redirect doc strings, QBO source comments. Grep now shows zero stale references in `src/`.
5. **Manual `+ New Customer` flow** — `/hq/customers` now has a `+ New Customer` button that expands inline form. Captures walk-ins, referrals, Juan's phone calls. No lead-first-then-convert required.
6. **Manual `Run Scrape Now` button** — `/hq/permit-leads` now has a button to kick the permit scrape ad-hoc. `/api/cron/scrape-permits` supports dual auth: `Bearer CRON_SECRET` (Vercel Cron) + Supabase cookie (`/hq` UI). Daily 14:00 UTC cron unchanged. This is the first time Julian can kick off the Lead Engine without curl-ing with secrets.
7. **`/hq` home KPI grid** — Replaced the 4-card lead-status row with a grouped KPI grid:
   - **Pipeline:** Open leads · Active permit leads · Pipeline value (sum draft+sent quote totals)
   - **Conversion:** Lead → Customer rate (30d) · Quote acceptance rate
   - **Revenue:** Revenue this month · Avg deal size
   - **Operations:** Jobs scheduled this week · Hot leads (ASAP + new)
   - Lead pipeline pill row (New/Contacted/Quoted/Won) kept as a second tier.
   - All numerical — graphs/charts deferred to Phase B.

**Key realizations:**
- Dashboard is the command center. Julian wants to work from phone in the truck AND laptop in the shop. Triple J-specific, zero multi-tenant bloat.
- Permit Lead Engine has never been tested end-to-end live. Manual trigger button lets Julian kick it off himself to validate before trusting the cron.
- All analytics for today's KPI grid were computable from existing tables. No schema changes.

**Decisions resolved this session (see `Decisions.md` for full rows):**
- Email domain = `triplejmetaltx.com` everywhere; Google Workspace aliases stay as inbound-only.
- Manual scrape = shipped today.
- Templates UI = deferred to Phase B design session.
- Phase B = dedicated design session covering HQ nav redesign + Recharts/Tremor graphs + public-site polish + Spanish `/es/` + pricing page + templates UI.

**Pending Julian actions:**
- Confirm `triplejmetaltx.com` is "Verified" in Resend dashboard (DNS records green). Otherwise sends bounce.
- Manually fire the `Run Scrape Now` button to validate Lead Engine end-to-end.
- Sanity-check `/hq` KPI numbers against Supabase queries for a few cards.

**What's queued for Phase B (design session):**
- HQ nav redesign to steel-blue matching public site
- Recharts graphs + sparkline trends on each KPI card
- Funnel chart (Leads → Customers → Quotes → Jobs)
- Pipeline-by-jurisdiction stacked bar for permit leads
- Public-site hero refresh, Spanish `/es/` landing, pricing page
- Quote templates UI at `/hq/quotes/templates`
- Component sourcing: Tremor as base, 21st.dev accents, shadcn/ui charts wrapper

---

## 2026-04-21 (end of session) — Final session addendum

This section captures tonight's extended strategic conversation and is the closing summary for this session. New Claude sessions should read `Next Session Primer.md` + `FB Marketplace Intel.md` first, then this entry for nuance.

**New strategic frameworks discussed (full detail in `Next Session Primer.md`):**

- **5 Market Edges** prioritized: Speed-to-response, Spanish site, Review velocity, Transparent pricing, Permit-data flywheel. First two pair up for Night 2 build (shared Twilio infra).
- **Moat honesty framing:** Tech advantage = 18-36 month window, NOT a permanent moat. Use head start to build durable moats (brand, reviews, crew, supplier leverage) before window closes ~2028. Real threat isn't Irvin — it's a hypothetical 22-yo AI-native founder in Austin targeting Central TX metal buildings vertical. Defense: crew + trust + tenure.
- **Capital strategy:** Debt-only, no equity dilution for foreseeable future. Realistic path: equipment financing Year 2+ → SBA 7(a)/504 Year 3+ → bonding capacity build Year 2+ → evaluate PE bolt-on offers only at $5M+ revenue Year 7-10. NEVER merchant cash advances, factoring, or pre-exit equity dilution.
- **FB Marketplace tier analysis:** Julian shared screenshots. Tier 1 threat = ProStructures of Belton (Joseph Zeluff, 5500 W FM 93 Temple). Full intel in `FB Marketplace Intel.md` including head-to-head pricing benchmarks + Triple J's winning listing template.

**Reality corrections that materially changed projections:**

1. **Julian is 18, not 19.** Extra year of compounding runway.
2. **Julian has 20% EQUITY (not commission).** Juan 40% / Freddy 40% / Julian 20% via LegalZoom. Freddy is co-owner, not employee. Earlier advice to "negotiate equity Year 3" is MOOT — he already has it.
3. **Juan is generous, not competitive.** Sees Julian as growth engine. Equity will likely grow over time with performance (realistic trajectory: 20% → 30-40% by Year 6-8 as Juan semi-retires).
4. **Real net margins ~2x textbook contractor assumption.** 50-60% on small jobs, 35-45% medium, 25-35% large. Live data: Copperas Cove $8,600 job / $3,036 materials / $100 diesel = $5,464 net (63%). Driven by owner-operated welders + paid-off equipment + direct MetalMax.
5. **Julian is also a welder.** Team has 2 in-house welders (Julian + Freddy). Can scale to $3-5M before 3rd welder hire.
6. **Asset base:** Skid steer, Ram 2500, trailers paid off. Only F350 at ~$900/mo. Lean fixed overhead.
7. **Financial state:** NOT broke. ~$16K incoming from recent contracts. Full execution greenlit, no cash-crunch constraint.
8. **Domain migration to triplejmetaltx.com DONE** (not pending as earlier docs suggested).

**Revised 10-year wealth projection:**
- Cumulative distributions to Julian over 10 years: **~$7M**
- Potential PE exit at Year 10: **+$5-7M pre-tax (20% of $25-35M sale)**
- **Realistic net worth at age 28: $10-20M**
- **Aggressive (equity growth + PE exit): $20-35M**

**Julian's physical state:**
- Recent car accident. Recovering. Can't work jobsite right now.
- Cognitive bandwidth fully intact, pouring into Triple J tech buildout.
- Recovery timing aligns perfectly with tech-work window.

**Parallel family business updates:**
- Mexicano Grill — 812 East Central Ave, Belton TX
- Target reopen **mid-July 2026** (~10 weeks out from 2026-04-21)
- Juan-funded entirely; Julian contributes welding labor (drive-through framework) but not capital
- When restaurant stabilizes → cash flow loops back to fund Triple J growth
- Known as "a very successful business" historically per Julian

**Execution pace directive from Julian:**
- "Let's not delay anything" — matched to his fast pace
- Can compress 10-week plan to 2 long-form Claude sessions
- Night 1 = deploy + GBP + reviews + FB recon + LegalZoom pull (all Julian solo)
- Night 2 = speed-to-response + review velocity + Spanish + pricing + market-report template (Claude session)
- Night 3 (optional) = CivicPlus expansion + FB template generator + LLC review

**Phase 2 is NOT financing. Phase 2 is conversion + trust stack.**
Phase 2 moves: Twilio SMS speed-to-response, post-job review velocity, Spanish page, pricing transparency page. Financing moves to Phase 3 with explicit trigger conditions in `Financing Research.md` (20+ leads/mo + 10+ reviews + current COIs).

**Permit data publishing strategy locked:**
- Public `/market-report/[year-month]` auto-generated aggregates (no addresses, no scoring, no individual owners)
- Private `/hq/permit-leads` keeps the full juice
- Zillow analogy: publish the narrative, hoard the leads

**Files created/updated this session (cumulative):**
- NEW: `Next Session Primer.md` — read-first doc for future sessions
- NEW: `FB Marketplace Intel.md` — competitive tier analysis + winning listing template + offensive tactics
- UPDATED: `Decisions.md` — 13 new 2026-04-21 rows total
- UPDATED: `Session Notes.md` — this entry + earlier 2026-04-21 pivots
- UPDATED: `Financing Research.md` — deferral notice at top, research preserved below
- UPDATED: `Project Context.md` — real margins, ownership (20/40/40 equity), domain DONE, team capacity, Mexicano Grill context, F350 at $900/mo

**Julian's between-session action items (priority order):**
1. **DEPLOY** — `git pull` on Mac → push to main → Vercel env vars (`CRON_SECRET`, `ANTHROPIC_API_KEY`) → run `004_permit_leads.sql` in Supabase dashboard → trigger cron, verify permits land
2. **Claim Google Business Profile** — business.google.com, fill every field, 20+ jobsite photos, request postcard
3. **10 Google reviews** — text past happy customers manually, personal asks, target 10 live within 1 week
4. **FB Marketplace full recon** — additional screenshots beyond ProStructures already covered; document other local competitors
5. **Post first 2-3 Triple J FB Marketplace listings** using template in `FB Marketplace Intel.md`
6. **Insurance COI check** — GL + WC PDFs with agent
7. **Pull LegalZoom LLC Operating Agreement** — paste text into next session for review against 20/40/40 equity + buy-sell + death/divorce checklist
8. **DO NOT apply to Hearth yet** — premature, trigger conditions not met

**Next Claude session (Night 2) scope:**
- Twilio SMS speed-to-response automation
- Post-job review velocity automation
- Spanish landing page (`/es/` + top 3 service pages)
- Pricing transparency page (`/pricing` + calculator)
- Market-report template at `/market-report/[year-month]`
- First 2-3 FB Marketplace listings using template

---

## 2026-04-21 — Lead Engine V1 MVP Shipped + Phase 2 Reframed + Capital Strategy Locked

**Lead Engine V1 MVP built (Temple + Bell County + Harker Heights):**
- Migration `supabase/migrations/004_permit_leads.sql` — `permit_leads` table w/ RLS, dedup unique index on `(jurisdiction, source_url, permit_number)`, score/status/created indexes
- `src/lib/permit-sources.ts` — 3 enabled Revize entries + 4 disabled CivicPlus/Granicus stubs
- `src/lib/permit-extractor.ts` — `unpdf` PDF text extraction + Anthropic SDK (`claude-sonnet-4-6`) with wheelhouse-scored JSON output, Zod-validated
- `src/app/api/cron/scrape-permits/route.ts` — Bearer-auth GET handler, per-jurisdiction try/catch, upsert with `ignoreDuplicates: true`
- `src/app/api/permit-leads/[id]/route.ts` — PATCH for status/notes/mark_called, Supabase Auth enforced
- `src/app/hq/permit-leads/page.tsx` + `components/PermitLeadsTable.tsx` — dashboard w/ status filter pills, score color-coding, expand-row for wheelhouse reasons + notes + raw source
- `vercel.json` — daily cron at 14:00 UTC (9am CT)
- Nav link added to `src/app/hq/layout.tsx`
- `.env.local` now has `CRON_SECRET` (64-char hex)
- Deps added: `@anthropic-ai/sdk` + `unpdf`

**Code is NOT YET DEPLOYED.** Sitting on branch `claude/setup-new-project-wA6jt`. Julian must pull on Mac, push to main, set env vars in Vercel, run migration in Supabase dashboard before any of this is live.

**Evening strategic conversation — key pivots:**

1. **Phase 2 is NOT financing, it's conversion + trust.**
   - Financing lift = 15-25%. Review velocity + speed-to-response lift = 100-300%.
   - Phase 2: claim GBP + manually collect 10 Google reviews + Twilio SMS auto-respond + post-job review-velocity automation.
   - Phase 3 (later): financing integration. Trigger: 20+ leads/mo AND 10+ reviews AND current COIs.
   - `Financing Research.md` prepended with deferral notice; original research preserved below.

2. **Permit data publishing strategy = public/private split.**
   - Public `/market-report/[year-month]` auto-generated aggregate stats (permit counts, valuations, city breakdown, contractor names from public record).
   - Private `/hq/permit-leads` keeps addresses + wheelhouse scores + reasoning + notes.
   - Publish the narrative, hoard the leads.

3. **Tech advantage = 18-36 month window, not permanent moat.**
   - Claude Code + scraping will commoditize. Window closes ~2028.
   - Use the head start to build durable moats: Google reviews, crew expansion, supplier leverage, bonding capacity, local brand.
   - Direct competitors (Capital/Irvin) won't build this — they adapt in years, not weeks. Real threat is a 22-yo AI-native founder in Austin targeting Central TX vertical. Defense = crew + trust + 3yr tenure.

4. **Outside capital stance = debt-only, no equity dilution.**
   - Contractor grand slam = cash-flow the business + debt for assets that earn (trucks, welder, yard).
   - Year 3+: SBA 7(a) or 504 for facility.
   - Build bonding capacity from Year 2.
   - NEVER MCAs. NEVER equity until a real exit.
   - Mueller merger unlikely — suppliers rarely acquire installers. Realistic exit (if wanted) in Year 7-10: PE bolt-on at 3-6x EBITDA or strategic acquirer (Morton, Varco Pruden, Nucor) at 5-8x.

5. **Facebook Marketplace = confirmed active channel.**
   - Irvin's highest-ROI channel. Julian doing recon between sessions.
   - Next-session build: `/quote?src=fb` UTM tracking + listing template generator pulling from `/hq/gallery`.
   - Differentiation: welded-only, same-week, real crew photos, not stock renders.

6. **Language division of labor logged.**
   - Julian = English. Juan + Freddy = Spanish. This is why Julian is the sales guy on 20% commission.
   - Spanish landing page + Google Voice Spanish line deferred to post-Phase-2 — massive untapped market, zero competitor coverage.

**Strategic locks from earlier in the day (`Decisions.md` appended):**
- Lead Engine V1 = 3 Revize jurisdictions only; CivicPlus deferred
- Capital/Irvin = **Both** — supply secondary ≤30% + installer-partnership pitch in parallel (MetalMax primary unchanged)
- Financing = Hearth primary, Enhancify subprime fallback; HFS / GreenSky / SFC evaluated + skipped
- 3D Builder = deferred indefinitely

**Julian's between-session action items (revised priority):**

1. **DEPLOY.** Pull branch on Mac, push to main, set `CRON_SECRET` + `ANTHROPIC_API_KEY` in Vercel env vars, run `supabase/migrations/004_permit_leads.sql` in Supabase dashboard. Trigger cron manually or wait 24hr for 9am CT run.
2. **Claim Google Business Profile** at business.google.com → "Triple J Metal Buildings." Fill every field. Push 20+ jobsite photos. Request postcard verification. Non-negotiable — you've been dragging on this.
3. **Manually collect 10 Google reviews** from past happy customers. Text them personally. Target: 10 in 7 days.
4. **Facebook Marketplace recon** on Capital — categories, price format, photo style, description formula, posting cadence. Screenshot 5-10 listings. Check FB Ad Library for paid ads.
5. **Insurance COIs check** — GL + Workers Comp, request PDFs from agent. Needed for Hearth application later.
6. Separately: Irvin installer-partnership conversation (Capital's overflow → Triple J crew).
7. Hearth enrollment = **DO NOT DO YET.** Premature. Trigger: 20+ leads/mo + 10+ reviews + current COIs.

**Next session (Claude work):**
- Twilio SMS speed-to-response automation (60-sec auto-reply on lead submit or permit-lead call)
- Post-job review-velocity automation (24hr after job "complete" → Google review link text)
- Debug any Lead Engine issues found during first live cron runs
- Optional if time: FB Marketplace `/quote?src=fb` UTM tracking

**Deferred to later sessions:**
- Spanish-language landing pages + Google Voice Spanish line
- Transparent pricing page (`/pricing` + per-service ranges + calculator)
- Permit-data content flywheel (`/market-report/[year-month]`, auto-generated, publish once we have 30 days of data)
- Financing frontend (trigger conditions above)
- CivicPlus scraping (Killeen, Waco, McLennan, Copperas Cove) — Firecrawl + headless
- FB Marketplace listing-template generator
- Apollo/ZoomInfo permit-owner enrichment
- Auto-outreach (SMS/email to permit holders)
- Domain migration Wix → Vercel + Resend branded-sender DNS
- Supabase 2FA (Julian self-service)

## 2026-04-21 (late evening) — Financial Reality + Margin Recalibration + No-Delay Directive

Julian dropped critical context that reframes everything built today:

**Ownership structure (confirmed):** Juan 40% / Freddy 40% / Julian 20% via LegalZoom. Freddy is a co-owner equity partner, not just a foreman. LLC paperwork needs verification (Julian to pull from LegalZoom account).

**Real net margins are DOUBLE what the earlier projection used:**
- Textbook contractor assumption: 15-25% net
- Triple J reality: **50-60% net on small jobs, 35-45% on medium, 25-35% on large**
- Live data point — Copperas Cove job, closed in 48 hrs: $8,600 rev / $3,036 materials / $100 diesel = **$5,464 net (63% margin)**
- Why: owner-operated welders (Julian + Freddy both weld), paid-off equipment, direct MetalMax relationship, zero subcontractors

**Asset base:** Skid steer, Ram 2500, trailers — paid off. F350 at $900/mo. Fixed monthly overhead is trivial vs. realistic revenue.

**Financial state correction:** Julian is NOT in broke mode. ~$16K incoming from recent invoices + the Copperas Cove close. Can fund Twilio/Anthropic/Google Voice line items without strain. Cash-crunch survival plan from earlier is OBSOLETE — full execution is greenlit.

**Parallel family business:** Mexicano Grill (812 East Central Ave, Belton TX). Target reopen **mid-July 2026** (~10 weeks out). Juan-funded entirely. Julian contributes welding labor (drive-through framework) but not capital. When restaurant stabilizes, cash flow loops back to fund Triple J growth.

**New team fact:** Julian is ALSO a welder. Team has 2 welders in-house (Julian + Freddy). Can scale to ~$3-5M before hiring a 3rd welder. Juan = investor + relationships only, not jobsite.

**Domain migration done** — triplejmetaltx.com live and professional. Remove "pending" from Project Context.md.

**Revised 10-year wealth projection (with real margins + 20% equity):**
- Year 2 (post-restaurant refocus): ~$170K to Julian
- Year 3: ~$320K
- Year 5: ~$600K
- Year 10: ~$1.3M/year in distributions
- Cumulative 10-yr: ~$7M + potential $5-7M exit at Year 10
- **Realistic net worth at age 28: $10-20M. Aggressive w/ equity growth + PE exit: $20-35M.**

**Julian's directive:** "Let's not delay anything." No cash-crunch constraints. Full Phase 2 execution starts next session.

**10-week plan (restaurant reopens mid-July = our window):**
- Week 1 (this week): Deploy branch to Vercel, run migration, first cron, claim GBP
- Weeks 2-4: 10 Google reviews (manual), FB Marketplace recon, LLC paperwork verify
- Weeks 4-6 (next Claude session): Twilio SMS speed-to-response + post-job review velocity
- Weeks 6-8: Spanish landing page + pricing transparency page
- Weeks 8-10: First `/market-report/` (May 2026) goes live; prep for restaurant reopen + Juan's refocus

---

## 2026-04-20 — Prep + Dashboard Hardening + Domain/Email

**Memory + tooling setup:**
- Appended Project Memory + Operating Rules to `AGENTS.md` (business, stack, key source files, locked decisions, NotebookLM ID, vault index)
- Triple J name origin logged: Juan (investor) + Julian (tech/ops, 19) + Jose Alfredo "Freddy" (foreman — cuts, welds, math)
- NotebookLM skill installed at `~/.claude/skills/notebooklm/` (unauthenticated in sandbox — user runs queries on Mac, pastes back)
- API keys dropped into `.env.local`: ANTHROPIC_API_KEY + FIRECRAWL_API_KEY

**Strategic lock-in — Lead Engine V1:**
- Filter Strategy **B (stay close to wheelhouse)** chosen: <$500K, pole barns, ag, small commercial accessory, auto/storage. Skip large PEMB/warehouse subcontractor pivot.
- NotebookLM research saved to `Lead Sources Research.md` — 7 Central TX jurisdictions mapped (Temple, Bell County, Harker Heights = easy Revize/Joomla; Killeen, Waco, McLennan, Copperas Cove = harder CivicPlus/Granicus)
- MGOconnect.org + EnerGov CSS confirmed unscrapable (login-gated) — TOMA upstream pivot (P&Z + Commissioners' Court + weekly permit reports) legally mandated public data

**Dashboard hardening committed (4c3bfe9 + 6a36b96):**
- Removed Owner Login link from public `Footer.tsx`
- `/dashboard` → `/hq` rename (all links, middleware matcher, grep-verified zero stale refs)
- Julian to enable Supabase 2FA himself

**Brand infra locked:**
- Domain: **triplejmetaltx.com** (Squarespace, ~$3 first-year)
- Email: **julian@triplejmetaltx.com** (Google Workspace Basic)
- Still on Wix `TripleJJMetal.com` — migration to Vercel pending

**NOT yet built (tomorrow's full session):**
- `permit_leads` Supabase migration
- `src/app/api/cron/scrape-permits/route.ts` (Temple-first MVP, then Bell County + Harker Heights)
- `vercel.json` daily cron
- `/hq/permit-leads` dashboard page (sortable by filter score, called-toggle)
- Claude parsing prompt for permit PDFs → structured JSON + wheelhouse filter score

**Julian's brainstorm parked for post-Lead-Engine session:**
- Business cards / yard signs / social collateral via Canva + real jobsite photos (shoot Freddy welding, 150 jobs worth of content) — NOT Nano Banana fake project photos
- Frontend design refresh after Lead Engine lands

**Next session checklist:**
1. Build Lead Engine V1 start-to-finish (migration → scraper → cron → dashboard page)
2. Then: frontend design pass if time permits
3. Julian deploys to Vercel when ready (still pending — needs `git push origin main` from Mac + 7 env vars)

---

## 2026-04-15 — Refinement Pass 1 + Research Sync

**NotebookLM research pulled (Gemini):**
- GBP photo strategy: 30–100+ reviews + job site photos = "digital tiebreaker" for TX contractors
- Review velocity: algorithms weight reviews mentioning specific services performed + traits like punctuality
- Proximity signal: verified address + appearing on city's "Registered General Contractor" list = ranking stability
- Keyword gaps confirmed: turnkey+concrete, welded vs. bolted, build speed, HOA compliance
- Military: geofence Facebook to KTB corridor, use PCS/BAH/VA Loans language, military discount CTA
- Multi-step form: ZIP upfront, turnkey upsell (concrete dropdown), urgency timeline cards, military toggle
- 4,000 PSI concrete callout = technical authority signal that increases conversion rates
- Specific niche pages that convert: "Barndominium foundations," "RV carports," "Custom metal sheds"

**Refinement pass committed (0c77415):**
- Font system: Geist → Barlow Condensed (headlines) + Inter (body)
- Tagline: "Built right, built fast, built by Triple J."
- TrustBar: Zero Subcontractors / Welded or Bolted / Same-Week / Temple TX
- Fixed all "custom welded" → "welded or bolted" (Triple J does BOTH)
- Fixed all "48-hour build" → "same-week scheduling" (48 hrs = materials arrival, not build time)
- Added Lean-to patios + House additions to all 14 location service lists + site.ts
- Testimonials.tsx rewritten as 'use client' auto-scroll marquee (CSS @keyframes, pause on hover)
- testimonials.md fill-in template created for Julian
- inspiration/screenshots/ folder created for visual reference drops

**New pages added (previous commit f82cc33 + refinement pass):**
- /gallery, /about, /contact, /service-areas
- /services/pbr-vs-pbu-panels
- 9 new location pages: Salado, Waco, Georgetown, Round Rock, Lampasas, Holland, Taylor, Troy, Nolanville
- Total: 14 location pages, 7 service pages

**Pending (Julian action items):**
1. `git push origin main` from Mac Terminal
2. Set 7 Vercel env vars → deploy
3. Collect real Google reviews → fill testimonials.md
4. Drop inspiration screenshots into inspiration/screenshots/ for next visual pass
5. Send Julian-approved AI footage for Cdance hero (on hold)

---

## 2026-04-14 — SEO + Form Architecture Session

**What we built:**

Deep research (Gemini → NotebookLM):
- Local SEO + GBP best practices for TX contractors
- Competitor keyword gap analysis (4 gaps identified)
- Military buyer behavior (Fort Cavazos PCS/BAH)
- Conversion optimization research (multi-step form design)
- All findings saved to Claude memory

Backend updates:
- supabase/migrations/002_leads_qualification_fields.sql — 5 new columns: zip, needs_concrete, current_surface, timeline, is_military (run in Supabase 2026-04-14)
- src/app/api/leads/route.ts — new Zod schema, ZIP→city lookup, richer owner email with urgency + military badges

QuoteForm rebuild (multi-step):
- Step 1: Name, Phone, Email, ZIP
- Step 2: Service type as icon cards, welded/bolted pills, W×L×H
- Step 3: Concrete option cards, surface pills (conditional), timeline cards, Military/FR toggle card
- Progress indicator + back/next navigation

Service pages — 6 niche SEO pages (keyword gap strategy):
- src/lib/services.ts — full data for all 6 services
- /services/[slug] — features grid, competitor comparison, FAQ schema, military section (rv-covers)
- /services index page
- Targets: turnkey+concrete (Gap 1), welded quality (Gap 2), 48-hr speed/military (Gap 3), HOA luxury (Gap 4)

Location pages — full redesign:
- src/lib/locations.ts — military fields added to Killeen + Harker Heights, "8 years experience" false claim removed
- /locations/[slug] — design system applied, trust strip, competitor comparison, military section

Dashboard:
- LeadsTable updated — shows ZIP, concrete, timeline, military badge

Commit: e45ea45

**Next session checklist:**
1. Julian: `git push origin main` from Mac Terminal
2. Julian: set 7 Vercel env vars + deploy
3. Test quote form end-to-end on live site
4. Build missing pages: /gallery, /about, /contact

---

## 2026-04-14 — Frontend Build Session

**What we built:**

Design system + shared chrome (Phase 1):
- src/lib/site.ts — single source of truth (NAP, nav, services, cities)
- src/app/globals.css — full design token set: steel-blue brand scale (#1e6bd6), ink neutrals, no dark mode, fluid typography
- src/components/ui/Button.tsx — Button + ButtonLink with 4 variants (primary/secondary/ghost/outline-dark)
- src/components/ui/Container.tsx — width-constrained wrapper (narrow/default/wide)
- src/components/ui/icons.tsx — inline SVG icons (phone, menu, close, arrow, pin, clock)
- src/components/site/Header.tsx — dark header with top thin bar (phone/hours/address), sticky+shrink on scroll, mobile drawer, both desktop phone + mobile sticky bar
- src/components/site/Footer.tsx — 4-col footer (Brand+NAP / Services / Service Cities / Company)
- src/components/site/MobileCallBar.tsx — sticky bottom Call Now + Free Quote bar (md and below)
- src/app/(marketing)/layout.tsx — route group isolating marketing chrome from dashboard/login/api

Homepage sections (Phase 2):
- TrustBar — 150+ Projects · 48-Hour Build · Turnkey Concrete · Temple TX
- Services — 4-card grid (Carports/Garages/Barns/RV Covers) with real photos + hover effects
- WhyTripleJ — welded-vs-bolted 6-row comparison table + photo callout
- HowItWorks — 3-step process on dark blueprint-grid background
- Testimonials — 3-card placeholder (replace when GBP reviews come in)

Interactive sections (Phase 3):
- Gallery — asymmetric photo grid (first tile 2×2) using 6 real Triple J job photos
- ServiceAreas — 5 city cards linking to /locations/[slug]
- QuoteForm — client component wired to POST /api/leads: Name, Phone, Email, City (dropdown), Service, W×L×H numeric fields, structure type (welded/bolted/unsure radio pills), notes textarea; inline success + error states

Route restructure:
- Moved src/app/page.tsx + locations/ into src/app/(marketing)/ route group
- Dashboard/login/setup/customer-quote pages keep their own layouts — no marketing chrome bleeds in

Deployment prep:
- All code committed: git commit 7ae863f (60 files, 4,108 insertions)
- Repo: github.com/julianleon8/triple-j-website (main branch)
- Push BLOCKED from sandbox (proxy) — Julian must run `git push origin main` from Mac Terminal
- Vercel connected to repo — NOT yet deployed (env vars not set)

CRM discussion:
- ClickUp MCP available (aa5a2bca-4004-49ea-bc2b-978162587a3a) — not connected yet
- Decision: hold ClickUp integration until live leads validate the need
- Preferred future path: Option 2 (ClickUp pipeline + keep custom quote system)

**Next session checklist:**
1. `git push origin main` from Mac Terminal (if not already done)
2. Set 7 env vars in Vercel (from .env.local) before clicking Deploy
3. Update NEXT_PUBLIC_SITE_URL to real Vercel domain after first deploy
4. Test quote form end-to-end: check Supabase leads table + owner email
5. Design iteration based on localhost review
6. Decide on display font (Barlow Condensed / Oswald to replace Geist placeholder)
7. Build missing pages: /services/[slug], /gallery, /about, /contact

---

## 2026-04-13 — Backend Build Session

**What we built:**
- Next.js (App Router) + TypeScript + Tailwind scaffolded
- Supabase MCP server connected (project: idrbgxlvvnqduvbqtaei)
- Supabase agent skills installed (.agents/skills/)
- Database schema: leads, customers, quotes, quote_line_items, quote_templates, jobs (with RLS)
- Lead submission API (/api/leads) with Resend email alerts to owner + customer confirmation
- Quote acceptance API (/api/quotes/[token]/accept) — tokenized, no login required
- Auth middleware protecting /dashboard
- Owner dashboard: lead table with status counters
- Login page with Supabase Auth

**SEO docs written (seo/):**
- SEO-STRATEGY.md — keywords, E-E-A-T, schema, link building, KPI targets
- COMPETITOR-ANALYSIS.md — 5 competitors, keyword gaps, what Triple J does better
- SITE-STRUCTURE.md — full URL hierarchy + schema per page type
- CONTENT-CALENDAR.md — 12-month content plan
- IMPLEMENTATION-ROADMAP.md — 4-phase rollout with GBP checklist

**Next steps:**
- Fill in .env.local with real Supabase + Resend keys
- Run migration SQL in Supabase dashboard (supabase/migrations/001_initial_schema.sql)
- Authenticate Supabase MCP (run /mcp in Claude Code terminal, select supabase, authenticate)
- Session 3: Frontend design — user will provide screenshots + assets

---

# Session Notes

End-of-session summaries written by Claude Code. Most recent at top.

---

## 2026-04-13 — Setup Session

**What we did:**
- Installed NotebookLM skill + authenticated with Google
- Installed Obsidian CLI skill + connected Triple J Website vault
- Created project folder at ~/Desktop/Triple J Project
- Added NotebookLM notebook (empty, ready for docs)
- Established two-brain memory architecture:
  - NotebookLM = document store (you upload, I query)
  - Obsidian = working memory (I read at start, write at end)

**Next steps:**
- Upload project docs/briefs to NotebookLM
- Fill in Project Context with goals and stack
- Start building the site

_Maintained by Claude Code_