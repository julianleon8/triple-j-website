import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendPush } from '@/lib/push'

export const dynamic = 'force-dynamic'

/**
 * POST /api/push/test
 * Fires a sample push to every stored subscription. Auth'd so only logged-in
 * HQ users can trigger it. Response reports sent / pruned counts so you can
 * tell whether your device was reached.
 */
export async function POST(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hasVapid = Boolean(process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
  if (!hasVapid) {
    return NextResponse.json(
      { error: 'VAPID keys not configured on this deployment', vapid: false },
      { status: 500 },
    )
  }

  const { sent, pruned } = await sendPush({
    title: '✅ Test push',
    body: 'Triple J HQ can reach your phone. You\'ll get real alerts for hot leads next.',
    url: '/hq',
    tag: 'test-push',
  })

  return NextResponse.json({ ok: true, sent, pruned, vapid: true })
}
