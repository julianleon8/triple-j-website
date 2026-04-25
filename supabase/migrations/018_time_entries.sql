-- Phase 4.x — time_entries (labor) + auto roll-up to job_costs
-- (data-model audit 2026-04-24, §7)
--
-- Tracks crew labor per job. crew_member is free text for now ("Freddy",
-- "Julian", "Juan", or future hires) — promote to a crew_members table
-- once roster gets big enough to need it. Either hourly_rate*hours OR
-- flat_amount can drive total_cost; a generated column picks whichever
-- is non-null.
--
-- AFTER INSERT/UPDATE trigger pushes the row into job_costs as
-- cost_type='labor' so the unified ledger stays current. DELETE trigger
-- removes the matching job_costs row.
--
-- Depends on: 017 (job_costs table + tg_jobs_recompute_profit fn).

create table if not exists public.time_entries (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  job_id       uuid not null references public.jobs(id) on delete cascade,
  crew_member  text not null,
  work_date    date not null,
  hours        numeric(5,2) not null,
  hourly_rate  numeric(8,2),
  flat_amount  numeric(10,2),
  total_cost   numeric(10,2) generated always as (
    coalesce(flat_amount, coalesce(hourly_rate, 0) * hours)
  ) stored,
  notes        text
);

create index if not exists time_entries_job_id_idx
  on public.time_entries (job_id);

create index if not exists time_entries_date_idx
  on public.time_entries (work_date);

create index if not exists time_entries_crew_idx
  on public.time_entries (crew_member);

-- updated_at touch
create or replace function public.tg_time_entries_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists time_entries_touch_updated_at on public.time_entries;
create trigger time_entries_touch_updated_at
  before update on public.time_entries
  for each row execute function public.tg_time_entries_touch_updated_at();

alter table public.time_entries enable row level security;

create policy "authed full access on time_entries"
  on public.time_entries for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Roll into job_costs. Delete-then-insert pattern so an updated row
-- (e.g. corrected hours) replaces its old job_costs entry instead of
-- duplicating. tg_jobs_recompute_profit refreshes the cached margin.
create or replace function public.tg_time_entries_to_job_costs()
returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    delete from public.job_costs
      where source_table = 'time_entries' and source_id = old.id;
    perform public.tg_jobs_recompute_profit(old.job_id);
    return old;
  end if;

  delete from public.job_costs
    where source_table = 'time_entries' and source_id = new.id;

  insert into public.job_costs (job_id, cost_type, amount, source_table, source_id, logged_at, notes)
  values (new.job_id, 'labor', new.total_cost, 'time_entries', new.id, new.work_date, new.notes);

  perform public.tg_jobs_recompute_profit(new.job_id);
  return new;
end $$;

drop trigger if exists time_entries_to_costs on public.time_entries;
create trigger time_entries_to_costs
  after insert or update or delete on public.time_entries
  for each row execute function public.tg_time_entries_to_job_costs();

comment on table public.time_entries is
  'Crew labor log. Each row auto-rolls into job_costs as cost_type=''labor'' via trigger.';
comment on column public.time_entries.total_cost is
  'Generated: flat_amount when set, otherwise hourly_rate * hours. Always non-null since hours is required + at least one of flat_amount / hourly_rate is expected at insert time.';
