import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth:   z.string().min(1),
  }),
})

/**
 * POST /api/push/subscribe
 * Body: PushSubscription.toJSON() output { endpoint, keys: { p256dh, auth } }
 *
 * Upserts the subscription by endpoint (a device re-subscribing after token
 * rotation replaces the old row, keeping one row per device).
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid subscription', issues: parsed.error.issues }, { status: 400 })
  }

  const userAgent = request.headers.get('user-agent')

  const { error } = await getAdminClient()
    .from('push_subscriptions')
    .upsert(
      {
        user_id: user.id,
        endpoint: parsed.data.endpoint,
        p256dh: parsed.data.keys.p256dh,
        auth: parsed.data.keys.auth,
        user_agent: userAgent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' },
    )

  if (error) {
    console.error('[push/subscribe] upsert failed:', error)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }

  // Sweep stale endpoints from the same browser. iOS Safari rotates the push
  // endpoint URL periodically (PWA reinstall, iOS update, occasional Apple-
  // initiated refresh); the upsert above creates a new row each time, leaving
  // the old endpoint dead. sendPush prunes 410s lazily, but if no push has
  // been sent recently the dead rows linger in the dashboard. We proactively
  // delete prior rows from the same user+UA — only if their updated_at is
  // older than 6h, so two distinct active iPhones with identical UAs (same
  // iOS version) don't kick each other out (they each phone home on PWA open
  // well within that window).
  if (userAgent) {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    const { error: pruneErr } = await getAdminClient()
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('user_agent', userAgent)
      .neq('endpoint', parsed.data.endpoint)
      .lt('updated_at', sixHoursAgo)
    if (pruneErr) {
      // Non-fatal — the new subscription is already saved.
      console.error('[push/subscribe] dedupe prune failed:', pruneErr)
    }
  }

  return NextResponse.json({ success: true })
}
