export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import { fmtUSD } from '@/lib/format'
import { KPICard } from '@/components/hq/KPICard'
import { ChartContainer } from '@/components/hq/ChartContainer'
import { Sparkline } from '@/components/hq/Sparkline'
import { Funnel } from '@/components/hq/Funnel'
import LeadsTable from './components/LeadsTable'

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
    db.from('quotes').select('status, total, sent_at'),
    db.from('jobs').select('status, total_contract, completed_date, scheduled_date'),
    db.from('permit_leads').select('status'),
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

  // Operations
  const jobsThisWeek = J.filter(j =>
    j.scheduled_date &&
    j.scheduled_date >= weekStart.slice(0, 10) &&
    j.scheduled_date <= weekEnd.slice(0, 10)
  ).length
  const hotLeads = L.filter(l => l.timeline === 'asap' && l.status === 'new').length

  // Lead pipeline pill row
  const counts = {
    new: L.filter(l => l.status === 'new').length,
    contacted: L.filter(l => l.status === 'contacted').length,
    quoted: L.filter(l => l.status === 'quoted').length,
    won: L.filter(l => l.status === 'won').length,
  }

  // Sparklines
  const leads30dSpark = bucketByDay(leads30d.map(l => l.created_at), 30)
  const revenueMtdSpark = cumulativeByDayOfMonth(
    J.filter(j => j.completed_date && (j.total_contract ?? 0) > 0)
      .map(j => ({ date: j.completed_date!, amount: Number(j.total_contract ?? 0) })),
  )

  // Funnel: Leads → Customers (with lead_id) → Quotes (sent) → Jobs (won/completed)
  const funnelData = [
    { label: 'Leads',     value: L.length },
    { label: 'Customers', value: C.filter(c => c.lead_id !== null).length },
    { label: 'Quotes',    value: Q.filter(q => ['sent', 'accepted', 'declined'].includes(q.status)).length },
    { label: 'Jobs won',  value: J.filter(j => ['scheduled', 'in_progress', 'completed'].includes(j.status)).length },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Pipeline */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pipeline</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KPICard label="Open leads" value={String(openLeads)} sub="Not won/lost" accent="blue">
            <Sparkline data={leads30dSpark} color="#1e6bd6" />
          </KPICard>
          <KPICard label="Active permits" value={String(activePermitLeads)} sub="new · called · qualified" accent="indigo" />
          <KPICard label="Pipeline value" value={fmtUSD(pipelineValue)} sub="Draft + sent quotes" accent="sky" />
        </div>
      </div>

      {/* Conversion */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Conversion</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KPICard label="Lead → Customer" value={`${leadConvRate}%`} sub={`Last 30 days (${customers30d.length}/${leads30d.length})`} accent="purple" />
          <KPICard label="Quote acceptance" value={`${quoteAcceptRate}%`} sub={`${accepted.length}/${sentOrAccepted.length} sent quotes`} accent="fuchsia" />
        </div>
      </div>

      {/* Revenue */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Revenue</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KPICard label="Revenue this month" value={fmtUSD(revenueThisMonth)} sub="Completed jobs" accent="green">
            <Sparkline data={revenueMtdSpark} color="#059669" />
          </KPICard>
          <KPICard label="Avg deal size" value={fmtUSD(Math.round(avgDealSize))} sub={`Across ${completedJobs.length} jobs`} accent="emerald" />
        </div>
      </div>

      {/* Operations */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Operations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KPICard label="Jobs this week" value={String(jobsThisWeek)} sub="Scheduled" accent="amber" />
          <KPICard label="Hot leads" value={String(hotLeads)} sub="ASAP + new" accent="red" />
        </div>
      </div>

      {/* Lead pipeline pill row */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Lead Pipeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'New',       count: counts.new,       style: 'bg-blue-50 border-blue-200 text-blue-800' },
            { label: 'Contacted', count: counts.contacted, style: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
            { label: 'Quoted',    count: counts.quoted,    style: 'bg-purple-50 border-purple-200 text-purple-800' },
            { label: 'Won',       count: counts.won,       style: 'bg-green-50 border-green-200 text-green-800' },
          ].map(({ label, count, style }) => (
            <div key={label} className={`rounded-xl border p-4 ${style}`}>
              <div className="text-3xl font-bold">{count}</div>
              <div className="text-sm font-medium mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Funnel */}
      <div className="mb-8">
        <ChartContainer
          title="Sales funnel"
          subtitle="All-time lead → customer → quote → job conversion"
          empty={L.length === 0}
          emptyMessage="No leads yet. First lead will populate the funnel."
        >
          <Funnel data={funnelData} />
        </ChartContainer>
      </div>

      <h2 className="text-lg font-bold mb-3">Recent Leads</h2>
      <LeadsTable initialLeads={recentLeadsForTable ?? []} emailEvents={latestEventByLead} />
    </div>
  )
}
