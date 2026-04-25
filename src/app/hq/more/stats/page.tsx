export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAdminClient } from '@/lib/supabase/admin'
import { fmtUSD } from '@/lib/format'
import { KPICard } from '@/components/hq/KPICard'
import { ChartContainer } from '@/components/hq/ChartContainer'
import { Sparkline, Funnel } from '@/components/hq/LazyCharts'

type Lead = { status: string; timeline: string | null; created_at: string }
type Customer = { created_at: string; lead_id: string | null }
type Quote = { status: string; total: number | null; sent_at: string | null }
type Job = {
  status: string
  total_contract: number | null
  completed_date: string | null
  scheduled_date: string | null
}
type PermitLead = { status: string }

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
function nowMs() {
  return Date.now()
}
function isoDayKey(iso: string): string {
  return iso.slice(0, 10)
}
function bucketByDay(isoTimestamps: string[], days: number): { value: number }[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const buckets: { value: number }[] = []
  const counts: Record<string, number> = {}
  for (const ts of isoTimestamps) counts[isoDayKey(ts)] = (counts[isoDayKey(ts)] ?? 0) + 1
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400_000)
    const key = d.toISOString().slice(0, 10)
    buckets.push({ value: counts[key] ?? 0 })
  }
  return buckets
}
function cumulativeByDayOfMonth(
  entries: { date: string; amount: number }[],
): { value: number }[] {
  const now = new Date()
  const daysSoFar = now.getDate()
  const byDay: Record<number, number> = {}
  for (const e of entries) {
    const d = new Date(e.date)
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
      const k = d.getDate()
      byDay[k] = (byDay[k] ?? 0) + e.amount
    }
  }
  const out: { value: number }[] = []
  let running = 0
  for (let i = 1; i <= daysSoFar; i++) {
    running += byDay[i] ?? 0
    out.push({ value: running })
  }
  return out
}

export default async function StatsPage() {
  const db = getAdminClient()

  const [
    { data: leads },
    { data: customers },
    { data: quotes },
    { data: jobs },
    { data: permitLeads },
  ] = await Promise.all([
    db.from('leads').select('status, timeline, created_at'),
    db.from('customers').select('created_at, lead_id'),
    db.from('quotes').select('status, total, sent_at'),
    db.from('jobs').select('status, total_contract, completed_date, scheduled_date'),
    db.from('permit_leads').select('status'),
  ])

  const L = (leads ?? []) as Lead[]
  const C = (customers ?? []) as Customer[]
  const Q = (quotes ?? []) as Quote[]
  const J = (jobs ?? []) as Job[]
  const P = (permitLeads ?? []) as PermitLead[]

  const thirtyDaysAgo = daysAgoIso(30)
  const monthStart = startOfMonth()
  const weekStart = startOfWeek()
  const weekEnd = endOfWeek()

  // Pipeline
  const openLeads = L.filter(l => !['won', 'lost'].includes(l.status)).length
  const activePermitLeads = P.filter(l => ['new', 'called', 'qualified'].includes(l.status)).length
  const pipelineValue = Q
    .filter(q => ['draft', 'sent'].includes(q.status))
    .reduce((sum, q) => sum + Number(q.total ?? 0), 0)

  // Conversion
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

  // Revenue
  const revenueThisMonth = J
    .filter(j => j.completed_date && j.completed_date >= monthStart.slice(0, 10))
    .reduce((sum, j) => sum + Number(j.total_contract ?? 0), 0)
  const completedJobs = J.filter(j => j.status === 'completed' && (j.total_contract ?? 0) > 0)
  const avgDealSize = completedJobs.length > 0
    ? completedJobs.reduce((sum, j) => sum + Number(j.total_contract ?? 0), 0) / completedJobs.length
    : 0
  const balanceDue = J
    .filter(j => ['scheduled', 'in_progress', 'completed'].includes(j.status))
    .reduce((sum, j) => sum + Math.max(0, Number(j.total_contract ?? 0) - 0), 0)

  // Operations
  const jobsThisWeek = J.filter(j =>
    j.scheduled_date &&
    j.scheduled_date >= weekStart.slice(0, 10) &&
    j.scheduled_date <= weekEnd.slice(0, 10)
  ).length
  const jobsInProgress = J.filter(j => j.status === 'in_progress').length
  const hotLeads = L.filter(l => l.timeline === 'asap' && l.status === 'new').length
  const _now = nowMs()
  const staleLeads = L.filter(l => {
    if (l.status !== 'new') return false
    const ageH = (_now - new Date(l.created_at).getTime()) / 3_600_000
    return ageH > 12
  }).length

  // Sparklines
  const leads30dSpark = bucketByDay(leads30d.map(l => l.created_at), 30)
  const revenueMtdSpark = cumulativeByDayOfMonth(
    J.filter(j => j.completed_date && (j.total_contract ?? 0) > 0)
      .map(j => ({ date: j.completed_date!, amount: Number(j.total_contract ?? 0) })),
  )

  // Funnel: Leads → Customers (with lead_id) → Quotes (sent/acc/dec) → Jobs (active or done)
  const funnelData = [
    { label: 'Leads',     value: L.length },
    { label: 'Customers', value: C.filter(c => c.lead_id !== null).length },
    { label: 'Quotes',    value: Q.filter(q => ['sent', 'accepted', 'declined'].includes(q.status)).length },
    { label: 'Jobs',      value: J.filter(j => ['scheduled', 'in_progress', 'completed'].includes(j.status)).length },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link href="/hq/more" className="inline-flex items-center gap-1 text-[15px] font-medium text-(--brand-fg)">
        <ArrowLeft size={18} strokeWidth={2} /> More
      </Link>

      <StatsGroup title="Pipeline">
        <KPICard label="Open leads" value={String(openLeads)} sub="Not won/lost" accent="blue">
          <Sparkline data={leads30dSpark} color="#1e6bd6" />
        </KPICard>
        <KPICard label="Active permits" value={String(activePermitLeads)} sub="new · called · qualified" accent="indigo" />
        <KPICard label="Pipeline value" value={fmtUSD(pipelineValue)} sub="Draft + sent quotes" accent="sky" />
      </StatsGroup>

      <StatsGroup title="Conversion">
        <KPICard
          label="Lead → Customer"
          value={`${leadConvRate}%`}
          sub={`Last 30 days (${customers30d.length}/${leads30d.length})`}
          accent="purple"
        />
        <KPICard
          label="Quote acceptance"
          value={`${quoteAcceptRate}%`}
          sub={`${accepted.length}/${sentOrAccepted.length} sent quotes`}
          accent="fuchsia"
        />
      </StatsGroup>

      <StatsGroup title="Revenue">
        <KPICard label="Revenue this month" value={fmtUSD(revenueThisMonth)} sub="Completed jobs" accent="green">
          <Sparkline data={revenueMtdSpark} color="#059669" />
        </KPICard>
        <KPICard label="Avg deal size" value={fmtUSD(Math.round(avgDealSize))} sub={`${completedJobs.length} completed jobs`} accent="emerald" />
        <KPICard label="Balance due" value={fmtUSD(balanceDue)} sub="Open + in-progress jobs" accent="amber" />
      </StatsGroup>

      <StatsGroup title="Operations">
        <KPICard label="Jobs this week" value={String(jobsThisWeek)} sub="Scheduled" accent="amber" />
        <KPICard label="In progress" value={String(jobsInProgress)} sub="Active now" accent="brand" />
        <KPICard label="Hot leads" value={String(hotLeads)} sub="ASAP + new" accent="red" />
        <KPICard label="Stale leads" value={String(staleLeads)} sub=">12h untouched" accent="red" />
      </StatsGroup>

      <ChartContainer
        title="Sales funnel"
        subtitle="All-time lead → customer → quote → job"
        empty={L.length === 0}
        emptyMessage="No leads yet. First lead will populate the funnel."
      >
        <Funnel data={funnelData} />
      </ChartContainer>
    </div>
  )
}

function StatsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {children}
      </div>
    </section>
  )
}
