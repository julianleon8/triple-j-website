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