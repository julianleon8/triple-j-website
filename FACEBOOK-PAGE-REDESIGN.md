# Facebook Page Redesign — Copy-Paste Blocks

Every field on the Triple J Metal Facebook Page, rewritten to convert.
Open **Meta Business Suite → Pages → Triple J Metal → Edit**, then paste block-by-block.

Takes ~20 minutes. Do it in one sitting so the page feels coherent when it re-renders.

> Current page: `facebook.com/profile.php?id=61579877376850`
> Target vanity URL: `facebook.com/triplejmetaltx` (claim it in step 1)
> Website + schema already link here via `SITE.social.facebook` (2026-04-24 commit `eee248d`).

---

## 1. Page name + username

**Page name** (Business Suite → Page info → Name):
```
Triple J Metal
```

**Username** (Business Suite → Page info → Username):
```
triplejmetaltx
```

This makes the URL `facebook.com/triplejmetaltx` — matches the website domain. After you claim it, come back to the repo and update `SITE.social.facebook` in `src/lib/site.ts` + `reference_social_profiles.md` in `~/.claude/projects/.../memory/`.

---

## 2. Profile photo + cover photo

**Profile photo** (170×170 native, displays at 320×320 desktop / 176×176 mobile):
- Use `public/images/logo-lion.png` — the lion emblem on brand-blue background
- Export at **1024×1024** PNG from the source; Meta downsamples cleanly
- Keep the lion centered with ~10% padding; Meta crops to a circle on mobile

**Cover photo** (820×360 recommended, mobile-safe area is 640×360):
- Shot of a welded red-iron frame being installed on-site, or a finished carport in Central Texas
- Overlay text (large, high-contrast): **"BUILT RIGHT. BUILT FAST. BUILT BY TRIPLE J."**
- Sub-line (smaller): "Central Texas · 254-346-7764"
- Keep the tagline in the mobile-safe center band (820×360 desktop safe ≈ 820×312; mobile crop starts around x=90, y=24)

If you don't have a clean install photo yet, use the hero image: `public/images/red-iron-frame-hero.jpg`.

---

## 3. Intro / Short description

**Short description** (Business Suite → Page info → Short description, 155 chars max):
```
Welded or bolted metal carports, garages, and barns across Central Texas. Turnkey with concrete. Same-week installs. 254-346-7764.
```
(127 chars — leaves headroom.)

---

## 4. Long description / About

**About / Long description** (Business Suite → Page info → Additional information):

```
Triple J Metal is a family-owned metal building contractor based in Temple, TX. We build welded or bolted metal carports, garages, barns, RV covers, lean-to patios, and HOA-compliant residential structures across Bell, Coryell, McLennan, Williamson, and Lampasas counties.

What makes us different from the national kit shippers and the local bolted-only crews:

• Same-week scheduling. Most Central Texas metal building contractors quote 4–16 weeks. Our crew typically starts on-site within the same week a contract is signed.

• Welded OR bolted — your choice. National brands ship bolted kits. Small shops only do welded. We do both, on-site, by our own crew.

• One contract, one invoice. Steel, concrete, site prep, permits, and install on a single signed contract. No coordinating three different subs.

• 4,000 PSI concrete standard. Residential default is 3,000 PSI — we spec 4,000 PSI for Central Texas clay soil movement.

• Zero subcontractors. Juan, Julian, and Freddy are all in-house welders. The crew on your job is the company.

• Bilingual. English and Spanish on the phone and on every jobsite. Press 1 for English, 2 for Spanish when you call.

• Mon–Sat, 8am–6pm Central. Six days a week, not just M–F.

We support Fort Cavazos military families with flexible scheduling around PCS orders — we can finish before your move-in window or delay until after move-out, no penalty.

Free quotes. No deposit to get quoted. Quotes valid 30 days.

Typical ranges (varies with size, site prep, and options):
– Carports: $4,000–$18,000
– Garages: $15,000–$60,000
– Barns: $25,000–$120,000

Call 254-346-7764 · julianleon@triplejmetaltx.com · triplejmetaltx.com
```

---

## 5. Services tab

Add each of these in **Business Suite → Services** as a separate service entry.

**Service 1 — Metal Carports**
- Name: `Metal Carports — Welded or Bolted`
- Starting price: `4000`
- Description:
  ```
  Welded red-iron or bolted metal carports in any width, length, and height. Single-car to 8-car agricultural. Concrete pad included in turnkey builds. Same-week scheduling.
  ```

**Service 2 — Metal Garages**
- Name: `Custom Metal Garages`
- Starting price: `15000`
- Description:
  ```
  Fully-enclosed residential or commercial garages. Roll-up or walk-in doors, insulation package optional, full slab and framing included.
  ```

**Service 3 — Metal Barns**
- Name: `Metal Barns & Ranch Structures`
- Starting price: `25000`
- Description:
  ```
  Horse, hay, and equipment barns. Center-aisle, monitor-style, or open-front. Up to 60ft clear spans. Built for Central Texas wind and hail loads.
  ```

**Service 4 — RV & Boat Covers**
- Name: `RV & Boat Covers`
- Starting price: `4500`
- Description:
  ```
  14ft+ clearance standard. Drive-through and single-entry designs. Taller bays for fifth-wheels and toy haulers. Fort Cavazos military discount available.
  ```

**Service 5 — Lean-to Patios & House Additions**
- Name: `Lean-to Patios & Additions`
- Starting price: `3500`
- Description:
  ```
  Attached covered structures with panel profile and trim matching your existing home.
  ```

**Service 6 — HOA-Compliant Structures**
- Name: `HOA-Compliant Metal Structures`
- Starting price: `6500`
- Description:
  ```
  Standing-seam concealed-fastener panels and architectural finishes that pass HOA review in Heritage Oaks, Bella Charca, and other Central Texas luxury subdivisions.
  ```

**Service 7 — Turnkey Carports with Concrete**
- Name: `Turnkey Carport + Concrete (One Contract)`
- Starting price: `7500`
- Description:
  ```
  Site prep, 4,000 PSI concrete pad, and welded or bolted carport on a single contract. The only Central Texas builder that includes every step.
  ```

---

## 6. Business info fields

| Field | Value |
|---|---|
| Phone | `254-346-7764` |
| Email | `julianleon@triplejmetaltx.com` |
| Website | `https://www.triplejmetaltx.com` |
| Address | `3319 Tem-Bel Ln, Temple, TX 76502` |
| Hours | `Mon–Sat: 8:00 AM – 6:00 PM. Closed Sunday.` |
| Categories | Primary: `Metal Building Contractor`. Secondary: `Contractor`, `Carport Service`, `Roofing Contractor` |
| Price range | `$$` |
| Founded | `2025` |
| Services area | Add each county: Bell, Coryell, McLennan, Williamson, Lampasas |
| Languages | English, Spanish |

---

## 7. CTA button config

**Business Suite → Page → Action button → Edit**

- Action: **Send Message**
- Destination: Messenger (default — this is what routes into our webhook)

Don't use "Call" as the action — it replaces the "Send Message" button and we want Messenger capture (+ the phone is already everywhere else on the page).

---

## 8. Messenger automated response

**Business Suite → Inbox → Automated responses → Instant reply**

Enable, paste:
```
Hey — thanks for reaching out to Triple J Metal.

Real quick so we can route you right:
1. Your ZIP code
2. What you're looking to build (carport, garage, barn, RV cover, etc.)
3. Rough size (width × length if you know it)

A crew member will text or call you back within a few hours — usually same day. If you need a faster answer, call 254-346-7764 (press 1 English, 2 Español).

— Julian
```

Meta will also save the incoming message — our `/api/webhooks/facebook` endpoint catches it and surfaces it in HQ as a lead.

---

## 9. Pinned post

**Create a new post → Pin to top**

Post text:
```
Triple J Metal — Temple, TX.

We build welded OR bolted metal carports, garages, and barns across Central Texas. One contract covers site prep, concrete, and install — no coordinating three different subs.

Why we're different:
• Same-week starts (while the kit shippers quote 4–16 weeks)
• Welded OR bolted — you choose
• 4,000 PSI concrete included (above the 3,000 PSI residential standard)
• Zero subs. The crew on your job is the owners.
• Bilingual (English / Español)
• Fort Cavazos military discount

Free quote: 254-346-7764 or message us.
triplejmetaltx.com
```

Attach 3–5 completed-project photos (carport install + finished garage + welded frame detail + cover shot).

---

## 10. Review solicitation — SMS + email templates

You have 50+ past customers and zero Facebook reviews. Fix that before you start ads.

**Direct review link:**
```
https://www.facebook.com/triplejmetaltx/reviews
```
(Works after the vanity URL is claimed. Until then use the `profile.php?id=...` URL with `/reviews` appended.)

**SMS template** (send to past customers one-by-one):
```
Hey [name] — Julian with Triple J Metal. Quick ask: would you mind leaving us a quick review on Facebook? It helps other folks in Central Texas find us when they're looking for a carport/garage/barn. Takes 30 seconds: [LINK]. Thanks a ton.
```

**Email template** (for customers with email on file):
```
Subject: A quick favor, [name]?

Hey [name],

Julian from Triple J Metal here. Now that your [carport/garage/barn] has been up for a bit, would you mind dropping us a quick review on Facebook? Doesn't have to be long — one sentence on what we built and how it went is plenty.

Direct link: [LINK]

Thanks — means a lot for a family business trying to grow without a national marketing budget. Call or text anytime if anything comes up with the build.

— Julian
254-346-7764
```

Target: **10 reviews in the first 2 weeks** before you turn on paid ads. Facebook weighs review count + recency in ad delivery + page trust scoring.

---

---

## APPENDIX A — Meta for Developers app setup

Required before Facebook Lead Ads + Messenger webhook events flow into HQ.

### A1. Create the app
1. Go to `https://developers.facebook.com/apps/` → **Create App**
2. Use case: **Other** → next
3. Type: **Business**
4. App name: `Triple J Metal HQ`
5. Contact email: `julianleon@triplejmetaltx.com`
6. Business account: link to the Triple J Business Manager (create one if you don't have it)

### A2. Add products
In the new app's dashboard:
- **Webhooks** → Set up
- **Pages** → Set up (grants `pages_manage_metadata`, `pages_read_engagement`, `pages_messaging`, `leads_retrieval` — Business Verification required for the last two)

### A3. Get the three env values
In **App Dashboard → Settings → Basic**:
- **App Secret** — click "Show", copy. This is `META_APP_SECRET`.
- **App ID** — copy for reference (not used as an env var).

Invent a **verify token** (any random string — e.g. `triplej-meta-webhook-8f3a2c`). This is `META_VERIFY_TOKEN`.

Generate a **Page Access Token**:
1. Open `https://developers.facebook.com/tools/explorer/`
2. Select your app
3. Get User Access Token with scopes: `pages_show_list`, `pages_manage_metadata`, `pages_read_engagement`, `pages_messaging`, `leads_retrieval`
4. Swap the short-lived token for a long-lived Page Token:
   ```
   curl "https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=<APP_ID>&client_secret=<APP_SECRET>&fb_exchange_token=<SHORT_TOKEN>"
   ```
5. Then fetch the Page-scoped token:
   ```
   curl "https://graph.facebook.com/v21.0/me/accounts?access_token=<LONG_LIVED_USER_TOKEN>"
   ```
   Find the Triple J page in the response and copy its `access_token`. **This is `META_PAGE_ACCESS_TOKEN` — it doesn't expire.**

### A4. Add to Vercel
From the repo root (requires `vercel env add`):
```
vercel env add META_APP_SECRET production
vercel env add META_PAGE_ACCESS_TOKEN production
vercel env add META_VERIFY_TOKEN production
```
Mark each as **Sensitive** in the Vercel dashboard after adding.

Also add to `.env.local` if you want to test locally (optional — webhook needs a public URL to receive from Meta anyway).

### A5. Subscribe the webhook
In the Meta app dashboard → **Webhooks** → **Add Subscription** → **Page**:
- Callback URL: `https://www.triplejmetaltx.com/api/webhooks/facebook`
- Verify token: (same value as `META_VERIFY_TOKEN`)
- Click **Verify and Save** — Meta sends a GET to the URL; our endpoint echoes `hub.challenge` back.
- Subscribe to fields: **`leadgen`**, **`messages`**, **`messaging_postbacks`**

Then **subscribe the specific page** (not just the app) in the same Webhooks panel — click **Subscribe** next to the Triple J page row.

### A6. Request permissions (needed for live data, not sandbox tests)
**App Review → Permissions and Features**:
- `pages_messaging` — required for Messenger sender name lookup + Send API replies
- `leads_retrieval` — required to fetch Lead Ads form data via Graph API
- `pages_manage_metadata` — required to subscribe the page to the webhook

Each triggers a short App Review (screencast + use-case description). Do this after Business Verification clears, or submit concurrently.

### A7. Business Verification
**Settings → Business Verification** — Meta requires this for ads-related permissions. Submit:
- Texas LLC formation docs
- Utility bill or lease for `3319 Tem-Bel Ln, Temple TX 76502`
- Domain verification: `triplejmetaltx.com` (DNS TXT record — Vercel panel)

Takes **1–7 days**. The Messenger webhook can be working before verification clears; Lead Ads need it.

---

## APPENDIX B — Verifying the integration

Once `META_*` env vars are set and the webhook is subscribed:

**1. GET handshake (sanity check):**
```
curl "https://www.triplejmetaltx.com/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test123"
```
Expect: `test123` in the response body.

**2. Messenger test:**
Send a DM to the Triple J page from any personal account. Within 30 seconds:
- New row in Supabase `leads` with `source = 'facebook_messenger'`
- Owner alert email in `julianleon@triplejmetaltx.com`
- iOS push on installed HQ PWA devices
- Row visible in HQ (`/hq`) via the 30s poll

**3. Lead Ads test (requires Business Verification):**
Meta Developer Console → Marketing API → Lead Ads Testing Tool → submit a test lead. Expect the same three signals.

**4. Check idempotency:**
Re-submit the same test. V1 accepts the duplicate row — the Meta `leadgen_id` is stored in the `message` field as `FB-Lead-<id>` so you can dedupe in SQL if it becomes a problem.

---

## What this unlocks

| Before | After |
|---|---|
| DM to FB page → sits in Meta inbox until Julian checks | DM → HQ lead → email + push → surfaces in `/hq` Now tab |
| Lead Ads leads → CSV export from Meta Business Suite | Lead Ads → HQ lead → full pipeline + auto-reply |
| No FB signal in site schema | `sameAs: facebook.com/triplejmetaltx/` in `LocalBusiness` + visible footer icon |
| Reviews: 0 | Templates + link ready to send to past customers |
