-- Customer-stated call window, captured on the public quote form.
--
-- Speed-to-response is the single biggest conversion lever we have, and the
-- form already asks when the job needs doing (`timeline`); this asks when the
-- customer can actually pick up the phone. The two are unrelated -- an ASAP
-- job from someone who only answers after 5pm is still an evening callback.
--
-- Nullable, and the CHECK admits NULL, because the Facebook webhook
-- (api/webhooks/facebook), the voice-memo intake (api/hq/voice-lead) and the
-- HQ test route all insert leads without ever seeing this field.

alter table public.leads
  add column if not exists best_time_to_call text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'leads_best_time_to_call_check'
  ) then
    alter table public.leads
      add constraint leads_best_time_to_call_check
        check (best_time_to_call is null or best_time_to_call in (
          'morning',
          'afternoon',
          'evening'
        ));
  end if;
end $$;

comment on column public.leads.best_time_to_call is
  'When the customer said they can take a call: morning (before noon),
   afternoon (12-5), evening (after 5). NULL when unasked or unanswered --
   only the website quote form collects it.';
