-- business-os-schema.draft.sql  --  DRAFT. NOT A MIGRATION. DO NOT APPLY.
--
-- Deliberately NOT in supabase/migrations/: nothing here is approved, and a
-- file in that directory is one `supabase db push` away from production.
-- Exercised against a throwaway PostgreSQL 16 cluster only. When it is
-- approved, move it to supabase/migrations/ and renumber against the applied
-- ledger (032 was the last applied as of 2026-09-07).
--
-- Design rationale: docs/BUSINESS-OS-AUDIT-2026-09-07.md
--
-- The shared business database: one place that knows what is true across
-- Triple J, Mesa and El Mexicano, and what the rules are.
--
-- WHY THIS EXISTS
--
-- Memory today is ~1 MB of markdown split across two repos that cannot see each
-- other, enforced by two incompatible mechanisms (scripts/check-vault.mjs here,
-- npm run check:docs in Mexicno-Grille). That makes four ordinary questions
-- unanswerable without a human reading every ledger:
--
--   1. "What did I decide about pricing?"        -- spans three businesses
--   2. "What rule applies to what I'm about to do?"
--   3. "How did the business do last month?"     -- spans three databases
--   4. "What did the bots find last week?"       -- lives in chat, nowhere else
--
-- Same reasoning as cron_runs (026): nothing recorded it, so nothing could
-- answer it.
--
-- EXACT ROWS, NOT POINTERS
--
-- Every content column holds the FULL text, not a link to a markdown file. The
-- endgame is a cheap local model whose entire world is this schema -- it cannot
-- clone a repo, so a pointer is useless to it. See os.knowledge.
--
-- Copying owned facts is what AGENTS.md warns about ("a second copy that
-- silently goes stale"). The answer is not to refuse to copy -- it is to make
-- every copy verifiable:
--
--   * origin='synced'  -- a markdown file owns this. The row carries source_sha,
--                         the hash of the exact block it came from. The sync
--                         script recomputes that hash and fails loudly when it
--                         moves. NEVER hand-edit a synced row.
--   * origin='native'  -- born here. This schema owns it. Nothing else has a
--                         copy: cross-business decisions, bot findings, metrics.
--
-- Drift is therefore detectable rather than prevented, which is the only
-- property that survives contact with a 164-row append-only ledger.
--
-- AUDIENCE
--
-- Briefs are intended for employees as well as owners, so every content row
-- carries who may read it. The vault already states these rules in prose
-- ("never publish per-sqft concrete pricing" -- internal only; "never name a
-- specific steel supplier"). Encoding it here is what stops a crew brief from
-- quoting a margin. The ladder is ordered: public < staff < owner, so a reader
-- cleared to 'staff' sees rows where audience <= 'staff'.
--
-- PORTABILITY
--
-- Plain PostgreSQL. No Supabase-only features, no RLS coupling, no PostgREST
-- dependency. `pg_dump --schema=os` lifts the whole thing onto your own server
-- when the local models move in-house. That is deliberate.
--
-- ACCESS
--
-- This schema shares a database with public.leads / public.customers, which
-- hold customer PII. Isolation is by GRANT, not by project: os_reader,
-- os_writer and os_sync get rights inside os and NOTHING in public. The schema
-- is NOT added to Supabase's exposed schemas -- writers connect over Postgres
-- directly, which is also what makes the move off Supabase a no-op.

create schema if not exists os;

comment on schema os is
  'Shared business OS: rules, journal, documents, metrics and briefs across Triple J, Mesa and El Mexicano. Exact text, not pointers. Portable: pg_dump --schema=os.';

-- Ordered least- to most-sensitive so `audience <= 'staff'` is a clearance check.
do $$ begin
  create type os.audience as enum ('public', 'staff', 'owner');
exception when duplicate_object then null; end $$;

-- Who owns the text in a row. See the header.
do $$ begin
  create type os.origin as enum ('synced', 'native');
exception when duplicate_object then null; end $$;

create or replace function os.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------- entities
-- The businesses this schema knows about. Legal names are read from source,
-- not remembered: Triple J from src/lib/site.ts, the other two from the
-- Mexicno-Grille brand kit and legal pages. They are three DIFFERENT legal
-- entities and a live defect in that repo already conflates two of them.

create table os.entities (
  slug          text primary key,
  name          text not null,
  kind          text not null check (kind in ('business', 'platform', 'tenant')),
  legal_name    text,
  repo          text,
  notes         text,
  created_at    timestamptz not null default now()
);

comment on table os.entities is
  'The businesses. slug is the join key used by every other table in this schema.';
comment on column os.entities.legal_name is
  'Contractual/legal name only -- never the public brand. Triple J Metal LLC != Triple J Metal.';

insert into os.entities (slug, name, kind, legal_name, repo, notes) values
  ('triple-j',    'Triple J Metal',      'business', 'Triple J Metal LLC',
   'julianleon8/triple-j-website',
   'Metal buildings, Temple TX. Juan (investor), Julian (tech/ops/sales), Freddy (foreman).'),
  ('mesa',        'Mesa',                'platform', 'Mexicano Grille Software LLC',
   'julianleon8/Mexicno-Grille',
   'Multi-tenant restaurant loyalty platform. The app vendor -- NOT the restaurant.'),
  ('el-mexicano', 'El Mexicano Grille',  'tenant',   'Taqueria El Mexicano Grille & Bar',
   'julianleon8/Mexicno-Grille',
   'Tenant zero on Mesa, never the platform default. DBA differs from the Mesa vendor LLC.')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------- rules
-- The rule warden. Full rule text, so a local model can quote it verbatim.

create table os.rules (
  id            text primary key,
  entities      text[] not null,
  title         text not null,
  body          text not null,
  status        text not null default 'active'
                  check (status in ('active', 'superseded', 'retired')),
  audience      os.audience not null default 'owner',
  supersedes    text references os.rules (id),
  decided_on    date,

  origin        os.origin not null,
  source_repo   text,
  source_file   text,
  source_ref    text,
  source_sha    text,

  applies_to    text[],
  enforced_by   text,

  synced_at     timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- The integrity rule that makes drift detectable: a synced row must be able
  -- to point at what it was derived from, and a native row must not pretend to.
  constraint rules_provenance check (
    case origin
      when 'synced' then source_repo is not null
                     and source_file is not null
                     and source_sha  is not null
      when 'native' then source_sha is null
    end
  ),
  constraint rules_entities_nonempty check (cardinality(entities) > 0)
);

comment on table os.rules is
  'Every standing rule across all businesses, as exact text. Rules 1-54 of Mexicno-Grille AGENTS.md and the Locked Decisions of triple-j sync in here as origin=synced; cross-business rules that have no markdown home are origin=native.';
comment on column os.rules.entities is
  'Entity slugs this rule binds. {*} means every business.';
comment on column os.rules.source_sha is
  'sha256 of the exact source block. The sync script recomputes it and fails when the markdown moved. NULL only for origin=native.';
comment on column os.rules.applies_to is
  'Path globs this rule governs, e.g. {src/lib/services.ts}. Lets a session ask which rules touch the files it is about to edit.';
comment on column os.rules.enforced_by is
  'The script that mechanically checks this rule, or NULL when it needs judgement.';

create index rules_status_idx   on os.rules (status);
create index rules_entities_idx on os.rules using gin (entities);
create index rules_applies_idx  on os.rules using gin (applies_to);
create index rules_fts_idx      on os.rules
  using gin (to_tsvector('english', title || ' ' || body));

create trigger rules_touch before update on os.rules
  for each row execute function os.touch_updated_at();

-- ---------------------------------------------------------------- events
-- The journal. Append-only by GRANT (os_writer gets INSERT and nothing else),
-- which is enforcement the bots cannot talk their way around.

create table os.events (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  entity      text references os.entities (slug),
  kind        text not null check (kind in
                ('decision', 'session', 'deploy', 'incident', 'finding', 'money', 'note')),
  actor       text not null,
  title       text not null,
  body        text,
  audience    os.audience not null default 'owner',
  evidence    jsonb not null default '{}'::jsonb,
  tags        text[],
  created_at  timestamptz not null default now()
);

comment on table os.events is
  'Append-only journal across every business. One row per thing that happened.';
comment on column os.events.actor is
  'Who filed it: julian | claude-code | grokbot:<name>. Bot findings land here instead of dying in chat.';
comment on column os.events.evidence is
  'Provenance as JSON: {commit, pr, url, read_on}. An unsourced claim is a note, not a finding.';

create index events_at_idx     on os.events (at desc);
create index events_entity_idx on os.events (entity, at desc);
create index events_kind_idx   on os.events (kind, at desc);
create index events_tags_idx   on os.events using gin (tags);
create index events_fts_idx    on os.events
  using gin (to_tsvector('english', title || ' ' || coalesce(body, '')));

-- ---------------------------------------------------------------- documents
-- Repo context, verbatim. This is what lets a local model answer "how does
-- redemption work" without a checkout: the designated contracts and vault
-- files live here as exact text, hash-stamped like rules.

create table os.documents (
  id            text primary key,
  entity        text not null references os.entities (slug),
  title         text not null,
  body          text not null,
  audience      os.audience not null default 'owner',
  kind          text not null default 'contract' check (kind in
                  ('contract', 'vault', 'runbook', 'reference', 'brief-source')),
  source_repo   text not null,
  source_file   text not null,
  source_sha    text not null,
  synced_at     timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table os.documents is
  'Exact text of designated repo documents, so a model with no filesystem still knows the repos. Always origin=synced in spirit: source_sha is mandatory.';

create index documents_entity_idx on os.documents (entity);
create index documents_fts_idx    on os.documents
  using gin (to_tsvector('english', title || ' ' || body));

create trigger documents_touch before update on os.documents
  for each row execute function os.touch_updated_at();

-- ---------------------------------------------------------------- metrics
-- The knower. Each app PUSHES its own aggregates; nothing here reaches into
-- another database. That keeps customer rows in the database that owns them
-- and keeps this schema free of PII.

create table os.metric_defs (
  metric        text primary key,
  label         text not null,
  definition    text not null,
  unit          text,
  owner_entity  text references os.entities (slug),
  created_at    timestamptz not null default now()
);

comment on table os.metric_defs is
  'What a number MEANS, in words, so the same metric name cannot mean two things in two businesses. Mesa froze several of these in docs/FOUNDER-DATA-PLAN.md; they belong here.';

create table os.metrics (
  entity        text not null references os.entities (slug),
  metric        text not null references os.metric_defs (metric),
  grain         text not null check (grain in ('day', 'week', 'month')),
  period_start  date not null,
  value         numeric not null,
  audience      os.audience not null default 'owner',
  source        text not null,
  captured_at   timestamptz not null default now(),
  primary key (entity, metric, grain, period_start)
);

comment on table os.metrics is
  'Aggregates only -- never a customer row. Idempotent by primary key so a cron can re-push a period safely.';
comment on column os.metrics.source is
  'Where the number came from, e.g. supabase:idrbgxlvvnqduvbqtaei or posthog. A number with no source is not evidence.';

create index metrics_metric_idx on os.metrics (metric, period_start desc);

-- ---------------------------------------------------------------- briefs
-- What was actually told to whom. A brief a crew member acted on is a record
-- worth keeping, and its audience is the reason the column above exists.

create table os.briefs (
  id            bigint generated always as identity primary key,
  entity        text references os.entities (slug),
  audience      os.audience not null,
  period_start  date,
  period_end    date,
  title         text not null,
  body          text not null,
  model         text,
  sources       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

comment on table os.briefs is
  'Generated briefs, kept so you can see what a model told an employee last Tuesday and what it read to say it.';
comment on column os.briefs.sources is
  'Row ids this brief was built from. A brief that cannot name its sources cannot be checked.';

create index briefs_created_idx on os.briefs (created_at desc);

-- ---------------------------------------------------------------- facts
-- The exact-lookup path. A local model asked "what does a 20x20 carport cost"
-- must hit a ROW, not a paragraph it has to interpret -- prose retrieval is
-- exactly how a model improvises a price, which the vault forbids outright.
-- Anything with a canonical answer lives here: prices, specs, NAP, hours.

create table os.facts (
  key            text not null,
  entity         text not null references os.entities (slug),
  value          text not null,
  value_num      numeric,
  unit           text,
  qualifier      text,
  audience       os.audience not null default 'owner',
  effective_from date,
  effective_to   date,
  source_repo    text not null,
  source_file    text not null,
  source_sha     text not null,
  synced_at      timestamptz not null default now(),
  primary key (key, entity, effective_from)
);

comment on table os.facts is
  'Canonical structured facts. Keyed like price.carport.20x20.bolted so a lookup is deterministic instead of retrieved.';
comment on column os.facts.qualifier is
  'The caveat that must travel with the number, e.g. "steel + install only, bolted, before tax". A price quoted without its qualifier is wrong.';
comment on column os.facts.effective_to is
  'NULL means current. Superseded prices stay: quotes given before a raise are honored at the old rate, so history is operational, not archival.';

create index facts_key_idx    on os.facts (key);
create index facts_entity_idx on os.facts (entity);
create index facts_current_idx on os.facts (key, entity) where effective_to is null;

-- ---------------------------------------------------------------- sources
-- The coverage registry. "The model knows everything in the DB" is only a
-- useful claim if you can prove what is IN it -- this table is the checklist,
-- and os.coverage below is the gap report.

create table os.sources (
  id              text primary key,
  entity          text not null references os.entities (slug),
  repo            text not null,
  path            text not null,
  required        boolean not null default true,
  kind            text not null default 'contract',
  audience        os.audience not null default 'owner',
  last_sha        text,
  last_synced_at  timestamptz,
  bytes           integer,
  note            text,
  unique (repo, path)
);

comment on table os.sources is
  'Every file that MUST be mirrored, whether or not it has been. A required row with last_synced_at NULL is a hole in the model''s world.';

-- ---------------------------------------------------------------- chunks
-- Retrieval units. Chunks carry their heading path so a fragment is never read
-- out of context, and the parent's sha so a stale chunk is detectable rather
-- than silently answering from replaced text.

create table os.chunks (
  id             bigint generated always as identity primary key,
  source_kind    text not null check (source_kind in ('document', 'rule', 'event', 'fact')),
  source_ref     text not null,
  entity         text references os.entities (slug),
  audience       os.audience not null default 'owner',
  heading_path   text,
  ordinal        integer not null,
  body           text not null,
  token_estimate integer,
  source_sha     text not null,
  created_at     timestamptz not null default now(),
  unique (source_kind, source_ref, ordinal)
);

comment on table os.chunks is
  'Derived retrieval units over documents/rules/events/facts. Fully rebuildable -- drop and re-chunk at will.';
comment on column os.chunks.heading_path is
  'Where the chunk sits in its document, e.g. "Pricing > Anchors". Retrieval without this returns orphan sentences.';

create index chunks_fts_idx    on os.chunks using gin (to_tsvector('english', body));
create index chunks_source_idx on os.chunks (source_kind, source_ref);
create index chunks_entity_idx on os.chunks (entity, audience);

-- Semantic retrieval, where pgvector exists. Supabase ships it; a bare
-- PostgreSQL box may not, and the keyword path above must still work there.
-- Dimension 768 matches nomic-embed-text / mxbai-embed-large, the usual
-- companions to a local Llama. Change it before you embed anything, not after.
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'vector') then
    create extension if not exists vector with schema extensions;
    execute 'alter table os.chunks add column if not exists embedding extensions.vector(768)';
    execute 'create index if not exists chunks_embedding_idx on os.chunks '
         || 'using hnsw (embedding extensions.vector_cosine_ops)';
  else
    raise notice 'pgvector unavailable: keyword retrieval only. Re-run the guarded block after installing it.';
  end if;
end $$;

-- ---------------------------------------------------------------- views
-- os.knowledge is THE retrieval surface: one shape, every kind of knowledge,
-- audience-tagged. A local model reads this and nothing else.

create or replace view os.knowledge as
  select 'rule'::text     as kind, r.id::text as ref, r.title, r.body,
         r.audience, r.entities, r.updated_at as at
    from os.rules r
   where r.status = 'active'
  union all
  select 'document', d.id, d.title, d.body,
         d.audience, array[d.entity], d.updated_at
    from os.documents d
  union all
  select 'event', e.id::text, e.title, coalesce(e.body, ''),
         e.audience, array[coalesce(e.entity, '*')], e.at
    from os.events e
  union all
  select 'fact', f.key,
         f.key,
         f.value || coalesce(' ' || f.unit, '') || coalesce(' (' || f.qualifier || ')', ''),
         f.audience, array[f.entity], f.synced_at
    from os.facts f
   where f.effective_to is null;

comment on view os.knowledge is
  'Everything a model may read, in one shape. Filter by audience for the reader: WHERE audience <= ''staff'' for a crew brief.';

create or replace view os.active_rules as
  select * from os.rules where status = 'active';

-- Rules whose markdown has not been re-verified lately. A silent sync is the
-- failure mode that makes a mirror worthless, so it gets a view.
create or replace view os.stale_syncs as
  select id, title, source_repo, source_file, synced_at,
         now() - synced_at as age
    from os.rules
   where origin = 'synced'
     and (synced_at is null or synced_at < now() - interval '7 days')
   order by synced_at nulls first;

-- What the model does NOT know. A required source that has never synced, or
-- whose file has moved on since, is a hole -- and a hole is the difference
-- between "answers to the T" and "answers confidently from stale text".
create or replace view os.coverage as
  select s.id, s.entity, s.repo, s.path, s.required, s.last_synced_at,
         case
           when s.last_synced_at is null then 'missing'
           when s.last_synced_at < now() - interval '7 days' then 'stale'
           else 'current'
         end as state
    from os.sources s
   order by s.required desc, s.last_synced_at nulls first;

comment on view os.coverage is
  'Gap report. Anything not "current" is text the model cannot see or is reading in an outdated form.';

-- The one call a local model makes. Clearance is a parameter, not a
-- convention, so a crew brief physically cannot retrieve owner-only rows.
create or replace function os.search(
  q          text,
  clearance  os.audience default 'owner',
  lim        integer default 20
)
returns table (
  source_kind  text,
  source_ref   text,
  entity       text,
  heading_path text,
  body         text,
  rank         real
)
language sql
stable
as $fn$
  select c.source_kind, c.source_ref, c.entity, c.heading_path, c.body,
         ts_rank(to_tsvector('english', c.body), websearch_to_tsquery('english', q)) as rank
    from os.chunks c
   where c.audience <= clearance
     and to_tsvector('english', c.body) @@ websearch_to_tsquery('english', q)
   order by rank desc, c.id
   limit lim;
$fn$;

comment on function os.search is
  'Keyword retrieval over every chunk the reader is cleared for. Ask os.facts first for anything with a canonical answer -- a price must be looked up, never retrieved.';

-- ---------------------------------------------------------------- access
-- Isolation is by GRANT. These roles reach into os and nowhere else -- in
-- particular they have no rights on public.leads or public.customers, which
-- is what makes it safe for this schema to share a database with them.
--
-- NOLOGIN roles: grant them to a login role and set a password out of band.
-- Never write a credential into a tracked file (.githooks/pre-commit blocks it).

do $$ begin create role os_reader nologin; exception when duplicate_object then null; end $$;
do $$ begin create role os_writer nologin; exception when duplicate_object then null; end $$;
do $$ begin create role os_sync   nologin; exception when duplicate_object then null; end $$;

revoke all on schema os from public;
grant usage on schema os to os_reader, os_writer, os_sync;

-- Reader: sees everything, changes nothing. This is what a local model gets.
grant select on all tables in schema os to os_reader;

-- Writer: files journal entries and nothing else. Append-only is a GRANT, not
-- a promise -- no UPDATE, no DELETE. This is the grokbot role.
grant select on all tables in schema os to os_writer;
grant insert on os.events to os_writer;
grant usage  on all sequences in schema os to os_writer;

-- Sync: the scripts that mirror markdown in and push metrics. Full DML on the
-- derived tables; still cannot touch public.
grant select, insert, update, delete
  on os.rules, os.documents, os.metrics, os.metric_defs, os.briefs,
     os.facts, os.sources, os.chunks to os_sync;
grant insert on os.events to os_sync;
grant usage on all sequences in schema os to os_sync;

alter default privileges in schema os
  grant select on tables to os_reader, os_writer;

-- Belt and braces: Supabase's public API roles must never see this schema.
-- os is also deliberately NOT added to the project's exposed schemas.
--
-- Guarded because anon/authenticated are Supabase's roles, not PostgreSQL's.
-- An unguarded REVOKE here would fail on a plain server -- which is precisely
-- the server this schema is built to be portable to.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on schema os from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on schema os from authenticated';
  end if;
end $$;

grant execute on function os.search(text, os.audience, integer)
  to os_reader, os_writer, os_sync;
