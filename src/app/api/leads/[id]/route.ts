import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireOwner } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase/admin'
import { cityFromZip } from '@/lib/locations'

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

  // Capture-screen fields (migration 033). The capture screen autosaves each
  // checklist row through this route, so contact and project details had to
  // become editable — before this, there was no way to change a lead's name or
  // phone through the API at all. Every one is nullable: a draft is a row where
  // these are still missing, and clearing a field back to null is a legitimate
  // edit rather than an error.
  name:                  z.string().max(100).nullable().optional(),
  phone:                 z.string().max(20).nullable().optional(),
  email:                 z.string().max(200).nullable().optional(),
  city:                  z.string().max(100).nullable().optional(),
  zip:                   z.string().max(10).nullable().optional(),
  service_type:          z.string().max(50).nullable().optional(),
  size_raw:              z.string().max(200).nullable().optional(),
  needs_concrete:        z.string().max(50).nullable().optional(),
  message:               z.string().max(2000).nullable().optional(),
  dup_ack:               z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireOwner()
  if (denied) return denied

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

  // leads.city is a city name or NULL, never a ZIP, and cityFromZip() is the
  // only thing allowed to populate it (locked 2026-09-07 — a ZIP in that column
  // is what migration 028 had to go back and clean up). The capture screen
  // sends one "City or ZIP" field, so whenever a zip arrives here the city is
  // DERIVED, never taken on trust. An unrecognised ZIP resolves to NULL and the
  // ZIP itself is still preserved in leads.zip.
  if (parsed.data.zip !== undefined) {
    update.city = parsed.data.zip ? cityFromZip(parsed.data.zip) : null
  }

  const { data, error } = await getAdminClient()
    .from('leads')
    .update(update)
    .eq('id', id)
    .select('id, status')
    .single()

  // PGRST116 is PostgREST's "no rows returned for .single()" — the only
  // condition that is genuinely a 404. Everything else (a CHECK violation, a
  // bad column, the database being down) used to be reported as "Lead not
  // found" too, which is actively dangerous now that capture autosaves through
  // this route: the operator would keep typing into a field that was silently
  // discarding every keystroke, on the one screen whose promise is that there
  // is nothing to lose. Surface those as 500 and log the code.
  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }
    console.error('[PATCH /api/leads/[id]] update failed', { id, code: error.code, message: error.message })
    return NextResponse.json({ error: 'Could not save', code: error.code }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireOwner()
  if (denied) return denied

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
