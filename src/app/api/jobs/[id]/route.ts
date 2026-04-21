import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const schema = z.object({
  status: z.enum(['scheduled', 'in_progress', 'completed', 'on_hold', 'cancelled']),
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

  const db = getAdminClient()

  const { data: prev } = await db
    .from('jobs')
    .select('id, status')
    .eq('id', id)
    .single()

  const { data, error } = await db
    .from('jobs')
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, status, customer_id, customers(name, phone)')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  // When a job flips to 'completed', schedule a review-request SMS for 24h out.
  // Customer must have a phone; otherwise silently skip.
  const justCompleted =
    parsed.data.status === 'completed' && prev?.status !== 'completed'
  const customerRaw = data.customers as
    | { name: string; phone: string | null }
    | { name: string; phone: string | null }[]
    | null
  const customer = Array.isArray(customerRaw) ? customerRaw[0] ?? null : customerRaw

  if (justCompleted && customer?.phone) {
    const sendAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    await db.from('scheduled_sms').insert({
      send_at: sendAt,
      template: 'review_request',
      variables: { customerName: customer.name },
      to_phone: customer.phone,
      customer_id: data.customer_id,
      job_id: data.id,
      status: 'pending',
    })
  }

  return NextResponse.json({ id: data.id, status: data.status })
}
