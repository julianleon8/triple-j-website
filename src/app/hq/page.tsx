export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getAdminClient } from '@/lib/supabase/admin'
import { PipelineList } from '@/components/hq/PipelineList'
import { buildPipeline } from '@/lib/pipeline'
import { RecentLeadsSection } from './components/RecentLeadsSection'
import { StatsSection } from './components/StatsSection'

type SearchParams = Promise<{ tab?: string; type?: string }>

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const { tab } = await searchParams

  if (tab === 'funnel') {
    return <FunnelTab />
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<RecentLeadsFallback />}>
        <RecentLeadsSection />
      </Suspense>

      <Suspense fallback={<StatsFallback />}>
        <StatsSection />
      </Suspense>
    </div>
  )
}

function RecentLeadsFallback() {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-bold text-(--text-primary)">Recent Leads</h2>
        <span className="text-xs text-(--text-tertiary)">Loading…</span>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl border border-(--border-subtle) bg-(--surface-2) animate-pulse"
            aria-hidden="true"
          />
        ))}
      </div>
    </section>
  )
}

function StatsFallback() {
  return (
    <div className="rounded-xl border border-(--border-subtle) bg-(--surface-2)">
      <div className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-(--text-tertiary)">
        <span>Pipeline & stats</span>
        <span className="text-xs">Loading…</span>
      </div>
    </div>
  )
}

async function FunnelTab() {
  const db = getAdminClient()

  const [
    { data: leads },
    { data: permits },
    { data: customers },
    { data: quotes },
    { data: jobs },
  ] = await Promise.all([
    db.from('leads')
      .select('id, created_at, name, phone, city, zip, service_type, structure_type, timeline, is_military, status')
      .order('created_at', { ascending: false })
      .limit(200),
    db.from('permit_leads')
      .select('id, created_at, jurisdiction, permit_number, permit_type, address, city, valuation, wheelhouse_score, status')
      .order('created_at', { ascending: false })
      .limit(200),
    db.from('customers')
      .select('id, created_at, name, phone, city')
      .order('created_at', { ascending: false })
      .limit(200),
    db.from('quotes')
      .select('id, created_at, quote_number, status, total, valid_until, customers(name)')
      .order('created_at', { ascending: false })
      .limit(200),
    db.from('jobs')
      .select('id, created_at, job_number, status, job_type, city, scheduled_date, total_contract, balance_due, customers(name)')
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  const rows = buildPipeline({
    leads:     (leads ?? []) as never,
    permits:   (permits ?? []) as never,
    customers: (customers ?? []) as never,
    quotes:    (quotes ?? []) as never,
    jobs:      (jobs ?? []) as never,
  })

  return (
    <div className="space-y-4">
      <PipelineList rows={rows} />
    </div>
  )
}
