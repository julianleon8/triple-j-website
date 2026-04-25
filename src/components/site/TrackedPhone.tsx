'use client'

import { useEffect, useSyncExternalStore, type ComponentProps, type ReactNode } from 'react'
import { track } from '@vercel/analytics'

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

/** Click handler that fires the analytics event. Used by both link
 *  components below + exported so existing custom anchors can adopt it. */
function logCallClick(tracked: TrackingResult, surface: string) {
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

/* ─── <TrackedPhoneButtonLink /> ─────────────────────────────────────────
   Button-styled tel: link. Mirrors the look of <ButtonLink href=...>Call X</ButtonLink>
   from src/components/ui/Button.tsx but uses a plain <a> (Next.js Link
   shouldn't be used for tel: hrefs). */

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline-dark'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-semibold tracking-tight ' +
  'transition-all duration-200 rounded-md whitespace-nowrap ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed'

const variants: Record<Variant, string> = {
  primary:
    'bg-[color:var(--color-brand-600)] text-white ' +
    'hover:bg-[color:var(--color-brand-700)] ' +
    'shadow-sm hover:shadow-md ' +
    'focus-visible:ring-[color:var(--color-brand-600)]',
  secondary:
    'bg-white text-[color:var(--color-ink-900)] ' +
    'border border-[color:var(--color-ink-200)] ' +
    'hover:bg-[color:var(--color-ink-50)] ' +
    'focus-visible:ring-[color:var(--color-ink-400)]',
  ghost:
    'bg-transparent text-[color:var(--color-ink-900)] ' +
    'hover:bg-[color:var(--color-ink-50)] ' +
    'focus-visible:ring-[color:var(--color-ink-400)]',
  'outline-dark':
    'bg-transparent text-white border border-white/30 ' +
    'hover:bg-white/10 hover:border-white/60 ' +
    'focus-visible:ring-white/70',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-13 px-7 text-base',
}

type ButtonLinkProps = {
  surface: string
  variant?: Variant
  size?: Size
  /** Optional prefix label rendered before the number. Default "Call ". */
  label?: ReactNode
  className?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
}

export function TrackedPhoneButtonLink({
  surface,
  variant = 'primary',
  size = 'md',
  label = 'Call ',
  className = '',
  icon,
  iconPosition = 'left',
}: ButtonLinkProps) {
  const tracked = useTrackedPhone()
  return (
    <a
      href={tracked.href}
      onClick={() => logCallClick(tracked, surface)}
      data-tracked-phone-source={tracked.source}
      data-tracked-phone={tracked.display}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon && iconPosition === 'left' ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
      <span>
        {label}
        <span className="tabular-nums">{tracked.display}</span>
      </span>
      {icon && iconPosition === 'right' ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
    </a>
  )
}
