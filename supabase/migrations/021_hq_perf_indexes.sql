-- Phase 3 perf push — HQ surface query indexes.
--
-- Additive only. Every CREATE INDEX is `if not exists`, so the migration
-- is idempotent and safe to re-run. No table writes, no schema reshape,
-- no data migration. Apply during low-traffic with `concurrently` if the
-- tables grow large; today's row counts make a brief lock acceptable.
--
-- Why these specific indexes — derived from the HQ queries the perf
-- baseline at docs/PERF-BASELINE-2026-04-25.md flagged:
--
--   1. /hq/leads pagination + counts query
--      - rows query: `.order(created_at desc).limit(50)`  → leads_created_idx
--      - counts query: filters by status across the full table  → leads_status_idx
--
--   2. /hq/jobs filtered list (status + scheduled_date)
--      - leads-style inbox segments by status, scheduled-this-week filter
--        in /hq/more/stats both want a (status, scheduled_date) compound.
--
--   3. /hq/customers/[id] activity timeline
--      - quotes by customer_id ordered by created_at desc.
--
--   4. /hq/jobs/[id] receipts strip
--      - job_receipts by job_id ordered by created_at desc.
--
-- Dropping any of these has zero correctness impact — only slows the
-- corresponding query. Safe to roll forward independently.

-- ── leads ───────────────────────────────────────────────────────────────
create index if not exists leads_created_idx
  on public.leads (created_at desc);

create index if not exists leads_status_idx
  on public.leads (status);

-- Compound for the common "new leads in last 24h" filter that
-- /hq/more/stats's stale-leads + hot-leads queries both touch.
create index if not exists leads_status_created_idx
  on public.leads (status, created_at desc);

-- ── jobs ────────────────────────────────────────────────────────────────
create index if not exists jobs_status_scheduled_idx
  on public.jobs (status, scheduled_date);

create index if not exists jobs_completed_idx
  on public.jobs (completed_date desc)
  where completed_date is not null;

-- ── quotes ──────────────────────────────────────────────────────────────
create index if not exists quotes_customer_created_idx
  on public.quotes (customer_id, created_at desc);

-- ── job_receipts ────────────────────────────────────────────────────────
-- Primary index already exists on job_id from migration 013; this adds
-- the created_at desc ordering used by JobReceiptStrip's "newest first"
-- query without changing the existing single-column index.
create index if not exists job_receipts_job_created_idx
  on public.job_receipts (job_id, created_at desc);

-- ── Verification ────────────────────────────────────────────────────────
-- After applying, run `EXPLAIN ANALYZE` on the queries below and confirm
-- index scans replace seq scans:
--
--   explain analyze
--     select status from leads;
--   explain analyze
--     select id, created_at, name, phone, email, city, zip, service_type,
--            structure_type, timeline, is_military, status, message
--     from leads order by created_at desc limit 50;
--   explain analyze
--     select * from jobs
--     where status in ('scheduled','in_progress')
--     order by scheduled_date;
--   explain analyze
--     select * from job_receipts
--     where job_id = '<some-uuid>' order by created_at desc;
