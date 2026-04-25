import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { pushQuoteToQBO } from '@/lib/qbo'
import { Resend } from 'resend'
import QuoteAcceptedOwnerAlert, { quoteAcceptedOwnerAlertText } from '@/emails/QuoteAcceptedOwnerAlert'
import { sendPushBackground } from '@/lib/push'

export const dynamic = 'force-dynamic'

let _resend: Resend | null = null
function resend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

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
      // Migration 016: stamp the day the customer signed off. Used as
      // the start of the deposit-to-install lag metric.
      contract_signed_date: now.slice(0, 10),
      total_contract: Number(quote.total ?? 0) || null,
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
    resend().emails.send({
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

  // Push notification to owner device(s)
  const totalUsd = Number(quote.total ?? 0)
  sendPushBackground({
    title: action === 'accepted'
      ? `💰 Quote accepted — ${customer?.name ?? ''}`
      : `❌ Quote declined — ${customer?.name ?? ''}`,
    body: `Quote ${quote.quote_number}${totalUsd > 0 ? ` · $${Math.round(totalUsd).toLocaleString()}` : ''}`,
    url: `/hq/quotes/${quote.id}`,
    tag: `quote-${quote.id}`,
  })

  return NextResponse.json({ success: true, action, quote_number: quote.quote_number })
}
