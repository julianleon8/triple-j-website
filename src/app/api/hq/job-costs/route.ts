import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const COST_TYPES = [
  'material',
  'concrete_sub',
  'labor',
  'fuel',
  'permit',
  'equipment',
  'misc',
] as const

const bodySchema = z.object({
  job_id:    z.string().uuid(),
  cost_type: z.enum(COST_TYPES),
  amount:    z.number().positive(),
  notes:     z.string().max(2000).optional(),
})

/**
 * POST /api/hq/job-costs
 *
 * Manual cost entry against a job. Inserts into job_costs with
 * source_table='manual' so the migration 017 trigger refreshes the
 * cached gross_profit / gross_margin on the parent job. Use this for
 * cash spend that didn't generate a receipt (e.g. paying a sub-trade
 * in cash, fuel without a receipt, etc.).
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { data, error } = await getAdminClient()
    .from('job_costs')
    .insert({
      job_id:       parsed.data.job_id,
      cost_type:    parsed.data.cost_type,
      amount:       parsed.data.amount,
      source_table: 'manual',
      source_id:    null,
      notes:        parsed.data.notes ?? null,
    })
    .select('id')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to create cost' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id })
}

const idSchema = z.object({ id: z.string().uuid() })

/**
 * DELETE /api/hq/job-costs?id=<uuid>
 *
 * Removes a manual cost row. The trigger on job_costs delete refreshes
 * the cached margin. Receipt-rooted and time-entry-rooted rows should
 * be deleted via their upstream tables instead so the source-of-truth
 * stays consistent — but this endpoint accepts any row by id.
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const parsed = idSchema.safeParse({ id: url.searchParams.get('id') ?? '' })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const { error } = await getAdminClient()
    .from('job_costs')
    .delete()
    .eq('id', parsed.data.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
