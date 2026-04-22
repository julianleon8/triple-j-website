import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const schema = z.object({
  endpoint: z.string().url(),
})

/**
 * POST /api/push/unsubscribe
 * Body: { endpoint: string }
 *
 * Removes the stored subscription for this endpoint. Called by PushOptIn
 * when the user turns off notifications in the app.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { error } = await getAdminClient()
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', parsed.data.endpoint)

  if (error) {
    console.error('[push/unsubscribe] delete failed:', error)
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
