import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const LOST_REASONS = [
  'price',
  'timeline',
  'went_with_competitor',
  'changed_mind',
  'unreachable',
  'no_budget',
  'out_of_area',
  'other',
] as const

const INTENT_STAGES = [
  'info_gathering',
  'timeline_known',
  'budget_set',
  'ready_to_buy',
] as const

const schema = z.object({
  status:                z.enum(['new', 'contacted', 'quoted', 'won', 'lost']).optional(),
  lost_reason:           z.enum(LOST_REASONS).nullable().optional(),
  lost_reason_notes:     z.string().max(2000).nullable().optional(),
  referring_customer_id: z.string().uuid().nullable().optional(),
  intent_stage:          z.enum(INTENT_STAGES).nullable().optional(),
  estimated_budget_min:  z.number().nullable().optional(),
  estimated_budget_max:  z.number().nullable().optional(),
  owner_notes:           z.string().max(5000).nullable().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  // Build update with only provided keys. The migration 015 trigger
  // auto-stamps won_at / lost_at / first_response_at on status change,
  // so we don't set those here.
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== undefined) update[k] = v
  }

  const { data, error } = await getAdminClient()
    .from('leads')
    .update(update)
    .eq('id', id)
    .select('id, status')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { error } = await getAdminClient()
    .from('leads')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
