/**
 * Pushes pending job receipts into QuickBooks as Purchases.
 *
 * Shared by the manual /hq/settings/quickbooks button and the nightly cron.
 * Extracted from the route so both callers get the same idempotency
 * guarantees — the whole reason this is safe to schedule.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import {
  createExpense,
  uploadAttachable,
  findPurchaseByDocNumber,
  receiptDocNumber,
} from '@/lib/qbo'

export type ReceiptRow = {
  id: string
  job_id: string
  vendor: string | null
  receipt_date: string | null
  total: number | null
  line_items: Array<{
    description: string
    qty?: number | null
    unit_price?: number | null
    total?: number | null
  }>
  memo: string | null
  image_url: string
}

export type ReceiptPushResult = {
  attempted: number
  succeeded: number
  /** Found already posted in QBO and reconciled without creating anything. */
  reconciled: number
  failures: Array<{ id: string; vendor: string | null; error: string }>
  /** Set when the batch could not run at all. */
  blocked?: 'not_connected' | 'no_expense_account'
}

/**
 * How many receipts one invocation will attempt.
 *
 * Each receipt costs two to four QBO round-trips (duplicate check, optional
 * vendor lookup, create, image upload) inside a 60s function. The original
 * route had no limit at all, so a backlog would time out mid-loop — which is
 * exactly the condition that produces the half-finished state this module
 * now guards against. A leftover backlog is simply picked up next run.
 */
export const RECEIPT_BATCH_LIMIT = 25

/** Turns stored OCR line items into QBO expense lines. */
export function toExpenseLines(row: ReceiptRow) {
  return row.line_items.map((l) => ({
    description: l.description,
    amount: Number(
      l.total ??
        (l.qty != null && l.unit_price != null ? l.qty * l.unit_price : (row.total ?? 0)),
    ),
  }))
}

export async function pushPendingReceipts(
  db: SupabaseClient,
  limit: number = RECEIPT_BATCH_LIMIT,
): Promise<ReceiptPushResult> {
  const empty: ReceiptPushResult = { attempted: 0, succeeded: 0, reconciled: 0, failures: [] }

  // Bail before looping — no point walking receipts when the first call 503s.
  const { data: tokens } = await db
    .from('qbo_tokens')
    .select('expense_account_id')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ expense_account_id: string | null }>()

  if (!tokens) return { ...empty, blocked: 'not_connected' }
  if (!tokens.expense_account_id) return { ...empty, blocked: 'no_expense_account' }

  const { data: pendingRaw } = await db
    .from('job_receipts')
    .select('id, job_id, vendor, receipt_date, total, line_items, memo, image_url')
    .is('qbo_pushed_at', null)
    .order('created_at', { ascending: true })
    .limit(limit)

  const pending = (pendingRaw ?? []) as ReceiptRow[]
  const failures: ReceiptPushResult['failures'] = []
  let succeeded = 0
  let reconciled = 0

  // Sequential on purpose — keeps the QBO API quiet and gives clean per-row
  // results, so /hq can show exactly what is still failing.
  for (const r of pending) {
    try {
      const docNumber = receiptDocNumber(r.id)

      // Idempotency gate. Creating the Purchase and marking the row pushed
      // are two writes to two systems with no transaction around them. If the
      // process died between them on an earlier run, the Purchase exists in
      // QBO while the row still reads pending — without this check the retry
      // would post the same expense a second time, into the books.
      //
      // findPurchaseByDocNumber throws rather than returning null on a
      // transport failure, so a broken lookup lands in the catch below and
      // the receipt is retried later. It never falls through to a create.
      let purchaseId = await findPurchaseByDocNumber(docNumber)
      let attachableId: string | null = null

      if (purchaseId) {
        reconciled += 1
      } else {
        const lines = toExpenseLines(r)
        const created = await createExpense({
          accountId: tokens.expense_account_id,
          vendor: r.vendor,
          date: r.receipt_date,
          total: r.total ?? 0,
          lines: lines.length > 0 ? lines : undefined,
          memo: r.memo,
          docNumber,
        })
        purchaseId = created.id

        // Best-effort image attach. Only on a fresh create: a reconciled
        // Purchase may already carry its attachment, and a duplicate image
        // is worse than a missing one.
        try {
          const imgRes = await fetch(r.image_url)
          if (imgRes.ok) {
            const blob = await imgRes.blob()
            const { id: aid } = await uploadAttachable({
              entityType: 'Purchase',
              entityId: purchaseId,
              blob,
              filename: `receipt-${r.id}.jpg`,
              contentType: blob.type || 'image/jpeg',
            })
            attachableId = aid
          }
        } catch (err) {
          console.error('[receipt-push] attachable failed', err)
        }

        succeeded += 1
      }

      await db
        .from('job_receipts')
        .update({
          qbo_expense_id: purchaseId,
          qbo_attachable_id: attachableId,
          qbo_pushed_at: new Date().toISOString(),
          qbo_push_error: null,
        })
        .eq('id', r.id)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown QBO error'
      await db.from('job_receipts').update({ qbo_push_error: msg }).eq('id', r.id)
      failures.push({ id: r.id, vendor: r.vendor, error: msg })
    }
  }

  return { attempted: pending.length, succeeded, reconciled, failures }
}
