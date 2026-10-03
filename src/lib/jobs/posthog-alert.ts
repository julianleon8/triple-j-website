import type { PushPayload } from '@/lib/push'

/**
 * PostHog insight alert → HQ push.
 *
 * PostHog calls /api/webhooks/posthog when an alert starts firing. Nothing in
 * that request is trusted: the route re-reads the alert from the PostHog API
 * with our own key and hands it here. A push goes out only for an alert that
 * PostHog itself says is firing and notified about in the last few minutes,
 * so a forged or replayed request can at most repeat a real, fresh alert.
 */

/** How long after PostHog's own notification a webhook may still push. */
export const ALERT_FRESH_MS = 15 * 60 * 1000

const SHORT_ID = /^[A-Za-z0-9]{1,20}$/

type AlertSnapshot = {
  id: string
  name: string
  state: string
  last_value: number | null
  last_notified_at: string | null
  last_checked_at: string | null
  insight: { short_id: string; name: string | null } | null
}

export function alertPush(alert: AlertSnapshot, now: Date, projectUrl: string): PushPayload | null {
  if (alert.state !== 'Firing') return null

  const stamps = [alert.last_notified_at, alert.last_checked_at]
    .map((s) => (s ? Date.parse(s) : NaN))
    .filter((t) => Number.isFinite(t))
  const latest = stamps.length ? Math.max(...stamps) : NaN
  if (!Number.isFinite(latest) || now.getTime() - latest > ALERT_FRESH_MS) return null

  const chart = alert.insight?.name?.trim() || 'PostHog chart'
  const value = typeof alert.last_value === 'number' ? `: ${alert.last_value}` : ''
  const shortId = alert.insight?.short_id
  return {
    title: `⚠️ ${alert.name}`.slice(0, 80),
    body: `${chart}${value}. Tap to open the chart.`.slice(0, 160),
    url: shortId && SHORT_ID.test(shortId) ? `${projectUrl}/insights/${shortId}` : projectUrl,
    // One notification per alert: a re-fire replaces the old one on the lock screen.
    tag: `posthog-alert-${alert.id}`,
  }
}
