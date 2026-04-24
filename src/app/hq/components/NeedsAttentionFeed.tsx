import { getAdminClient } from '@/lib/supabase/admin'
import { PipelineList } from '@/components/hq/PipelineList'
import { buildPipeline, urgencyScore } from '@/lib/pipeline'

export async function NeedsAttentionFeed() {
  const db = getAdminClient()

  const [
    { data: leads },
    { data: permits },
    { data: quotes },
    { data: jobs },
  ] = await Promise.all([
    db.from('leads')
      .select('id, created_at, name, phone, city, zip, service_type, structure_type, timeline, is_military, status')
      .in('status', ['new', 'contacted'])
      .order('created_at', { ascending: false })
      .limit(100),
    db.from('permit_leads')
      .select('id, created_at, jurisdiction, permit_number, permit_type, address, city, valuation, wheelhouse_score, status')
      .in('status', ['new', 'called'])
      .order('created_at', { ascending: false })
      .limit(100),
    db.from('quotes')
      .select('id, created_at, quote_number, status, total, valid_until, customers(name)')
      .in('status', ['sent'])
      .order('created_at', { ascending: false })
      .limit(100),
    db.from('jobs')
      .select('id, created_at, job_number, status, job_type, city, scheduled_date, total_contract, balance_due, customers(name)')
      .in('status', ['scheduled', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  const rows = buildPipeline({
    leads:     (leads ?? []) as never,
    permits:   (permits ?? []) as never,
    customers: [],
    quotes:    (quotes ?? []) as never,
    jobs:      (jobs ?? []) as never,
  })

  const needsAttention = rows
    .map((row) => ({ row, score: urgencyScore(row) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.row)

  return (
    <section aria-label="Needs attention" className="space-y-2">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
          Needs attention
        </h2>
        <span className="text-[12px] text-(--text-tertiary)">{needsAttention.length}</span>
      </div>
      {needsAttention.length === 0 ? (
        <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-6 text-center">
          <p className="text-[14px] text-(--text-secondary)">Inbox zero. Nice.</p>
        </div>
      ) : (
        <PipelineList rows={needsAttention} hideFilters variant="messages" />
      )}
    </section>
  )
}
