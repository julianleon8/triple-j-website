export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Phone, MessageSquare } from 'lucide-react'
import { getAdminClient } from '@/lib/supabase/admin'
import { LEAD_STATUS_CLASS, COLD_THRESHOLD_HOURS } from '@/lib/pipeline'
import { ColdBanner } from '@/components/hq/ColdBanner'
import { CardSkeleton } from '@/components/hq/Skeleton'
import { LeadStatusButtons } from './components/LeadStatusButtons'
import { AttributionCard } from './components/AttributionCard'
import { ReferrerPicker } from './components/ReferrerPicker'
import { IntentStagePicker } from './components/IntentStagePicker'

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
  // Migration 014/015 — attribution + outcomes
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
  gclid: string | null
  fbclid: string | null
  landing_url: string | null
  referrer_url: string | null
  referring_customer_id: string | null
  first_response_at: string | null
  intent_stage: string | null
  estimated_budget_min: number | null
  estimated_budget_max: number | null
  won_at: string | null
  lost_at: string | null
  lost_reason: string | null
  lost_reason_notes: string | null
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
            aria-disabled={!lead.phone ? "true" : undefined}
          >
            <Phone size={18} strokeWidth={2} /> Call
          </a>
          <a
            href={lead.phone ? `sms:${lead.phone}` : undefined}
            className="flex items-center justify-center gap-2 rounded-xl border border-(--border-subtle) bg-(--surface-1) px-3 py-3 text-[16px] font-semibold text-(--text-primary) tap-list disabled:opacity-50"
            aria-disabled={!lead.phone ? "true" : undefined}
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

      <AttributionCard lead={lead} />

      <IntentStagePicker
        leadId={lead.id}
        current={lead.intent_stage as 'info_gathering' | 'timeline_known' | 'budget_set' | 'ready_to_buy' | null}
      />

      <Suspense fallback={<CardSkeleton height="h-16" radius="rounded-2xl" />}>
        <DeferredReferrerPicker leadId={lead.id} referringCustomerId={lead.referring_customer_id} />
      </Suspense>

      {/* Activity scaffold */}
      <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">Activity</h2>
        <ul className="mt-2 space-y-2 text-[14px] text-(--text-secondary)">
          <li>Received {formatAbsolute(lead.created_at)}</li>
          {lead.first_response_at && (
            <li>First response {formatAbsolute(lead.first_response_at)}</li>
          )}
          {lead.won_at && <li>Marked won {formatAbsolute(lead.won_at)}</li>}
          {lead.lost_at && <li>Marked lost {formatAbsolute(lead.lost_at)}</li>}
          {lead.lost_reason && (
            <li className="text-(--text-primary)">
              Lost reason: <span className="font-semibold">{readable(lead.lost_reason)}</span>
              {lead.lost_reason_notes ? ` — ${lead.lost_reason_notes}` : null}
            </li>
          )}
          {lead.updated_at && lead.updated_at !== lead.created_at && (
            <li>Last updated {formatAbsolute(lead.updated_at)}</li>
          )}
        </ul>
      </section>

      <Suspense fallback={<CardSkeleton height="h-16" radius="rounded-2xl" />}>
        <DeferredStatusButtons leadId={lead.id} currentStatus={lead.status} />
      </Suspense>
    </div>
  )
}

/**
 * Deferred customer-lookup → status action bar. Runs in parallel with
 * the page's main render via Suspense so the header / details paint
 * before the customer-table query resolves.
 */
async function DeferredStatusButtons({
  leadId, currentStatus,
}: {
  leadId: string; currentStatus: string
}) {
  const { data: existingCustomer } = await getAdminClient()
    .from('customers')
    .select('id')
    .eq('lead_id', leadId)
    .maybeSingle()
  return (
    <LeadStatusButtons
      leadId={leadId}
      currentStatus={currentStatus}
      existingCustomerId={existingCustomer?.id ?? null}
    />
  )
}

/**
 * Deferred referrer name resolution + picker. Resolves the linked
 * customer name (if any) so the picker's collapsed view shows it
 * instantly without a client roundtrip.
 */
async function DeferredReferrerPicker({
  leadId, referringCustomerId,
}: {
  leadId: string; referringCustomerId: string | null
}) {
  let current: { id: string; name: string } | null = null
  if (referringCustomerId) {
    const { data } = await getAdminClient()
      .from('customers')
      .select('id, name')
      .eq('id', referringCustomerId)
      .maybeSingle()
    if (data) current = { id: data.id, name: data.name }
  }
  return <ReferrerPicker leadId={leadId} current={current} />
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <>
      <dt className="text-[12px] text-(--text-tertiary)">{label}</dt>
      <dd className="mt-0.5 text-(--text-primary)">{value || '—'}</dd>
    </>
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
