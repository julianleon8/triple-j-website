import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase/admin'
import { getResend } from '@/lib/resend'
import QuoteEmail, { quoteEmailText } from '@/emails/QuoteEmail'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireOwner()
  if (denied) return denied

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY is not configured' }, { status: 500 })
  }

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://triplejmetaltx.com'
  const acceptUrl = `${siteUrl}/quotes/${quote.accept_token}`

  const emailProps = {
    customerName: quote.customers.name,
    quoteNumber: quote.quote_number,
    lineItems: quote.quote_line_items.map((li: { description: string; quantity: number | string; unit_price: number | string; total_price: number | string }) => ({
      description: li.description,
      quantity: Number(li.quantity),
      unit_price: Number(li.unit_price),
      total_price: Number(li.total_price),
    })),
    subtotal: Number(quote.subtotal),
    taxAmount: Number(quote.tax_amount),
    total: Number(quote.total),
    validUntil: quote.valid_until,
    notes: quote.notes ?? undefined,
    acceptUrl,
  }

  try {
    const { data: sendData, error: sendError } = await getResend().emails.send({
      from: 'Triple J Metal <quotes@triplejmetaltx.com>',
      replyTo: 'julianleon@triplejmetaltx.com',
      to: quote.customers.email,
      subject: `Your Quote ${quote.quote_number} from Triple J Metal`,
      react: QuoteEmail(emailProps),
      text: quoteEmailText(emailProps),
      tags: [
        { name: 'quote_id', value: id },
        { name: 'email_type', value: 'quote_sent' },
      ],
    })

    if (sendError) {
      console.error('[quotes/send] Resend error:', sendError)
      return NextResponse.json(
        { error: `Email send failed: ${sendError.message ?? 'unknown error'}` },
        { status: 502 },
      )
    }

    const sentAt = new Date().toISOString()
    const { error: updateError } = await db
      .from('quotes')
      .update({ status: 'sent', sent_at: sentAt, updated_at: sentAt })
      .eq('id', id)

    if (updateError) {
      console.error('[quotes/send] DB update error after send:', updateError)
      return NextResponse.json(
        { error: 'Email sent but quote status update failed', resend_id: sendData?.id },
        { status: 500 },
      )
    }

    return NextResponse.json({ sent_at: sentAt, resend_id: sendData?.id })
  } catch (e) {
    console.error('[quotes/send] unexpected error:', e)
    const message = e instanceof Error ? e.message : 'Unexpected send error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

