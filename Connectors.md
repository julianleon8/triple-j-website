# Connectors

Every external service this project talks to. **Update this file in the same turn you add, remove, or re-wire a connector.**

Env var values live in `.env` (gitignored) and in Vercel's project settings. `.env.example` documents key **names** only — never values. A pre-commit hook enforces that.

---

## Registry

| Connector | Env vars | Read in | Breaks if down |
|---|---|---|---|
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | `src/lib/supabase/{client,server,admin}.ts`, `src/middleware.ts` | Everything — auth, leads, HQ dashboard |
| **Resend** | `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `OWNER_EMAIL` | `src/lib/lead-notifications.ts`, `src/app/api/quotes/[id]/{send,accept}/route.ts`, `src/app/api/partner-inquiries/route.ts`, `src/app/api/webhooks/resend/route.ts` | Lead + quote email. The lead still persists to Postgres |
| **QuickBooks** | `QBO_CLIENT_ID`, `QBO_CLIENT_SECRET`, `QBO_REDIRECT_URI`, `QBO_ENVIRONMENT` | `src/lib/qbo.ts`, `src/lib/jobs/receipt-push.ts`, `src/app/api/qbo/{connect,callback}/route.ts` | Receipt → expense push. Save-local + retry, so no data loss. **Refresh token lives ~101 days and rotates only on use** — the `qbo-keepalive` cron is what stops an idle connection dying |
| **Anthropic** | `ANTHROPIC_API_KEY` | `src/lib/{voice-lead-extractor,receipt-extractor,permit-extractor}.ts` | Voice→lead, receipt OCR, permit extraction |
| **OpenAI** | `OPENAI_API_KEY` | `src/lib/openai.ts` | Whisper transcription in the voice-memo pipeline |
| **Twilio** | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | `src/lib/twilio.ts` | Quote SMS |
| **hCaptcha** | `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`, `HCAPTCHA_SECRET_KEY` | `src/lib/captcha.ts`, `QuoteForm.tsx`, `PartnerInquiryForm.tsx` | Spam floods the public forms |
| **Meta / Facebook** | `META_APP_SECRET`, `META_PAGE_ACCESS_TOKEN`, `META_VERIFY_TOKEN` | `src/app/api/webhooks/facebook/route.ts` | Facebook lead ingestion |
| **Web Push (VAPID)** | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | `src/lib/push.ts` | HQ push notifications on new leads / hot permits |
| **Google Maps Static** | `GOOGLE_MAPS_STATIC_KEY` | `src/app/hq/jobs/[id]/components/JobMapHero.tsx` | Job map hero image |
| **Google Ads** | `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | `src/components/seo/` | Conversion tracking only — no user-facing impact |
| **Vercel cron** | `CRON_SECRET` | `src/lib/cron.ts` (auth + run recording), every route under `src/app/api/cron/` | The crons in `vercel.json` stop firing. See "Scheduled jobs" below |
| **Vercel build** | `VERCEL_GIT_COMMIT_SHA`, `VERCEL_DEPLOYMENT_CREATED_AT` | `src/app/hq/settings/page.tsx` | Build stamp display only |
| **Setup route** | `SETUP_KEY` | `src/app/api/setup/route.ts` | One-time bootstrap gate |
| **U.S. Census (ZIP data)** | none — public domain, no key | `scripts/build-zip-data.mjs` → `src/lib/data/zip-geo.json`, read by `src/lib/zip.ts` | Nothing at runtime. Build-time only: the JSON is committed, so census.gov being down affects only regeneration |

## Scheduled jobs

Every cron route goes through `cronRoute()` / `withCronRun()` in `src/lib/cron.ts`, which
handles auth and writes one row per invocation to `public.cron_runs` (migration 026).
Schedules live in `vercel.json`; times are **UTC** (Central is UTC−5/−6). Vercel plan is
**Pro**, so the ceiling is 40 cron jobs at any frequency.

| Job slug | Schedule (UTC) | What it does |
|---|---|---|
| `stale-leads` | `0 13-23/2 * * *` | Leads still `new` past `COLD_THRESHOLD_HOURS`. Nudges once per lead (`leads.nudged_at`) |
| `scrape-permits` | `0 14 * * *` | Temple weekly permit PDFs → `permit_leads` + `permit_reports`. Reads up to 3 unseen reports per run; a manual POST may carry `{ maxReports }` |
| `review-followups` | `30 14 * * *` | Customers whose `review_followup_due_at` passed with no review |
| `quote-sweep` | `45 14 * * *` | Expires past-due sent quotes; nudges once on quotes silent >`QUOTE_STALL_HOURS` |
| `bounce-watch` | `0 */6 * * *` | New `email.bounced` / `email.complained` since last success. **Push-first** |
| `receipt-push` | `0 2 * * *` | Pending `job_receipts` → QuickBooks Purchases, max 25/run. Notifies only on failure |
| `qbo-keepalive` | `0 16 * * 0` | Exercises the QBO refresh token; warns under 14 days left |

Routes live at `src/app/api/cron/<slug>/route.ts`. Each job's pure decision logic sits in
`src/lib/jobs/<slug>.ts` — **not** in the route: Next 16 rejects any export from a `route.ts`
that is not a route field (`GET`, `POST`, `dynamic`, `maxDuration`…), so a helper exported
from a route fails the build with *"X is not a valid Route export field"*. That split is
also what makes the logic unit-testable without a database.

**Why `cron_runs` exists.** Nothing recorded that a cron had run — both routes built a
result object, returned it as the HTTP response and discarded it. That made three ordinary
questions unanswerable: what changed since the last run, has this returned zero N times
running, and is this job failing. `/hq/activity` looks like a log but is a *derived* feed
over business-table timestamps and writes nothing.

**Auth.** `cronAuth()` accepts `Bearer $CRON_SECRET` (Vercel Cron) or a Supabase session
cookie (manual `/hq` trigger). It guards that `CRON_SECRET` is *set* before comparing —
the original inline check would authenticate a literal `Bearer undefined` header in any
environment where the var was missing.

**Checking a job by hand:**

```
curl -H "Authorization: Bearer $CRON_SECRET" https://triplejmetaltx.com/api/cron/<slug>
```

or read the ledger:

```sql
select job, started_at, ok, yield, notified, error
from cron_runs order by started_at desc limit 20;
```

## Deploy

**Vercel**, GitHub integration. Every push to `main` auto-deploys to production. There is no staging branch — `main` **is** production, and a bad push is live in about a minute.

---

## Owner accounts

Two things must agree for an account to be an admin, and they are in different places:

1. **`OWNER_EMAIL`** (Vercel env, comma-separated) — what `isOwnerEmail()` in `src/lib/owner.ts`
   actually checks. Gates `/hq` via the proxy and every `/api` route via `requireOwner()`.
   It doubles as the alert recipient list, so every address on it receives lead and cron mail.
   **Changing it needs a redeploy** to reach running functions.
2. **`public.app_owners`** — read by the `is_owner()` SQL function for RLS only (migration 024).

An account missing from `OWNER_EMAIL` signs in fine and then gets 403 everywhere. An unset
`OWNER_EMAIL` falls back to "any authenticated user" — see the docstring in `owner.ts`.

Accounts as of 2026-09-07: `juanleon1905@gmail.com`, `julianleon0724@yahoo.com`.

### Passkeys (WebAuthn)

Sign-in with Face ID / Touch ID / a security key. Code is shipped; the **project config is a
Dashboard step that has to be done once** or every call fails with `passkey_disabled`:

**Authentication → Passkeys → Enable**, then set

- **Relying Party ID:** `triplejmetaltx.com` — the bare domain, no scheme or `www`.
- **Relying Party Origins:** `https://www.triplejmetaltx.com`
- **Display Name:** `Triple J Metal`

> **The RP ID is effectively permanent.** Passkeys are cryptographically bound to it, so changing
> it later silently invalidates every enrolled key and everyone must re-enrol. Using the bare
> domain (not the `www` host) is what keeps `www` and apex both working.

Then: sign in with a password once → **HQ → Settings → Passkeys → Add a passkey** → sign out and
use the passkey button on `/login`. There is **no passkey sign-*up*** — Supabase requires an
existing confirmed user before one can be registered.

Implementation notes:
- Requires `@supabase/supabase-js` **≥ 2.105.0** and `auth.experimental.passkey: true` on *both*
  `src/lib/supabase/{client,server}.ts`. Without the flag every `auth.passkey.*` call throws.
- Supabase ships this as **experimental** and may change the API without a major version — treat a
  supabase-js bump as a reason to re-test `/login`, not a routine upgrade.
- `src/lib/passkey.ts` maps error codes to copy and deliberately returns `null` for a dismissed OS
  prompt, which is the common case and not a failure.

### Creating an owner by SQL — the NULL-token trap

`/api/setup` only works while **zero** users exist; it 409s afterwards, so it is not the tool for
adding a second owner. The Supabase Dashboard (Authentication → Users → Add user) is the safe
route. If you insert into `auth.users` directly instead, you must also:

- insert a matching **`auth.identities`** row (`provider: 'email'`, `provider_id` = the user id as
  text, `identity_data` carrying `sub` and `email`) — without it, email sign-in fails;
- set the token columns to **`''`, never NULL**: `confirmation_token`, `recovery_token`,
  `email_change`, `email_change_token_new`, `email_change_token_current`, `phone_change`,
  `phone_change_token`, `reauthentication_token`.

GoTrue scans those into non-nullable Go strings. Leave one NULL and sign-in fails with the
misleading **"Database error querying schema"** — which reads like a permissions or migration
problem and is neither. Verify with:

```sql
select (encrypted_password = crypt('<pw>', encrypted_password)) as ok from auth.users where email = '...';
```

## Known-broken / non-obvious states

Recorded so no future session rediscovers them.

### Supabase MCP — authorized (verified 2026-09-06)
`.mcp.json` declares one HTTP server (`mcp.supabase.com/mcp?project_ref=idrbgxlvvnqduvbqtaei`). It **is** authorized and both `execute_sql` and `apply_migration` work. An earlier note here claimed it was unauthenticated — that was wrong, and it caused a session to plan around a capability it actually had.

If a session ever finds it unauthorized, the fallback chain is:
1. Use the bundled `supabase` skill for guidance.
2. Write SQL to `supabase/migrations/` and ask the user to apply it in the Supabase SQL editor.
3. Ask the user to run `/mcp` in an interactive session to re-authorize.

### Migration applied-state — the database is the record
`supabase_migrations.schema_migrations` is the authoritative list of what has been applied. **No file in this repo duplicates it**, deliberately — a second copy would go stale exactly the way the vault did (it asserted migrations 014–020 were unapplied for four months while they were live).

That table sits outside the `public` schema, so PostgREST does not expose it and a service-role key cannot read it. Fetch it through MCP:

```sql
select version, name from supabase_migrations.schema_migrations order by version;
```

Then check for drift in both directions — files never applied, and rows with no file:

```
node scripts/check-migrations.mjs --sql            # prints the query
node scripts/check-migrations.mjs --stdin < applied.json
```

Not in CI: GitHub Actions has no database access. Run it after any schema change.

**Known historical gap:** migration 007 never existed. `gallery_photos` was created out-of-band and had no file in the repo until it was reconstructed from the live schema as `008_gallery_photos.sql` on 2026-09-06 and backfilled into the ledger. That is the class of problem this checker exists to catch.

### NotebookLM is manual — no skill installed
Notebook `f4aaf762-3ede-45b9-a1ad-b9d8a6319207`. `~/.claude/skills/` does not exist on this machine; the skill referenced by older docs was pinned to a `/Users/julianleon/…` path that no longer resolves. **Status: MANUAL.** When a source-grounded answer would genuinely help, say so and let the user run the query on their authenticated machine and paste the result back. Never attempt to authenticate from here.

### Stripe does not exist
Listed in project docs since 2026-04-13 as "phase 4", but there is no dependency, no env var, and no code. The only matches in `src/` are an `accentStripe` CSS variable in `src/emails/BrandLayout.tsx`. **QuickBooks is the money rail.** Descoped 2026-09-06 — see `Locked Decisions.md`.

---

## Verifying a connector

- **Env var present?** `grep -n '<KEY>' .env.example` confirms it's documented; the real value is in `.env` and in Vercel.
- **Supabase reachable?** Ask the user to check the project dashboard, or apply a no-op migration.
- **Resend deliverability** — `triplejmetaltx.com` must show **Verified** in the Resend dashboard with DKIM/SPF/DMARC green, or outbound mail bounces silently.
- **QuickBooks** — `/hq/settings/quickbooks` shows connection state plus the pending-receipt count.
- **Crons** — Vercel dashboard → project → Cron Jobs, or check for rows written by the two cron routes.
