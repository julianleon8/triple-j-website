export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAdminClient } from '@/lib/supabase/admin'
import { fmtUSD } from '@/lib/format'
import { KPICard } from '@/components/hq/KPICard'
import { ChartContainer } from '@/components/hq/ChartContainer'
import { Sparkline, Funnel } from '@/components/hq/LazyCharts'

type Lead = {
  status: string
  timeline: string | null
  created_at: string
  source: string | null
  utm_source: string | null
  utm_campaign: string | null
  first_response_at: string | null
  won_at: string | null
  lost_reason: string | null
}
type Customer = { created_at: string; lead_id: string | null }
type Quote = { status: string; total: number | null; sent_at: string | null }
type Job = {
  status: string
  total_contract: number | null
  completed_date: string | null
  scheduled_date: string | null
  gross_profit_cached: number | null
  gross_margin_cached: number | null
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
function topBucket(values: (string | null)[]): { key: string; count: number } | null {
  const counts = new Map<string, number>()
  for (const v of values) {
    if (!v) continue
    counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  let best: { key: string; count: number } | null = null
  for (const [k, c] of counts) {
    if (!best || c > best.count) best = { key: k, count: c }
  }
  return best
}

function countBuckets(values: (string | null)[]): { key: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const v of values) {
    if (!v) continue
    counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
}

function countAmounts(rows: { cost_type: string; amount: number }[]): { key: string; total: number }[] {
  const totals = new Map<string, number>()
  for (const r of rows) {
    totals.set(r.cost_type, (totals.get(r.cost_type) ?? 0) + Number(r.amount))
  }
  return [...totals.entries()]
    .map(([key, total]) => ({ key, total }))
    .sort((a, b) => b.total - a.total)
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

function readableLabel(s: string): string {
  return s.replace(/_/g, ' ')
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
    { data: jobCosts },
  ] = await Promise.all([
    db.from('leads').select('status, timeline, created_at, source, utm_source, utm_campaign, first_response_at, won_at, lost_reason'),
    db.from('customers').select('created_at, lead_id'),
    db.from('quotes').select('status, total, sent_at'),
    db.from('jobs').select('status, total_contract, completed_date, scheduled_date, gross_profit_cached, gross_margin_cached'),
    db.from('permit_leads').select('status'),
    db.from('job_costs').select('cost_type, amount'),
  ])

  const L = (leads ?? []) as Lead[]
  const C = (customers ?? []) as Customer[]
  const Q = (quotes ?? []) as Quote[]
  const J = (jobs ?? []) as Job[]
  const P = (permitLeads ?? []) as PermitLead[]
  const JC = (jobCosts ?? []) as Array<{ cost_type: string; amount: number }>

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

  // Attribution (migration 014) — top buckets by source / utm_*
  const topSource = topBucket(L.map(l => l.source))
  const topUtmSource = topBucket(L.map(l => l.utm_source))
  const topUtmCampaign = topBucket(L.map(l => l.utm_campaign))
  const paidShare = L.length > 0
    ? Math.round((L.filter(l => l.utm_source).length / L.length) * 100)
    : 0

  // Pipeline Health (migration 015) — first response, time-to-won, top loss reason
  const respondedLeads = L.filter(l => l.first_response_at)
  const responseMins = respondedLeads.map(l => Math.max(0,
    (new Date(l.first_response_at!).getTime() - new Date(l.created_at).getTime()) / 60_000,
  ))
  const medianRespondMin = median(responseMins)
  const wonLeads = L.filter(l => l.won_at)
  const timeToWonDays = wonLeads.map(l => Math.max(0,
    (new Date(l.won_at!).getTime() - new Date(l.created_at).getTime()) / 86_400_000,
  ))
  const medianWonDays = median(timeToWonDays)
  const topLossReason = topBucket(L.map(l => l.lost_reason))
  const lostReasonCounts = countBuckets(L.map(l => l.lost_reason))

  // Job Economics (migrations 016/017/018/020)
  const jobsWithMargin = J.filter(j => j.gross_margin_cached != null)
  const avgMargin = jobsWithMargin.length > 0
    ? jobsWithMargin.reduce((s, j) => s + Number(j.gross_margin_cached ?? 0), 0) / jobsWithMargin.length
    : 0
  const lowMarginJobs = J.filter(j =>
    j.gross_margin_cached != null && Number(j.gross_margin_cached) < 0.20,
  ).length
  const totalRevenueCompleted = J
    .filter(j => j.status === 'completed' && (j.total_contract ?? 0) > 0)
    .reduce((s, j) => s + Number(j.total_contract ?? 0), 0)
  const laborSpend = JC
    .filter(c => c.cost_type === 'labor')
    .reduce((s, c) => s + Number(c.amount), 0)
  const laborShareOfRevenue = totalRevenueCompleted > 0
    ? Math.round((laborSpend / totalRevenueCompleted) * 100)
    : 0
  // Cost-by-type totals
  const costByType = countAmounts(JC)

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

      <StatsGroup title="Attribution">
        <KPICard
          label="Top source"
          value={topSource ? readableLabel(topSource.key) : '—'}
          sub={topSource ? `${topSource.count} leads` : 'No data'}
          accent="brand"
        />
        <KPICard
          label="Top UTM source"
          value={topUtmSource ? topUtmSource.key : '—'}
          sub={topUtmSource ? `${topUtmSource.count} leads` : 'No tagged leads yet'}
          accent="sky"
        />
        <KPICard
          label="Top campaign"
          value={topUtmCampaign ? topUtmCampaign.key : '—'}
          sub={topUtmCampaign ? `${topUtmCampaign.count} leads` : 'No tagged leads yet'}
          accent="indigo"
        />
        <KPICard
          label="Paid share"
          value={`${paidShare}%`}
          sub="Leads with utm_source"
          accent="purple"
        />
      </StatsGroup>

      <StatsGroup title="Pipeline Health">
        <KPICard
          label="Median first response"
          value={medianRespondMin > 0 ? formatDuration(medianRespondMin) : '—'}
          sub={`${respondedLeads.length} responded leads`}
          accent="green"
        />
        <KPICard
          label="Median time to won"
          value={medianWonDays > 0 ? `${medianWonDays.toFixed(1)}d` : '—'}
          sub={`${wonLeads.length} won leads`}
          accent="emerald"
        />
        <KPICard
          label="Top loss reason"
          value={topLossReason ? readableLabel(topLossReason.key) : '—'}
          sub={topLossReason ? `${topLossReason.count} leads` : 'No lost leads'}
          accent="red"
        />
      </StatsGroup>

      <StatsGroup title="Job Economics">
        <KPICard
          label="Avg gross margin"
          value={jobsWithMargin.length > 0 ? `${(avgMargin * 100).toFixed(1)}%` : '—'}
          sub={`${jobsWithMargin.length} jobs with cached margin`}
          accent="emerald"
        />
        <KPICard
          label="Low-margin jobs"
          value={String(lowMarginJobs)}
          sub="Below 20% gross margin"
          accent="amber"
        />
        <KPICard
          label="Labor share"
          value={`${laborShareOfRevenue}%`}
          sub={`${fmtUSD(laborSpend)} of ${fmtUSD(totalRevenueCompleted)}`}
          accent="purple"
        />
      </StatsGroup>

      {costByType.length > 0 ? (
        <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-4">
          <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
            Spend by cost type
          </h2>
          <ul className="space-y-2">
            {costByType.map((row) => {
              const grand = costByType.reduce((s, r) => s + r.total, 0)
              const pct = grand > 0 ? Math.round((row.total / grand) * 100) : 0
              return (
                <li key={row.key}>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="capitalize text-(--text-primary)">{readableLabel(row.key)}</span>
                    <span className="tabular-nums text-(--text-secondary)">{fmtUSD(row.total)} · {pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-(--surface-3)">
                    <div className="h-full bg-(--brand-fg)" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {lostReasonCounts.length > 0 ? (
        <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-4">
          <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
            Loss reason breakdown
          </h2>
          <ul className="space-y-2">
            {lostReasonCounts.map((row) => {
              const pct = Math.round((row.count / lostReasonCounts.reduce((s, r) => s + r.count, 0)) * 100)
              return (
                <li key={row.key}>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="capitalize text-(--text-primary)">{readableLabel(row.key)}</span>
                    <span className="tabular-nums text-(--text-secondary)">{row.count} · {pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-(--surface-3)">
                    <div className="h-full bg-red-500" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

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

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`
  const hours = minutes / 60
  if (hours < 24) return `${hours.toFixed(1)}h`
  return `${(hours / 24).toFixed(1)}d`
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
