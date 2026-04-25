-- Multi-day job span support for /hq/calendar v1.
--
-- Existing jobs treated as single-day: when end_date is null, the
-- calendar renders the job as a one-day chip on scheduled_date. When
-- end_date is set, the job renders as a span from scheduled_date
-- through end_date inclusive.
--
-- Additive + idempotent. Safe to re-run. No backfill required.

alter table public.jobs
  add column if not exists end_date date;

-- Compound index on the common calendar-overlap query:
--   "give me every job whose scheduled_date..end_date intersects week X"
-- Helps both the v1 read-only week view + the future drag-to-reschedule
-- range query that v2 will run.
create index if not exists jobs_scheduled_end_idx
  on public.jobs (scheduled_date, end_date);

comment on column public.jobs.end_date is
  'Last day of the install. NULL = single-day job ending on scheduled_date. /hq/calendar renders multi-day jobs as a span when this is set.';
