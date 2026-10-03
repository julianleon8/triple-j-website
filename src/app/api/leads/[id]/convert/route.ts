import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase/admin'
import { asPreferredLanguage, isMissingLanguageColumn, withoutLanguage } from '@/lib/preferred-language'

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
  const denied = await requireOwner()
  if (denied) return denied

  const { id } = await params
  const admin = getAdminClient()

  const { data: lead, error: leadErr } = await admin
    .from('leads')
    // '*', not a column list: preferred_language (034) may not exist yet, and
    // naming a missing column fails the whole read.
    .select('*')
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

  // The customer keeps the lead's language: it picks the quote email, SMS and PDF.
  const row = {
    lead_id: id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    city: lead.city,
    zip: lead.zip,
    preferred_language: asPreferredLanguage(lead.preferred_language),
  }
  let { data: customer, error: insErr } = await admin.from('customers').insert(row).select('id').single()
  if (isMissingLanguageColumn(insErr)) {
    console.error('[convert] preferred_language column missing — apply migration 034.')
    ;({ data: customer, error: insErr } = await admin.from('customers').insert(withoutLanguage(row)).select('id').single())
  }
  if (insErr || !customer) {
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }

  await admin
    .from('leads')
    .update({ status: 'won', updated_at: new Date().toISOString() })
    .eq('id', id)

  return NextResponse.json({ customer_id: customer.id, existed: false })
}
