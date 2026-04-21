export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import LeadsTable from './components/LeadsTable'

type Lead = { status: string; timeline: string | null; created_at: string }
type Customer = { created_at: string; lead_id: string | null }
type Quote = { status: string; total: number | null }
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

function fmtUSD(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n.toLocaleString()}`
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
    db.from('quotes').select('status, total'),
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

  // Most-recent event per lead (first match wins because rows come back desc)
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

  const kpiSections: { title: string; cards: { label: string; value: string; sub?: string; style: string }[] }[] = [
    {
      title: 'Pipeline',
      cards: [
        { label: 'Open leads', value: String(openLeads), sub: 'Not won/lost', style: 'bg-blue-50 border-blue-200 text-blue-900' },
        { label: 'Active permits', value: String(activePermitLeads), sub: 'new · called · qualified', style: 'bg-indigo-50 border-indigo-200 text-indigo-900' },
        { label: 'Pipeline value', value: fmtUSD(pipelineValue), sub: 'Draft + sent quotes', style: 'bg-sky-50 border-sky-200 text-sky-900' },
      ],
    },
    {
      title: 'Conversion',
      cards: [
        { label: 'Lead → Customer', value: `${leadConvRate}%`, sub: `Last 30 days (${customers30d.length}/${leads30d.length})`, style: 'bg-purple-50 border-purple-200 text-purple-900' },
        { label: 'Quote acceptance', value: `${quoteAcceptRate}%`, sub: `${accepted.length}/${sentOrAccepted.length} sent quotes`, style: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900' },
      ],
    },
    {
      title: 'Revenue',
      cards: [
        { label: 'Revenue this month', value: fmtUSD(revenueThisMonth), sub: 'Completed jobs', style: 'bg-green-50 border-green-200 text-green-900' },
        { label: 'Avg deal size', value: fmtUSD(Math.round(avgDealSize)), sub: `Across ${completedJobs.length} jobs`, style: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
      ],
    },
    {
      title: 'Operations',
      cards: [
        { label: 'Jobs this week', value: String(jobsThisWeek), sub: 'Scheduled', style: 'bg-amber-50 border-amber-200 text-amber-900' },
        { label: 'Hot leads', value: String(hotLeads), sub: 'ASAP + new', style: 'bg-red-50 border-red-200 text-red-900' },
      ],
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* KPI grid */}
      <div className="space-y-6 mb-8">
        {kpiSections.map(section => (
          <div key={section.title}>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.cards.map(card => (
                <div key={card.label} className={`rounded-xl border p-4 ${card.style}`}>
                  <div className="text-3xl font-bold">{card.value}</div>
                  <div className="text-sm font-semibold mt-1">{card.label}</div>
                  {card.sub && <div className="text-xs opacity-70 mt-0.5">{card.sub}</div>}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Lead pipeline pill row */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Lead Pipeline
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'New', count: counts.new, style: 'bg-blue-50 border-blue-200 text-blue-800' },
              { label: 'Contacted', count: counts.contacted, style: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
              { label: 'Quoted', count: counts.quoted, style: 'bg-purple-50 border-purple-200 text-purple-800' },
              { label: 'Won', count: counts.won, style: 'bg-green-50 border-green-200 text-green-800' },
            ].map(({ label, count, style }) => (
              <div key={label} className={`rounded-xl border p-4 ${style}`}>
                <div className="text-3xl font-bold">{count}</div>
                <div className="text-sm font-medium mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-3">Recent Leads</h2>
      <LeadsTable initialLeads={recentLeadsForTable ?? []} emailEvents={latestEventByLead} />
    </div>
  )
}
