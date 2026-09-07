-- 026_cron_runs.sql
--
-- Durable run history for scheduled jobs. Until now NOTHING in this repo
-- recorded that a cron ran. Both existing crons (scrape-permits,
-- review-followups) build a result object, return it as the HTTP response,
-- and discard it. /hq/activity looks like a log but is a *derived* feed
-- synthesized from business-table timestamps — it writes nothing.
--
-- That gap makes three ordinary questions unanswerable:
--
--   1. "What changed since my last run?"  — needed by the bounce watch, which
--      must report only email_events that arrived since it last succeeded.
--   2. "Has this returned zero N times running?" — needed by the permit-scraper
--      yield alarm. Bell County's index URL is hardcoded to year_2026.php and
--      must be changed every January (see src/lib/permit-sources.ts); when it
--      rots, the scraper keeps returning 200 with zero rows and nothing notices.
--   3. "Is this job failing?" — today the only durable failure trace anywhere
--      in the codebase is the per-row job_receipts.qbo_push_error column.
--
-- One row per invocation, opened before the work and closed after it.

create table if not exists public.cron_runs (
  id          uuid primary key default uuid_generate_v4(),
  job         text not null,
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  ok          boolean,
  yield       integer not null default 0,
  notified    integer not null default 0,
  error       text,
  detail      jsonb
);

comment on table public.cron_runs is
  'One row per scheduled-job invocation. Written by withCronRun() in src/lib/cron.ts. Read back for "since last success", zero-yield streaks and failure streaks.';
comment on column public.cron_runs.job is
  'Stable job slug, matching the route segment: scrape-permits, review-followups, stale-leads, quote-sweep, bounce-watch, qbo-keepalive, receipt-push, scrape-watch, review-watch, morning-digest.';
comment on column public.cron_runs.ok is
  'NULL while in flight. A row with ok IS NULL and finished_at IS NULL after the job''s max duration died mid-run (timeout / cold-start eviction) — distinct from a clean ok=false failure.';
comment on column public.cron_runs.yield is
  'Units the run actually acted on: permits inserted, quotes expired, leads nudged. Zero-yield streaks are how the scraper alarm detects silent rot.';
comment on column public.cron_runs.notified is
  'Pushes + emails actually delivered. Distinct from yield: a run can find 3 stale leads (yield 3) and deliver 1 batched push (notified 1).';
comment on column public.cron_runs.detail is
  'Free-form per-job payload — e.g. the scraper''s per-jurisdiction summary. Never read programmatically; it exists so a failed run can be diagnosed after the fact.';

-- Every read is "latest N rows for one job", so lead with job and sort desc.
create index if not exists cron_runs_job_started_idx
  on public.cron_runs (job, started_at desc);

alter table public.cron_runs enable row level security;
-- No policies: service-role only, following the app_owners convention from 024.
-- Written exclusively by getAdminClient() inside cron routes; never exposed to
-- the browser and never read with the anon key.
