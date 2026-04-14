import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const body = await request.json().catch(() => ({}))
  const action: 'accepted' | 'declined' = body.action === 'decline' ? 'declined' : 'accepted'

  const { data: quote, error } = await adminClient
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
    await adminClient.from('jobs').insert({
      customer_id: quote.customer_id,
      quote_id: quote.id,
      job_number: `JJM-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
      status: 'scheduled',
    })
  }

  return NextResponse.json({ success: true, action, quote_number: quote.quote_number })
}
