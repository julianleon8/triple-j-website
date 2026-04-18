-- QuickBooks Online OAuth token storage
-- One row per QBO company (realm). We only expect one row in practice.

create table if not exists public.qbo_tokens (
  id uuid primary key default uuid_generate_v4(),
  realm_id text not null unique,
  access_token text not null,
  refresh_token text not null,
  access_token_expires_at timestamptz not null,
  refresh_token_expires_at timestamptz not null,
  updated_at timestamptz default now()
);

-- Only authenticated (owner) can read/write tokens
alter table public.qbo_tokens enable row level security;

create policy "Owner full access to qbo_tokens"
  on public.qbo_tokens
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
