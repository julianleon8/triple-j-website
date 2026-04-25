-- Phase 4.x — leads outcome columns + status-change trigger
-- (data-model audit 2026-04-24, §7)
--
-- Lets the dashboard answer "why did we lose this lead" + "how long
-- from inbound to won/lost". The trigger auto-stamps won_at / lost_at
-- / first_response_at on status transitions so the /hq UI doesn't have
-- to remember to set them manually.
--
-- Depends on: nothing (parallel-safe with 014).

alter table public.leads
  add column if not exists won_at            timestamptz,
  add column if not exists lost_at           timestamptz,
  add column if not exists lost_reason       text,
  add column if not exists lost_reason_notes text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'leads_lost_reason_check'
  ) then
    alter table public.leads
      add constraint leads_lost_reason_check
        check (lost_reason is null or lost_reason in
          ('price','timeline','went_with_competitor','changed_mind',
           'unreachable','no_budget','out_of_area','other'));
  end if;
end $$;

-- Trigger: auto-stamp first_response_at when leaving 'new', won_at on
-- status='won', lost_at on status='lost'. All three idempotent — only
-- writes if the column is currently null + the transition is fresh.
create or replace function public.tg_leads_status_timestamps()
returns trigger language plpgsql as $$
begin
  if new.status = 'won' and old.status <> 'won' and new.won_at is null then
    new.won_at = now();
  end if;
  if new.status = 'lost' and old.status <> 'lost' and new.lost_at is null then
    new.lost_at = now();
  end if;
  if old.status = 'new' and new.status <> 'new' and new.first_response_at is null then
    new.first_response_at = now();
  end if;
  return new;
end $$;

drop trigger if exists leads_status_timestamps on public.leads;
create trigger leads_status_timestamps
  before update on public.leads
  for each row execute function public.tg_leads_status_timestamps();

comment on column public.leads.lost_reason is
  'Set when status transitions to lost. Powers the lost-reason breakdown on /hq/more/stats.';
comment on column public.leads.won_at is
  'Auto-stamped by leads_status_timestamps trigger when status changes to won. Used for win-rate / time-to-close metrics.';
