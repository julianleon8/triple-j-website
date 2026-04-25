export const dynamic = 'force-dynamic'

import Link from 'next/link'
import {
  ArrowLeft,
  Inbox,
  FileText,
  Briefcase,
  UserPlus,
  Receipt as ReceiptIcon,
  Star,
  XCircle,
  CheckCircle2,
} from 'lucide-react'
import { getAdminClient } from '@/lib/supabase/admin'

type ActivityEvent = {
  id: string
  at: string
  kind:
    | 'lead_new'
    | 'lead_won'
    | 'lead_lost'
    | 'customer_new'
    | 'quote_sent'
    | 'quote_accepted'
    | 'quote_declined'
    | 'job_scheduled'
    | 'job_completed'
    | 'receipt_pushed'
    | 'review_left'
  title: string
  subtitle: string | null
  href: string | null
}

const KIND_META: Record<ActivityEvent['kind'], { icon: typeof Inbox; tone: string; label: string }> = {
  lead_new:        { icon: Inbox,       tone: 'text-(--brand-fg)',          label: 'New lead' },
  lead_won:        { icon: CheckCircle2, tone: 'text-green-600 dark:text-green-400', label: 'Lead won' },
  lead_lost:       { icon: XCircle,     tone: 'text-red-600 dark:text-red-400', label: 'Lead lost' },
  customer_new:    { icon: UserPlus,    tone: 'text-green-600 dark:text-green-400', label: 'New customer' },
  quote_sent:      { icon: FileText,    tone: 'text-amber-600 dark:text-amber-400', label: 'Quote sent' },
  quote_accepted:  { icon: CheckCircle2, tone: 'text-green-600 dark:text-green-400', label: 'Quote accepted' },
  quote_declined:  { icon: XCircle,     tone: 'text-red-600 dark:text-red-400', label: 'Quote declined' },
  job_scheduled:   { icon: Briefcase,   tone: 'text-(--brand-fg)',          label: 'Job scheduled' },
  job_completed:   { icon: CheckCircle2, tone: 'text-green-600 dark:text-green-400', label: 'Job completed' },
  receipt_pushed:  { icon: ReceiptIcon, tone: 'text-purple-600 dark:text-purple-400', label: 'Receipt → QBO' },
  review_left:     { icon: Star,        tone: 'text-amber-600 dark:text-amber-400', label: 'Review left' },
}

function nowMs() {
  return Date.now()
}

export default async function ActivityLogPage() {
  const db = getAdminClient()

  // Pull a window of recent events. Each table caps at 50 — the merged
  // feed below trims to 100 most-recent overall. Older history lives
  // on each entity's detail page.
  const [
    { data: leads },
    { data: customers },
    { data: quotes },
    { data: jobs },
    { data: receipts },
  ] = await Promise.all([
    db.from('leads')
      .select('id, name, status, source, created_at, won_at, lost_at, lost_reason')
      .order('created_at', { ascending: false })
      .limit(80),
    db.from('customers')
      .select('id, name, created_at, lead_id, review_left_at')
      .order('created_at', { ascending: false })
      .limit(50),
    db.from('quotes')
      .select('id, quote_number, status, total, sent_at, accepted_at, declined_at, customers(name)')
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(50),
    db.from('jobs')
      .select('id, job_number, status, scheduled_date, completed_date, customers(name)')
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(50),
    db.from('job_receipts')
      .select('id, vendor, total, qbo_pushed_at, job_id')
      .not('qbo_pushed_at', 'is', null)
      .order('qbo_pushed_at', { ascending: false, nullsFirst: false })
      .limit(30),
  ])

  const events: ActivityEvent[] = []

  for (const l of leads ?? []) {
    events.push({
      id: `lead-new-${l.id}`,
      at: l.created_at,
      kind: 'lead_new',
      title: l.name,
      subtitle: l.source ? l.source.replace(/_/g, ' ') : null,
      href: `/hq/leads/${l.id}`,
    })
    if (l.won_at) {
      events.push({
        id: `lead-won-${l.id}`,
        at: l.won_at,
        kind: 'lead_won',
        title: l.name,
        subtitle: null,
        href: `/hq/leads/${l.id}`,
      })
    }
    if (l.lost_at) {
      events.push({
        id: `lead-lost-${l.id}`,
        at: l.lost_at,
        kind: 'lead_lost',
        title: l.name,
        subtitle: l.lost_reason ? l.lost_reason.replace(/_/g, ' ') : null,
        href: `/hq/leads/${l.id}`,
      })
    }
  }

  for (const c of customers ?? []) {
    events.push({
      id: `customer-${c.id}`,
      at: c.created_at,
      kind: 'customer_new',
      title: c.name,
      subtitle: c.lead_id ? 'Converted from lead' : 'Created direct',
      href: `/hq/customers/${c.id}`,
    })
    if (c.review_left_at) {
      events.push({
        id: `review-${c.id}`,
        at: c.review_left_at,
        kind: 'review_left',
        title: c.name,
        subtitle: null,
        href: `/hq/customers/${c.id}`,
      })
    }
  }

  for (const q of quotes ?? []) {
    const customer = Array.isArray(q.customers) ? q.customers[0] : q.customers
    const cname = customer?.name ?? 'Unknown'
    if (q.sent_at) {
      events.push({
        id: `quote-sent-${q.id}`,
        at: q.sent_at,
        kind: 'quote_sent',
        title: `#${q.quote_number} · ${cname}`,
        subtitle: q.total != null ? fmtUSD(Number(q.total)) : null,
        href: `/hq/quotes/${q.id}`,
      })
    }
    if (q.accepted_at) {
      events.push({
        id: `quote-acc-${q.id}`,
        at: q.accepted_at,
        kind: 'quote_accepted',
        title: `#${q.quote_number} · ${cname}`,
        subtitle: q.total != null ? fmtUSD(Number(q.total)) : null,
        href: `/hq/quotes/${q.id}`,
      })
    }
    if (q.declined_at) {
      events.push({
        id: `quote-dec-${q.id}`,
        at: q.declined_at,
        kind: 'quote_declined',
        title: `#${q.quote_number} · ${cname}`,
        subtitle: null,
        href: `/hq/quotes/${q.id}`,
      })
    }
  }

  for (const j of jobs ?? []) {
    const customer = Array.isArray(j.customers) ? j.customers[0] : j.customers
    const cname = customer?.name ?? 'Unknown'
    if (j.scheduled_date) {
      events.push({
        id: `job-sched-${j.id}`,
        at: `${j.scheduled_date}T08:00:00Z`,
        kind: 'job_scheduled',
        title: `#${j.job_number} · ${cname}`,
        subtitle: null,
        href: `/hq/jobs/${j.id}`,
      })
    }
    if (j.completed_date) {
      events.push({
        id: `job-done-${j.id}`,
        at: `${j.completed_date}T18:00:00Z`,
        kind: 'job_completed',
        title: `#${j.job_number} · ${cname}`,
        subtitle: null,
        href: `/hq/jobs/${j.id}`,
      })
    }
  }

  for (const r of receipts ?? []) {
    if (!r.qbo_pushed_at) continue
    events.push({
      id: `receipt-${r.id}`,
      at: r.qbo_pushed_at,
      kind: 'receipt_pushed',
      title: r.vendor ?? 'Receipt',
      subtitle: r.total != null ? fmtUSD(Number(r.total)) : null,
      href: `/hq/jobs/${r.job_id}`,
    })
  }

  events.sort((a, b) => (a.at < b.at ? 1 : -1))
  const trimmed = events.slice(0, 100)

  // Group by ISO day for the date dividers.
  const groups = new Map<string, ActivityEvent[]>()
  for (const e of trimmed) {
    const day = e.at.slice(0, 10)
    const arr = groups.get(day) ?? []
    arr.push(e)
    groups.set(day, arr)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href="/hq/more" className="inline-flex items-center gap-1 text-[15px] font-medium text-(--brand-fg)">
        <ArrowLeft size={18} strokeWidth={2} /> More
      </Link>

      <header>
        <h1 className="text-[24px] font-bold text-(--text-primary)">Activity log</h1>
        <p className="mt-1 text-[14px] text-(--text-secondary)">
          Cross-table feed of the last {trimmed.length} events.
        </p>
      </header>

      {trimmed.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-(--border-strong) bg-(--surface-2) px-4 py-10 text-center text-[14px] text-(--text-secondary)">
          No activity yet. Submit a lead or create a customer to see this populate.
        </p>
      ) : (
        <div className="space-y-4">
          {[...groups.entries()].map(([day, evs]) => (
            <section key={day}>
              <h2 className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
                {formatDay(day)}
              </h2>
              <ul className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) divide-y divide-(--border-subtle)">
                {evs.map((e) => {
                  const meta = KIND_META[e.kind]
                  const Icon = meta.icon
                  const inner = (
                    <div className="flex items-center gap-3 p-3">
                      <div className={`shrink-0 ${meta.tone}`}>
                        <Icon size={18} strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-[14px] font-semibold text-(--text-primary)">
                            {e.title}
                          </span>
                          <span className="shrink-0 text-[11px] text-(--text-tertiary) tabular-nums">
                            {formatTime(e.at)}
                          </span>
                        </div>
                        <div className="text-[12px] text-(--text-secondary)">
                          <span className="font-medium">{meta.label}</span>
                          {e.subtitle ? <span className="text-(--text-tertiary)"> · {e.subtitle}</span> : null}
                        </div>
                      </div>
                    </div>
                  )
                  return (
                    <li key={e.id}>
                      {e.href ? (
                        <Link href={e.href} className="block tap-list">{inner}</Link>
                      ) : (
                        inner
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function formatDay(iso: string): string {
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  if (iso === todayKey) return 'Today'
  const yesterday = new Date(nowMs() - 86_400_000)
  const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  if (iso === yKey) return 'Yesterday'
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function fmtUSD(n: number): string {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}
