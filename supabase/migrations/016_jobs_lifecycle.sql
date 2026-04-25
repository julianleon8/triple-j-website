-- Phase 4.x — jobs lifecycle / cached profit columns
-- (data-model audit 2026-04-24, §7)
--
-- Adds:
--   - contract_signed_date — separate from scheduled_date so the gap
--     between sign + start can be measured (deposit-to-install lag).
--   - gross_profit_cached / gross_margin_cached — roll-up snapshots
--     refreshed by the tg_jobs_recompute_profit() function added in
--     migration 017. Cached so /hq/more/stats can render without
--     re-aggregating job_costs on every request.
--
-- gross_margin_cached is numeric(5,4) → 0.0000–1.0000 (4 decimal precision).

alter table public.jobs
  add column if not exists contract_signed_date date,
  add column if not exists gross_profit_cached  numeric(10,2),
  add column if not exists gross_margin_cached  numeric(5,4);

comment on column public.jobs.contract_signed_date is
  'Date Julian + customer signed the contract. Distinct from scheduled_date — the gap between the two is deposit-to-install lag (a key ops metric).';
comment on column public.jobs.gross_profit_cached is
  'total_contract minus sum(job_costs.amount) for this job. Refreshed by tg_jobs_recompute_profit() (migration 017). Cached for dashboard speed.';
comment on column public.jobs.gross_margin_cached is
  'gross_profit_cached / total_contract. NULL if total_contract is 0 or unset.';
