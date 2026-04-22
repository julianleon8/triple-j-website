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

  return NextResponse.json({ success: true })
}
