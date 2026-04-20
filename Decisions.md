# Decisions Log

A running log of decisions made during the Triple J Website project.

| Date | Decision | Reason |
|------|----------|--------|
| 2026-04-13 | Set up NotebookLM as document memory | Source-grounded answers, reduce hallucination |
| 2026-04-13 | Set up Obsidian as working memory | Persistent context across sessions, token efficiency |
| 2026-04-13 | Created Triple J Project folder on Desktop | Central file drop for project assets |

_Maintained by Claude Code_

| 2026-04-13 | Use Next.js + Supabase + Resend as backend stack | Free tier covers MVP; Postgres+RLS for security; no separate backend server |
| 2026-04-13 | 3-phase backend roadmap: MVP (lead capture) → Phase 2 (quotes+jobs) → Phase 3 (payments) | Ship fast, validate before building complex features |
| 2026-04-13 | Owner dashboard at /dashboard, Supabase Auth protected | Single owner account, row-level security on all tables |
| 2026-04-13 | Tokenized quote acceptance (no customer login) | Reduces friction — customer clicks Accept in email, no account needed |
| 2026-04-13 | SEO strategy: target hyper-local TX keywords competitors don't own | carports waco tx, welded carports central texas — zero competition on these |
| 2026-04-14 | Build public frontend in 3 phases (design system → homepage sections → form/gallery) | Ship incrementally, review after each phase before building next |
| 2026-04-14 | Use (marketing) route group to isolate public chrome from dashboard/login | Clean separation — Header/Footer only wrap public pages |
| 2026-04-14 | Design direction: WolfSteel-inspired, steel-blue #1e6bd6, no dark mode | Premium local contractor feel; dark mode doubles CSS work for zero audience benefit |
| 2026-04-14 | src/lib/site.ts as single source of truth for NAP, nav, services, cities | One edit point for all site-wide constants |
| 2026-04-14 | QuoteForm dimensions: W×L×H as 3 numeric fields, concat into message field | Captures structured size data without requiring a DB migration |
| 2026-04-14 | ClickUp as CRM: HOLD — revisit when live leads come in | Don't over-engineer before validating lead volume; Option 2 (ClickUp + custom quotes) preferred if/when needed |
| 2026-04-14 | Sandbox can't push to GitHub (proxy blocks outbound) | Julian must run `git push origin main` from his Mac Terminal |
| 2026-04-15 | Font system: Geist → Barlow Condensed (headlines) + Inter (body) | Industrial/confident feel; Barlow Condensed is tight and bold without needing custom weights |
| 2026-04-15 | Tagline locked: "Built right, built fast, built by Triple J." | Julian approved; replaces generic placeholder |
| 2026-04-15 | TrustBar stats: Zero Subcontractors / Welded or Bolted / Same-Week / Temple TX | More differentiating than generic "150+ Projects" stats |
| 2026-04-15 | "48-hour build" messaging removed site-wide | 48 hrs = materials arrival time, NOT build time. Misleading. Replaced with "same-week" language. |
| 2026-04-15 | "Custom welded" → "welded or bolted" everywhere | Triple J offers BOTH options. Saying only welded was losing bolted-interested customers. |
| 2026-04-15 | Added Lean-to Patios + House Additions as services | Real services Triple J performs; were absent from all service lists and nav |
| 2026-04-15 | Testimonials: auto-scroll marquee instead of static grid | More engaging; hides the fact that placeholder copy is thin until real reviews arrive |
| 2026-04-15 | inspiration/screenshots/ folder created | Drop zone for visual reference screenshots before next design pass |
| 2026-04-15 | Dashboard deployment on hold | Auth flow not yet built; Julian still needs to set 7 Vercel env vars |
| 2026-04-20 | "Triple J" name meaning logged: Juan + Julian + Jose Alfredo ("Freddy") | Vault didn't have it; Freddy is foreman with all jobsite skills, key person for SEO/marketing realism |
| 2026-04-20 | Lead Engine V1 picked as next build | Permit-scrape → Claude parse → Supabase pipeline → dashboard call list. Skip Apollo enrichment, skip auto-outreach, skip SEO + barndo engines for now. Validate lead quality before adding cost/automation. |
| 2026-04-20 | Lead Engine filter strategy = **B (stay close to wheelhouse)** | <$500K valuation, pole barns / ag / small commercial accessory / auto-storage. Skip large industrial PEMB / warehouse subcontractor pivot. Triple J needs realistic close-rate leads NOW, not commercial-pivot leads later. |
| 2026-04-20 | Renamed `/dashboard` → `/hq` and removed Owner Login from public Footer | Reduce attack surface and obscurity-by-naming. URL is no longer guessable; no public link points at the auth surface. Middleware still enforces Supabase auth at `/hq/:path*`. Julian to enable 2FA in Supabase Auth himself. |
| 2026-04-20 | Domain = **triplejmetaltx.com** (Squarespace registrar, ~$3 first-year promo) | Texas-local SEO wedge (`tx` signals state). Short, .com, matches brand. Migrating off Wix `TripleJJMetal.com` (two-J name didn't match brand identity). |
| 2026-04-20 | Email = **julian@triplejmetaltx.com** via Google Workspace Business Starter | Real Gmail inbox on custom domain. Industry standard, unlocks Gmail/Calendar/Drive/Meet on the brand. ~$7/user/mo. |