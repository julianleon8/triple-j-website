/**
 * Web Push helper — server-side only.
 *
 * Sends VAPID-signed push notifications to all subscriptions currently
 * stored in public.push_subscriptions. Prunes subscriptions whose endpoint
 * returns 404/410 (the client unsubscribed or the token rotated).
 *
 * Consumers:
 *   - POST /api/leads           → "New lead" / "⚡ HOT lead"
 *   - POST /api/quotes/:id/accept → "💰 Quote accepted"
 *   - GET  /api/cron/scrape-permits → "HOT permit" for wheelhouse_score ≥ 8
 */

import webpush from 'web-push'
import { getAdminClient } from '@/lib/supabase/admin'

let vapidConfigured = false

function ensureVapid(): boolean {
  if (vapidConfigured) return true
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:julianleon@triplejmetaltx.com'

  if (!publicKey || !privateKey) return false

  webpush.setVapidDetails(subject, publicKey, privateKey)
  vapidConfigured = true
  return true
}

export type PushPayload = {
  title: string
  body: string
  /** Path to navigate to on notification click. Defaults to /hq. */
  url?: string
  /** Notification tag — later pushes with the same tag replace earlier ones. */
  tag?: string
  /** Optional icon override (defaults to /icon-192.png in the SW). */
  icon?: string
}

type StoredSubscription = {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

/**
 * Sends a push to every stored subscription. Best-effort — per-endpoint
 * failures are logged but don't throw. Expired endpoints (404/410) are
 * deleted so we stop trying to hit them.
 *
 * If VAPID env vars are missing, this is a no-op + warn (so trigger routes
 * don't crash before the keys are set in Vercel).
 */
export async function sendPush(payload: PushPayload): Promise<{ sent: number; pruned: number }> {
  if (!ensureVapid()) {
    console.warn('[push] VAPID keys not configured; skipping push')
    return { sent: 0, pruned: 0 }
  }

  const db = getAdminClient()
  const { data: subs, error } = await db
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')

  if (error) {
    console.error('[push] failed to load subscriptions:', error)
    return { sent: 0, pruned: 0 }
  }
  if (!subs || subs.length === 0) return { sent: 0, pruned: 0 }

  const body = JSON.stringify(payload)
  const expiredIds: string[] = []
  let sent = 0

  await Promise.all(
    (subs as StoredSubscription[]).map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body,
        )
        sent++
      } catch (err: unknown) {
        const code = (err as { statusCode?: number })?.statusCode
        if (code === 404 || code === 410) {
          expiredIds.push(sub.id)
        } else {
          console.error('[push] send failed', code, err)
        }
      }
    }),
  )

  if (expiredIds.length > 0) {
    await db.from('push_subscriptions').delete().in('id', expiredIds)
  }

  return { sent, pruned: expiredIds.length }
}

/** Fire-and-forget wrapper for trigger routes that shouldn't block on push. */
export function sendPushBackground(payload: PushPayload): void {
  sendPush(payload).catch((err) => console.error('[push] background send failed:', err))
}
