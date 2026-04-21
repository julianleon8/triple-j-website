-- Email delivery events from Resend webhooks.
-- One row per event (sent, delivered, opened, clicked, bounced, complained).
-- Linked back to the originating lead or quote via Resend tags.

create table if not exists public.email_events (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  resend_id text not null,
  event_type text not null,
  email_type text,
  to_email text,
  subject text,
  lead_id uuid references public.leads(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  click_link text,
  occurred_at timestamptz not null,
  raw jsonb
);

create index if not exists email_events_resend_id_idx on public.email_events (resend_id);
create index if not exists email_events_lead_id_idx on public.email_events (lead_id);
create index if not exists email_events_quote_id_idx on public.email_events (quote_id);
create index if not exists email_events_occurred_at_idx on public.email_events (occurred_at desc);

alter table public.email_events enable row level security;

create policy "Owner full access to email_events"
  on public.email_events
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
