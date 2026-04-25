-- Phase 4.x — job_receipts.cost_category + auto-roll into job_costs
-- (data-model audit 2026-04-24, §7)
--
-- Categorizes every receipt into the same enum the job_costs ledger
-- uses, then auto-rolls confirmed receipts (total is not null) into
-- job_costs via trigger. Existing receipts get default 'material' and
-- are backfilled into job_costs. Cached profit is recomputed for every
-- existing job at the end of the migration so /hq/jobs/[id] shows
-- correct numbers immediately.
--
-- Depends on: 017 (job_costs + tg_jobs_recompute_profit).
--
-- IMPORTANT: this migration adds a NOT NULL column with a default,
-- which Postgres handles fast in modern versions but does require
-- a brief table-level lock. job_receipts is small (one row per
-- receipt), so the lock is harmless.

alter table public.job_receipts
  add column if not exists cost_category text not null default 'material'
    check (cost_category in ('material','concrete_sub','fuel','permit','equipment','misc'));

create index if not exists job_receipts_cost_category_idx
  on public.job_receipts (cost_category);

-- Trigger: roll a confirmed receipt (total set) into job_costs. Skips
-- placeholder rows that exist before OCR completes (total is null).
-- Delete-then-insert so an edited receipt replaces its job_costs row
-- instead of duplicating. Recomputes cached profit at the end.
create or replace function public.tg_job_receipts_to_job_costs()
returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    delete from public.job_costs
      where source_table = 'job_receipts' and source_id = old.id;
    perform public.tg_jobs_recompute_profit(old.job_id);
    return old;
  end if;

  -- Only roll into job_costs once the user has confirmed the receipt
  -- (total is set). Pre-confirmation rows stay in job_receipts only.
  if new.total is not null and (
       old is null
    or old.total is null
    or old.total <> new.total
    or old.cost_category <> new.cost_category
    or old.job_id <> new.job_id
  ) then
    delete from public.job_costs
      where source_table = 'job_receipts' and source_id = new.id;

    insert into public.job_costs (job_id, cost_type, amount, source_table, source_id, logged_at, notes)
    values (new.job_id, new.cost_category, new.total, 'job_receipts', new.id,
            coalesce(new.receipt_date, current_date), new.memo);

    perform public.tg_jobs_recompute_profit(new.job_id);
  end if;
  return new;
end $$;

drop trigger if exists job_receipts_to_costs on public.job_receipts;
create trigger job_receipts_to_costs
  after insert or update or delete on public.job_receipts
  for each row execute function public.tg_job_receipts_to_job_costs();

-- Backfill: existing confirmed receipts → job_costs.
insert into public.job_costs (job_id, cost_type, amount, source_table, source_id, logged_at, notes)
select job_id, cost_category, total, 'job_receipts', id,
       coalesce(receipt_date, created_at::date), memo
from public.job_receipts
where total is not null
  and not exists (
    select 1 from public.job_costs jc
    where jc.source_table = 'job_receipts' and jc.source_id = public.job_receipts.id
  );

-- Refresh cached profit on every job so /hq stats are correct on first
-- page load after deploy. One-shot; subsequent updates flow through
-- the triggers.
do $$
declare r record;
begin
  for r in select id from public.jobs loop
    perform public.tg_jobs_recompute_profit(r.id);
  end loop;
end $$;

comment on column public.job_receipts.cost_category is
  'Maps to job_costs.cost_type. Default ''material'' covers steel + hardware. Other values for sub-trades, fuel, permit fees, equipment rental, miscellaneous.';
