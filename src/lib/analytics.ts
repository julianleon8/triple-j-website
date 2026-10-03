/**
 * Product analytics (PostHog) for the public marketing site.
 *
 * Every custom event goes through capture() here, so the funnel's event names
 * live in one place. The PostHog dashboards and funnels are built on these
 * names: add new ones, never rename an existing one.
 *
 * posthog-js is about 100 KB gzipped, so it never ships in the first-load
 * bundle. src/instrumentation-client.ts calls loadPostHog() once the page has
 * finished loading, and capture() calls made before then wait for it. With no
 * NEXT_PUBLIC_POSTHOG_KEY (local dev, tests, a preview without the var)
 * nothing loads and every call is a no-op.
 *
 * What stays out of PostHog: /hq, /login, /setup (the owner's tools) and
 * /quotes/[token] (a customer's priced quote, with their name and address on
 * screen). Names, phones, emails and messages are never sent as properties,
 * and session replay masks every form input.
 */

import type { PostHog } from 'posthog-js'

import { spanishPath } from '@/i18n/routes'

export type AnalyticsEvent =
  // Fired by the delegated click listener in instrumentation-client.ts, so
  // every link on the site is covered without wiring each button.
  | 'quote_cta_clicked'
  | 'phone_clicked'
  | 'text_clicked'
  | 'email_clicked'
  | 'directions_clicked'
  // The quote form funnel, in order (QuoteForm.tsx).
  | 'quote_form_viewed'
  | 'quote_form_started'
  | 'quote_step_completed'
  | 'quote_step_back'
  | 'quote_form_submitted'
  | 'quote_form_failed'
  // Partner (B2B) form.
  | 'partner_inquiry_submitted'
  // Contact page message form (MessageForm.tsx). Its lead also fires the
  // server-side lead_created, like a quote.
  | 'contact_message_submitted'

/** Server-side event, sent from /api/leads once the lead row exists. The
 *  canonical conversion: it counts every saved lead, ad blocker or not. */
export const LEAD_CREATED_EVENT = 'lead_created'

type Props = Record<string, string | number | boolean | null | undefined>

/** US Cloud. The browser never calls it directly: next.config.ts proxies
 *  /ingest to it, so ad blockers that block posthog.com don't drop events. */
export const POSTHOG_UI_HOST = 'https://us.posthog.com'
export const POSTHOG_INGEST_PATH = '/ingest'

/**
 * Owner-only and customer-private routes. PostHog does not load when a visit
 * starts on one of these, and drops events from them if a visitor navigates in.
 */
const UNTRACKED = /^\/(hq|login|setup|quotes|offline|api)(\/|$)/

export function isTrackedPath(pathname: string): boolean {
  return !UNTRACKED.test(pathname)
}

/** Routes that mark this browser as the owner's. See markInternal(). */
const OWNER_ROUTES = /^\/(hq|login|setup)(\/|$)/

export function isOwnerPath(pathname: string): boolean {
  return OWNER_ROUTES.test(pathname)
}

export const PRODUCTION_HOSTS = ['www.triplejmetaltx.com', 'triplejmetaltx.com']

/* ─── Link classification (delegated click listener) ─────────────────────── */

export type LinkKind = 'quote' | 'phone' | 'text' | 'email' | 'directions'

export const LINK_EVENT: Record<LinkKind, AnalyticsEvent> = {
  quote: 'quote_cta_clicked',
  phone: 'phone_clicked',
  text: 'text_clicked',
  email: 'email_clicked',
  directions: 'directions_clicked',
}

/** The quote page in both languages; the Spanish URL is owned by src/i18n/routes.ts. */
const QUOTE_PATHS = new Set(['/quote', spanishPath('/quote')])

const MAP_HOSTS = /(^|\.)(google\.[a-z.]+|goo\.gl|maps\.apple\.com)$/

/** Pure: which conversion-relevant link, if any, an href points at. */
export function classifyLink(href: string, origin: string): LinkKind | null {
  const lower = href.trim().toLowerCase()
  if (lower.startsWith('tel:')) return 'phone'
  if (lower.startsWith('sms:')) return 'text'
  if (lower.startsWith('mailto:')) return 'email'

  let url: URL
  try {
    url = new URL(href, origin)
  } catch {
    return null
  }
  if (url.origin === origin) {
    if (QUOTE_PATHS.has(url.pathname) || url.hash === '#quote') return 'quote'
    return null
  }
  if (MAP_HOSTS.test(url.hostname) && (url.pathname.startsWith('/maps') || url.hostname.startsWith('maps.'))) {
    return 'directions'
  }
  return null
}

/* ─── ?src= fallback ─────────────────────────────────────────────────────── */

/**
 * `?src=fb` is the short form our own ad creatives and Marketplace listings
 * use. marketing-attribution.ts and call-tracking.ts both read it as
 * utm_source; this makes PostHog agree, so a visit isn't "Facebook" on the
 * lead row and "direct" in the funnel. A real utm_source always wins.
 */
export function utmSourceFromSrc(currentUrl: string | undefined): string | null {
  if (!currentUrl) return null
  try {
    const params = new URL(currentUrl).searchParams
    if (params.get('utm_source')) return null
    const src = params.get('src')?.trim()
    return src ? src.slice(0, 200) : null
  } catch {
    return null
  }
}

/* ─── Runtime (browser only) ─────────────────────────────────────────────── */

const INTERNAL_KEY = 'tj_internal'

let instance: PostHog | null = null
let loading: Promise<PostHog | null> | null = null

/**
 * Mark this browser as the owner's. Its events are still recorded but carry
 * internal_traffic=true, which the PostHog project's "filter out internal and
 * test users" toggle hides. Set by visiting /hq or /login, or any page with
 * ?tj_internal=1; ?tj_internal=0 clears it.
 */
export function markInternal(on = true): void {
  try {
    if (on) localStorage.setItem(INTERNAL_KEY, '1')
    else localStorage.removeItem(INTERNAL_KEY)
  } catch {
    /* Storage blocked: the flag just doesn't persist. */
  }
  instance?.register({ internal_traffic: on })
}

function isInternal(): boolean {
  if (!PRODUCTION_HOSTS.includes(window.location.hostname)) return true
  try {
    return localStorage.getItem(INTERNAL_KEY) === '1'
  } catch {
    return false
  }
}

export function loadPostHog(): Promise<PostHog | null> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (typeof window === 'undefined' || !key) return Promise.resolve(null)
  if (loading) return loading
  if (!isTrackedPath(window.location.pathname)) return Promise.resolve(null)

  loading = import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: POSTHOG_INGEST_PATH,
        ui_host: POSTHOG_UI_HOST,
        defaults: '2026-08-30',
        person_profiles: 'identified_only',
        capture_pageleave: true,
        capture_dead_clicks: true,
        capture_exceptions: true,
        enable_heatmaps: true,
        session_recording: {
          maskAllInputs: true,
          recordBody: false,
          recordHeaders: false,
        },
        // Runs before the first pageview, so even that one carries the flag.
        // `locale` is the page's <html lang> ('en' | 'es'). The English and
        // Spanish sites have separate root layouts, so changing language is a
        // full page load and this runs again.
        loaded: (ph) => ph.register({ internal_traffic: isInternal(), locale: document.documentElement.lang || 'en' }),
        before_send: (event) => {
          if (!event) return null
          const url = event.properties?.$current_url as string | undefined
          if (url) {
            try {
              if (!isTrackedPath(new URL(url).pathname)) return null
            } catch {
              /* Unparseable URL: keep the event. */
            }
          }
          const src = utmSourceFromSrc(url)
          if (src && event.properties) event.properties.utm_source = src
          return event
        },
      })
      instance = posthog
      return posthog
    })
    .catch(() => null)
  return loading
}

/** Record a custom event. Safe to call anywhere, any time; no-op without a key. */
export function capture(event: AnalyticsEvent, props?: Props): void {
  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return
  if (instance) {
    instance.capture(event, props)
    return
  }
  void loadPostHog().then((ph) => ph?.capture(event, props))
}

/**
 * Tie this browser to the lead it just created. The PostHog person's
 * distinct ID becomes the lead's UUID, so a lead in HQ can be looked up in
 * PostHog (Persons → search the lead ID) with every visit and recording.
 * Only non-identifying fields go in: no name, phone, email or message.
 */
export function identifyLead(leadId: string, props: Props): void {
  instance?.identify(leadId, props)
}

/** IDs sent with the lead so the server's lead_created event lands in the
 *  same person and session as the browser's funnel events, and carries the
 *  internal flag so the owner's own test leads are filtered out with the
 *  rest of their traffic. */
export function posthogIds(): {
  posthog_distinct_id?: string
  posthog_session_id?: string
  posthog_internal?: boolean
} {
  if (!instance) return {}
  return {
    posthog_distinct_id: instance.get_distinct_id() || undefined,
    posthog_session_id: instance.get_session_id() || undefined,
    posthog_internal: instance.get_property('internal_traffic') === true || undefined,
  }
}

/** Stop recording when a visitor navigates into an untracked route. */
export function pauseReplay(): void {
  instance?.stopSessionRecording()
}
