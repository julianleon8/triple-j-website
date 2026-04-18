import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { pushQuoteToQBO } from '@/lib/qbo'

export const dynamic = 'force-dynamic'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { quoteId } = await params
  const result = await pushQuoteToQBO(quoteId)

  if (!result.success) {
    return NextResponse.json({ error: result.error ?? 'QBO push failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true, invoiceId: result.invoiceId })
}
