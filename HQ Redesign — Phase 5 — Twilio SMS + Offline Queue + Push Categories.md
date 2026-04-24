# HQ Redesign — Phase 5 — Twilio SMS + Offline Queue + Push Categories

_One of 5 phased plans for the full HQ iPhone PWA redesign. Depends on Phases 1–4. Sibling plans: Phases 1–3 (design), Phase 4 (Voice + Camera + Receipt OCR)._

_Branch: `claude/redesign-iphone-pwa-app-5V1Cn` (push to main authorized; Vercel auto-deploys)._

---

## Read first
- `CLAUDE.md` + `AGENTS.md`
- Phases 1–4 plans
- Twilio docs: Programmable Messaging, StatusCallback webhooks, Twilio MessagingService
- `supabase` skill + `supabase-postgres-best-practices` skill (this phase adds the biggest new schema — two tables with RLS, indexes, FKs)

## Context
The last phase. Three finishing moves that unlock the real business value:

1. **Twilio threaded SMS inside HQ** — every inbound + outbound customer text lives in a threaded conversation tied to a lead or customer. Julian texts from inside HQ, not iMessage. His phone buzzes on inbound via push. Auto-response on new lead + review-velocity texts after job completion also flow through the same system. **This is the single highest-ROI feature in the whole redesign** — speed-to-response + review velocity are the Phase 2 conversion stack from `Next Session Primer.md`.

2. **Offline draft queue for new leads** — if you're at a jobsite with no signal and someone gives you their info, you type it into the `+` → New Lead form, it queues in IndexedDB, and syncs automatically when network returns. Read-only for all other entities stays as it already is (Serwist NetworkFirst cache handles that — see audit section 2).

3. **Push notification categories** — per-category toggles (Hot permits · New leads · Quote accepted · SMS replies · Job updates) + quiet hours (mute 10pm–7am except hot permits). Replaces the current single global switch.

## Scope (this phase)
1. **Twilio infrastructure** — number provision, env vars, webhook, outbound API.
2. **SMS threads UI** — threaded conversation view on lead + customer detail screens, unified inbox in More tab.
3. **Auto-response on new lead** — 60-second SMS auto-reply with calendar link (locked strategy: Phase 2 conversion stack).
4. **Review velocity** — 24hr-after-job-completed SMS with Google review link.
5. **Offline draft queue** — IndexedDB queue for new leads with background sync.
6. **Push notification categories** — user-configurable categories + quiet hours in Settings → Notifications.

## File-level changes

### Twilio — new files
- `src/lib/sms/twilio.ts` — small wrapper around `twilio` SDK. Functions: `sendSMS({to, body, threadKey})` + `formatPhone(raw)` + `parseInbound(webhookPayload)`. Pulls creds from env.
- `src/app/api/sms/send/route.ts` — POST. Authenticated. Body: `{lead_id?, customer_id?, body}`. Sends via Twilio, inserts outbound row into `sms_messages`, returns thread id.
- `src/app/api/webhooks/twilio/inbound/route.ts` — POST. Public. Verifies Twilio signature via `TWILIO_AUTH_TOKEN`. Finds existing thread by phone number (matching against `leads.phone` + `customers.phone`) or creates a new lead with `source='sms_inbound'`. Inserts into `sms_messages`. Fires a push notification to subscribed users (category: `sms_replies`).
- `src/app/api/webhooks/twilio/status/route.ts` — POST. Updates `sms_messages.delivery_status` (queued → sent → delivered → failed).
- `src/components/hq/sms/SmsThread.tsx` — iMessage-style conversation view. Outbound = brand-blue right-aligned bubbles; inbound = gray left-aligned. Timestamps grouped. Composer at bottom with `<Input>` (Phase 2) + send button. Auto-scroll to bottom on new.
- `src/components/hq/sms/SmsInbox.tsx` — list of threads, newest activity first. Each row: avatar + name + last-message preview + timestamp + unread-count badge. Reuses `MessagesRow` pattern from Phase 2.
- `src/app/hq/sms/page.tsx` — SMS inbox top-level (More → SMS entry point).
- `src/app/hq/sms/[thread_id]/page.tsx` — thread view.
- `src/app/hq/leads/[id]/_components/LeadSmsThread.tsx` — inline thread on the lead detail (replaces the `sms:` deep-link from Phase 2).
- `src/app/hq/customers/[id]/_components/CustomerSmsThread.tsx` — same for customer detail.
- `supabase/migrations/015_sms_threads.sql` — `sms_threads` + `sms_messages` tables + RLS + indexes.

### Auto-response + review velocity
- `src/app/api/leads/route.ts` (modify) — after successful lead insert, fire a Twilio auto-response text to the lead's phone. Body template from `src/lib/site.ts`. Gate with `AUTO_RESPONSE_ENABLED=true` env for A/B.
- `src/app/api/cron/review-velocity/route.ts` — new cron. Runs daily 09:00 TX time. Finds jobs where `status='completed'` AND `completed_date = today - 1 day` AND no review-text sent yet. Sends the review-velocity SMS (includes Google review link from `src/lib/site.ts`). Marks `jobs.review_text_sent_at`.
- `vercel.json` — add the cron entry.
- `supabase/migrations/016_jobs_review_text_sent_at.sql` — add the column.

### Offline draft queue
- `src/lib/hq/offline-queue.ts` — IndexedDB (using `idb` library — add to deps) with a single object store `lead_drafts`. Functions: `enqueue(draft)`, `drain()`, `listPending()`. Persists through reload.
- `src/components/hq/OfflineQueueBadge.tsx` — shows a pill near `OfflineBadge` when pending drafts exist (e.g. "2 queued"). Tap → list of drafts with retry/edit/delete.
- `src/app/api/leads/route.ts` (modify) — already exists; add an `Idempotency-Key` header accept so the drain worker doesn't double-insert on flaky networks.
- `src/components/hq/OfflineDrainer.tsx` — mounts in `HqChrome`. Listens to `window.online` event; when online, drains the queue. Shows toast on success.
- `src/app/sw.ts` (modify) — add Background Sync event listener for `lead-draft-sync` tag that calls the drain (progressive enhancement; iOS Safari doesn't support Background Sync but the online event still works).
- Update `HoldToRecordButton` / lead form from Phase 4 to enqueue when offline instead of failing.

### Push categories + quiet hours
- `supabase/migrations/017_push_preferences.sql` — `push_preferences` table (user_id PK, FK to push_subscriptions via user) with columns: `hot_permits`, `new_leads`, `quote_accepted`, `sms_replies`, `job_updates` (booleans, default true) + `quiet_hours_start text`, `quiet_hours_end text`, `quiet_critical_override boolean default true` (hot permits always wake phone).
- `src/lib/push/notify.ts` — new helper `sendPush({userId, category, title, body, url, tag})`. Checks prefs + quiet hours before calling `web-push`. Used by inbound SMS, new-lead, quote-accepted, hot-permit flows.
- `src/app/hq/settings/notifications/page.tsx` (modify) — add toggles per category + quiet-hours time pickers (native `<input type="time">`).
- `src/app/api/push/preferences/route.ts` — GET + PATCH.
- Retrofit existing push call sites to route through `sendPush` instead of direct `web-push` send.

### Env vars (add to Vercel + `.env.example`)
```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_MESSAGING_SERVICE_SID=     # preferred over a single 'from' number
TWILIO_FROM_NUMBER=               # fallback if no messaging service
AUTO_RESPONSE_ENABLED=true
CRON_SECRET=                      # already exists for permit scrape; review-velocity reuses
```

### Database schema
```sql
-- 015_sms_threads.sql
create table public.sms_threads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  lead_id uuid references public.leads(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  phone text not null,
  last_message_at timestamptz,
  last_message_preview text,
  unread_count int not null default 0
);
create unique index sms_threads_phone_unique on public.sms_threads(phone);
create index sms_threads_updated_at on public.sms_threads(updated_at desc);
alter table public.sms_threads enable row level security;
create policy "authed full access" on public.sms_threads for all using (auth.role() = 'authenticated');

create table public.sms_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.sms_threads(id) on delete cascade,
  created_at timestamptz not null default now(),
  direction text not null check (direction in ('inbound','outbound')),
  body text not null,
  twilio_sid text unique,
  delivery_status text check (delivery_status in ('queued','sent','delivered','failed','undelivered')),
  sent_by uuid references auth.users(id),
  from_number text,
  to_number text,
  error_code text,
  media_urls text[] default '{}'
);
create index sms_messages_thread_created on public.sms_messages(thread_id, created_at desc);
alter table public.sms_messages enable row level security;
create policy "authed full access" on public.sms_messages for all using (auth.role() = 'authenticated');

-- 016_jobs_review_text_sent_at.sql
alter table public.jobs add column if not exists review_text_sent_at timestamptz;

-- 017_push_preferences.sql
create table public.push_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  hot_permits boolean not null default true,
  new_leads boolean not null default true,
  quote_accepted boolean not null default true,
  sms_replies boolean not null default true,
  job_updates boolean not null default true,
  quiet_hours_start text,     -- '22:00'
  quiet_hours_end text,       -- '07:00'
  quiet_critical_override boolean not null default true
);
alter table public.push_preferences enable row level security;
create policy "user owns preferences" on public.push_preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
```

## Reused utilities (from audit + prior phases)
- `src/components/hq/PushOptIn.tsx` — keep subscribe flow. Add the preferences section next to it.
- `src/components/hq/Sheet.tsx` — SMS composer on lead detail slides up as a Sheet on small screens (optional).
- `src/components/hq/ui/Input.tsx` (Phase 2) — SMS composer input.
- `src/lib/hq/haptics.ts` (Phase 1) — `success` on send, `tap` on inbound render.
- `src/components/hq/OfflineBadge.tsx` (exists) — compose with `OfflineQueueBadge` in the header.
- `src/app/api/push/*` (exists) — reuse subscribe/unsubscribe; `send` helpers route through the new `sendPush`.
- `vercel.json` cron pattern (exists for permit scrape) — same syntax for review-velocity.

## Twilio provisioning checklist (Julian, before coding)
- Buy a local TX number (area code 254 matches Temple HQ).
- Create a Messaging Service + attach the number.
- Configure inbound webhook: `https://triplejmetaltx.com/api/webhooks/twilio/inbound`.
- Configure status callback: `https://triplejmetaltx.com/api/webhooks/twilio/status`.
- Request A2P 10DLC registration (required for new TX business numbers). Can take 1–3 days.
- Paste SID + auth token into Vercel env.

## Verification
1. Send yourself an inbound SMS to the Twilio number → appears in `/hq/sms` within 3s, push notification fires. Threaded correctly against your phone.
2. Reply from the thread composer → Twilio `MessageSid` logged. Recipient receives the text. Delivery status updates to `delivered` via webhook.
3. Submit a new website lead → auto-response text arrives at the lead's phone within 60s.
4. Mark a job `completed` with `completed_date = yesterday` → review-velocity cron (run manually via `/api/cron/review-velocity?secret=X`) sends the review text. `jobs.review_text_sent_at` populates.
5. Airplane mode → open `+` → New Lead → fill + submit → lead appears in local queue with "2 queued" badge. Turn airplane off → drainer fires → lead appears in `/hq/leads`. Badge clears.
6. Idempotency: force a double-drain (e.g. refresh + reconnect) → no duplicate `leads` row.
7. Settings → Notifications: toggle "New leads" off → submit a test lead from website → no push (but SMS replies still work if that toggle is on). Set quiet hours 23:00–06:00 → send at midnight → no push (unless `quiet_critical_override=true` and category is `hot_permits`).
8. Dark mode verified on SMS threads (iMessage-style bubbles flip colors correctly).
9. RLS sanity: a non-authed request to `/api/sms/send` returns 401. Public webhook routes verify Twilio signature.
10. `npm run typecheck && npm run build` pass.

## Cost sanity
- Twilio: $1/mo number + $0.0079 per SMS. 500 msgs/mo = ~$5/mo.
- A2P 10DLC: $15 one-time registration + small monthly fee (~$1.50/campaign).
- Total: <$10/mo at realistic early volume. At 1000 msgs/mo, ~$10/mo.

## Commit + deploy
Suggested commits: `db: sms_threads + sms_messages + push_preferences + job review timestamp` → `sms: twilio send + inbound + status webhooks` → `sms: threaded UI on lead/customer detail + inbox` → `sms: auto-response on new lead + review-velocity cron` → `hq: offline draft queue for new leads (idb)` → `push: per-category preferences + quiet hours`. Push to `main`.

## Post-Phase-5: the app is done (for this redesign arc)
After Phase 5 ships, HQ is a real 2026-era iPhone app — iOS-native visual language, Twilio-powered customer messaging, offline-tolerant field use, voice-to-lead, camera-to-job, receipts-to-QBO. The next roadmap layer (not in this plan set) is: Freddy team account + Spanish i18n, native iOS widget companion, route optimizer, in-app calendar — all locked as **deferred** in the 2026-04-24 intake.
