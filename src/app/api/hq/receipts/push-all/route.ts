import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { createExpense, uploadAttachable } from '@/lib/qbo'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

type ReceiptRow = {
  id: string
  job_id: string
  vendor: string | null
  receipt_date: string | null
  total: number | null
  line_items: Array<{ description: string; qty?: number | null; unit_price?: number | null; total?: number | null }>
  memo: string | null
  image_url: string
}

/**
 * POST /api/hq/receipts/push-all
 *
 * Batch-retry every job_receipts row where qbo_pushed_at is null.
 * Used by the /hq/settings/quickbooks "N receipts pending push" button.
 * Sequential — keep QBO API quiet, surface clean per-row results so the
 * user can see what succeeded and what's still failing.
 *
 * Returns: { attempted, succeeded, failures: [{ id, vendor, error }] }
 */
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getAdminClient()

  // Bail early if QBO isn't ready — no point looping receipts when the
  // first call would 503.
  const { data: tokens } = await db
    .from('qbo_tokens')
    .select('expense_account_id')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ expense_account_id: string | null }>()
  if (!tokens) {
    return NextResponse.json(
      { error: 'QuickBooks is not connected.' },
      { status: 503 },
    )
  }
  if (!tokens.expense_account_id) {
    return NextResponse.json(
      { error: 'No expense account configured. Pick one under Settings → QuickBooks.' },
      { status: 400 },
    )
  }

  const { data: pendingRaw } = await db
    .from('job_receipts')
    .select('id, job_id, vendor, receipt_date, total, line_items, memo, image_url')
    .is('qbo_pushed_at', null)
    .order('created_at', { ascending: true })
  const pending: ReceiptRow[] = (pendingRaw ?? []) as ReceiptRow[]

  const failures: Array<{ id: string; vendor: string | null; error: string }> = []
  let succeeded = 0

  for (const r of pending) {
    try {
      const expenseLines =
        r.line_items.length > 0
          ? r.line_items.map((l) => ({
              description: l.description,
              amount: Number(l.total ?? (l.qty != null && l.unit_price != null ? l.qty * l.unit_price : (r.total ?? 0))),
            }))
          : []

      const { id: purchaseId } = await createExpense({
        accountId: tokens.expense_account_id!,
        vendor:    r.vendor,
        date:      r.receipt_date,
        total:     r.total ?? 0,
        lines:     expenseLines.length > 0 ? expenseLines : undefined,
        memo:      r.memo,
      })

      // Best-effort image attach.
      let attachableId: string | null = null
      try {
        const imgRes = await fetch(r.image_url)
        if (imgRes.ok) {
          const blob = await imgRes.blob()
          const { id: aid } = await uploadAttachable({
            entityType:  'Purchase',
            entityId:    purchaseId,
            blob,
            filename:    `receipt-${r.id}.jpg`,
            contentType: blob.type || 'image/jpeg',
          })
          attachableId = aid
        }
      } catch (err) {
        console.error('push-all: attachable failed', err)
      }

      await db
        .from('job_receipts')
        .update({
          qbo_expense_id:    purchaseId,
          qbo_attachable_id: attachableId,
          qbo_pushed_at:     new Date().toISOString(),
          qbo_push_error:    null,
        })
        .eq('id', r.id)
      succeeded += 1
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown QBO error'
      await db
        .from('job_receipts')
        .update({ qbo_push_error: msg })
        .eq('id', r.id)
      failures.push({ id: r.id, vendor: r.vendor, error: msg })
    }
  }

  return NextResponse.json({
    attempted: pending.length,
    succeeded,
    failures,
  })
}
