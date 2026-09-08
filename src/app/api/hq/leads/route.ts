import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireOwner } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase/admin'
import { normalizeTenDigits } from '@/lib/hq/capture-draft'

export const dynamic = 'force-dynamic'

/**
 * POST /api/hq/leads — create a lead from a phone number alone.
 *
 * This exists rather than loosening POST /api/leads, which is the PUBLIC
 * marketing endpoint: hCaptcha, 5 requests per IP per hour, and it triggers the
 * owner alert email. Relaxing its required fields so capture could reuse it
 * would open a nameless-lead spam hole straight into the CRM.
 *
 * Modelled on /api/hq/voice-lead instead — the other owner-authored ingest
 * path. Owner-gated, no captcha, no rate limit, and deliberately NO
 * notifyNewLead: the owner is the author, and alerting them about a lead they
 * are looking at is noise.
 *
 * name and service_type are written as explicit NULLs. That is what makes the
 * row a draft (migration 033's generated is_draft), and it is why 033 also had
 * to drop the 'carport' default on service_type — an omitted column would
 * otherwise arrive as a real value and the row would never read as a draft.
 */
const schema = z.object({
  phone: z.string().min(10).max(20),
})

export async function POST(request: NextRequest) {
  const denied = await requireOwner()
  if (denied) return denied

  const body = await request.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  // Reject a number that cannot be a US phone before it becomes a row the
  // duplicate lookup can never match.
  if (!normalizeTenDigits(parsed.data.phone)) {
    return NextResponse.json({ error: 'Not a valid US phone number' }, { status: 400 })
  }

  const { data, error } = await getAdminClient()
    .from('leads')
    .insert({
      phone:        parsed.data.phone.trim(),
      name:         null,
      service_type: null,
      status:       'new',
      // Already in the validated leads_source_check allowlist (migration 029).
      // Do not add a new value for capture — is_draft is the discriminator.
      source:       'phone',
    })
    .select('id, is_draft')
    .single()

  if (error || !data) {
    console.error('[POST /api/hq/leads] insert failed', { code: error?.code, message: error?.message })
    return NextResponse.json({ error: 'Could not create lead', code: error?.code }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
