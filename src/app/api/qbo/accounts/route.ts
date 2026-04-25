import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listExpenseAccounts } from '@/lib/qbo'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/**
 * GET /api/qbo/accounts
 *
 * Returns the connected QBO company's chart of accounts filtered to
 * Expense / Cost of Goods Sold / Other Expense families. Used by the
 * Phase 4.2 settings page to let Julian pick the single account every
 * receipt-OCR push books to.
 *
 * Owner-auth only. Returns 503 if QBO isn't connected.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const accounts = await listExpenseAccounts()
    return NextResponse.json({ accounts })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (/not connected/i.test(msg)) {
      return NextResponse.json(
        { error: 'QuickBooks is not connected.', accounts: [] },
        { status: 503 },
      )
    }
    console.error('qbo/accounts: list failed', err)
    return NextResponse.json(
      { error: 'Failed to load QBO accounts.', accounts: [] },
      { status: 502 },
    )
  }
}
