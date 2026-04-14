import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import QuoteEmail from '@/emails/QuoteEmail'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = getAdminClient()

  const { data: quote, error } = await db
    .from('quotes')
    .select('*, customers(name, email), quote_line_items(*)')
    .eq('id', id)
    .single()

  if (error || !quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  if (quote.status !== 'draft') return NextResponse.json({ error: 'Quote already sent' }, { status: 409 })
  if (!quote.quote_line_items?.length) return NextResponse.json({ error: 'Quote has no line items' }, { status: 400 })
  if (!quote.customers?.email) return NextResponse.json({ error: 'Customer has no email address' }, { status: 400 })

  const acceptUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/quotes/${quote.accept_token}`

  await resend.emails.send({
    from: 'Triple J Metal LLC <quotes@triplejmetalllc.com>',
    to: quote.customers.email,
    subject: `Your Quote ${quote.quote_number} from Triple J Metal LLC`,
    react: QuoteEmail({
      customerName: quote.customers.name,
      quoteNumber: quote.quote_number,
      lineItems: quote.quote_line_items,
      subtotal: quote.subtotal,
      taxAmount: quote.tax_amount,
      total: quote.total,
      validUntil: quote.valid_until,
      notes: quote.notes ?? undefined,
      acceptUrl,
    }),
  })

  const sentAt = new Date().toISOString()
  await db
    .from('quotes')
    .update({ status: 'sent', sent_at: sentAt, updated_at: sentAt })
    .eq('id', id)

  return NextResponse.json({ sent_at: sentAt })
}
