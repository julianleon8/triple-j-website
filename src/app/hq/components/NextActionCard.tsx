import { getAdminClient } from '@/lib/supabase/admin'
import { buildPipeline, urgencyScore, type PipelineRow } from '@/lib/pipeline'
import { NextActionCardClient, type NextActionPayload } from './NextActionCardClient'

export async function NextActionCard() {
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
      .limit(50),
    db.from('permit_leads')
      .select('id, created_at, jurisdiction, permit_number, permit_type, address, city, valuation, wheelhouse_score, status')
      .in('status', ['new', 'called'])
      .order('created_at', { ascending: false })
      .limit(50),
    db.from('quotes')
      .select('id, created_at, quote_number, status, total, valid_until, customers(name)')
      .in('status', ['sent'])
      .order('created_at', { ascending: false })
      .limit(50),
    db.from('jobs')
      .select('id, created_at, job_number, status, job_type, city, scheduled_date, total_contract, balance_due, customers(name)')
      .in('status', ['scheduled', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const rows = buildPipeline({
    leads:     (leads ?? []) as never,
    permits:   (permits ?? []) as never,
    customers: [],
    quotes:    (quotes ?? []) as never,
    jobs:      (jobs ?? []) as never,
  })

  const scored = rows
    .map((row) => ({ row, score: urgencyScore(row) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)

  if (scored.length === 0) {
    return <NextActionCardClient payload={null} />
  }

  const top = scored[0].row
  const payload: NextActionPayload = {
    row: top,
    reason: reasonFor(top),
    callHref: callHrefFor(top, leads ?? []),
  }

  return <NextActionCardClient payload={payload} />
}

type LeadRecord = { id: string; phone: string | null }

function callHrefFor(row: PipelineRow, leads: LeadRecord[]): string | null {
  if (row.kind !== 'lead') return null
  const lead = leads.find((l) => l.id === row.id)
  if (!lead?.phone) return null
  return `tel:${lead.phone.replace(/[^\d+]/g, '')}`
}

function reasonFor(row: PipelineRow): string {
  switch (row.kind) {
    case 'lead': {
      if (row.badges?.some((b) => b.tone === 'asap')) return 'ASAP lead'
      if (row.badges?.some((b) => b.tone === 'mil')) return 'Military lead'
      return 'New lead'
    }
    case 'permit':
      return 'Hot permit'
    case 'quote': {
      if (row.badges?.some((b) => b.tone === 'warn')) return 'Quote expiring'
      return 'Quote silent'
    }
    case 'job':
      return 'Job today'
    default:
      return 'Needs attention'
  }
}
