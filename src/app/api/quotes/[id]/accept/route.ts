import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { pushQuoteToQBO } from '@/lib/qbo'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const token = id
  const body = await request.json().catch(() => ({}))
  const action: 'accepted' | 'declined' = body.action === 'decline' ? 'declined' : 'accepted'
  const db = getAdminClient()

  const { data: quote, error } = await db
    .from('quotes')
    .update({
      status: action,
      updated_at: new Date().toISOString(),
      ...(action === 'accepted'
        ? { accepted_at: new Date().toISOString() }
        : { declined_at: new Date().toISOString() }),
    })
    .eq('accept_token', token)
    .eq('status', 'sent')
    .select('id, quote_number, customer_id')
    .single()

  if (error || !quote) {
    return NextResponse.json(
      { error: 'Quote not found or already processed' },
      { status: 404 }
    )
  }

  // Auto-create job record on acceptance
  if (action === 'accepted') {
    await db.from('jobs').insert({
      customer_id: quote.customer_id,
      quote_id: quote.id,
      job_number: `JJM-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
      status: 'scheduled',
    })

    // Push to QuickBooks — fire and forget; don't block the acceptance response
    pushQuoteToQBO(quote.id).catch((err) =>
      console.error('[QBO] auto-push on acceptance failed:', err)
    )
  }

  return NextResponse.json({ success: true, action, quote_number: quote.quote_number })
}
