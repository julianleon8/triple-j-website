import { NextResponse } from 'next/server'

import { alertPush } from '@/lib/jobs/posthog-alert'
import { notifyOwner } from '@/lib/notify'
import { getAlert, POSTHOG_APP_HOST, POSTHOG_PROJECT_ID } from '@/lib/posthog-server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const ALERT_ID = /^[0-9a-f-]{32,36}$/i

/**
 * POST /api/webhooks/posthog — PostHog insight alerts, delivered to HQ as a
 * push instead of an email.
 *
 * Called by the "HQ push" destination on each alert in the Website project
 * with `{ "alert_id": "<id>" }`. The body is only a pointer: the alert is
 * re-read from the PostHog API with POSTHOG_PERSONAL_API_KEY, and
 * alertPush() pushes only when PostHog says it is firing right now. No shared
 * secret to keep in sync between PostHog and Vercel.
 */
export async function POST(request: Request) {
  const rl = checkRateLimit(getClientIp(request), 'posthog-webhook', 20, 10 * 60 * 1000)
  if (!rl.allowed) return NextResponse.json({ error: 'rate limited' }, { status: 429 })

  const body = (await request.json().catch(() => null)) as { alert_id?: unknown } | null
  const alertId = typeof body?.alert_id === 'string' ? body.alert_id : ''
  if (!ALERT_ID.test(alertId)) return NextResponse.json({ error: 'alert_id required' }, { status: 400 })

  let alert
  try {
    alert = await getAlert(alertId)
  } catch (err) {
    // A wrong id is a 404 from PostHog; report it without echoing details.
    console.warn('[posthog-webhook] alert lookup failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'alert not found' }, { status: 404 })
  }
  if (!alert) {
    return NextResponse.json({ error: 'POSTHOG_PERSONAL_API_KEY is not set' }, { status: 503 })
  }

  const push = alertPush(alert, new Date(), `${POSTHOG_APP_HOST}/project/${POSTHOG_PROJECT_ID}`)
  if (!push) return NextResponse.json({ pushed: 0, reason: 'alert not firing or not fresh' }, { status: 202 })

  // Push only: PostHog already emails the alert's subscriber.
  const sent = await notifyOwner({ push })
  return NextResponse.json({ pushed: sent.pushed, errors: sent.errors })
}
