# Next Session Primer — Read This First

_Created: 2026-04-21 evening · Last updated 2026-04-22 · For any Claude session picking up after 2026-04-22_

---

## What shipped 2026-04-22 (functional pass)

**4 functional wins:**
1. Email sender unified to `@triplejmetaltx.com` across all Resend send paths. `reply_to: julianleon@triplejmetaltx.com` added for quote + lead confirmation sends. **Julian must verify domain in Resend dashboard (DKIM/SPF/DMARC green), otherwise sends bounce silently.**
2. Manual `+ New Customer` button on `/hq/customers` — walk-ins, referrals, phone calls now have a path. `POST /api/customers` endpoint exists.
3. Manual `Run Scrape Now` button on `/hq/permit-leads` — kicks off permit scrape without curling with CRON_SECRET. Dual auth on `/api/cron/scrape-permits`: Bearer for cron, Supabase cookie for UI.
4. `/hq` home = 9-card KPI grid (Pipeline · Conversion · Revenue · Operations) pulling from `leads`, `customers`, `quotes`, `jobs`, `permit_leads` in parallel. Lead-pipeline pill row preserved as second tier.

**2 bug fixes earlier in the same session:**
- QuoteForm implicit-submit bug NUKED by removing `<form>` element entirely (now `<div>` + `onClick`).
- Lead delete with two-click confirm + `→ Customer` conversion button on `/hq` leads table.

**Phase B = next logical session.** Dedicated design pass for both HQ dashboard and public site. Scope: steel-blue nav redesign, Recharts/Tremor graphs + sparklines, funnel chart, public hero refresh, Spanish `/es/` landing, pricing page, quote templates UI. Component libs: Tremor (base) + 21st.dev (accents) + shadcn/ui charts (wrapper).

Reminder: `FB Marketplace Intel.md`, `Financing Research.md`, `Decisions.md` remain authoritative for strategy.

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
