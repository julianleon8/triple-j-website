import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// XOR check: either flat_amount is set OR (hourly_rate AND hours > 0)
// must be true. The DB has a generated total_cost column that picks
// whichever is non-null, but we prefer to validate at the API layer
// so the user gets a 400 instead of an inserted row with total=0.
const bodySchema = z.object({
  job_id:      z.string().uuid(),
  crew_member: z.string().trim().min(1).max(60),
  work_date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hours:       z.number().nonnegative(),
  hourly_rate: z.number().nonnegative().optional(),
  flat_amount: z.number().nonnegative().optional(),
  notes:       z.string().max(2000).optional(),
}).refine(
  (b) => (b.flat_amount != null && b.flat_amount > 0) ||
         (b.hourly_rate != null && b.hours > 0),
  { message: 'Either flat_amount or hourly_rate × hours must be > 0' },
)

/**
 * POST /api/hq/time-entries
 *
 * Adds a labor entry. Migration 018's trigger pushes the row into
 * job_costs as cost_type='labor' and refreshes the cached gross
 * margin on the job. Idempotency note: editing an existing entry
 * (PATCH) replaces the matching job_costs row via the same trigger.
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
    .from('time_entries')
    .insert({
      job_id:      parsed.data.job_id,
      crew_member: parsed.data.crew_member,
      work_date:   parsed.data.work_date,
      hours:       parsed.data.hours,
      hourly_rate: parsed.data.hourly_rate ?? null,
      flat_amount: parsed.data.flat_amount ?? null,
      notes:       parsed.data.notes ?? null,
    })
    .select('id, total_cost')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id, total_cost: data.total_cost })
}

const idSchema = z.object({ id: z.string().uuid() })

/**
 * DELETE /api/hq/time-entries?id=<uuid>
 *
 * Removes the entry. Trigger removes the matching job_costs row +
 * recomputes cached profit.
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
    .from('time_entries')
    .delete()
    .eq('id', parsed.data.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
