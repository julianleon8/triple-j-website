# Call tracking — runbook

Dynamic Number Insertion (DNI) infrastructure for swapping the displayed phone number based on traffic source. Built to plug a CallRail (or similar) account in with ~10 minutes of work once the account exists.

---

## Architecture

Three files:

| File | Role |
|---|---|
| [src/lib/call-tracking.ts](../src/lib/call-tracking.ts) | Pure logic. Source detection from URL params + referrer, lookup against `TRACKING_NUMBERS` config, canonical fallback. Server-safe — no `window` access. |
| [src/components/site/TrackedPhone.tsx](../src/components/site/TrackedPhone.tsx) | Client components + `useTrackedPhone()` hook. SSR-renders the canonical number, swaps on mount when a tracking number applies. Logs `phone_displayed` + `phone_clicked` to Vercel Analytics. |
| `docs/CALL-TRACKING.md` (this file) | The runbook. |

### How the swap works

1. Server renders every CTA with the canonical number (`254-346-7764`). HTML ships looking the same as it does today.
2. On the client, `useTrackedPhone()` runs once on mount. It reads `window.location.search` + `document.referrer`, classifies the visitor's source ([detectTrafficSource](../src/lib/call-tracking.ts)), and looks up a tracking number from `TRACKING_NUMBERS`.
3. If a tracking number applies, the component swaps both the visible text and the `tel:` href. If none applies, the canonical number stays.
4. Visitor source + number-shown is logged once to Vercel Analytics as `phone_displayed`. Click events fire `phone_clicked`.

### Sources we route

Defined in `TrafficSource` ([call-tracking.ts](../src/lib/call-tracking.ts)). Detection rules, in priority order:

| Source | Match rule |
|---|---|
| `google_lsa` | `utm_source=google` and (`utm_medium=lsa` OR `utm_campaign` contains `lsa`) |
| `google_search_ads` | `utm_source=google` with `utm_medium=cpc \| paid`, OR a `gclid` is present |
| `facebook_ads` | `utm_source=facebook` / `fb`, OR an `fbclid` is present |
| `instagram_ads` | `utm_source=instagram` / `ig` |
| `gbp` | `utm_source=gbp` / `google_business` / `gmb`, OR referrer is `google.com/maps` |
| `google_organic` | Referrer is `*.google.com` (no UTM) and not `/maps` |
| `bing_organic` | Referrer is `*.bing.com` |
| `facebook_organic` | Referrer is `facebook.com` / `m.facebook.com` / `l.facebook.com` |
| `youtube` | Referrer is `*.youtube.com` |
| `other_referrer` | Any other external referrer |
| `direct` | No UTM, no referrer |
| `canonical` | Fallback when no tracking number is configured for the matched source — render the canonical number |

---

## Wiring CallRail (or similar) — the 10-minute path

Skip step 4 if you're using your own provider that issues straight phone numbers.

### 1. Provision per-source numbers

In CallRail (or equivalent), create one tracking number per source you care about. The backbone six worth provisioning first:

- Google Search Ads
- Google LSA
- Facebook Ads
- Instagram Ads
- Google organic (SEO)
- GBP (Google Business Profile)

Direct + organic-non-Google can stay on the canonical number until volume justifies splitting.

### 2. Drop the numbers into `TRACKING_NUMBERS`

Edit [src/lib/call-tracking.ts](../src/lib/call-tracking.ts):

```ts
export const TRACKING_NUMBERS: Partial<Record<TrafficSource, string>> = {
  google_search_ads: '254-555-0101',
  google_lsa:        '254-555-0102',
  facebook_ads:      '254-555-0103',
  instagram_ads:     '254-555-0104',
  google_organic:    '254-555-0105',
  gbp:               '254-555-0106',
}
```

That's the full code change. Empty entries fall through to the canonical number — no other code edits required.

Numbers can be in any common format (`(254) 555-0101`, `254.555.0101`, `+12545550101`). [formatPhoneDisplay](../src/lib/call-tracking.ts) and [makeHref](../src/lib/call-tracking.ts) normalize on read.

### 3. Commit + push

The site auto-deploys on push to `main` (Vercel integration). Tracking is live within ~30 seconds.

### 4. (Optional) load the CallRail JavaScript snippet

Only needed if you want CallRail's session-stitching cookies + their dashboard reports against pages on this domain. Without the snippet you still get number-swap at the UI layer and visitor-source counts in Vercel Analytics — you just don't get CallRail-attributed call recordings + cookie-based session linking.

If you decide to load it: add the snippet to [src/app/layout.tsx](../src/app/layout.tsx) inside the `<body>` tag, just after `{children}`:

```tsx
import Script from 'next/script'

// inside <body>:
<Script
  src="https://cdn.callrail.com/companies/<your-company-id>/<your-key>/12/swap.js"
  strategy="afterInteractive"
/>
```

CallRail's snippet does its own DOM scan and replaces phone numbers it finds. Our `<TrackedPhoneLink>` already swaps independently — when both run, CallRail's swap wins on first paint after their script loads (because we set `data-tracked-phone-source` on every node, CallRail's script sees them and respects them, but you may want to mark the canonical-only nodes to keep them stable; ping the CallRail support for `swap-target` opt-out if needed).

**Recommendation:** start without the CallRail snippet. Our component-based swap covers 95% of what you need. Add the snippet only when you want session-stitching across many pages.

---

## Schema.org telephone — must stay canonical

The schema-graph emitted by [src/components/seo/OrganizationJsonLd.tsx](../src/components/seo/OrganizationJsonLd.tsx) and the per-page schemas (`/locations/[slug]`, `/services/[slug]`, etc.) **must** keep using `SITE.phone`. The reason:

- Schema is server-rendered and sent to Google's crawlers, not human visitors. There's no UTM context to swap on.
- Google verifies the LocalBusiness `telephone` against the GBP / Google Maps record. If schema returns a different number than GBP, the LocalBusiness entity becomes ambiguous and the Knowledge Panel suffers.
- A tracking number rotated out of CallRail later would orphan stale schema cached in Google's index.

The `<TrackedPhone*>` components are intentionally NOT used inside any JSON-LD. Schema, email templates, and metadata descriptions all reference `SITE.phone` directly. This is a hard rule — verified by grep at audit time.

---

## What gets logged

Every `useTrackedPhone()` mount fires one `phone_displayed` event:

```ts
track('phone_displayed', {
  source: 'google_search_ads',
  number: '254-555-0101',
  utm_source: 'google',
  utm_medium: 'cpc',
  utm_campaign: 'central_tx_carports',
  referrer_host: 'www.google.com',
})
```

Every click on a `<TrackedPhoneLink>` / `<TrackedPhoneButtonLink>` fires one `phone_clicked` event:

```ts
track('phone_clicked', {
  source: 'google_search_ads',
  number: '254-555-0101',
  surface: 'header_topbar',  // identifies which CTA was clicked
  ...attribution,
})
```

Both events ship to **Vercel Analytics** (already loaded in [src/app/layout.tsx](../src/app/layout.tsx)). View them under the Custom Events tab on the Vercel dashboard.

To pipe these to Postgres for first-party retention, see the proposed Migration 014 in [docs/DATA-MODEL-AUDIT-2026-04-24.md](DATA-MODEL-AUDIT-2026-04-24.md) — `leads.utm_*` + `leads.referring_customer_id` close the loop from "phone shown" → "lead created".

### Per-CTA `surface` values

Each `<TrackedPhoneLink>` / `<TrackedPhoneButtonLink>` ships with a `surface` prop so you can tell which CTA generated the click. The names in use today:

- `header_topbar`, `header_dropdown`, `header_drawer` — site chrome
- `footer` — footer NAP block
- `mobile_call_bar` — sticky bottom bar on mobile
- `prefooter` — pre-footer CTA section
- `homepage_hero`, `military_hero`, `about_hero`, `service_areas_hero`, `services_hero`, `services_slug_hero`, `locations_slug_hero`, `partners_hero`, `gallery_hero`, `gallery_id_hero`, `blog_hero`, `service_areas_inline`, `colors_hero`, `hybrid_projects_hero`, `pbr_pbu_hero` — page-level CTAs

---

## Testing without a real account

The infrastructure works with no tracking numbers configured — every visitor sees the canonical number, but `phone_displayed` events still fire with the resolved `source`. That gives you a free pre-CallRail data set: **"how many of my visitors are coming from google_search_ads vs google_organic vs direct?"** is answerable from Vercel Analytics today, before you spend a dollar on CallRail.

To exercise the swap path locally:

1. Drop a temp entry into `TRACKING_NUMBERS`:
   ```ts
   google_search_ads: '254-555-0101',
   ```
2. Run `npm run dev`.
3. Visit `http://localhost:3000/?utm_source=google&utm_medium=cpc`.
4. Open the dev tools — every CTA should display `254-555-0101`. The Header phone, Footer phone, MobileCallBar, and every page hero CTA all swap.
5. Click any CTA. Vercel Analytics dev mode logs the `phone_clicked` event in the console.

Remove the temp entry before commit.

---

## What's NOT swapped, by design

- **Schema.org JSON-LD** (canonical via SITE.phone — see above).
- **Email templates** under `src/emails/*` (server-rendered, no UTM context, customer-facing email body).
- **Metadata descriptions** that mention `254-346-7764` (`/contact`, `/`, `/services` Open Graph + meta descriptions). Static at build/request time, can't reflect a per-visitor number.
- **API error responses** (`Too many submissions … please call 254-346-7764`). Server-side, no UTM.
- **`/quotes/[token]`** customer quote-acceptance pages. These are direct deep links from emails, not from ads — no source attribution to swap on.
- **Privacy / terms** plain-text mentions. Compliance copy stays canonical for trust.

If you want any of these to swap, push for Phase 2 — but it adds complexity (e.g. emails would need per-recipient tracking number provisioning) without much marginal value.

---

## File map

| Need to change… | Edit this |
|---|---|
| Add a new tracking number | `TRACKING_NUMBERS` in [src/lib/call-tracking.ts](../src/lib/call-tracking.ts) |
| Add a new traffic-source bucket (e.g. TikTok ads) | `TrafficSource` type + `detectTrafficSource()` rule in [src/lib/call-tracking.ts](../src/lib/call-tracking.ts) |
| Add a new CTA to the site | Use `<TrackedPhoneButtonLink surface="..." />` from [src/components/site/TrackedPhone.tsx](../src/components/site/TrackedPhone.tsx) — never hardcode `tel:+12543467764` |
| Change the canonical number | `SITE.phone` + `SITE.phoneHref` in [src/lib/site.ts](../src/lib/site.ts) — both `CANONICAL_PHONE` constants in `call-tracking.ts` re-export from there |
| Load CallRail's session-stitching script | See "(Optional) load the CallRail JavaScript snippet" above |

---

*Last updated 2026-04-24. Update when the CallRail account ships and `TRACKING_NUMBERS` gets populated.*
