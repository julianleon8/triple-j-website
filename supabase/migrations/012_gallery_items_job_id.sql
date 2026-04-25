-- Phase 4.1 — tie gallery_items rows to an optional job for the
-- camera-first jobsite photo flow (/api/hq/job-photo).
--
-- Design calls:
--   * job_id is NULLABLE so existing public-site gallery photos (not tied
--     to a Supabase `jobs` row) keep working as-is.
--   * ON DELETE SET NULL so deleting a job doesn't nuke the photos — Julian
--     may want to keep them for the portfolio even after the job is done.
--   * Job-captured photos default to is_active = false (set by the API
--     route, not the DB) so they don't leak into the public /gallery page.
--     The existing "Public read active" RLS policy filters them out.
--   * Idempotent — safe to re-run in dev environments.

alter table public.gallery_items
  add column if not exists job_id uuid references public.jobs(id) on delete set null;

create index if not exists gallery_items_job_id_idx
  on public.gallery_items (job_id)
  where job_id is not null;

comment on column public.gallery_items.job_id is
  'Optional link to the job this photo was captured for. Phase 4.1 camera-first flow tags photos here; public portfolio photos (no job) leave it null.';
