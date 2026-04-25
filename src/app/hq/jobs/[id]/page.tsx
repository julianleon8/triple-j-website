export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Phone, FileText } from 'lucide-react'
import { getAdminClient } from '@/lib/supabase/admin'
import { JOB_STATUS_CLASS } from '@/lib/pipeline'
import { JobMapHero } from './components/JobMapHero'
import { JobPhotoStrip, type JobPhotoStripPhoto } from '@/components/hq/JobPhotoStrip'
import { JobReceiptStrip, type JobReceipt, type ReceiptLineItem } from '@/components/hq/JobReceiptStrip'
import { CardSkeleton } from '@/components/hq/Skeleton'

type JobRecord = {
  id: string
  created_at: string
  updated_at: string | null
  customer_id: string
  quote_id: string | null
  job_number: string
  status: string
  job_type: string | null
  structure_type: string | null
  address: string | null
  city: string | null
  scheduled_date: string | null
  completed_date: string | null
  total_contract: number | null
  amount_paid: number | null
  balance_due: number | null
  crew_notes: string | null
  internal_notes: string | null
  customers: { id: string; name: string; phone: string | null } | null
  quotes: { id: string; quote_number: string; total: number | null } | null
}

const PROGRESS: Array<{ key: string; label: string }> = [
  { key: 'scheduled',   label: 'Scheduled' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed',   label: 'Completed' },
]

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = getAdminClient()

  // Critical-path: job header needs the row (status, customer, contract).
  // Photos + receipts are deferred via <Suspense> below — first paint shows
  // the job header + map; photos and receipts stream in independently.
  const { data: raw } = await admin
    .from('jobs')
    .select('*, customers(id, name, phone), quotes(id, quote_number, total)')
    .eq('id', id)
    .single()
  if (!raw) notFound()
  const job = raw as JobRecord

  const statusClass = JOB_STATUS_CLASS[job.status] ?? 'bg-gray-100 text-gray-600'
  const activeIdx = PROGRESS.findIndex((p) => p.key === job.status)

  return (
    <div className="space-y-4">
      <Link href="/hq/jobs" className="inline-flex items-center gap-1 text-[15px] font-medium text-(--brand-fg)">
        <ArrowLeft size={18} strokeWidth={2} /> Jobs
      </Link>

      <JobMapHero address={job.address} city={job.city} />

      <Suspense fallback={<CardSkeleton height="h-32" radius="rounded-2xl" />}>
        <DeferredJobPhotos jobId={job.id} />
      </Suspense>

      <Suspense fallback={<CardSkeleton height="h-32" radius="rounded-2xl" />}>
        <DeferredJobReceipts jobId={job.id} />
      </Suspense>

      <header className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[24px] font-bold leading-tight text-(--text-primary)">
              #{job.job_number}
            </h1>
            <p className="mt-0.5 text-[14px] text-(--text-secondary)">
              {[job.job_type, job.structure_type, job.city].filter(Boolean).join(' · ') || 'Job'}
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusClass}`}>
            {job.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Progress stepper */}
        <ol className="mt-4 flex items-center gap-2">
          {PROGRESS.map((p, i) => {
            const done = i <= activeIdx
            return (
              <li key={p.key} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    done ? 'bg-(--brand-fg) text-white' : 'bg-(--surface-3) text-(--text-tertiary)'
                  }`}
                  aria-current={i === activeIdx ? 'step' : undefined}
                >
                  {i + 1}
                </div>
                <span className={`text-[13px] ${done ? 'text-(--text-primary) font-medium' : 'text-(--text-tertiary)'}`}>
                  {p.label}
                </span>
                {i < PROGRESS.length - 1 && (
                  <span className={`ml-auto h-px flex-1 ${done && i + 1 <= activeIdx ? 'bg-(--brand-fg)' : 'bg-(--border-subtle)'}`} />
                )}
              </li>
            )
          })}
        </ol>
      </header>

      <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">Schedule & finance</h2>
        <dl className="mt-3 grid grid-cols-2 gap-y-2.5 gap-x-6 text-[15px]">
          <Field label="Scheduled" value={formatDate(job.scheduled_date)} />
          <Field label="Completed" value={formatDate(job.completed_date)} />
          <Field label="Contract" value={money(job.total_contract)} />
          <Field label="Paid" value={money(job.amount_paid)} />
          <Field label="Balance" value={money(job.balance_due)} />
          <Field label="Address" value={[job.address, job.city].filter(Boolean).join(', ') || null} />
        </dl>
      </section>

      {/* Related customer + quote */}
      {job.customers && (
        <Link
          href={`/hq/customers/${job.customers.id}`}
          className="flex items-center justify-between rounded-2xl border border-(--border-subtle) bg-(--surface-2) px-5 py-4 tap-list"
        >
          <div className="min-w-0">
            <p className="text-[12px] text-(--text-tertiary)">Customer</p>
            <p className="mt-0.5 text-[17px] font-semibold text-(--text-primary) truncate">
              {job.customers.name}
            </p>
          </div>
          {job.customers.phone && (
            <a
              href={`tel:${job.customers.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-(--brand-fg) px-3 py-2 text-[13px] font-semibold text-white"
            >
              <Phone size={14} strokeWidth={2} /> Call
            </a>
          )}
        </Link>
      )}

      {job.quotes && (
        <Link
          href={`/hq/quotes/${job.quotes.id}`}
          className="flex items-center justify-between rounded-2xl border border-(--border-subtle) bg-(--surface-2) px-5 py-4 tap-list"
        >
          <div className="min-w-0 flex items-center gap-3">
            <FileText size={18} strokeWidth={2} className="text-(--text-secondary)" />
            <div>
              <p className="text-[12px] text-(--text-tertiary)">Quote</p>
              <p className="mt-0.5 text-[17px] font-semibold text-(--text-primary)">
                #{job.quotes.quote_number}
              </p>
            </div>
          </div>
          {job.quotes.total != null && (
            <span className="text-[15px] font-semibold text-(--text-primary) tabular-nums">{money(job.quotes.total)}</span>
          )}
        </Link>
      )}

      {(job.crew_notes || job.internal_notes) && (
        <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">Notes</h2>
          {job.crew_notes && (
            <div className="mt-3">
              <p className="text-[12px] text-(--text-tertiary)">Crew</p>
              <p className="mt-1 whitespace-pre-wrap text-[15px] text-(--text-primary)">{job.crew_notes}</p>
            </div>
          )}
          {job.internal_notes && (
            <div className="mt-3">
              <p className="text-[12px] text-(--text-tertiary)">Internal</p>
              <p className="mt-1 whitespace-pre-wrap text-[15px] text-(--text-primary)">{job.internal_notes}</p>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-[12px] text-(--text-tertiary)">{label}</dt>
      <dd className="mt-0.5 text-(--text-primary)">{value || '—'}</dd>
    </div>
  )
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function money(n: number | null): string | null {
  if (n == null) return null
  return `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

/**
 * Photos sub-render: gallery_item lookup → gallery_photos query.
 * Two sequential queries (photos depend on the item ID), but they don't
 * block the parent's first paint.
 */
async function DeferredJobPhotos({ jobId }: { jobId: string }) {
  const admin = getAdminClient()
  let jobPhotos: JobPhotoStripPhoto[] = []
  const { data: galleryItem } = await admin
    .from('gallery_items')
    .select('id')
    .eq('job_id', jobId)
    .limit(1)
    .maybeSingle()
  if (galleryItem?.id) {
    const { data: photosRaw } = await admin
      .from('gallery_photos')
      .select('id, image_url, alt_text, is_cover, sort_order, gallery_item_id, created_at')
      .eq('gallery_item_id', galleryItem.id)
      .order('is_cover', { ascending: false })
      .order('sort_order', { ascending: true })
    jobPhotos = (photosRaw ?? []) as JobPhotoStripPhoto[]
  }
  return <JobPhotoStrip jobId={jobId} photos={jobPhotos} photoCount={jobPhotos.length} />
}

/**
 * Receipts sub-render: single query into job_receipts. Streams in
 * separately from photos so a slow receipts table doesn't delay the
 * photo strip and vice-versa.
 */
async function DeferredJobReceipts({ jobId }: { jobId: string }) {
  const admin = getAdminClient()
  const { data: receiptsRaw } = await admin
    .from('job_receipts')
    .select(
      'id, vendor, receipt_date, subtotal, tax, total, line_items, memo, image_url, extraction_confidence, qbo_expense_id, qbo_pushed_at, qbo_push_error, created_at',
    )
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })
  const jobReceipts: JobReceipt[] = (receiptsRaw ?? []).map((r) => ({
    ...(r as Omit<JobReceipt, 'line_items'>),
    line_items: (Array.isArray((r as { line_items?: unknown }).line_items)
      ? (r as { line_items: unknown[] }).line_items
      : []) as ReceiptLineItem[],
  }))
  return <JobReceiptStrip jobId={jobId} receipts={jobReceipts} />
}
