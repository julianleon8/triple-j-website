# Connectors

Every external service this project talks to. **Update this file in the same turn you add, remove, or re-wire a connector.**

Env var values live in `.env` (gitignored) and in Vercel's project settings. `.env.example` documents key **names** only — never values. A pre-commit hook enforces that.

---

## Registry

| Connector | Env vars | Read in | Breaks if down |
|---|---|---|---|
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | `src/lib/supabase/{client,server,admin}.ts`, `src/middleware.ts` | Everything — auth, leads, HQ dashboard |
| **Resend** | `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `OWNER_EMAIL` | `src/lib/lead-notifications.ts`, `src/app/api/quotes/[id]/{send,accept}/route.ts`, `src/app/api/partner-inquiries/route.ts`, `src/app/api/webhooks/resend/route.ts` | Lead + quote email. The lead still persists to Postgres |
| **QuickBooks** | `QBO_CLIENT_ID`, `QBO_CLIENT_SECRET`, `QBO_REDIRECT_URI`, `QBO_ENVIRONMENT` | `src/lib/qbo.ts`, `src/app/api/qbo/{connect,callback}/route.ts` | Receipt → expense push. Save-local + retry, so no data loss |
| **Anthropic** | `ANTHROPIC_API_KEY` | `src/lib/{voice-lead-extractor,receipt-extractor,permit-extractor}.ts` | Voice→lead, receipt OCR, permit extraction |
| **OpenAI** | `OPENAI_API_KEY` | `src/lib/openai.ts` | Whisper transcription in the voice-memo pipeline |
| **Twilio** | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | `src/lib/twilio.ts` | Quote SMS |
| **hCaptcha** | `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`, `HCAPTCHA_SECRET_KEY` | `src/lib/captcha.ts`, `QuoteForm.tsx`, `PartnerInquiryForm.tsx` | Spam floods the public forms |
| **Meta / Facebook** | `META_APP_SECRET`, `META_PAGE_ACCESS_TOKEN`, `META_VERIFY_TOKEN` | `src/app/api/webhooks/facebook/route.ts` | Facebook lead ingestion |
| **Web Push (VAPID)** | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | `src/lib/push.ts` | HQ push notifications on new leads / hot permits |
| **Google Maps Static** | `GOOGLE_MAPS_STATIC_KEY` | `src/app/hq/jobs/[id]/components/JobMapHero.tsx` | Job map hero image |
| **Google Ads** | `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | `src/components/seo/` | Conversion tracking only — no user-facing impact |
| **Vercel cron** | `CRON_SECRET` | `src/app/api/cron/{scrape-permits,review-followups}/route.ts` | Two crons in `vercel.json` (14:00 and 14:30 UTC) stop firing |
| **Vercel build** | `VERCEL_GIT_COMMIT_SHA`, `VERCEL_DEPLOYMENT_CREATED_AT` | `src/app/hq/settings/page.tsx` | Build stamp display only |
| **Setup route** | `SETUP_KEY` | `src/app/api/setup/route.ts` | One-time bootstrap gate |

## Deploy

**Vercel**, GitHub integration. Every push to `main` auto-deploys to production. There is no staging branch — `main` **is** production, and a bad push is live in about a minute.

---

## Known-broken / non-obvious states

Recorded so no future session rediscovers them.

### Supabase MCP requires interactive OAuth
`.mcp.json` declares one HTTP server (`mcp.supabase.com/mcp?project_ref=idrbgxlvvnqduvbqtaei`). It is **unauthenticated**, and a non-interactive session cannot complete the OAuth flow. Do not attempt it, and never ask the user for tokens or callback URLs.

Fallback chain, in order:
1. Use the bundled `supabase` skill for guidance.
2. Write SQL to `supabase/migrations/` and ask the user to apply it in the Supabase SQL editor.
3. Ask the user to run `/mcp` in an interactive session to authorize.

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
