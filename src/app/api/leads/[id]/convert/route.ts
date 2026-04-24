import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * Convert a lead into a customer. Idempotent — if a customer already exists
 * for this lead (matching lead_id), returns its id instead of creating a dupe.
 * On success, also flips the lead's status to 'won'.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const admin = getAdminClient()

  const { data: lead, error: leadErr } = await admin
    .from('leads')
    .select('id, name, phone, email, city, zip')
    .eq('id', id)
    .single()
  if (leadErr || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  const { data: existing } = await admin
    .from('customers')
    .select('id')
    .eq('lead_id', id)
    .maybeSingle()

  if (existing) {
    await admin
      .from('leads')
      .update({ status: 'won', updated_at: new Date().toISOString() })
      .eq('id', id)
    return NextResponse.json({ customer_id: existing.id, existed: true })
  }

  const { data: customer, error: insErr } = await admin
    .from('customers')
    .insert({
      lead_id: id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      city: lead.city,
      zip: lead.zip,
    })
    .select('id')
    .single()
  if (insErr || !customer) {
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }

  await admin
    .from('leads')
    .update({ status: 'won', updated_at: new Date().toISOString() })
    .eq('id', id)

  return NextResponse.json({ customer_id: customer.id, existed: false })
}
