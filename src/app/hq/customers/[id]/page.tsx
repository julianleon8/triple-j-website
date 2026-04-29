export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Phone, MessageSquare, Mail } from 'lucide-react'
import { getAdminClient } from '@/lib/supabase/admin'
import { CardSkeleton } from '@/components/hq/Skeleton'
import { ActivityTimeline, type TimelineLead, type TimelineQuote, type TimelineJob } from '../_components/ActivityTimeline'
import { ReviewSection } from './components/ReviewSection'
import { PermissionToggles } from './components/PermissionToggles'

type CustomerRecord = {
  id: string
  created_at: string
  updated_at: string | null
  lead_id: string | null
  name: string
  phone: string
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  notes: string | null
  // Migration 019 — flywheel
  review_asked_at: string | null
  review_followup_due_at: string | null
  review_left_at: string | null
  review_url: string | null
  feature_permission: boolean | null
  feature_permission_asked_at: string | null
  repeat_contact_permission: boolean | null
  repeat_contact_asked_at: string | null
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = getAdminClient()

  // Critical-path: customer query — header card needs name + location before
  // first paint. Activity timeline (lead + quotes + jobs) is deferred via
  // <Suspense> below so the header doesn't wait on three more queries.
  const { data: raw } = await admin
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()
  if (!raw) notFound()
  const customer = raw as CustomerRecord

  const location = [customer.address, customer.city, [customer.state, customer.zip].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="space-y-4">
      <Link href="/hq/customers" className="inline-flex items-center gap-1 text-[15px] font-medium text-(--brand-fg)">
        <ArrowLeft size={18} strokeWidth={2} /> Customers
      </Link>

      <header className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
        <h1 className="text-[26px] font-bold leading-tight text-(--text-primary)">{customer.name}</h1>
        <p className="mt-0.5 text-[14px] text-(--text-secondary)">{location || 'Customer'}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href={customer.phone ? `tel:${customer.phone}` : undefined}
            className="flex items-center justify-center gap-2 rounded-xl bg-(--brand-fg) px-3 py-3 text-[16px] font-semibold text-white tap-solid"
            aria-disabled={!customer.phone ? "true" : undefined}
          >
            <Phone size={18} strokeWidth={2} /> Call
          </a>
          <a
            href={customer.phone ? `sms:${customer.phone}` : undefined}
            className="flex items-center justify-center gap-2 rounded-xl border border-(--border-subtle) bg-(--surface-1) px-3 py-3 text-[16px] font-semibold text-(--text-primary) tap-list"
            aria-disabled={!customer.phone ? "true" : undefined}
          >
            <MessageSquare size={18} strokeWidth={2} /> SMS
          </a>
        </div>

        {customer.email && (
          <a
            href={`mailto:${customer.email}`}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-(--border-subtle) bg-(--surface-1) px-3 py-2.5 text-[14px] font-medium text-(--text-primary) tap-list"
          >
            <Mail size={16} strokeWidth={2} /> {customer.email}
          </a>
        )}
      </header>

      {customer.notes && (
        <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">Notes</h2>
          <p className="mt-2 whitespace-pre-wrap text-[15px] text-(--text-primary)">{customer.notes}</p>
        </section>
      )}

      <ReviewSection
        customerId={customer.id}
        reviewAskedAt={customer.review_asked_at}
        reviewFollowupDueAt={customer.review_followup_due_at}
        reviewLeftAt={customer.review_left_at}
        reviewUrl={customer.review_url}
      />

      <PermissionToggles
        customerId={customer.id}
        featurePermission={customer.feature_permission}
        repeatContactPermission={customer.repeat_contact_permission}
      />

      <Suspense fallback={<CardSkeleton height="h-48" radius="rounded-2xl" />}>
        <DeferredActivityTimeline customerId={id} leadId={customer.lead_id} />
      </Suspense>
    </div>
  )
}

/**
 * Defers the lead + quotes + jobs queries (3 parallel fetches) so the
 * customer header + notes paint as soon as the customers row resolves.
 * Once all three timeline-feeding queries land, the section streams in.
 */
async function DeferredActivityTimeline({
  customerId,
  leadId,
}: {
  customerId: string
  leadId: string | null
}) {
  const admin = getAdminClient()
  const leadPromise = leadId
    ? admin
        .from('leads')
        .select('id, created_at, status, service_type, message')
        .eq('id', leadId)
        .maybeSingle()
    : Promise.resolve({ data: null as TimelineLead })

  const [{ data: lead }, { data: quotes }, { data: jobs }] = await Promise.all([
    leadPromise,
    admin
      .from('quotes')
      .select('id, created_at, quote_number, status, total')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false }),
    admin
      .from('jobs')
      .select('id, created_at, job_number, status, job_type, scheduled_date')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false }),
  ])

  return (
    <ActivityTimeline
      lead={(lead ?? null) as TimelineLead}
      quotes={(quotes ?? []) as TimelineQuote[]}
      jobs={(jobs ?? []) as TimelineJob[]}
    />
  )
}
