import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { createExpense, uploadAttachable } from '@/lib/qbo'

export const dynamic = 'force-dynamic'
// QBO Purchase create + Attachable upload is two round-trips to Intuit.
// 30s budget keeps headroom on slow days.
export const maxDuration = 30

const lineSchema = z.object({
  description: z.string().trim().min(1),
  qty:         z.number().nullable().optional(),
  unit_price:  z.number().nullable().optional(),
  total:       z.number().nullable().optional(),
})

const bodySchema = z.object({
  vendor:        z.string().trim().nullable(),
  receipt_date:  z.string().trim().nullable(),  // YYYY-MM-DD
  cost_category: z.enum(['material', 'concrete_sub', 'fuel', 'permit', 'equipment', 'misc']).optional(),
  subtotal:      z.number().nonnegative().nullable(),
  tax:           z.number().nonnegative().nullable(),
  total:         z.number().nonnegative(),
  line_items:    z.array(lineSchema).max(40),
  memo:          z.string().trim().nullable().optional(),
})

/**
 * POST /api/hq/receipt/[id]/confirm
 * Body (JSON): edited fields the user reviewed on the confirmation sheet.
 *
 * Always:
 *   - Save the user's edits to job_receipts (extraction may have been
 *     wrong; their edits are the source of truth).
 *
 * Best-effort:
 *   - Push to QBO as a Purchase posted to qbo_tokens.expense_account_id.
 *   - Upload the receipt image as an Attachable linked to the Purchase.
 *
 * Failure modes:
 *   - QBO disconnected → save edits, return { pushed: false,
 *     reason: 'qbo_not_connected' }.
 *   - Account ID not configured → save edits, return { pushed: false,
 *     reason: 'account_id_missing' }.
 *   - QBO API error → save edits + qbo_push_error, return { pushed: false,
 *     error }.
 *
 * The /hq/settings/quickbooks pending-receipts batch retry button calls
 * this same endpoint with no body to retry without re-confirming.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const idCheck = z.string().uuid().safeParse(id)
  if (!idCheck.success) {
    return NextResponse.json({ error: 'Invalid receipt id' }, { status: 400 })
  }

  const db = getAdminClient()

  // Load the receipt row (we always need its image + job_id).
  const { data: receipt, error: receiptErr } = await db
    .from('job_receipts')
    .select('*')
    .eq('id', id)
    .single<{
      id: string
      job_id: string
      vendor: string | null
      receipt_date: string | null
      subtotal: number | null
      tax: number | null
      total: number | null
      line_items: Array<{ description: string; qty?: number | null; unit_price?: number | null; total?: number | null }>
      memo: string | null
      image_url: string
      image_path: string
      qbo_expense_id: string | null
    }>()
  if (receiptErr || !receipt) {
    return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })
  }

  // ── Apply user edits (when present) ───────────────────────────────
  let body: z.infer<typeof bodySchema> | null = null
  if (request.headers.get('content-type')?.includes('application/json')) {
    try {
      const json = await request.json()
      const parsed = bodySchema.safeParse(json)
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
      }
      body = parsed.data
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
  }

  if (body) {
    const { error: updateErr } = await db
      .from('job_receipts')
      .update({
        vendor:        body.vendor,
        receipt_date:  body.receipt_date,
        cost_category: body.cost_category ?? 'material',
        subtotal:      body.subtotal,
        tax:           body.tax,
        total:         body.total,
        line_items:    body.line_items,
        memo:          body.memo ?? null,
      })
      .eq('id', id)
    if (updateErr) {
      return NextResponse.json({ error: 'Failed to save edits' }, { status: 500 })
    }
  }

  // Already pushed? No-op the QBO call but surface success so the UI
  // can navigate cleanly.
  if (receipt.qbo_expense_id) {
    return NextResponse.json({
      pushed: true,
      already_pushed: true,
      qbo_expense_id: receipt.qbo_expense_id,
    })
  }

  // ── Look up the configured QBO account ────────────────────────────
  const { data: tokens } = await db
    .from('qbo_tokens')
    .select('expense_account_id, refresh_token_expires_at')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!tokens) {
    return NextResponse.json({
      pushed: false,
      reason: 'qbo_not_connected',
      message: 'QuickBooks is not connected. Saved locally; connect QBO under Settings to push.',
    })
  }
  if (!tokens.expense_account_id) {
    return NextResponse.json({
      pushed: false,
      reason: 'account_id_missing',
      message: 'No expense account configured. Pick one under Settings → QuickBooks.',
    })
  }

  // Use the edited values if the user just confirmed; otherwise fall
  // back to the row in DB (handles batch-retry path).
  const finalVendor = body ? body.vendor : receipt.vendor
  const finalDate   = body ? body.receipt_date : receipt.receipt_date
  const finalTotal  = body ? body.total : (receipt.total ?? 0)
  const finalLines  = (body ? body.line_items : receipt.line_items) ?? []
  const finalMemo   = body ? (body.memo ?? null) : receipt.memo

  // Build line array. If the only item is a junk single-line "Total" or
  // there are no real lines, send a single-line expense for the total.
  const expenseLines =
    finalLines.length > 0
      ? finalLines.map((l) => ({
          description: l.description,
          amount: Number(l.total ?? (l.qty != null && l.unit_price != null ? l.qty * l.unit_price : finalTotal)),
        }))
      : []

  // ── Push to QBO ──────────────────────────────────────────────────
  let purchaseId: string
  try {
    const result = await createExpense({
      accountId: tokens.expense_account_id,
      vendor:    finalVendor,
      date:      finalDate,
      total:     finalTotal,
      lines:     expenseLines.length > 0 ? expenseLines : undefined,
      memo:      finalMemo,
    })
    purchaseId = result.id
  } catch (err) {
    console.error('receipt confirm: QBO push failed', err)
    const msg = err instanceof Error ? err.message : 'Unknown QBO error'
    await db
      .from('job_receipts')
      .update({ qbo_push_error: msg })
      .eq('id', id)
    return NextResponse.json({
      pushed: false,
      reason: 'qbo_api_error',
      error:  msg,
    })
  }

  // ── Attach the receipt image (best-effort) ───────────────────────
  let attachableId: string | null = null
  try {
    // Re-fetch the image bytes for upload to QBO. We could pipe the
    // public URL directly but Supabase Storage public URLs require a
    // valid range fetch which keeps the Vercel function alive — the
    // round-trip is fine.
    const imgRes = await fetch(receipt.image_url)
    if (imgRes.ok) {
      const blob = await imgRes.blob()
      const filename = `receipt-${receipt.id}.jpg`
      const { id: aid } = await uploadAttachable({
        entityType:  'Purchase',
        entityId:    purchaseId,
        blob,
        filename,
        contentType: blob.type || 'image/jpeg',
      })
      attachableId = aid
    }
  } catch (err) {
    // Attachable failure is non-fatal — the Purchase is already
    // created. Surface the warning so Julian can re-attach manually.
    console.error('receipt confirm: attachable upload failed', err)
  }

  // ── Persist QBO state ────────────────────────────────────────────
  const { error: pushUpdateErr } = await db
    .from('job_receipts')
    .update({
      qbo_expense_id:    purchaseId,
      qbo_attachable_id: attachableId,
      qbo_pushed_at:     new Date().toISOString(),
      qbo_push_error:    null,
    })
    .eq('id', id)
  if (pushUpdateErr) {
    console.error('receipt confirm: db update after push failed', pushUpdateErr)
  }

  return NextResponse.json({
    pushed: true,
    qbo_expense_id: purchaseId,
    qbo_attachable_id: attachableId,
    attachable_warning: attachableId === null ? 'Receipt image was not attached to QBO; you can re-attach manually.' : undefined,
  })
}
