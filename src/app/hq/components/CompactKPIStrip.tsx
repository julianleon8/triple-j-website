import Link from 'next/link'
import { getAdminClient } from '@/lib/supabase/admin'
import { fmtUSD } from '@/lib/format'

type Lead = { status: string; created_at: string }
type Customer = { created_at: string; lead_id: string | null }
type Quote = { status: string }
type Job = { status: string; total_contract: number | null; completed_date: string | null }

function startOfMonthIso(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

function startOfWeekIso(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.getFullYear(), d.getMonth(), diff).toISOString()
}

function daysAgoIso(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}

export async function CompactKPIStrip() {
  const db = getAdminClient()

  const [
    { data: leads },
    { data: customers },
    { data: quotes },
    { data: jobs },
  ] = await Promise.all([
    db.from('leads').select('status, created_at'),
    db.from('customers').select('created_at, lead_id'),
    db.from('quotes').select('status'),
    db.from('jobs').select('status, total_contract, completed_date'),
  ])

  const L = (leads ?? []) as Lead[]
  const C = (customers ?? []) as Customer[]
  const Q = (quotes ?? []) as Quote[]
  const J = (jobs ?? []) as Job[]

  const monthStart = startOfMonthIso()
  const weekStart = startOfWeekIso()
  const thirtyDaysAgo = daysAgoIso(30)

  const revenueMtd = J
    .filter((j) => j.completed_date && j.completed_date >= monthStart)
    .reduce((sum, j) => sum + Number(j.total_contract ?? 0), 0)

  const leadsThisWeek = L.filter((l) => l.created_at >= weekStart).length

  const sentOrResolved = Q.filter((q) => ['sent', 'accepted', 'declined'].includes(q.status))
  const accepted = Q.filter((q) => q.status === 'accepted').length
  const winRate = sentOrResolved.length > 0
    ? Math.round((accepted / sentOrResolved.length) * 100)
    : 0

  const completedJobs = J.filter((j) => j.status === 'completed' && (j.total_contract ?? 0) > 0)
  const avgTicket = completedJobs.length > 0
    ? completedJobs.reduce((sum, j) => sum + Number(j.total_contract ?? 0), 0) / completedJobs.length
    : 0

  // 30-day lead→customer context goes in the "sub" line of leads-this-week tile
  const leads30d = L.filter((l) => l.created_at >= thirtyDaysAgo).length
  const customers30d = C.filter((c) => c.created_at >= thirtyDaysAgo && c.lead_id !== null).length

  const tiles: Tile[] = [
    { label: 'Revenue MTD',    value: fmtUSD(revenueMtd),                  sub: 'Completed' },
    { label: 'Leads this wk',  value: String(leadsThisWeek),               sub: `${customers30d}/${leads30d} 30d` },
    { label: 'Win rate',       value: sentOrResolved.length ? `${winRate}%` : '—', sub: `${accepted}/${sentOrResolved.length}` },
    { label: 'Avg ticket',     value: completedJobs.length ? fmtUSD(Math.round(avgTicket)) : '—', sub: `${completedJobs.length} jobs` },
  ]

  return (
    <Link
      href="/hq/more/stats"
      aria-label="Open full stats"
      className="block active:scale-[0.99] transition-transform"
    >
      <div className="grid grid-cols-4 gap-2 rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-3">
        {tiles.map((t) => (
          <TileView key={t.label} tile={t} />
        ))}
      </div>
    </Link>
  )
}

type Tile = { label: string; value: string; sub: string }

function TileView({ tile }: { tile: Tile }) {
  return (
    <div className="min-w-0 text-center">
      <div className="text-[17px] font-bold text-(--text-primary) tabular-nums truncate">
        {tile.value}
      </div>
      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-(--text-tertiary) truncate">
        {tile.label}
      </div>
      <div className="text-[10px] text-(--text-tertiary) truncate">{tile.sub}</div>
    </div>
  )
}
