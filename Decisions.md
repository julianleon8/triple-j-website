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