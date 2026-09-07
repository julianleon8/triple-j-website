-- 024_lock_down_rls.sql
--
-- Tightens row-level security. Context from the 2026-09-06 audit:
--
--   1. "Public quote acceptance" let an UNAUTHENTICATED anon-key holder UPDATE
--      any quote in 'sent' status. The USING clause had no accept_token
--      predicate, and WITH CHECK constrained only the final status — so the same
--      request could also rewrite total, accept_token or customer_id.
--
--   2. "Public lead submission" let anyone INSERT leads directly with the public
--      anon key, bypassing the captcha and rate limiter on /api/leads.
--
--   3. Every owner policy was `auth.role() = 'authenticated'`, meaning ANY user
--      of this Supabase project — not a specific owner — had full read/write on
--      leads, customers, quotes, jobs and qbo_tokens (which stores QuickBooks
--      access + refresh tokens in plaintext). If email signup is enabled on the
--      project, a stranger could self-register and read all of it over PostgREST.
--
-- SAFETY: this cannot break the application. Every data path in src/ goes
-- through getAdminClient() (service role), which bypasses RLS. The anon client
-- is used only for auth.getUser(). RLS here is pure defense-in-depth against
-- direct PostgREST access with the public anon key.

-- ── 1. Drop the two unauthenticated public policies ──────────────────────────
-- Neither is used: /api/quotes/[id]/accept and /api/leads both write via the
-- service role.
drop policy if exists "Public quote acceptance" on public.quotes;
drop policy if exists "Public lead submission" on public.leads;

-- ── 2. Owner allowlist ───────────────────────────────────────────────────────
-- Keep this in sync with the OWNER_EMAIL env var (same addresses).
create table if not exists public.app_owners (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.app_owners enable row level security;
-- No policies: service-role only. Manage rows from the Supabase SQL editor.

-- Seed from the accounts that already exist rather than hardcoding an address.
-- As of 2026-09-06 there is exactly one auth user, created 2026-04-15 — the
-- owner. This is self-correcting and avoids baking a guessed email into schema.
insert into public.app_owners (email)
select u.email from auth.users u where u.email is not null
on conflict (email) do nothing;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_owners
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to authenticated;

-- ── 3. Replace every `auth.role() = 'authenticated'` policy with is_owner() ──
do $$
declare
  t text;
  owner_tables text[] := array[
    'leads', 'customers', 'quotes', 'quote_line_items', 'quote_templates',
    'jobs', 'gallery_items', 'gallery_photos', 'permit_leads', 'qbo_tokens',
    'email_events', 'partner_inquiries', 'job_receipts', 'job_costs',
    'time_entries', 'lead_appointments'
  ];
begin
  foreach t in array owner_tables loop
    if to_regclass('public.' || t) is null then
      raise notice 'skipping %, table does not exist', t;
      continue;
    end if;

    -- Drop the known legacy policy names from migrations 001-023.
    execute format('drop policy if exists %I on public.%I', 'Owner full access', t);
    execute format('drop policy if exists %I on public.%I',
                   'Owner full access to ' || t, t);
    execute format('drop policy if exists %I on public.%I',
                   'authed full access on ' || t, t);

    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "Owner full access" on public.%I for all
         using (public.is_owner()) with check (public.is_owner())', t);
  end loop;
end $$;

-- ── 4. Preserve the legitimately-public reads ────────────────────────────────
-- /gallery renders published items and their photos for anonymous visitors.
-- These already existed and were correctly scoped to is_active; step 3 only
-- replaced the "Owner full access" policies, but recreate them idempotently so
-- this migration is safe to re-run.
drop policy if exists "Public read active" on public.gallery_items;
create policy "Public read active" on public.gallery_items
  for select using (is_active = true);

drop policy if exists "Public read photos of active items" on public.gallery_photos;
create policy "Public read photos of active items" on public.gallery_photos
  for select using (
    exists (
      select 1 from public.gallery_items gi
      where gi.id = gallery_photos.gallery_item_id and gi.is_active = true
    )
  );
