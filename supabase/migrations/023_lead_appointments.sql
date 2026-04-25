-- Lead site-visit + follow-up appointments. Surfaced in /hq/calendar v1
-- alongside jobs (jobs.scheduled_date) and permit-lead callbacks
-- (permit_leads.called_at).
--
-- Until this table existed, lead site visits lived in Julian's head or
-- in `leads.notes` as freeform text — invisible to the schedule. v1 of
-- the calendar surfaces them as amber chips at appointment_at.
--
-- Additive + idempotent. Safe to re-run.

create table if not exists public.lead_appointments (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  lead_id         uuid not null references public.leads(id) on delete cascade,
  appointment_at  timestamptz not null,
  duration_min    integer default 60,
  kind            text not null default 'site_visit'
                  check (kind in ('site_visit', 'follow_up_call', 'other')),
  notes           text
);

create index if not exists lead_appointments_at_idx
  on public.lead_appointments (appointment_at);

create index if not exists lead_appointments_lead_idx
  on public.lead_appointments (lead_id);

-- updated_at auto-trigger (mirrors the pattern from migration 013
-- job_receipts) so HQ UI can show "edited Nm ago" on appointment edits.
create or replace function public.tg_lead_appointments_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists lead_appointments_touch_updated_at on public.lead_appointments;
create trigger lead_appointments_touch_updated_at
  before update on public.lead_appointments
  for each row execute function public.tg_lead_appointments_touch_updated_at();

alter table public.lead_appointments enable row level security;

create policy "authed full access on lead_appointments"
  on public.lead_appointments
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

comment on table public.lead_appointments is
  'Site visits + follow-up calls scheduled with a lead. Rendered on /hq/calendar alongside jobs + permit-lead callbacks.';
