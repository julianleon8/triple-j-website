/**
 * Call-tracking source detection + tracking-number lookup.
 *
 * Pure logic, server-safe. No window access here — the React layer in
 * src/components/site/TrackedPhone.tsx feeds in URL + referrer.
 *
 * Wiring path when CallRail (or similar) signs up:
 *   1. Drop the per-source numbers into TRACKING_NUMBERS below.
 *   2. (Optional) load the CallRail JS snippet — see docs/CALL-TRACKING.md.
 *   3. That's it. Every <TrackedPhoneLink /> + <TrackedPhoneNumber />
 *      across the site swaps automatically. Schema.org telephone, email
 *      footers, and metadata descriptions stay on the canonical number
 *      by design — see resolveTrackingNumber().
 */

import { SITE } from '@/lib/site'

/** Canonical Triple J number — schema.org, emails, metadata always use this. */
export const CANONICAL_PHONE = SITE.phone
export const CANONICAL_PHONE_HREF = SITE.phoneHref

/** Sources we'll route distinct tracking numbers to.
 *  Order matters in the resolve fall-through (most specific first). */
export type TrafficSource =
  | 'google_search_ads'   // utm_source=google + utm_medium=cpc
  | 'google_lsa'          // utm_source=google + utm_medium=lsa OR utm_campaign=lsa
  | 'facebook_ads'        // utm_source=facebook + utm_medium=cpc | paid_social
  | 'instagram_ads'       // utm_source=instagram + utm_medium=cpc | paid_social
  | 'google_organic'      // referrer = google.* and no utm_*
  | 'bing_organic'        // referrer = bing.com and no utm_*
  | 'facebook_organic'    // referrer = facebook.com / m.facebook.com / l.facebook.com
  | 'youtube'             // referrer = youtube.com
  | 'gbp'                 // utm_source=gbp OR referrer = google.com/maps
  | 'direct'              // no utm_*, no referrer
  | 'other_referrer'      // any other external referrer
  | 'canonical'           // fallback: nothing identifying — use SITE.phone

export type TrackingResult = {
  /** Display string, e.g. "254-555-0101" — what we render visibly. */
  display: string
  /** tel: href, e.g. "tel:+12545550101". */
  href: string
  /** Which source matched. 'canonical' = fallback, no swap happened. */
  source: TrafficSource
  /** Free-form attribution detail captured at resolve time, surfaced to
   *  the logging hook. Useful in analytics for debugging "why this number". */
  detail?: {
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    gclid?: string
    fbclid?: string
    referrerHost?: string
  }
}

/**
 * Tracking-number config map. Populated when a CallRail (or similar)
 * account is provisioned — see docs/CALL-TRACKING.md.
 *
 * Empty values fall through to the canonical number, so the site keeps
 * working with no swap behavior until real numbers arrive.
 *
 * Phone format: 10-digit US, dashes for the display, +1 prefix added by
 * makeHref() for the tel: link.
 */
export const TRACKING_NUMBERS: Partial<Record<TrafficSource, string>> = {
  // google_search_ads: '',
  // google_lsa:        '',
  // facebook_ads:      '',
  // instagram_ads:     '',
  // google_organic:    '',
  // bing_organic:      '',
  // facebook_organic:  '',
  // youtube:           '',
  // gbp:               '',
  // direct:            '',
  // other_referrer:    '',
}

/** Strip everything except digits, then format as "###-###-####". */
export function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(-10)
  if (digits.length !== 10) return raw
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}

/** Build a tel: href with +1 country code from a 10-digit number. */
export function makeHref(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(-10)
  if (digits.length !== 10) return CANONICAL_PHONE_HREF
  return `tel:+1${digits}`
}

/** Inputs for source detection. Server passes empty strings or omits;
 *  client passes window.location.search + document.referrer. */
export type DetectInput = {
  search?: string   // URL query string, with or without leading '?'
  referrer?: string // document.referrer (may be empty)
}

/** Pure: classify a request as one of the TrafficSource buckets. */
export function detectTrafficSource({ search = '', referrer = '' }: DetectInput): {
  source: TrafficSource
  detail: NonNullable<TrackingResult['detail']>
} {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const utmSource = (params.get('utm_source') ?? '').toLowerCase().trim() || undefined
  const utmMedium = (params.get('utm_medium') ?? '').toLowerCase().trim() || undefined
  const utmCampaign = (params.get('utm_campaign') ?? '').toLowerCase().trim() || undefined
  const gclid = params.get('gclid') ?? undefined
  const fbclid = params.get('fbclid') ?? undefined

  let referrerHost: string | undefined
  try {
    if (referrer) referrerHost = new URL(referrer).hostname.toLowerCase()
  } catch {
    referrerHost = undefined
  }

  const detail = { utmSource, utmMedium, utmCampaign, gclid, fbclid, referrerHost }

  // Most specific first: explicit UTM beats heuristic referrer.
  if (utmSource === 'google' || gclid) {
    if (utmMedium === 'lsa' || utmCampaign?.includes('lsa')) return { source: 'google_lsa', detail }
    if (utmMedium === 'cpc' || utmMedium === 'paid' || gclid) return { source: 'google_search_ads', detail }
  }
  if (utmSource === 'facebook' || utmSource === 'fb' || fbclid) {
    return { source: 'facebook_ads', detail }
  }
  if (utmSource === 'instagram' || utmSource === 'ig') {
    return { source: 'instagram_ads', detail }
  }
  if (utmSource === 'gbp' || utmSource === 'google_business' || utmSource === 'gmb') {
    return { source: 'gbp', detail }
  }

  // Referrer-driven (no UTM was sufficient).
  if (referrerHost) {
    if (referrerHost === 'google.com' || referrerHost.endsWith('.google.com') || referrerHost === 'www.google.com') {
      // /maps inside google.com → GBP click; otherwise organic.
      if (referrer.includes('/maps')) return { source: 'gbp', detail }
      return { source: 'google_organic', detail }
    }
    if (referrerHost === 'bing.com' || referrerHost.endsWith('.bing.com')) {
      return { source: 'bing_organic', detail }
    }
    if (
      referrerHost === 'facebook.com' ||
      referrerHost.endsWith('.facebook.com') ||
      referrerHost === 'm.facebook.com' ||
      referrerHost === 'l.facebook.com'
    ) {
      return { source: 'facebook_organic', detail }
    }
    if (referrerHost === 'youtube.com' || referrerHost.endsWith('.youtube.com')) {
      return { source: 'youtube', detail }
    }
    return { source: 'other_referrer', detail }
  }

  // Nothing identifying.
  if (!utmSource && !gclid && !fbclid) return { source: 'direct', detail }

  return { source: 'canonical', detail }
}

/**
 * End-to-end resolve: classify source → look up tracking number → build
 * a TrackingResult. Falls back to canonical when no entry matches.
 */
export function resolveTrackingPhone(input: DetectInput = {}): TrackingResult {
  const { source, detail } = detectTrafficSource(input)
  const tracked = TRACKING_NUMBERS[source]
  if (tracked) {
    return {
      display: formatPhoneDisplay(tracked),
      href: makeHref(tracked),
      source,
      detail,
    }
  }
  return {
    display: CANONICAL_PHONE,
    href: CANONICAL_PHONE_HREF,
    source: 'canonical',
    detail,
  }
}
