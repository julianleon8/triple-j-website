# Triple J Website — Project Context

## What This Is
A lead-generation website + owner dashboard for Triple J Metal LLC. Maintained by Claude as working memory.

## NotebookLM
- Notebook URL: https://notebooklm.google.com/notebook/f4aaf762-3ede-45b9-a1ad-b9d8a6319207
- Use for: source-grounded answers from uploaded project documents

_Last updated: 2026-04-14_

---

## Business Details
**Company:** Triple J Metal LLC (Triple JJJ Metal Buildings)
**Owner:** Juan Luis Leon (father) + Julian Leon Alvarez (son, 19, daily ops)
**Address:** 3319 Tem-Bel Ln, Temple, TX 76502
**Phone:** 254-346-7764
**Founded:** 2025 · 150+ projects completed · 50+ satisfied clients
**Type:** Metal construction — welded + bolted red-iron carports, garages, barns, RV covers
**Location:** Central Texas (Temple base; also serves Belton, Killeen, Harker Heights, Copperas Cove)
**Suppliers:** MetalMax (Waco) — primary; MetalMart
**Key differentiators:**
- 48-hour build time (competitors take 4–16 weeks)
- Turnkey: site prep + concrete pad included (nobody else does this)
- Welded not bolted — permanent, storm-proof
- Local Temple-based crew — no middlemen

---

## Current Site Status (as of 2026-04-14)
**The site is built and code is committed to GitHub (`julianleon8/triple-j-website`).**
**Vercel is connected to the repo but NOT yet deployed** — waiting on env vars + Julian to push.

### What's live in the repo
- Full design system: steel-blue tokens, typography, Button, Container, SVG icons
- Site chrome: Header (sticky+shrink, top bar w/ phone, mobile drawer), Footer (4-col NAP), MobileCallBar
- Homepage sections: Hero → TrustBar → Services → WhyTripleJ → HowItWorks → Gallery → Testimonials → ServiceAreas → QuoteForm
- QuoteForm wired to POST /api/leads (Name, Phone, Email, City, Service, W×L×H, structure type, notes)
- 6 real Triple J job photos in /public/images/
- Route group (marketing) isolates public chrome from dashboard/login/api
- Full backend: leads, customers, quotes, quote_line_items, quote_templates, jobs tables (Supabase + RLS)
- Owner dashboard at /dashboard (Supabase Auth protected): leads, customers, quotes, jobs
- Tokenized quote acceptance (customer clicks Accept in email — no login needed)
- 5 location pages: /locations/[slug] for Temple, Belton, Killeen, Harker Heights, Copperas Cove

### What still needs doing (next session)
- Julian must: `git push origin main` from his Mac Terminal (sandbox can't push — proxy blocks it)
- Vercel env vars: set all 7 variables from .env.local before clicking Deploy
  - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
  - RESEND_API_KEY, OWNER_EMAIL, NEXT_PUBLIC_SITE_URL, SETUP_KEY
  - Update NEXT_PUBLIC_SITE_URL to the real Vercel domain after first deploy
- Test quote form end-to-end (check Supabase leads table + owner email alert fires)
- Design iteration: Julian needs to review localhost and give feedback before next push

### Pending / future work
- Supabase migration SQL: run supabase/migrations/001_initial_schema.sql if not done yet
- Display font: placeholder (Geist) — decide on Barlow Condensed/Oswald later
- Testimonials: placeholder copy — swap when real Google reviews arrive
- Gallery: add more job photos as they accumulate
- Services pages: /services/[slug] don't exist yet (linked in nav + service cards)
- Gallery page: /gallery doesn't exist yet (linked in footer)
- About page: /about doesn't exist yet
- Contact page: /contact doesn't exist yet
- Quote calculator (phase 4): instant price estimate on homepage
- Stripe payments (phase 4): deposit capture post-quote-acceptance

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
