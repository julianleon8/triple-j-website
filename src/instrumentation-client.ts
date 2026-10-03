/**
 * Client bootstrap for product analytics. Next.js runs this once, before
 * hydration, on every page load (see node_modules/next/dist/docs, file
 * convention `instrumentation-client`). It must stay light: posthog-js itself
 * is loaded later, after the page's `load` event, by loadPostHog().
 *
 * Also owns the one delegated click listener that turns quote, phone, text,
 * email and directions links into named events, wherever they render.
 */

import {
  LINK_EVENT,
  capture,
  classifyLink,
  isOwnerPath,
  isTrackedPath,
  loadPostHog,
  markInternal,
  pauseReplay,
} from '@/lib/analytics'

/** Where on the page a link sits. An explicit data-cta-location wins (the
 *  TrackedPhone surfaces and the mobile call bar set one); otherwise the
 *  landmark or section around it. */
function ctaLocation(el: Element): string {
  const tagged = el.closest('[data-cta-location]')?.getAttribute('data-cta-location')
  if (tagged) return tagged
  if (el.closest('header')) return 'header'
  if (el.closest('footer')) return 'footer'
  const section = el.closest('section[id]')
  return section ? section.id : 'page'
}

function onClick(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Element)) return
  const link = target.closest('a[href]')
  if (!link) return
  const kind = classifyLink(link.getAttribute('href') ?? '', window.location.origin)
  if (!kind) return
  capture(LINK_EVENT[kind], {
    // innerText, not textContent: stacked spans ("Call Now" over "English ·
    // Español") read as separate words instead of running together.
    cta_text: ((link as HTMLElement).innerText ?? link.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 80),
    cta_location: ctaLocation(link),
    cta_href: kind === 'quote' ? link.getAttribute('href') : undefined,
  })
}

function start() {
  void loadPostHog()
}

try {
  const params = new URLSearchParams(window.location.search)
  if (params.get('tj_internal') === '1') markInternal(true)
  if (params.get('tj_internal') === '0') markInternal(false)
  if (isOwnerPath(window.location.pathname)) markInternal(true)

  if (process.env.NEXT_PUBLIC_POSTHOG_KEY && isTrackedPath(window.location.pathname)) {
    document.addEventListener('click', onClick, { capture: true })
    const idle = (fn: () => void) =>
      'requestIdleCallback' in window ? window.requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 1)
    if (document.readyState === 'complete') idle(start)
    else window.addEventListener('load', () => idle(start), { once: true })
  }
} catch {
  // Analytics must never break the page.
}

export function onRouterTransitionStart(url: string) {
  try {
    const { pathname } = new URL(url, window.location.origin)
    if (isTrackedPath(pathname)) return
    pauseReplay()
    if (isOwnerPath(pathname)) markInternal(true)
  } catch {
    // Analytics must never break navigation.
  }
}
