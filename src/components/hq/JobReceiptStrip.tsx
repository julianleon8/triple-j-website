'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Receipt as ReceiptIcon,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { Sheet } from '@/components/hq/Sheet'
import { Input } from '@/components/hq/ui/Input'
import { prepareImage } from '@/lib/hq/image-prep'
import { useHaptics } from '@/lib/hq/haptics'

/**
 * Receipt OCR + QBO push for /hq/jobs/[id]. Sibling to JobPhotoStrip:
 *   - Receipt button (camera-first via <input capture="environment">)
 *   - List of recent receipts on this job with QBO push status pill
 *   - Confirmation sheet opens after extraction with editable fields,
 *     line items editor, "Post to QuickBooks" button.
 *
 * Server contract:
 *   POST /api/hq/receipt                  → { id, image_url, extracted | null, warning? }
 *   POST /api/hq/receipt/{id}/confirm     → { pushed, qbo_expense_id?, reason?, error? }
 */

export type JobReceipt = {
  id: string
  vendor: string | null
  receipt_date: string | null
  subtotal: number | null
  tax: number | null
  total: number | null
  line_items: ReceiptLineItem[]
  memo: string | null
  image_url: string
  extraction_confidence: number | null
  qbo_expense_id: string | null
  qbo_pushed_at: string | null
  qbo_push_error: string | null
  created_at: string
}

export type ReceiptLineItem = {
  description: string
  qty: number | null
  unit_price: number | null
  total: number | null
}

type Props = {
  jobId: string
  receipts: JobReceipt[]
}

type SheetState =
  | { mode: 'closed' }
  | {
      mode: 'editing'
      receiptId: string
      imageUrl: string
      vendor: string
      receiptDate: string
      subtotal: string
      tax: string
      total: string
      memo: string
      lines: Array<{ description: string; qty: string; unit_price: string; total: string }>
      confidence: number | null
      submitting: boolean
      error: string | null
      success: string | null
      lowConfidenceWarning: boolean
    }

function fmtUSD(n: number | null): string {
  if (n == null) return '—'
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function asString(v: number | null): string {
  return v == null ? '' : String(v)
}

function parseNum(s: string): number | null {
  const t = s.trim()
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

export function JobReceiptStrip({ jobId, receipts: initialReceipts }: Props) {
  const haptics = useHaptics()
  const inputRef = useRef<HTMLInputElement>(null)
  const [receipts, setReceipts] = useState<JobReceipt[]>(initialReceipts)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sheet, setSheet] = useState<SheetState>({ mode: 'closed' })

  const pendingCount = useMemo(
    () => receipts.filter((r) => r.qbo_pushed_at == null).length,
    [receipts],
  )

  const onPick = useCallback(() => inputRef.current?.click(), [])

  const openSheet = useCallback((r: JobReceipt) => {
    haptics.tap()
    setSheet({
      mode: 'editing',
      receiptId: r.id,
      imageUrl: r.image_url,
      vendor: r.vendor ?? '',
      receiptDate: r.receipt_date ?? '',
      subtotal: asString(r.subtotal),
      tax: asString(r.tax),
      total: asString(r.total),
      memo: r.memo ?? '',
      lines: r.line_items.length
        ? r.line_items.map((l) => ({
            description: l.description,
            qty:        asString(l.qty),
            unit_price: asString(l.unit_price),
            total:      asString(l.total),
          }))
        : [{ description: '', qty: '1', unit_price: '', total: '' }],
      confidence: r.extraction_confidence,
      submitting: false,
      error: null,
      success: null,
      lowConfidenceWarning: r.extraction_confidence != null && r.extraction_confidence < 0.7,
    })
  }, [haptics])

  const closeSheet = useCallback(() => setSheet({ mode: 'closed' }), [])

  const onCapture = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return

      setError(null)
      setBusy(true)
      haptics.tap()
      try {
        const prepared = await prepareImage(file)
        const form = new FormData()
        form.append('job_id', jobId)
        form.append(
          'file',
          new File([prepared.blob], prepared.filename, {
            type: prepared.blob.type || 'image/jpeg',
          }),
        )
        const res = await fetch('/api/hq/receipt', { method: 'POST', body: form })
        const body = (await res.json().catch(() => ({}))) as {
          id?: string
          image_url?: string
          extracted?: {
            vendor: string | null
            date: string | null
            subtotal: number | null
            tax: number | null
            total: number | null
            line_items: ReceiptLineItem[]
            confidence: number
            notes: string | null
          } | null
          warning?: string
          error?: string
        }
        if (!res.ok || !body.id || !body.image_url) {
          throw new Error(body.error || `Upload failed (${res.status})`)
        }

        const newRow: JobReceipt = {
          id: body.id,
          vendor: body.extracted?.vendor ?? null,
          receipt_date: body.extracted?.date ?? null,
          subtotal: body.extracted?.subtotal ?? null,
          tax: body.extracted?.tax ?? null,
          total: body.extracted?.total ?? null,
          line_items: body.extracted?.line_items ?? [],
          memo: body.extracted?.notes ?? null,
          image_url: body.image_url,
          extraction_confidence: body.extracted?.confidence ?? null,
          qbo_expense_id: null,
          qbo_pushed_at: null,
          qbo_push_error: null,
          created_at: new Date().toISOString(),
        }
        setReceipts((prev) => [newRow, ...prev])
        haptics.success()
        // Auto-open the confirm sheet so Julian can verify + push.
        openSheet(newRow)
        if (body.warning) {
          // Surface as a transient error so it shows in the sheet.
          setSheet((s) => (s.mode === 'editing' ? { ...s, error: body.warning ?? null } : s))
        }
      } catch (err) {
        haptics.error()
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setError(msg)
      } finally {
        setBusy(false)
      }
    },
    [jobId, openSheet, haptics],
  )

  const updateLine = useCallback(
    (idx: number, patch: Partial<{ description: string; qty: string; unit_price: string; total: string }>) => {
      setSheet((s) => {
        if (s.mode !== 'editing') return s
        const lines = s.lines.map((l, i) => (i === idx ? { ...l, ...patch } : l))
        return { ...s, lines }
      })
    },
    [],
  )

  const addLine = useCallback(() => {
    setSheet((s) => {
      if (s.mode !== 'editing') return s
      return {
        ...s,
        lines: [...s.lines, { description: '', qty: '1', unit_price: '', total: '' }],
      }
    })
  }, [])

  const removeLine = useCallback((idx: number) => {
    setSheet((s) => {
      if (s.mode !== 'editing') return s
      return { ...s, lines: s.lines.filter((_, i) => i !== idx) }
    })
  }, [])

  const submitConfirm = useCallback(async () => {
    if (sheet.mode !== 'editing') return
    setSheet((s) => (s.mode === 'editing' ? { ...s, submitting: true, error: null, success: null } : s))

    const linesPayload = sheet.lines
      .filter((l) => l.description.trim())
      .map((l) => ({
        description: l.description.trim(),
        qty:        parseNum(l.qty),
        unit_price: parseNum(l.unit_price),
        total:      parseNum(l.total),
      }))

    const totalNum = parseNum(sheet.total)
    if (totalNum == null || totalNum <= 0) {
      setSheet((s) => (s.mode === 'editing' ? { ...s, submitting: false, error: 'Total is required.' } : s))
      return
    }

    const body = {
      vendor:       sheet.vendor.trim() || null,
      receipt_date: sheet.receiptDate || null,
      subtotal:     parseNum(sheet.subtotal),
      tax:          parseNum(sheet.tax),
      total:        totalNum,
      line_items:   linesPayload,
      memo:         sheet.memo.trim() || null,
    }

    try {
      const res = await fetch(`/api/hq/receipt/${sheet.receiptId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = (await res.json().catch(() => ({}))) as {
        pushed?: boolean
        qbo_expense_id?: string
        reason?: string
        error?: string
        message?: string
        attachable_warning?: string
      }

      if (data.pushed) {
        haptics.success()
        setReceipts((prev) =>
          prev.map((r) =>
            r.id === sheet.receiptId
              ? {
                  ...r,
                  vendor: body.vendor,
                  receipt_date: body.receipt_date,
                  subtotal: body.subtotal,
                  tax: body.tax,
                  total: body.total,
                  line_items: linesPayload,
                  memo: body.memo,
                  qbo_expense_id: data.qbo_expense_id ?? null,
                  qbo_pushed_at: new Date().toISOString(),
                  qbo_push_error: null,
                }
              : r,
          ),
        )
        setSheet((s) => (s.mode === 'editing' ? {
          ...s,
          submitting: false,
          success: data.attachable_warning
            ? `Posted to QuickBooks. Note: ${data.attachable_warning}`
            : 'Posted to QuickBooks.',
        } : s))
        // Close the sheet after a brief success flash.
        window.setTimeout(closeSheet, 1500)
      } else {
        haptics.warn()
        setReceipts((prev) =>
          prev.map((r) =>
            r.id === sheet.receiptId
              ? {
                  ...r,
                  vendor: body.vendor,
                  receipt_date: body.receipt_date,
                  subtotal: body.subtotal,
                  tax: body.tax,
                  total: body.total,
                  line_items: linesPayload,
                  memo: body.memo,
                  qbo_push_error: data.error ?? data.reason ?? null,
                }
              : r,
          ),
        )
        const friendly =
          data.reason === 'qbo_not_connected'
            ? 'Edits saved locally. Connect QuickBooks under Settings to push.'
            : data.reason === 'account_id_missing'
            ? 'Edits saved locally. Pick an expense account under Settings → QuickBooks.'
            : `Edits saved locally. QuickBooks push failed: ${data.error ?? data.message ?? 'unknown error'}`
        setSheet((s) => (s.mode === 'editing' ? { ...s, submitting: false, error: friendly } : s))
      }
    } catch (err) {
      haptics.error()
      setSheet((s) => (s.mode === 'editing'
        ? { ...s, submitting: false, error: err instanceof Error ? err.message : 'Submit failed' }
        : s))
    }
  }, [sheet, haptics, closeSheet])

  return (
    <section
      aria-label="Job receipts"
      className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
            Receipts
          </h2>
          <p className="mt-0.5 text-[12px] text-(--text-tertiary)">
            {receipts.length === 0
              ? 'Snap a receipt to push it to QuickBooks.'
              : `${receipts.length} on this job${pendingCount > 0 ? ` · ${pendingCount} pending push` : ''}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onPick}
          disabled={busy}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-(--brand-fg) px-3.5 py-2 text-[13px] font-semibold text-white tap-solid disabled:opacity-60"
        >
          {busy ? (
            <Loader2 size={14} strokeWidth={2} className="animate-spin" />
          ) : (
            <ReceiptIcon size={14} strokeWidth={2} />
          )}
          {busy ? 'Reading…' : 'Receipt'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onCapture}
        />
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-500/15 px-3 py-2 text-[12px] text-red-600 dark:text-red-400">
          <AlertCircle size={14} strokeWidth={2} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {receipts.length > 0 && (
        <ul className="mt-3 space-y-2">
          {receipts.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => openSheet(r)}
                className="flex w-full items-center gap-3 rounded-xl border border-(--border-subtle) bg-(--surface-1) px-3 py-2.5 text-left tap-list"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-(--surface-3)">
                  {/* eslint-disable-next-line @next/next/no-img-element -- thumbnails of dynamic Supabase URLs, no need to optimize */}
                  <img
                    src={r.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[15px] font-semibold text-(--text-primary)">
                      {r.vendor || 'Unknown vendor'}
                    </p>
                    <ReceiptStatusPill receipt={r} />
                  </div>
                  <p className="mt-0.5 text-[12px] text-(--text-tertiary)">
                    {r.receipt_date ?? '—'} · {fmtUSD(r.total)}
                    {r.line_items.length > 0 ? ` · ${r.line_items.length} line${r.line_items.length === 1 ? '' : 's'}` : ''}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet
        open={sheet.mode === 'editing'}
        onClose={closeSheet}
        title="Confirm receipt"
        snap={0.95}
      >
        {sheet.mode === 'editing' && (
          <ConfirmForm
            sheet={sheet}
            onChange={(patch) =>
              setSheet((s) => (s.mode === 'editing' ? { ...s, ...patch } : s))
            }
            onLineUpdate={updateLine}
            onLineAdd={addLine}
            onLineRemove={removeLine}
            onSubmit={submitConfirm}
            onClose={closeSheet}
          />
        )}
      </Sheet>
    </section>
  )
}

function ReceiptStatusPill({ receipt }: { receipt: JobReceipt }) {
  const isPushed = !!receipt.qbo_pushed_at
  const hasError = !!receipt.qbo_push_error
  const lowConfidence =
    receipt.extraction_confidence != null && receipt.extraction_confidence < 0.7
  const tone = isPushed
    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
    : hasError
    ? 'bg-red-500/15 text-red-600 dark:text-red-400'
    : lowConfidence
    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
    : 'bg-(--surface-3) text-(--text-secondary)'
  const label = isPushed
    ? 'Pushed'
    : hasError
    ? 'Push failed'
    : lowConfidence
    ? 'Verify'
    : 'Pending'
  const Icon = isPushed
    ? CheckCircle2
    : hasError
    ? AlertCircle
    : lowConfidence
    ? AlertTriangle
    : ReceiptIcon
  return (
    <span
      className={`shrink-0 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone}`}
    >
      <Icon size={10} strokeWidth={2.4} />
      {label}
    </span>
  )
}

type ConfirmFormProps = {
  sheet: Extract<SheetState, { mode: 'editing' }>
  onChange: (patch: Partial<Extract<SheetState, { mode: 'editing' }>>) => void
  onLineUpdate: (idx: number, patch: Partial<{ description: string; qty: string; unit_price: string; total: string }>) => void
  onLineAdd: () => void
  onLineRemove: (idx: number) => void
  onSubmit: () => void
  onClose: () => void
}

function ConfirmForm({ sheet, onChange, onLineUpdate, onLineAdd, onLineRemove, onSubmit, onClose }: ConfirmFormProps) {
  // Auto-suggest total = sum(line totals or qty × unit_price). Suggestive, not enforced.
  const computedTotal = useMemo(() => {
    let sum = 0
    for (const l of sheet.lines) {
      const lineTotal = parseNum(l.total)
      if (lineTotal != null) {
        sum += lineTotal
        continue
      }
      const q = parseNum(l.qty)
      const u = parseNum(l.unit_price)
      if (q != null && u != null) sum += q * u
    }
    return sum > 0 ? sum.toFixed(2) : null
  }, [sheet.lines])

  // Sync subtotal+tax → total when both are filled and total is empty.
  useEffect(() => {
    if (sheet.total) return
    const sub = parseNum(sheet.subtotal)
    const tax = parseNum(sheet.tax)
    if (sub != null && tax != null) {
      onChange({ total: (sub + tax).toFixed(2) })
    }
  }, [sheet.subtotal, sheet.tax, sheet.total, onChange])

  return (
    <div className="space-y-4 pb-4">
      {/* Confidence banner */}
      {sheet.lowConfidenceWarning && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-[12px] text-amber-600 dark:text-amber-400">
          <AlertTriangle size={14} strokeWidth={2} className="mt-0.5 shrink-0" />
          <span>
            Low extraction confidence. Double-check the totals — the photo may have
            been blurry or partially out of frame.
          </span>
        </div>
      )}

      {/* Receipt thumbnail for cross-reference while editing */}
      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sheet.imageUrl}
          alt="Receipt photo"
          className="max-h-44 rounded-xl border border-(--border-subtle) object-contain"
        />
      </div>

      <div className="space-y-3">
        <Input
          label="Vendor"
          value={sheet.vendor}
          onChange={(e) => onChange({ vendor: e.target.value })}
          placeholder="Lowe's"
        />
        <Input
          label="Date"
          type="date"
          value={sheet.receiptDate}
          onChange={(e) => onChange({ receiptDate: e.target.value })}
        />
        <div className="grid grid-cols-3 gap-2">
          <Input
            label="Subtotal"
            type="number"
            inputMode="decimal"
            value={sheet.subtotal}
            onChange={(e) => onChange({ subtotal: e.target.value })}
          />
          <Input
            label="Tax"
            type="number"
            inputMode="decimal"
            value={sheet.tax}
            onChange={(e) => onChange({ tax: e.target.value })}
          />
          <Input
            label="Total"
            type="number"
            inputMode="decimal"
            value={sheet.total}
            onChange={(e) => onChange({ total: e.target.value })}
            hint={computedTotal && computedTotal !== sheet.total ? `Lines sum: $${computedTotal}` : undefined}
          />
        </div>
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
            Line items
          </h3>
          <button
            type="button"
            onClick={onLineAdd}
            className="inline-flex items-center gap-1 rounded-full bg-(--surface-3) px-2.5 py-1 text-[12px] font-semibold text-(--text-primary) tap-solid"
          >
            <Plus size={12} strokeWidth={2.4} /> Add
          </button>
        </div>
        {sheet.lines.length === 0 ? (
          <p className="text-[12px] text-(--text-tertiary)">
            No line items. The total above is what gets posted.
          </p>
        ) : (
          <ul className="space-y-2">
            {sheet.lines.map((l, idx) => (
              <li key={idx} className="rounded-xl border border-(--border-subtle) bg-(--surface-1) p-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <Input
                      label="Description"
                      value={l.description}
                      onChange={(e) => onLineUpdate(idx, { description: e.target.value })}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        label="Qty"
                        type="number"
                        inputMode="decimal"
                        value={l.qty}
                        onChange={(e) => onLineUpdate(idx, { qty: e.target.value })}
                      />
                      <Input
                        label="Unit"
                        type="number"
                        inputMode="decimal"
                        value={l.unit_price}
                        onChange={(e) => onLineUpdate(idx, { unit_price: e.target.value })}
                      />
                      <Input
                        label="Line total"
                        type="number"
                        inputMode="decimal"
                        value={l.total}
                        onChange={(e) => onLineUpdate(idx, { total: e.target.value })}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onLineRemove(idx)}
                    aria-label="Remove line"
                    className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--surface-3) text-(--text-secondary) tap-solid"
                  >
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Input
        label="Memo (optional)"
        value={sheet.memo}
        onChange={(e) => onChange({ memo: e.target.value })}
        placeholder="Job notes for QuickBooks"
      />

      {sheet.error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-500/15 px-3 py-2 text-[12px] text-red-600 dark:text-red-400">
          <AlertCircle size={14} strokeWidth={2} className="mt-0.5 shrink-0" />
          <span>{sheet.error}</span>
        </div>
      )}
      {sheet.success && (
        <div className="flex items-start gap-2 rounded-xl bg-emerald-500/15 px-3 py-2 text-[12px] text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={14} strokeWidth={2} className="mt-0.5 shrink-0" />
          <span>{sheet.success}</span>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          disabled={sheet.submitting}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3 py-3 text-[14px] font-semibold text-(--text-primary) tap-solid disabled:opacity-60"
        >
          <X size={14} strokeWidth={2} /> Close
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={sheet.submitting}
          className="ml-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-(--brand-fg) px-4 py-3 text-[14px] font-semibold text-white tap-solid disabled:opacity-60"
        >
          {sheet.submitting ? (
            <>
              <Loader2 size={14} strokeWidth={2} className="animate-spin" /> Posting…
            </>
          ) : (
            <>
              <CheckCircle2 size={14} strokeWidth={2} /> Post to QuickBooks
            </>
          )}
        </button>
      </div>
    </div>
  )
}
