import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendSms, isTwilioConfigured, toE164 } from '@/lib/twilio'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/quotes/[id]/send-sms
 *
 * Mirrors POST /api/quotes/[id]/send (email) but ships an SMS to the
 * customer's phone with a quote summary + accept-token deep link.
 *
 * Twilio is unprovisioned at write time — endpoint returns 503 with a
 * setup hint. Once env vars land (TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN
 * + TWILIO_FROM_NUMBER), the same endpoint starts shipping SMS without
 * code changes. See docs/QUOTE-CALCULATOR.md.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isTwilioConfigured()) {
    return NextResponse.json(
      {
        error:
          'Twilio is not configured. Set TWILIO_ACCOUNT_SID + ' +
          'TWILIO_AUTH_TOKEN + TWILIO_FROM_NUMBER in Vercel env. ' +
          'See docs/QUOTE-CALCULATOR.md.',
      },
      { status: 503 },
    )
  }

  const { id } = await params
  const db = getAdminClient()

  const { data: quote, error } = await db
    .from('quotes')
    .select('id, quote_number, accept_token, total, status, customers(name, phone)')
    .eq('id', id)
    .single<{
      id: string
      quote_number: string
      accept_token: string
      total: number | string
      status: string
      customers: { name: string; phone: string | null } | null
    }>()

  if (error || !quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  if (!quote.customers?.phone) {
    return NextResponse.json({ error: 'Customer has no phone on file' }, { status: 400 })
  }

  const e164 = toE164(quote.customers.phone)
  if (!e164) {
    return NextResponse.json(
      { error: `Customer phone "${quote.customers.phone}" is not a valid US number` },
      { status: 400 },
    )
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.triplejmetaltx.com'
  const acceptUrl = `${siteUrl}/quotes/${quote.accept_token}`
  const total = Number(quote.total)
  const totalStr = total.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

  const body =
    `Triple J Metal — Quote ${quote.quote_number} for ${quote.customers.name}: ${totalStr}. ` +
    `Review + accept: ${acceptUrl}. Reply STOP to opt out.`

  const result = await sendSms({ to: e164, body })

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, reason: result.reason },
      { status: result.reason === 'not_configured' ? 503 : 502 },
    )
  }

  // Bump status to 'sent' if still draft. Mirrors the email-send route.
  if (quote.status === 'draft') {
    await db.from('quotes').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', id)
  }

  return NextResponse.json({ ok: true, sid: result.sid, sent_to: e164 })
}
