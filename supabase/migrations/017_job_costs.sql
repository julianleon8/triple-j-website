-- Phase 4.x — job_costs unified ledger + profit recompute function
-- (data-model audit 2026-04-24, §7)
--
-- Single table that aggregates every dollar spent on a job from every
-- source (receipts, time entries, manual adjustments). One row per
-- cost line. The dashboard sums this table (filtered by job_id) to
-- compute true profit — so we can answer "what was the margin on the
-- 30x40 carport in Killeen" in one query.
--
-- source_table + source_id form a soft FK back to whichever table
-- generated the row, used by triggers in migrations 018 + 020 to
-- update or replace stale rows when the upstream record changes.
--
-- Depends on: 016 (gross_profit_cached / gross_margin_cached columns
-- on jobs).

create table if not exists public.job_costs (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  job_id        uuid not null references public.jobs(id) on delete cascade,
  cost_type     text not null check (cost_type in
                  ('material','concrete_sub','labor','fuel','permit','equipment','misc')),
  amount        numeric(10,2) not null,
  source_table  text not null check (source_table in ('job_receipts','time_entries','manual')),
  source_id     uuid,
  logged_at     timestamptz not null default now(),
  notes         text
);

create index if not exists job_costs_job_id_idx
  on public.job_costs (job_id);

create index if not exists job_costs_cost_type_idx
  on public.job_costs (cost_type);

create index if not exists job_costs_source_idx
  on public.job_costs (source_table, source_id);

-- updated_at touch trigger — same pattern as job_receipts (migration 013).
create or replace function public.tg_job_costs_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists job_costs_touch_updated_at on public.job_costs;
create trigger job_costs_touch_updated_at
  before update on public.job_costs
  for each row execute function public.tg_job_costs_touch_updated_at();

alter table public.job_costs enable row level security;

create policy "authed full access on job_costs"
  on public.job_costs for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Recompute helper. Called by triggers on job_costs (insert / update /
-- delete) AND by the receipts + time-entries triggers in 018 + 020 so
-- the cached profit on jobs stays current.
create or replace function public.tg_jobs_recompute_profit(p_job_id uuid)
returns void language plpgsql as $$
declare
  v_total numeric;
  v_costs numeric;
begin
  select total_contract into v_total from public.jobs where id = p_job_id;
  select coalesce(sum(amount), 0) into v_costs from public.job_costs where job_id = p_job_id;
  update public.jobs
    set gross_profit_cached = coalesce(v_total, 0) - v_costs,
        gross_margin_cached = case
          when v_total > 0 then (v_total - v_costs) / v_total
          else null
        end
    where id = p_job_id;
end $$;

-- Refresh cached profit whenever a job_costs row changes directly
-- (manual cost entries via /hq/jobs/[id]). Receipt + time-entry
-- triggers in 018/020 also call tg_jobs_recompute_profit, but route
-- via the upstream tables — those don't fire this trigger because the
-- recompute helper is invoked directly inside their AFTER triggers.
create or replace function public.tg_job_costs_recompute()
returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    perform public.tg_jobs_recompute_profit(old.job_id);
    return old;
  else
    perform public.tg_jobs_recompute_profit(new.job_id);
    return new;
  end if;
end $$;

drop trigger if exists job_costs_recompute on public.job_costs;
create trigger job_costs_recompute
  after insert or update or delete on public.job_costs
  for each row execute function public.tg_job_costs_recompute();

comment on table public.job_costs is
  'Unified cost ledger. Every dollar spent on a job ends up here — receipts (auto via trigger), labor (auto via time_entries trigger), or manual adjustments. Sum by job_id for true profit.';
comment on column public.job_costs.source_table is
  'Which upstream table generated this row. Used by triggers to replace stale rows when the source updates.';
