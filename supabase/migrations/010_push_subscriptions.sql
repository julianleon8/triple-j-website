-- Browser push subscriptions (VAPID web push).
-- One row per (user, device). Endpoint uniqueness guards against duplicates
-- when the same device re-subscribes after token rotation.

create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now()
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);

-- RLS: readable/writable only to the owning user via service role (API routes).
-- Public/anon clients never touch this table directly.
alter table public.push_subscriptions enable row level security;
