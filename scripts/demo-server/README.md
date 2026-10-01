# Demo-in-a-box — local mock Supabase backend

A zero-dependency Node server that impersonates the slice of Supabase this app talks to
(GoTrue password auth + PostgREST incl. embedded relations), backed by in-memory tables
seeded with realistic Triple J data: a 7-project gallery with photos, 5 customers, 8 leads
(one military, one draft), 5 quotes with line items, and 3 jobs.

**Use it for:** client demos with perfect data, screenshots, and UI work — offline, with
no risk of touching production leads or customer records, and in environments with no
Docker or Supabase CLI. Writes persist in memory until a restart or reset.

Ported from the engine in `frescos-operating-system/scripts/demo-server/` — `engine.js` and
`index.js` are app-agnostic and kept identical there; only `seed.js` is Triple J-specific.

## Run

```bash
npm run demo:backend            # mock on :54321 (PORT=… to change)
```

`.env.local` (gitignored — add these, keeping your real values somewhere else):

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.mock
# Any JWT whose payload has role=service_role — the engine reads the role claim to
# bypass seed scoping for getAdminClient():
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.mock
```

Restart `next dev` after changing env (`NEXT_PUBLIC_*` is inlined at compile time).
`curl -X POST localhost:54321/__reset` restores the pristine seed without a restart.

Sign in at `/login` as **`owner@triplejmetal.test`** with any password. Leave `OWNER_EMAIL`
unset (or set it to that address) so the owner gate in `src/lib/owner.ts` lets it through.

## What works

- **Public site:** `/gallery`, `/gallery/[id]`, services, locations, home — anon reads of
  active gallery items and their photos (images are the real files in `public/images`).
- **HQ:** Today (call-next card, drafts, quotes waiting), Leads, Quotes, Jobs, Customers.
- **Engine:** password + refresh-token auth, filters (`eq neq gt gte lt lte like ilike in is
  cs`, `not.`, `or=`/`and=`), `order`/`limit`/`offset`, embeds (`customers(name)`,
  `quote_line_items(*)`, `!inner`, `embed.order`), single-object headers, counts, in-memory
  insert/upsert/patch/delete, `rpc` hook, anon-aware `scope()`, service-role bypass.

## What doesn't

- **Passkey sign-in, magic links, signup** — password login only.
- **Storage uploads** (gallery/receipt/job photos), **QBO, Twilio, Resend, push, cron** —
  these hit third parties or Supabase Storage; the routes will error or no-op.
- **`permit_leads`, receipts, costs, time entries, appointments** — tables exist but are
  empty, so those HQ screens show empty states. Add rows in `seed.js` as needed; unknown
  tables/relations log `[mock] …` once in the server console.
- Filters on embedded columns, triggers, constraints, generated columns (the seed computes
  `balance_due` by hand).

## Adding data

Everything lives in `seed.js` as plain objects (`build()` returns fresh copies each call).
Mirror a table's columns from `supabase/migrations/`, and declare any PostgREST embeds the
page uses in `relations` (`rel.many` / `rel.one`).

⚠️ Local development tool with no real authentication. Never point a deployed build at it.
