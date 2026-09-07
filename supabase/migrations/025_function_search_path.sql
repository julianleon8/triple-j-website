-- 025_function_search_path.sql
--
-- Supabase's security linter (lint 0011, function_search_path_mutable) flagged
-- all nine trigger functions as having a role-mutable search_path. A function
-- without a pinned search_path resolves unqualified names against whatever the
-- caller's search_path happens to be, so a caller who can create objects in an
-- earlier schema can shadow a table or operator the function relies on.
--
-- Pinning to `public, pg_temp` is the standard remediation. pg_temp goes last
-- deliberately: leaving it first would reintroduce the same shadowing risk via
-- temporary tables.
--
-- Signatures verified against pg_proc on 2026-09-06 — tg_jobs_recompute_profit
-- is the only one that takes an argument.

alter function public.tg_job_costs_recompute()                set search_path = public, pg_temp;
alter function public.tg_job_costs_touch_updated_at()         set search_path = public, pg_temp;
alter function public.tg_job_receipts_to_job_costs()          set search_path = public, pg_temp;
alter function public.tg_job_receipts_touch_updated_at()      set search_path = public, pg_temp;
alter function public.tg_jobs_recompute_profit(p_job_id uuid) set search_path = public, pg_temp;
alter function public.tg_lead_appointments_touch_updated_at() set search_path = public, pg_temp;
alter function public.tg_leads_status_timestamps()            set search_path = public, pg_temp;
alter function public.tg_time_entries_to_job_costs()          set search_path = public, pg_temp;
alter function public.tg_time_entries_touch_updated_at()      set search_path = public, pg_temp;
