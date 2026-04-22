import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendPushBackground } from '@/lib/push'

export const dynamic = 'force-dynamic'

/**
 * POST /api/test/lead
 * Auth-gated. Creates a marker lead that exercises the full ingest flow
 * (DB insert + push notification). Timeline defaults to 'asap' so the
 * HOT-lead push path fires.
 *
 * Returns { ok, id, name } — the caller can delete via
 * DELETE /api/leads/:id once they've verified the push arrived.
 */
export async function POST(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const stamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const name = `TEST · ${stamp}`

  const { data: lead, error } = await getAdminClient()
    .from('leads')
    .insert({
      name,
      phone: '555-000-0000',
      email: null,
      city: 'Temple',
      zip: '76502',
      service_type: 'carport',
      structure_type: 'welded',
      needs_concrete: 'yes',
      timeline: 'asap',
      is_military: false,
      message: 'Created from /hq/settings/testing — safe to delete.',
      source: 'hq_test',
    })
    .select('id, name, created_at')
    .single()

  if (error || !lead) {
    console.error('[test/lead] insert failed:', error)
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
  }

  sendPushBackground({
    title: `⚡ HOT lead: ${lead.name}`,
    body: 'Temple · carport — (test)',
    url: '/hq',
    tag: `lead-${lead.id}`,
  })

  return NextResponse.json({ ok: true, id: lead.id, name: lead.name })
}
