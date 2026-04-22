# Triple J Website — Project Context

## What This Is
A lead-generation website + owner dashboard for Triple J Metal LLC. Maintained by Claude as working memory.

## NotebookLM
- Notebook URL: https://notebooklm.google.com/notebook/f4aaf762-3ede-45b9-a1ad-b9d8a6319207
- Use for: source-grounded answers from uploaded project documents

_Last updated: 2026-04-21 (evening)_

---

## Business Details
**Company:** Triple J Metal LLC (Triple JJJ Metal Buildings)
**Ownership:** Juan 40% / Freddy 40% / Julian 20% (per LegalZoom formation — paperwork verification pending)
**Team:** Juan (investor/co-owner) + Julian Leon Alvarez (son, **18**, sales lead + tech + welder) + Jose Alfredo "Freddy" (foreman/co-owner — welder + all jobsite skills)
**Address:** 3319 Tem-Bel Ln, Temple, TX 76502
**Phone:** 254-346-7764
**Domain:** triplejmetaltx.com (migrated from Wix — **DONE**, professional)
**Email:** julianleon@triplejmetaltx.com (Google Workspace Business Starter)
**Founded:** 2025 · 150+ projects completed · 50+ satisfied clients
**Type:** Metal construction — welded + bolted red-iron carports, garages, barns, RV covers, house additions, lean-to patios
**Location:** Central Texas (Temple base; serves Belton, Killeen, Harker Heights, Copperas Cove, Waco, Salado, Georgetown, Round Rock, Lampasas, Holland, Taylor, Troy, Nolanville)
**Suppliers:** MetalMax (Waco) — primary; MetalMart secondary; Capital Metal Buildings (Troy, Irvin Jimenez) — tertiary ≤30% of spend for specialty/overflow

**Crew capacity:** 2 welders in-house (Freddy + Julian). Juan = investor + relationships, not jobsite labor. Can scale to ~$3-5M revenue before needing a 3rd welder hire.

**Real net margin structure (discovered 2026-04-21):**
- Small jobs ($5-15K): **50-60% net** — owner-operated, paid-off equipment, direct supplier
- Medium jobs ($15-40K): **35-45% net**
- Large jobs ($40-100K+): **25-35% net** (compresses as hired labor grows)
- Reference data point: Copperas Cove job — $8,600 rev − $3,036 materials − $100 diesel = **$5,464 net on a single small building**

**Asset base:** Skid steer, Ram 2500, trailers — **all paid off**. F350 truck financed at ~$900/mo. Very low fixed overhead.

**Parallel family business:** Mexicano Grill (812 East Central Ave, Belton TX) — under rebuild, target reopen **mid-July 2026**. Juan-funded; Julian contributes welding labor (drive-through framework). Currently absorbing Triple J's cash + Juan's attention.

**Key differentiators (current / locked per Decisions.md):**
- **Same-week** turnaround (not 48-hour build — 48 hrs = materials arrival)
- **Welded OR bolted** (both capabilities; never "only welded")
- **Zero subcontractors** (owner-operated welders only)
- **4,000 PSI concrete** (above 3,000 PSI standard)
- **Turnkey** — site prep + concrete pad included
- **Paid-off equipment** = lean overhead = competitive pricing with 60% margins
- **Bilingual team** (Juan + Freddy Spanish; Julian English) — division of labor, not weakness

---

## Current Site Status (as of 2026-04-22)
**Site live at `triplejmetaltx.com`** · Dashboard live at `/hq` · Lead Engine deployed (cron daily 14:00 UTC) · Manual scrape trigger added · `/hq` home rebuilt as 9-card KPI grid · Manual customer create + lead delete/convert working · Email sender unified to `@triplejmetaltx.com`.

**Pending Julian action:** confirm `triplejmetaltx.com` is "Verified" in Resend dashboard (DKIM/SPF/DMARC green), otherwise all outbound Resend sends bounce silently.

_Historical: Previously listed "all code committed to GitHub, Vercel connected but NOT deployed" (2026-04-15). Domain migration + deploy completed 2026-04-21._

### What's in the repo (latest)
- Full design system: Barlow Condensed headlines + Inter body, steel-blue tokens, fluid typography
- Site chrome: Header, Footer (4-col NAP + Lean-to Patios + House Additions), MobileCallBar
- Homepage: Hero → TrustBar → Services → WhyTripleJ → HowItWorks → Gallery → Testimonials (auto-scroll marquee) → ServiceAreas → QuoteForm
- Multi-step QuoteForm: Step 1 (NAP+ZIP) → Step 2 (service+type+dimensions) → Step 3 (concrete+timeline+military)
- 14 location pages: Temple, Belton, Killeen, Harker Heights, Copperas Cove, Salado, Waco, Georgetown, Round Rock, Lampasas, Holland, Taylor, Troy, Nolanville
- 7 service pages: carports, garages, barns, rv-covers, hoa-structures, metal-porch-covers, pbr-vs-pbu-panels
- Additional pages: /gallery, /about, /contact, /service-areas
- Full backend: Supabase leads table with ZIP, concrete, timeline, military fields; Resend email alerts
- Owner dashboard at /dashboard (Supabase Auth protected)
- inspiration/screenshots/ folder — drop zone for visual reference

### Julian action items to deploy
1. `git push origin main` from Mac Terminal
2. Set 9 Vercel env vars from .env.local:
   - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
   - RESEND_API_KEY, OWNER_EMAIL, NEXT_PUBLIC_SITE_URL, SETUP_KEY
   - **ANTHROPIC_API_KEY** (Lead Engine — Claude permit-PDF extraction)
   - **CRON_SECRET** (Lead Engine — Vercel Cron Bearer auth)
   - **RESEND_WEBHOOK_SECRET** (Svix `whsec_…` — verifies Resend open/click webhooks at `/api/webhooks/resend`)
3. Update NEXT_PUBLIC_SITE_URL to real Vercel domain after first deploy
4. Test quote form end-to-end (Supabase leads table + owner email)
5. Run `supabase/migrations/004_permit_leads.sql` in Supabase SQL editor (Lead Engine table)
6. Run `supabase/migrations/006_email_events.sql` in Supabase SQL editor (Resend open/click tracking)
7. In Resend dashboard → Webhooks → add endpoint `https://triplejmetaltx.com/api/webhooks/resend`, subscribe to `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`, `email.complained`, copy the `whsec_…` signing secret into `RESEND_WEBHOOK_SECRET`

### Pending / future work
- Real Google reviews → fill testimonials.md → swap placeholder Testimonials cards
- Julian: drop inspiration screenshots into inspiration/screenshots/ for next design pass
- Niche landing pages: barndominium foundations, RV carports Fort Cavazos, custom metal sheds
- Quote calculator (phase 4): instant price estimate
- Stripe payments (phase 4): deposit capture post-quote-acceptance
- Dashboard auth flow: not built yet — on hold until Vercel is live
- Cdance hero video: on hold pending AI-generated footage from Julian

---

## Stack
- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind v4 — deployed on Vercel
- **Database + Auth:** Supabase (Postgres + RLS + Supabase Auth)
- **Email:** Resend (lead alerts to owner + customer confirmation)
- **Payments (future):** Stripe
- **Memory:** Obsidian (this vault) = working memory; NotebookLM = document store

## Key source files
- `src/lib/site.ts` — single source of truth for NAP, nav links, services, cities (edit here first)
- `src/app/globals.css` — all design tokens (brand color, ink, typography)
- `src/components/site/Header.tsx` — sticky header with top bar + mobile drawer
- `src/components/site/Footer.tsx` — 4-col footer
- `src/components/sections/QuoteForm.tsx` — lead capture form (POST /api/leads)
- `src/app/api/leads/route.ts` — lead submission API (Supabase insert + Resend emails)

---

## Design direction
- WolfSteel-inspired: dark header/footer, white body, steel-blue accents
- No dark mode — single direction
- Phone number visible at all times (top bar + mobile sticky bar)
- Hero photo: red-iron-frame-hero.jpg (static, fast-loading)
- Display font: TBD (Geist placeholder)
- Brand blue: #1e6bd6 (steel blue, --color-brand-600)

---

## CRM / Dashboard decision (2026-04-14)
- ClickUp considered as CRM layer — MCP available if needed later
- Decision: **hold for now**. Revisit once live leads start coming in.
- If volume grows, Option 2 is preferred: ClickUp for pipeline management + keep custom system for quotes
- Custom quote system (tokenized PDF/email + customer acceptance page) can't be replicated in ClickUp

---

## Key Competitors
- Alan's Factory Outlet (dominant TX, 24k reviews, 3D configurator)
- East Texas Carports (7k installs, 4–16 week lead times, no concrete)
- Absolute Steel (Terrell TX, 25yr family-owned)
- WolfSteel Buildings (design inspiration — "I like theirs but we can do better")
- Carport Central (industry-leading 3D estimator)

## SEO (docs in seo/ folder)
- Target: hyper-local TX keywords competitors don't own
- Priority: carports with concrete belton tx, welded carports central texas, turnkey carports killeen
- Location pages live at /locations/[slug] for 5 cities
