-- Phase 4.x — customers compounding flags
-- (data-model audit 2026-04-24, §7)
--
-- Powers the post-install flywheel:
--   - Review-ask cadence: when did we ask + did they leave it
--   - Photo-feature permission: can we use their build in marketing
--   - Repeat-contact opt-in: ok to text in 12mo for accessory upsell
--
-- All optional / nullable. The /hq/customers/[id] surface and the
-- weekly-cron will populate these going forward. Backfilling existing
-- customers is left for a separate operation.

alter table public.customers
  add column if not exists review_asked_at             timestamptz,
  add column if not exists review_followup_due_at      timestamptz,
  add column if not exists review_left_at              timestamptz,
  add column if not exists review_url                  text,
  add column if not exists feature_permission          boolean,
  add column if not exists feature_permission_asked_at timestamptz,
  add column if not exists repeat_contact_permission   boolean,
  add column if not exists repeat_contact_asked_at     timestamptz;

create index if not exists customers_review_followup_idx
  on public.customers (review_followup_due_at)
  where review_followup_due_at is not null and review_left_at is null;

comment on column public.customers.review_followup_due_at is
  'When to nudge again if review_left_at is still null. Indexed for the weekly cron that scans for due follow-ups.';
comment on column public.customers.feature_permission is
  'Customer agreed to let us use their finished build in marketing photos / case studies. NULL = never asked.';
comment on column public.customers.repeat_contact_permission is
  'Opt-in for follow-up text in 12mo (accessory / expansion upsell). NULL = never asked.';
