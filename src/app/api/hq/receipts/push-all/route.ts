import { NextResponse } from 'next/server'
import { requireOwner } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase/admin'
import { pushPendingReceipts } from '@/lib/jobs/receipt-push'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/hq/receipts/push-all
 *
 * Manual batch push for the /hq/settings/quickbooks "N receipts pending"
 * button. The work itself lives in src/lib/jobs/receipt-push.ts, shared with
 * the nightly cron at /api/cron/receipt-push so both paths get the same
 * duplicate protection.
 *
 * Returns: { attempted, succeeded, reconciled, failures: [{ id, vendor, error }] }
 */
export async function POST() {
  const denied = await requireOwner()
  if (denied) return denied

  const result = await pushPendingReceipts(getAdminClient())

  if (result.blocked === 'not_connected') {
    return NextResponse.json({ error: 'QuickBooks is not connected.' }, { status: 503 })
  }
  if (result.blocked === 'no_expense_account') {
    return NextResponse.json(
      { error: 'No expense account configured. Pick one under Settings → QuickBooks.' },
      { status: 400 },
    )
  }

  return NextResponse.json({
    attempted: result.attempted,
    succeeded: result.succeeded,
    reconciled: result.reconciled,
    failures: result.failures,
  })
}
