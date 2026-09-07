import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '@/lib/auth'
import { pushQuoteToQBO } from '@/lib/qbo'

export const dynamic = 'force-dynamic'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const denied = await requireOwner()
  if (denied) return denied

  const { quoteId } = await params
  const result = await pushQuoteToQBO(quoteId)

  if (!result.success) {
    return NextResponse.json({ error: result.error ?? 'QBO push failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true, invoiceId: result.invoiceId })
}
