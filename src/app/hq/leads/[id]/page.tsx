export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Phone, MessageSquare } from 'lucide-react'
import { getAdminClient } from '@/lib/supabase/admin'
import { LEAD_STATUS_CLASS, COLD_THRESHOLD_HOURS } from '@/lib/pipeline'
import { ColdBanner } from '@/components/hq/ColdBanner'
import { CardSkeleton } from '@/components/hq/Skeleton'
import { ConvertToCustomerButton } from './components/ConvertToCustomerButton'

type LeadRecord = {
  id: string
  created_at: string
  updated_at: string | null
  name: string
  phone: string
  email: string | null
  city: string | null
  zip: string | null
  service_type: string | null
  structure_type: string | null
  needs_concrete: string | null
  current_surface: string | null
  timeline: string | null
  is_military: boolean | null
  message: string | null
  status: string
  source: string | null
  owner_notes: string | null
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = getAdminClient()

  // Critical-path query: header + details + activity all need this row.
  // Customer-lookup is deferred via <Suspense> below — runs in parallel
  // and renders the convert button when ready, instead of blocking the
  // header on a non-critical query.
  const { data: leadRaw } = await admin
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()
  if (!leadRaw) notFound()
  const lead = leadRaw as LeadRecord

  const ageH = Math.max(0, (Date.now() - new Date(lead.created_at).getTime()) / 3_600_000)
  const cold = lead.status === 'new' && ageH > COLD_THRESHOLD_HOURS
  const statusClass = LEAD_STATUS_CLASS[lead.status] ?? 'bg-gray-100 text-gray-600'

  return (
    <div className="space-y-4">
      <Link href="/hq/leads" className="inline-flex items-center gap-1 text-[15px] font-medium text-(--brand-fg)">
        <ArrowLeft size={18} strokeWidth={2} /> Leads
      </Link>

      {cold && (
        <div className="overflow-hidden rounded-xl">
          <ColdBanner ageHours={ageH} />
        </div>
      )}

      {/* Hero */}
      <header className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[26px] font-bold leading-tight text-(--text-primary)">{lead.name}</h1>
            <p className="mt-0.5 text-[14px] text-(--text-secondary)">
              {[readable(lead.service_type), lead.structure_type, lead.city].filter(Boolean).join(' · ') || 'Lead'}
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusClass}`}>
            {lead.status}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href={lead.phone ? `tel:${lead.phone}` : undefined}
            className="flex items-center justify-center gap-2 rounded-xl bg-(--brand-fg) px-3 py-3 text-[16px] font-semibold text-white tap-solid disabled:opacity-50"
            aria-disabled={!lead.phone}
          >
            <Phone size={18} strokeWidth={2} /> Call
          </a>
          <a
            href={lead.phone ? `sms:${lead.phone}` : undefined}
            className="flex items-center justify-center gap-2 rounded-xl border border-(--border-subtle) bg-(--surface-1) px-3 py-3 text-[16px] font-semibold text-(--text-primary) tap-list disabled:opacity-50"
            aria-disabled={!lead.phone}
          >
            <MessageSquare size={18} strokeWidth={2} /> SMS
          </a>
        </div>
      </header>

      {/* Details card */}
      <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">Details</h2>
        <dl className="mt-3 grid grid-cols-1 gap-y-2.5 text-[15px] sm:grid-cols-2 sm:gap-x-6">
          <Field label="Phone" value={lead.phone} />
          <Field label="Email" value={lead.email} />
          <Field label="Service" value={readable(lead.service_type)} />
          <Field label="Structure" value={readable(lead.structure_type)} />
          <Field label="Timeline" value={readable(lead.timeline)} />
          <Field label="Concrete" value={readable(lead.needs_concrete)} />
          <Field label="Surface" value={readable(lead.current_surface)} />
          <Field label="City / ZIP" value={[lead.city, lead.zip].filter(Boolean).join(' · ') || null} />
          <Field label="Military" value={lead.is_military ? 'Yes' : 'No'} />
          <Field label="Source" value={readable(lead.source)} />
        </dl>
      </section>

      {/* Message card */}
      {lead.message && (
        <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">Message</h2>
          <p className="mt-2 whitespace-pre-wrap text-[15px] text-(--text-primary)">{lead.message}</p>
        </section>
      )}

      {/* Activity scaffold */}
      <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">Activity</h2>
        <ul className="mt-2 space-y-2 text-[14px] text-(--text-secondary)">
          <li>Received {formatAbsolute(lead.created_at)}</li>
          {lead.updated_at && lead.updated_at !== lead.created_at && (
            <li>Last updated {formatAbsolute(lead.updated_at)}</li>
          )}
        </ul>
      </section>

      <Suspense fallback={<CardSkeleton height="h-16" radius="rounded-2xl" />}>
        <DeferredConvertButton leadId={lead.id} />
      </Suspense>
    </div>
  )
}

/**
 * Deferred customer-lookup → convert-to-customer button. Runs in parallel
 * with the page's main render via Suspense; doesn't block the header /
 * details paint waiting on the customer table query.
 */
async function DeferredConvertButton({ leadId }: { leadId: string }) {
  const { data: existingCustomer } = await getAdminClient()
    .from('customers')
    .select('id')
    .eq('lead_id', leadId)
    .maybeSingle()
  return (
    <ConvertToCustomerButton
      leadId={leadId}
      existingCustomerId={existingCustomer?.id ?? null}
    />
  )
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-[12px] text-(--text-tertiary)">{label}</dt>
      <dd className="mt-0.5 text-(--text-primary)">{value || '—'}</dd>
    </div>
  )
}

function readable(s: string | null | undefined): string | null {
  if (!s) return null
  return s.replace(/_/g, ' ')
}

function formatAbsolute(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
