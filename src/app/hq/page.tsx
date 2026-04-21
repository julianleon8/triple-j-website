export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import LeadsTable from './components/LeadsTable'
import { PageHeader } from './components/PageHeader'
import {
  FunnelChart,
  KpiCard,
  PermitPipelineChart,
  StatusPill,
  TrendChart,
} from './components/Charts'
import { bucketByDay, sumByDay } from './lib/metrics'
import type { FunnelStep, PipelineRow } from './components/Charts'

type Lead = { status: string; timeline: string | null; created_at: string }
type Customer = { created_at: string; lead_id: string | null }
type Quote = { status: string; total: number | null; created_at: string }
type Job = {
  status: string
  total_contract: number | null
  completed_date: string | null
  scheduled_date: string | null
  created_at: string
}
type PermitLead = { status: string; jurisdiction: string }

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
}
function startOfWeek(d = new Date()) {
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.getFullYear(), d.getMonth(), diff).toISOString()
}
function endOfWeek(d = new Date()) {
  const day = d.getDay()
  const diff = d.getDate() - day + 6
  return new Date(d.getFullYear(), d.getMonth(), diff, 23, 59, 59).toISOString()
}
function daysAgoIso(n: number) {
  return new Date(Date.now() - n * 86400_000).toISOString()
}

function fmtUSD(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n.toLocaleString()}`
}

function titleCase(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default async function DashboardPage() {
  const db = getAdminClient()

  const [
    { data: leads },
    { data: customers },
    { data: quotes },
    { data: jobs },
    { data: permitLeads },
    { data: recentLeadsForTable },
    { data: recentEmailEvents },
  ] = await Promise.all([
    db.from('leads').select('status, timeline, created_at'),
    db.from('customers').select('created_at, lead_id'),
    db.from('quotes').select('status, total, created_at'),
    db.from('jobs').select('status, total_contract, completed_date, scheduled_date, created_at'),
    db.from('permit_leads').select('status, jurisdiction'),
    db.from('leads').select('*').order('created_at', { ascending: false }).limit(100),
    db
      .from('email_events')
      .select('lead_id, event_type, occurred_at')
      .not('lead_id', 'is', null)
      .in('event_type', ['email.opened', 'email.clicked', 'email.delivered'])
      .order('occurred_at', { ascending: false })
      .limit(500),
  ])

  const latestEventByLead: Record<string, { event_type: string; occurred_at: string }> = {}
  for (const e of (recentEmailEvents ?? []) as { lead_id: string; event_type: string; occurred_at: string }[]) {
    if (!latestEventByLead[e.lead_id]) latestEventByLead[e.lead_id] = { event_type: e.event_type, occurred_at: e.occurred_at }
  }

  const L = (leads ?? []) as Lead[]
  const C = (customers ?? []) as Customer[]
  const Q = (quotes ?? []) as Quote[]
  const J = (jobs ?? []) as Job[]
  const P = (permitLeads ?? []) as PermitLead[]

  const thirtyDaysAgo = daysAgoIso(30)
  const monthStart = startOfMonth()
  const weekStart = startOfWeek()
  const weekEnd = endOfWeek()

  // ── KPI headline numbers ────────────────────────────────────────────────────
  const openLeads = L.filter(l => !['won', 'lost'].includes(l.status)).length
  const activePermitLeads = P.filter(l => ['new', 'called', 'qualified'].includes(l.status)).length
  const pipelineValue = Q
    .filter(q => ['draft', 'sent'].includes(q.status))
    .reduce((sum, q) => sum + Number(q.total ?? 0), 0)

  const leads30d = L.filter(l => l.created_at >= thirtyDaysAgo)
  const customers30d = C.filter(c => c.created_at >= thirtyDaysAgo && c.lead_id !== null)
  const leadConvRate = leads30d.length > 0
    ? Math.round((customers30d.length / leads30d.length) * 100)
    : 0

  const sentOrAccepted = Q.filter(q => ['sent', 'accepted', 'declined'].includes(q.status))
  const accepted = Q.filter(q => q.status === 'accepted')
  const quoteAcceptRate = sentOrAccepted.length > 0
    ? Math.round((accepted.length / sentOrAccepted.length) * 100)
    : 0

  const revenueThisMonth = J
    .filter(j => j.completed_date && j.completed_date >= monthStart.slice(0, 10))
    .reduce((sum, j) => sum + Number(j.total_contract ?? 0), 0)

  const completedJobs = J.filter(j => j.status === 'completed' && (j.total_contract ?? 0) > 0)
  const avgDealSize = completedJobs.length > 0
    ? completedJobs.reduce((sum, j) => sum + Number(j.total_contract ?? 0), 0) / completedJobs.length
    : 0

  const jobsThisWeek = J.filter(j =>
    j.scheduled_date &&
    j.scheduled_date >= weekStart.slice(0, 10) &&
    j.scheduled_date <= weekEnd.slice(0, 10)
  ).length
  const hotLeads = L.filter(l => l.timeline === 'asap' && l.status === 'new').length

  // ── 30-day sparkline series ─────────────────────────────────────────────────
  const leadsTrend = bucketByDay(L.map(l => ({ created_at: l.created_at })))
  const customersTrend = bucketByDay(C.map(c => ({ created_at: c.created_at })))
  const quotesSentOrAcceptedRows = Q
    .filter(q => ['sent', 'accepted'].includes(q.status))
    .map(q => ({ created_at: q.created_at, amount: q.total }))
  const pipelineTrend = sumByDay(quotesSentOrAcceptedRows)
  const revenueTrend = sumByDay(
    J
      .filter(j => j.status === 'completed' && j.completed_date)
      .map(j => ({ created_at: j.completed_date!, amount: j.total_contract }))
  )

  // ── Funnel (last 30 days) ───────────────────────────────────────────────────
  const quotes30d = Q.filter(q => q.created_at >= thirtyDaysAgo)
  const funnel: FunnelStep[] = [
    { name: 'Leads', value: leads30d.length },
    { name: 'Customers', value: customers30d.length },
    { name: 'Quotes sent', value: quotes30d.filter(q => ['sent', 'accepted', 'declined'].includes(q.status)).length },
    { name: 'Accepted', value: quotes30d.filter(q => q.status === 'accepted').length },
    { name: 'Completed', value: J.filter(j => j.completed_date && j.completed_date >= thirtyDaysAgo.slice(0, 10)).length },
  ]

  // ── Permit pipeline by jurisdiction ─────────────────────────────────────────
  const byJurisdiction = new Map<string, PipelineRow>()
  for (const pl of P) {
    const key = pl.jurisdiction
    const row =
      byJurisdiction.get(key) ??
      { jurisdiction: titleCase(key), new: 0, called: 0, qualified: 0, won: 0, lost: 0 }
    const status = pl.status as keyof Omit<PipelineRow, 'jurisdiction'>
    if (status in row) row[status] += 1
    byJurisdiction.set(key, row)
  }
  const pipelineRows = Array.from(byJurisdiction.values())

  // ── Lead pipeline pill row ──────────────────────────────────────────────────
  const counts = {
    new: L.filter(l => l.status === 'new').length,
    contacted: L.filter(l => l.status === 'contacted').length,
    quoted: L.filter(l => l.status === 'quoted').length,
    won: L.filter(l => l.status === 'won').length,
  }

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Dashboard"
        subtitle="Live pipeline, conversion, and revenue — rolling 30 days."
      />

      {/* Lead pipeline pills */}
      <section className="mb-8">
        <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[color:var(--color-ink-400)] mb-3">
          Lead Pipeline
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatusPill label="New" count={counts.new} tone="new" />
          <StatusPill label="Contacted" count={counts.contacted} tone="contacted" />
          <StatusPill label="Quoted" count={counts.quoted} tone="quoted" />
          <StatusPill label="Won" count={counts.won} tone="won" />
        </div>
      </section>

      {/* KPI grid */}
      <section className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Open leads"
          value={String(openLeads)}
          sub="Not won/lost"
          trend={leadsTrend}
          tone="brand"
        />
        <KpiCard
          label="Active permits"
          value={String(activePermitLeads)}
          sub="new · called · qualified"
          tone="neutral"
        />
        <KpiCard
          label="Pipeline value"
          value={fmtUSD(pipelineValue)}
          sub="Draft + sent quotes"
          trend={pipelineTrend}
          tone="brand"
        />
        <KpiCard
          label="Revenue (MTD)"
          value={fmtUSD(revenueThisMonth)}
          sub="Completed jobs"
          trend={revenueTrend}
          tone="success"
        />
        <KpiCard
          label="Lead → Customer"
          value={`${leadConvRate}%`}
          sub={`${customers30d.length}/${leads30d.length} (30d)`}
          tone="brand"
        />
        <KpiCard
          label="Quote acceptance"
          value={`${quoteAcceptRate}%`}
          sub={`${accepted.length}/${sentOrAccepted.length} sent`}
          tone="brand"
        />
        <KpiCard
          label="Avg deal size"
          value={fmtUSD(Math.round(avgDealSize))}
          sub={`Across ${completedJobs.length} jobs`}
          tone="neutral"
        />
        <KpiCard
          label="Hot leads"
          value={String(hotLeads)}
          sub={`${jobsThisWeek} jobs this week`}
          tone="warning"
        />
      </section>

      {/* Trend + Funnel side by side */}
      <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[color:var(--color-ink-100)] bg-white p-5">
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[color:var(--color-ink-400)] mb-3">
            Activity · last 30 days
          </div>
          <TrendChart
            series={[
              { label: 'Leads', color: '#1e6bd6', data: leadsTrend },
              { label: 'Customers', color: '#15803d', data: customersTrend },
            ]}
          />
        </div>
        <div className="rounded-xl border border-[color:var(--color-ink-100)] bg-white p-5">
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[color:var(--color-ink-400)] mb-3">
            Conversion funnel · last 30 days
          </div>
          <FunnelChart data={funnel} />
        </div>
      </section>

      {/* Permit pipeline */}
      <section className="mb-8">
        <div className="rounded-xl border border-[color:var(--color-ink-100)] bg-white p-5">
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[color:var(--color-ink-400)] mb-3">
            Permit leads by jurisdiction
          </div>
          <PermitPipelineChart data={pipelineRows} />
        </div>
      </section>

      {/* Recent leads table */}
      <section>
        <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[color:var(--color-ink-400)] mb-3">
          Recent leads
        </div>
        <LeadsTable initialLeads={recentLeadsForTable ?? []} emailEvents={latestEventByLead} />
      </section>
    </div>
  )
}
