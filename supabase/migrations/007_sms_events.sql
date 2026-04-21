-- SMS delivery events from Twilio + scheduled outbound SMS queue.
-- Mirrors the email_events shape so the dashboard can surface both next to
-- each other on the Leads/Jobs tables.

create table if not exists public.sms_events (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  twilio_sid text,
  status text not null,
  to_phone text not null,
  body text,
  template text,
  lead_id uuid references public.leads(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  job_id uuid references public.jobs(id) on delete set null,
  occurred_at timestamptz not null default now(),
  raw jsonb
);

create index if not exists sms_events_lead_id_idx on public.sms_events (lead_id);
create index if not exists sms_events_customer_id_idx on public.sms_events (customer_id);
create index if not exists sms_events_job_id_idx on public.sms_events (job_id);
create index if not exists sms_events_occurred_at_idx on public.sms_events (occurred_at desc);
create index if not exists sms_events_twilio_sid_idx on public.sms_events (twilio_sid);

alter table public.sms_events enable row level security;

create policy "Owner full access to sms_events"
  on public.sms_events
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Deferred/scheduled outbound SMS. Cron drains rows where send_at <= now().
create table if not exists public.scheduled_sms (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  send_at timestamptz not null,
  template text not null,
  variables jsonb not null default '{}'::jsonb,
  to_phone text not null,
  lead_id uuid references public.leads(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  job_id uuid references public.jobs(id) on delete cascade,
  status text not null default 'pending',
  sent_at timestamptz,
  sms_event_id uuid references public.sms_events(id) on delete set null,
  last_error text
);

create index if not exists scheduled_sms_pending_idx
  on public.scheduled_sms (status, send_at)
  where status = 'pending';
create index if not exists scheduled_sms_job_id_idx on public.scheduled_sms (job_id);

alter table public.scheduled_sms enable row level security;

create policy "Owner full access to scheduled_sms"
  on public.scheduled_sms
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
