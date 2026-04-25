import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  kind: z.enum(['feature', 'repeat']),
  value: z.boolean(),
})

/**
 * POST /api/customers/[id]/permission
 *
 * Toggles a flywheel permission flag (migration 019). On the first
 * change for a kind, also stamps the matching *_asked_at timestamp so
 * the flywheel report can compute "asked-rate" without confusing a
 * never-asked customer with one who was asked + said no.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const json = await request.json().catch(() => ({}))
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const admin = getAdminClient()

  // Read current state to know whether this is the first ask.
  const { data: existing } = await admin
    .from('customers')
    .select('feature_permission_asked_at, repeat_contact_asked_at')
    .eq('id', id)
    .maybeSingle()

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (parsed.data.kind === 'feature') {
    update.feature_permission = parsed.data.value
    if (!existing?.feature_permission_asked_at) {
      update.feature_permission_asked_at = new Date().toISOString()
    }
  } else {
    update.repeat_contact_permission = parsed.data.value
    if (!existing?.repeat_contact_asked_at) {
      update.repeat_contact_asked_at = new Date().toISOString()
    }
  }

  const { error } = await admin
    .from('customers')
    .update(update)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to update permission' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
