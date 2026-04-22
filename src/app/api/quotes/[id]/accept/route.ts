import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { pushQuoteToQBO } from '@/lib/qbo'
import { Resend } from 'resend'
import QuoteAcceptedOwnerAlert, { quoteAcceptedOwnerAlertText } from '@/emails/QuoteAcceptedOwnerAlert'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const token = id
  const body = await request.json().catch(() => ({}))
  const action: 'accepted' | 'declined' = body.action === 'decline' ? 'declined' : 'accepted'
  const db = getAdminClient()
  const now = new Date().toISOString()

  const { data: quote, error } = await db
    .from('quotes')
    .update({
      status: action,
      updated_at: now,
      ...(action === 'accepted'
        ? { accepted_at: now }
        : { declined_at: now }),
    })
    .eq('accept_token', token)
    .eq('status', 'sent')
    .select('id, quote_number, customer_id, total, customers(name, phone, email)')
    .single()

  if (error || !quote) {
    return NextResponse.json(
      { error: 'Quote not found or already processed' },
      { status: 404 }
    )
  }

  // Auto-create job record on acceptance
  let jobNumber: string | null = null
  if (action === 'accepted') {
    jobNumber = `JJM-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
    await db.from('jobs').insert({
      customer_id: quote.customer_id,
      quote_id: quote.id,
      job_number: jobNumber,
      status: 'scheduled',
    })

    // Push to QuickBooks — fire and forget; don't block the acceptance response
    pushQuoteToQBO(quote.id).catch((err) =>
      console.error('[QBO] auto-push on acceptance failed:', err)
    )
  }

  // Owner alert — fire-and-forget so response isn't blocked on Resend
  const customer = Array.isArray(quote.customers) ? quote.customers[0] : quote.customers
  const alertProps = {
    quoteNumber: quote.quote_number,
    customerName: customer?.name ?? 'Unknown',
    customerPhone: customer?.phone ?? null,
    customerEmail: customer?.email ?? null,
    total: Number(quote.total ?? 0),
    action,
    acceptedAt: new Date(now).toLocaleString('en-US', { timeZone: 'America/Chicago' }) + ' CST',
    jobNumber,
  }
  if (process.env.OWNER_EMAIL) {
    resend.emails.send({
      from: 'Triple J Metal <quotes@triplejmetaltx.com>',
      to: process.env.OWNER_EMAIL.split(','),
      subject: action === 'accepted'
        ? `💰 ACCEPTED: ${quote.quote_number} — ${customer?.name ?? ''}`
        : `❌ Declined: ${quote.quote_number} — ${customer?.name ?? ''}`,
      react: QuoteAcceptedOwnerAlert(alertProps),
      text: quoteAcceptedOwnerAlertText(alertProps),
      tags: [
        { name: 'quote_id', value: quote.id },
        { name: 'email_type', value: action === 'accepted' ? 'quote_accepted_alert' : 'quote_declined_alert' },
      ],
    }).catch((err) => console.error('[Resend] quote-accept owner alert failed:', err))
  }

  return NextResponse.json({ success: true, action, quote_number: quote.quote_number })
}
