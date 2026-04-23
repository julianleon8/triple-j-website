import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendPush, getVapidError } from '@/lib/push'

export const dynamic = 'force-dynamic'

/**
 * POST /api/push/test
 * Fires a sample push to every stored subscription. Auth'd so only logged-in
 * HQ users can trigger it. Response reports sent / pruned counts so you can
 * tell whether your device was reached. Always returns JSON (no unhandled
 * crashes — the UI on /hq/settings/testing parses the body and shows the
 * `error` field directly).
 */
export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY
    if (!publicKey || !privateKey) {
      return NextResponse.json(
        {
          error: `VAPID env missing: ${!publicKey ? 'NEXT_PUBLIC_VAPID_PUBLIC_KEY ' : ''}${!privateKey ? 'VAPID_PRIVATE_KEY' : ''}`.trim(),
          vapid: false,
        },
        { status: 500 },
      )
    }

    const result = await sendPush({
      title: '✅ Test push',
      body: 'Triple J HQ can reach your phone. You\'ll get real alerts for hot leads next.',
      url: '/hq',
      tag: 'test-push',
    })

    // sendPush returns {sent: 0} both for "no subs" AND "vapid invalid" — in the
    // latter case getVapidError() is populated.
    const vapidErr = getVapidError()
    if (vapidErr) {
      return NextResponse.json(
        {
          error: `VAPID configured but invalid: ${vapidErr}. Likely cause: keys malformed (wrong length, whitespace, accidentally swapped public/private, or pasted with quotes). Regenerate with \`npx web-push generate-vapid-keys\` and re-add to Vercel.`,
          vapid: false,
          publicKeyLength: publicKey.length,
          privateKeyLength: privateKey.length,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true, sent: result.sent, pruned: result.pruned, vapid: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[/api/push/test] unhandled:', err)
    return NextResponse.json({ error: `Unhandled: ${message}` }, { status: 500 })
  }
}
