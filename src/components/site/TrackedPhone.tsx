'use client'

import { useEffect, useSyncExternalStore, type ComponentProps, type ReactNode } from 'react'
import { track } from '@vercel/analytics'

import { callConversionSendTo } from '@/lib/call-conversion'
import {
  CANONICAL_PHONE,
  CANONICAL_PHONE_HREF,
  resolveTrackingPhone,
  type TrackingResult,
} from '@/lib/call-tracking'

/**
 * Client-side hook + components that swap the displayed phone number
 * based on traffic source. SSR-safe: every component renders the
 * canonical number first, then swaps once on mount if a tracking number
 * applies.
 *
 * Schema.org telephone, email templates, and metadata descriptions
 * intentionally bypass this layer and stay on SITE.phone — see
 * docs/CALL-TRACKING.md.
 */

const CANONICAL: TrackingResult = {
  display: CANONICAL_PHONE,
  href: CANONICAL_PHONE_HREF,
  source: 'canonical',
}

/**
 * Read tracking inputs from the browser (location.search + document.referrer)
 * and resolve to a TrackingResult. Returns canonical when called server-side.
 *
 * Cached at module scope so useSyncExternalStore's snapshot getter can
 * return a stable reference across calls (the contract requires that).
 */
let cachedClient: TrackingResult | null = null

function readClientSnapshot(): TrackingResult {
  if (typeof window === 'undefined') return CANONICAL
  if (cachedClient) return cachedClient
  cachedClient = resolveTrackingPhone({
    search: window.location.search,
    referrer: document.referrer,
  })
  return cachedClient
}

function readServerSnapshot(): TrackingResult {
  return CANONICAL
}

/** No-op subscribe — visitor source doesn't change during a session, so
 *  there's nothing to react to. useSyncExternalStore wants a function shape. */
function subscribe(_onChange: () => void) {
  return () => {}
}

/**
 * Hook: returns the resolved phone number for the current visitor.
 *
 * SSR returns canonical via readServerSnapshot. Client returns a
 * tracked number (or canonical fallback) via readClientSnapshot, cached
 * at module scope so the value is stable across renders. This is the
 * React 19 idiomatic pattern for SSR-safe client-only data — no
 * setState-in-effect, no hydration mismatch.
 *
 * `phone_displayed` analytics fires once per mount when source is
 * identifiable (even if no tracking number is configured yet, so we
 * can size demand before provisioning numbers).
 */
export function useTrackedPhone(): TrackingResult {
  const result = useSyncExternalStore(subscribe, readClientSnapshot, readServerSnapshot)

  useEffect(() => {
    if (result.source === 'canonical') return
    track('phone_displayed', {
      source: result.source,
      number: result.display,
      utm_source: result.detail?.utmSource ?? null,
      utm_medium: result.detail?.utmMedium ?? null,
      utm_campaign: result.detail?.utmCampaign ?? null,
      referrer_host: result.detail?.referrerHost ?? null,
    })
  }, [result])

  return result
}

/** Click handler that fires the analytics event and the Google Ads call
 *  conversion. Used by both link components below + exported so existing
 *  custom anchors can adopt it. */
function logCallClick(tracked: TrackingResult, surface: string) {
  const sendTo = callConversionSendTo(
    process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CALL_CONVERSION_LABEL,
  )
  if (sendTo && typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', { send_to: sendTo })
  }
  track('phone_clicked', {
    source: tracked.source,
    number: tracked.display,
    surface,
    utm_source: tracked.detail?.utmSource ?? null,
    utm_medium: tracked.detail?.utmMedium ?? null,
    utm_campaign: tracked.detail?.utmCampaign ?? null,
    referrer_host: tracked.detail?.referrerHost ?? null,
  })
}

/* ─── <TrackedPhoneNumber /> ─────────────────────────────────────────────
   Plain inline span with the resolved display number. Drop-in for
   `{SITE.phone}` references inside body copy. */

type NumberProps = Omit<ComponentProps<'span'>, 'children'> & {
  /** Optional formatter for the visible string. Default is the raw "###-###-####". */
  format?: (display: string) => string
}

export function TrackedPhoneNumber({ format, className, ...rest }: NumberProps) {
  const tracked = useTrackedPhone()
  const text = format ? format(tracked.display) : tracked.display
  return (
    <span
      data-tracked-phone-source={tracked.source}
      data-tracked-phone={tracked.display}
      className={className}
      {...rest}
    >
      {text}
    </span>
  )
}

/* ─── <TrackedPhoneLink /> ───────────────────────────────────────────────
   Anchor with a tracked tel: href + tracked display text. Drop-in for
   `<a href={SITE.phoneHref}>...</a>` and `<ButtonLink href={SITE.phoneHref}>`
   patterns. Children control the visible label — pass nothing to render
   the tracked number alone, or pass a label like "Call " and the number
   appends automatically. */

type LinkProps = Omit<ComponentProps<'a'>, 'href' | 'onClick'> & {
  /** Surface name for analytics (e.g. "header_topbar", "homepage_hero"). */
  surface: string
  /** Render mode. 'auto' (default) appends the number after `children` if
   *  children are provided; 'children-only' renders only children (number
   *  is invisible — useful when the parent already shows it via TrackedPhoneNumber). */
  mode?: 'auto' | 'children-only'
  /** Children act as the prefix label. Pass "Call " to get "Call 254-555-…". */
  children?: ReactNode
}

export function TrackedPhoneLink({
  surface,
  mode = 'auto',
  children,
  className,
  ...rest
}: LinkProps) {
  const tracked = useTrackedPhone()
  return (
    <a
      href={tracked.href}
      data-tracked-phone-source={tracked.source}
      data-tracked-phone={tracked.display}
      onClick={() => logCallClick(tracked, surface)}
      className={className}
      {...rest}
    >
      {children}
      {mode === 'auto' && (
        <span className="tabular-nums">{tracked.display}</span>
      )}
    </a>
  )
}
