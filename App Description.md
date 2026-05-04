# App Description — Triple J Metal Website

## 15 Adjectives

1. Local
2. Lean
3. Fast-loading
4. Mobile-first
5. SEO-tuned
6. Conversion-focused
7. Trust-building
8. Niche-targeted
9. Family-branded
10. Texan
11. Lead-hungry
12. Owner-operated
13. Same-week-promising
14. Military-aware
15. Authority-driven

## What it is

The public-facing website and back-office cockpit for **Triple J Metal**, a family-owned metal-building contractor based in Temple, TX. It is a Next.js 16 / React 19 / Tailwind v4 app with a Supabase backend, Resend for transactional email, and Vercel for hosting. Two halves live in one repo:

- **Marketing site** (`src/app/(marketing)/`) — homepage, 6 niche service pages (welded carports, bolted garages, barns, RV/boat covers, lean-to patios, house additions), 14 location pages (Temple + every Central Texas city Triple J serves), trust bar, auto-scrolling testimonials marquee, and a multi-step quote form.
- **Owner dashboard** (`src/app/dashboard/`) — Supabase-Auth-protected console for Juan, Julian, and Freddy to track customers, jobs, gallery uploads, quotes, and incoming leads.

## What it does

1. **Pulls** local search traffic for "metal building / carport / barndominium + city" across 14 Central Texas towns.
2. **Converts** that traffic through a ZIP-gated, three-step lead form (ZIP → service + type + dimensions → concrete + timeline + military status).
3. **Validates** each submission with Zod, looks up the city from the ZIP, drops the lead into Supabase (with RLS), and fires two Resend emails — one customer confirmation, one owner notification.
4. **Surfaces** the lead in the dashboard so the crew can quote and schedule a same-week build.
5. **Reinforces trust** with the locked positioning — "Built right, built fast, built by Triple J" — Zero Subcontractors / Welded or Bolted / Same-Week / 4,000 PSI concrete / Temple TX.
6. **Lays the rails** for Phase 4 Stripe deposits, so the same lead funnel can collect money once the build pipeline can absorb the volume.

## How much it earns (hopefully)

The site itself doesn't charge anyone — it earns by feeding the build crew. Rough hopeful math:

| Lever | Conservative | Hopeful | Stretch |
|---|---|---|---|
| Qualified leads / month | 20 | 40 | 80 |
| Close rate | 15% | 25% | 30% |
| Closed builds / month | 3 | 10 | 24 |
| Avg ticket (mix of carports, garages, barns, additions) | $12K | $18K | $25K |
| **Monthly gross** | **$36K** | **$180K** | **$600K** |
| **Annual gross** | **~$430K** | **~$2.2M** | **~$7.2M** |

Year-one realistic target: **$500K–$1.5M gross** off the website pipeline alone, scaling toward the hopeful column once the testimonials marquee fills with real Google reviews and the location pages start ranking. Margin sits in the build cost, not the code — but every lead the form catches that the phone would have missed is pure upside.
