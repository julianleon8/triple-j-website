# Connectors

Every external service this project talks to. **Update this file in the same turn you add, remove, or re-wire a connector.**

Env var values live in `.env` (gitignored) and in Vercel's project settings. `.env.example` documents key **names** only — never values. A pre-commit hook enforces that.

---

## Registry

| Connector | Env vars | Read in | Breaks if down |
|---|---|---|---|
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | `src/lib/supabase/{client,server,admin}.ts`, `src/middleware.ts` | Everything — auth, leads, HQ dashboard |
| **Resend** | `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `OWNER_EMAIL`, `MORNING_BRIEF_TO` (optional) | `src/lib/lead-notifications.ts`, `src/app/api/quotes/[id]/{send,accept}/route.ts`, `src/app/api/partner-inquiries/route.ts`, `src/app/api/webhooks/resend/route.ts` | Lead + quote email. The lead still persists to Postgres |
| **QuickBooks** | `QBO_CLIENT_ID`, `QBO_CLIENT_SECRET`, `QBO_REDIRECT_URI`, `QBO_ENVIRONMENT` | `src/lib/qbo.ts`, `src/lib/jobs/receipt-push.ts`, `src/app/api/qbo/{connect,callback}/route.ts` | Receipt → expense push. Save-local + retry, so no data loss. **Refresh token lives ~101 days and rotates only on use** — the `qbo-keepalive` cron is what stops an idle connection dying |
| **Anthropic** | `ANTHROPIC_API_KEY` | `src/lib/{voice-lead-extractor,receipt-extractor,permit-extractor}.ts`; locally, `scripts/serp-steal.mjs` | Voice→lead, receipt OCR, permit extraction. The keyword script's judgments |
| **OpenAI** | `OPENAI_API_KEY` | `src/lib/openai.ts` | Whisper transcription in the voice-memo pipeline |
| **Twilio** | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | `src/lib/twilio.ts` | Quote SMS |
| **hCaptcha** | `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`, `HCAPTCHA_SECRET_KEY` | `src/lib/captcha.ts`, `QuoteForm.tsx`, `PartnerInquiryForm.tsx` | Spam floods the public forms |
| **Meta / Facebook** | `META_APP_SECRET`, `META_PAGE_ACCESS_TOKEN`, `META_VERIFY_TOKEN` | `src/app/api/webhooks/facebook/route.ts`, `src/lib/messenger-lead.ts` | Facebook lead ingestion. **As of 2026-09-29 no lead has ever arrived this way** — confirm the app is subscribed to the Page's `messages` and `leadgen` fields before spending on Facebook |
| **Web Push (VAPID)** | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | `src/lib/push.ts` | HQ push notifications on new leads / hot permits |
| **Google Maps Static** | `GOOGLE_MAPS_STATIC_KEY` | `src/app/hq/jobs/[id]/components/JobMapHero.tsx` | Job map hero image |
| **Google Ads** (+ a read-only Google Ads Script, `marketing/google-ads-daily-report.js`, pasted into the account by the owner; it emails a daily spend/leads report and needs no key here) | `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`, `NEXT_PUBLIC_GOOGLE_ADS_CALL_CONVERSION_LABEL` | `src/components/seo/` (form conversion on `/thank-you`), `src/components/site/TrackedPhone.tsx` + `src/lib/call-conversion.ts` (phone-tap conversion) | Conversion tracking only — no user-facing impact. Account `AW-18112939313`; the form label is live (verified in the production bundle 2026-09-29). The call label is live too (2026-10-01): action "Click to call" (Phone call lead, Primary, "Calls from website visits — clicks on a number"), label set in Vercel Production by the owner and verified in the production bundle. Google's snippet and `onclick` instructions do not apply; `TrackedPhone` fires it. The agent's Vercel token cannot list or create production env vars (403), so env changes are an owner dashboard step |
| **PostHog** (US Cloud) | `NEXT_PUBLIC_POSTHOG_KEY`, `POSTHOG_PERSONAL_API_KEY` (server, secret) | `src/lib/analytics.ts` (event names, init, `capture()`), `src/instrumentation-client.ts` (loader + site-wide link clicks), `src/components/sections/QuoteForm.tsx` (form funnel), `src/lib/posthog-server.ts` (`lead_created` from `/api/leads`, plus the read API), `src/app/api/webhooks/posthog/route.ts`, cron `weekly-ads`; `/ingest` proxy in `next.config.ts` | Analytics only — no user impact. Blank public key = nothing loads; blank personal key = alerts and the Monday report reach email only. See "PostHog" below |
| **Vercel cron** | `CRON_SECRET` | `src/lib/cron.ts` (auth + run recording), every route under `src/app/api/cron/` | The crons in `vercel.json` stop firing. See "Scheduled jobs" below |
| **Vercel build** | `VERCEL_GIT_COMMIT_SHA`, `VERCEL_DEPLOYMENT_CREATED_AT` | `src/app/hq/settings/page.tsx` | Build stamp display only |
| **Setup route** | `SETUP_KEY` | `src/app/api/setup/route.ts` | One-time bootstrap gate |
| **U.S. Census (ZIP data)** | none — public domain, no key | `scripts/build-zip-data.mjs` → `src/lib/data/zip-geo.json`, read by `src/lib/zip.ts` | Nothing at runtime. Build-time only: the JSON is committed, so census.gov being down affects only regeneration |
| **SERP API** (DataForSEO or Serper) | `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD` or `SERPER_API_KEY` | `scripts/lib/serp/providers.mjs`, run by `scripts/serp-steal.mjs` | Nothing at runtime: local keyword research only, never set in Vercel. Returns Google's top 10 and map pack as seen from each city, which no earlier tool here could (see `research/competitors/roster-2026-09.md`). DataForSEO wins when both are set. Cost per run is printed by the script and recorded in the report |

## Scheduled jobs

Every cron route goes through `cronRoute()` / `withCronRun()` in `src/lib/cron.ts`, which
handles auth and writes one row per invocation to `public.cron_runs` (migration 026).
Schedules live in `vercel.json`; times are **UTC** (Central is UTC−5/−6). Vercel plan is
**Pro**, so the ceiling is 40 cron jobs at any frequency.

| Job slug | Schedule (UTC) | What it does |
|---|---|---|
| `stale-leads` | `0 13-23/2 * * *` | Leads still `new` past `COLD_THRESHOLD_HOURS`. Nudges once per lead (`leads.nudged_at`) |
| `scrape-permits` | `0 14 * * *` | Temple weekly permit PDFs → `permit_leads` + `permit_reports`. Reads up to 3 unseen reports per run, then relabels up to 45 rows with `labeled_at IS NULL`. Manual `POST` (may carry `{ maxReports }`) answers 202 and runs detached; `GET …/scrape-permits/status` (owner) returns the latest `cron_runs` row for the page to poll |
| `review-followups` | `30 14 * * *` | Customers whose `review_followup_due_at` passed with no review |
| `quote-sweep` | `45 14 * * *` | Expires past-due sent quotes; nudges once on quotes silent >`QUOTE_STALL_HOURS` |
| `bounce-watch` | `0 */6 * * *` | New `email.bounced` / `email.complained` since last success. **Push-first** |
| `morning-brief` | `0 12 * * 1-5` | Weekday 7 AM CDT / 6 AM CST. One email: leads new since the last successful brief, and every non-draft lead still `new`, oldest first, plus the draft count. Email only, to `morningBriefRecipients()` (`MORNING_BRIEF_TO`, else the Triple J inbox + Julian's), **not** `OWNER_EMAIL`. Sent even when empty |
| `receipt-push` | `0 2 * * *` | Pending `job_receipts` → QuickBooks Purchases, max 25/run. Notifies only on failure |
| `qbo-keepalive` | `0 16 * * 0` | Exercises the QBO refresh token; warns under 14 days left |
| `weekly-ads` | `0 12 * * 1` | Monday 7 AM CDT / 6 AM CST. Push only: last 7 days from PostHog (leads and how many from Google Ads, call taps, visitors, failed quote sends) against the 7 before; opens the Ad funnel dashboard. Needs `POSTHOG_PERSONAL_API_KEY`, else records `ok: false` |

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

**Adding an HQ login.** There is no sign-up in the app, and `/setup` only works while zero users exist.
1. Supabase Dashboard → **Authentication → Users → Add user → Create new user**: email, password,
   **Auto Confirm User** on. ("Send invitation" emails a link built from the Auth Site URL.)
2. Append the email to **`OWNER_EMAIL`** in Vercel and **redeploy**. Skipping this is the common failure:
   the password works, then `/login` shows "Signed in, but that account isn't authorized for HQ."
3. Insert the email into **`public.app_owners`**, so RLS (`is_owner()`) agrees with `OWNER_EMAIL`. Most HQ
   reads use the admin client and skip RLS, so a missing row shows up only where the user's own session queries.
4. They sign in at `/login` (or the installed app) and can add a passkey under HQ → Settings.

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

### `vercel env pull` cannot produce a working `.env.local` (found 2026-10-03)

The repo is linked (`.vercel/`, git-ignored) and `npx vercel env pull .env.local --environment=production`
runs, but **26 of the Production variables are marked Sensitive, and Vercel never returns a Sensitive
value** — the CLI writes `[SENSITIVE]` placeholders instead. Fill those from each service's own
dashboard (the sources are listed in `.env.example`), or blank them. A placeholder is worse than a
blank: features that degrade on an empty key (hCaptcha, Maps, Twilio) treat `[SENSITIVE]` as a real
key and fail. Local dev on Production values reads and writes the live database and can send real
email and SMS. The Vercel MCP connector cannot list env vars at all (403).

**Previewing the public pages anyway (works, 2026-10-03):** process env wins over `.env.local`, so override
only what the marketing pages read, with throwaway values and a dead Supabase host, and leave the file alone:

```
env NEXT_PUBLIC_SITE_URL=http://localhost:3100 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:9 \
  NEXT_PUBLIC_SUPABASE_ANON_KEY=local-dummy SUPABASE_SERVICE_ROLE_KEY=local-dummy \
  NEXT_PUBLIC_POSTHOG_KEY= NEXT_PUBLIC_GOOGLE_ADS_ID= NEXT_PUBLIC_HCAPTCHA_SITE_KEY= \
  npm run dev -- -p 3100
```

Without `NEXT_PUBLIC_SITE_URL` every page 500s (`new URL('[SENSITIVE]')` in `src/app/layout.tsx`). The blank
PostHog and Ads keys keep a localhost visit out of the live analytics project. Gallery sections render empty
(the dead host), which is fine for header, footer and copy work. HQ and forms need real keys.

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

### Vercel Web Analytics is not enabled (found 2026-09-29)
`src/app/layout.tsx` mounts `<Analytics />`, and `TrackedPhone` sends `phone_displayed` / `phone_clicked`, but the Vercel API answers **"Web Analytics not found"** for `triple-j-website`: it was never turned on, so none of it is recorded. Owner fix: Vercel → project → Analytics → Enable. It cannot be switched on through the Vercel MCP (`update_project` has no such field).
Re-checked 2026-10-04 on owner request: still "not found". The other route is the CLI on a logged-in machine,
`vercel project web-analytics triple-j-website`. Vercel adds the collection routes at the next deployment, so
push or redeploy once after enabling. Confirm with the MCP's `count_pageviews` (it needs `since` and `until`):
a count instead of "not found".

### Google Search Console (added 2026-10-03)
**Domain property `triplejmetaltx.com`**, verified 2026-10-03 by a DNS TXT record on the apex in **Vercel DNS**
(the nameservers are Vercel's; a record added at the Squarespace registrar is ignored, which is why the first attempt
failed). The record starts `google-site-verification=ZVrd…`. **Never delete it**: removing it unverifies the
property. It sits beside the SPF record; two TXT records on the apex is normal. No env var and no code reads it.
Sitemap `https://www.triplejmetaltx.com/sitemap.xml` was submitted the same day (Search Console reported 52
discovered pages; the sitemap itself lists 60). **Baseline** (page-indexing export, data to 2026-09-20): **5 pages
indexed, 7 known but not indexed** of 60 in the sitemap; 17–64 impressions a day, peaking 64 on 2026-09-07 and
falling to 17 by 09-20. Open issues then: 3 "Page with redirect" (expected, retired URLs), 2 "Blocked due to other
4xx" (URLs not yet identified), 2 "Crawled - currently not indexed" (URLs not yet identified). Bing Webmaster Tools
is not set up (import from Search Console). The Page indexing chart is a 90-day window.

### PostHog — product analytics (added 2026-10-03)
Funnels, drop-off, heatmaps and session replay for the public site, for the ad budget. **Event names are
owned by `AnalyticsEvent` in `src/lib/analytics.ts`**; the dashboards are built on them, so add, never rename.
The ad funnel is `$pageview` → `quote_form_viewed` → `quote_form_started` → `quote_step_completed` →
`quote_form_submitted` → `lead_created` (server-side, one per saved lead). Phone, text, email, directions and
quote-link taps are captured site-wide by one click listener, with `cta_location` saying where on the page.

- **Not tracked:** `/hq`, `/login`, `/setup`, `/quotes/[token]`, `/offline`. Never sent as properties: name,
  phone, email, message. Replay masks every input and records no network bodies.
- **Lead ↔ person.** A submitted lead calls `identify(<lead UUID>)`, so PostHog → Persons → search the lead ID
  shows that visitor's pages and recordings.
- **Internal traffic** carries `internal_traffic = true`: any browser that has opened `/hq` or `/login`, any
  host other than `triplejmetaltx.com` (previews, localhost), or any page opened with `?tj_internal=1`
  (`?tj_internal=0` clears it). The project's internal/test filter excludes it. The installed HQ app keeps
  separate storage on iPhone, so the owner's Safari needs `?tj_internal=1` once.
- **Load cost.** posthog-js (~100 KB gzipped) is a lazy chunk fetched after the page's `load` event, never in
  first-load JS. Headless browsers (`navigator.webdriver`) are dropped as bots by the SDK itself.
- **Proxy.** Browser traffic goes to `/ingest/*` on our own domain, rewritten to `us.i.posthog.com`. PostHog's
  paths end in `/`, so `skipTrailingSlashRedirect` is on and Next's `/:path+/ → /:path+` redirect is
  re-created in `redirects()` for everything except `/ingest/`. Verified 2026-10-03: `/about/` still 308s.
- **Account.** The only existing PostHog project (`Default project`, id 423436, org "MESA") holds El Mexicano
  Grille's app data. Triple J must not share it: web analytics, replays and person counts would mix. MESA is
  on the free plan, which allows one project per organization, so creating "Triple J Metal" there failed
  (403, 2026-10-03). Organizations are unlimited and each has its own free allowance (1M events, 5K
  recordings a month), so Triple J has its own: **org "Triple J Metal", project "Website" (id 643189)**, created
  2026-10-03. Its key is in Vercel as `NEXT_PUBLIC_POSTHOG_KEY`. Project settings: timezone America/Chicago;
  replay and heatmaps only on `triplejmetaltx.com` (`recording_domains`); internal/test filter
  `internal_traffic` is not `true`, checked by default. The PostHog MCP reaches it after
  `switch-organization` + `switch-project 643189`; it starts on MESA's project.
- **Dashboard:** "Ad funnel" (pinned), https://us.posthog.com/project/643189/dashboard/2165121 — headline
  leads / phone taps / visitors / visit-to-lead rate, the six-step drop-off funnel, failures by reason, the
  funnel by channel, lead rate by landing page, weekly leads and calls by channel, a utm source × campaign
  table, taps by button position, homepage form vs `/quote`, and leads by building type and by city.
- **Monday email:** PostHog subscription 159678, "Ad funnel — Monday report", weekly on Monday at 12:00 UTC
  (7 AM CDT / 6 AM CST) to `juanleon1905@gmail.com`, `julianleon@triplejmetaltx.com`, `julianleon0724@yahoo.com`:
  10 of the dashboard's charts plus an AI-written summary steered to leads, calls, source and the biggest
  funnel drop. Change recipients in PostHog → the dashboard → Subscriptions.
- **To HQ as push, not email:** alert firings go to PostHog destination "HQ push: Quote submission failed"
  (function `01a10003-0dbe-0000-d529-39e0579baa25`, enabled, filtered to that alert's id) → `POST /api/webhooks/posthog`
  with `{ alert_id }`. The route trusts nothing in the request: it re-reads the alert with
  `POSTHOG_PERSONAL_API_KEY` and pushes only if PostHog says it is firing and notified in the last 15 minutes
  (`src/lib/jobs/posthog-alert.ts`), so there is no shared secret to keep in sync. Pushes linking to
  posthog.com open in the browser, not inside the installed app (`src/app/sw.ts`). PostHog still emails each
  alert's subscriber — it requires at least one — so that email is a backstop, not removable.
- **Alert "Quote submission failed":** hourly, on insight "Failed quote submissions per hour" (`Twwvx6O1`),
  fires when the last full hour had any failed send other than the captcha reminder.
- **Owner test leads** carry `internal_traffic` on `lead_created` too: the form sends the browser's flag as
  `posthog_internal`, so they fall under the same filter.

### Stripe does not exist
Listed in project docs since 2026-04-13 as "phase 4", but there is no dependency, no env var, and no code. The only matches in `src/` are an `accentStripe` CSS variable in `src/emails/BrandLayout.tsx`. **QuickBooks is the money rail.** Descoped 2026-09-06 — see `Locked Decisions.md`.

---

## Verifying a connector

- **Env var present?** `grep -n '<KEY>' .env.example` confirms it's documented; the real value is in `.env` and in Vercel.
- **Supabase reachable?** Ask the user to check the project dashboard, or apply a no-op migration.
- **Resend deliverability** — `triplejmetaltx.com` must show **Verified** in the Resend dashboard with DKIM/SPF/DMARC green, or outbound mail bounces silently.
- **Google Workspace (Gmail) DKIM — fixed 2026-10-01.** DNS is on Vercel (`ns1/ns2.vercel-dns.com`, team `juanleon1905-5355s-projects`; records live on the team's Domains page, not the project's). Gmail signs with selector `google` (2048-bit, Google Admin → Gmail → Authenticate email: "Authenticating email with DKIM"). The `google._domainkey` TXT record had gone missing from DNS, most likely when DNS moved to Vercel, so Yahoo rejected Gmail-sent mail with "DKIM = failure". The owner re-added it from the key on that Admin page; it resolves on Google and Cloudflare DNS. Do not stop or regenerate the key in Admin without updating the record. SPF includes `_spf.google.com` and `amazonses.com`; DMARC is `p=none`; `resend._domainkey` covers website mail. Check: `curl -s 'https://dns.google/resolve?name=google._domainkey.triplejmetaltx.com&type=TXT'` returns an Answer.
- **QuickBooks** — `/hq/settings/quickbooks` shows connection state plus the pending-receipt count.
- **Crons** — Vercel dashboard → project → Cron Jobs, or check for rows written by the two cron routes.
