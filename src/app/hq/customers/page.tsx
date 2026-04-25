export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Star } from 'lucide-react'
import { getAdminClient } from '@/lib/supabase/admin'
import { customerToRow, type CustomerForRow } from '@/lib/pipeline'
import { CustomersList } from './components/CustomersList'

type ReviewDue = {
  id: string
  name: string
  review_followup_due_at: string
}

export default async function CustomersPage() {
  const admin = getAdminClient()
  const nowIso = new Date().toISOString()

  const [{ data: customers }, { data: reviewDue }] = await Promise.all([
    admin
      .from('customers')
      .select('id, created_at, name, phone, city')
      .order('created_at', { ascending: false })
      .limit(500),
    admin
      .from('customers')
      .select('id, name, review_followup_due_at')
      .lte('review_followup_due_at', nowIso)
      .is('review_left_at', null)
      .order('review_followup_due_at', { ascending: true })
      .limit(20),
  ])

  const rows = ((customers ?? []) as CustomerForRow[]).map(customerToRow)
  const dueRows = (reviewDue ?? []) as ReviewDue[]

  return (
    <div className="space-y-4">
      {dueRows.length > 0 ? (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
          <h2 className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            <Star size={14} strokeWidth={2} />
            Reviews due ({dueRows.length})
          </h2>
          <ul className="mt-2 divide-y divide-amber-500/15">
            {dueRows.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/hq/customers/${c.id}`}
                  className="flex items-center justify-between gap-3 py-2.5 tap-list"
                >
                  <span className="truncate text-[15px] font-medium text-(--text-primary)">{c.name}</span>
                  <span className="shrink-0 text-[12px] text-amber-700 dark:text-amber-300">
                    {dueAgo(c.review_followup_due_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <CustomersList rows={rows} />
    </div>
  )
}

function nowMs() {
  return Date.now()
}

function dueAgo(iso: string): string {
  const days = Math.round((nowMs() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return 'due today'
  if (days === 1) return 'due 1d ago'
  return `due ${days}d ago`
}
