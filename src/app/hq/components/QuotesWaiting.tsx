import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getAdminClient } from '@/lib/supabase/admin'
import { QUOTE_STALL_HOURS } from '@/lib/pipeline'
import { fmtUSD } from '@/lib/format'

type QuoteRow = {
  id: string
  quote_number: string
  total: number | null
  valid_until: string | null
  sent_at: string | null
  customers: { name: string } | null
}

/**
 * Staleness is measured from `sent_at`, never `created_at` — a quote that sat
 * in draft for a week is not overdue for an answer. An unknown `sent_at` is
 * never stale. (Locked Decisions: "Quote staleness is measured from sent_at".)
 */
function isStale(sentAt: string | null): boolean {
  if (!sentAt) return false
  const hours = (Date.now() - new Date(sentAt).getTime()) / 3_600_000
  return hours >= QUOTE_STALL_HOURS
}

/** "expires in 2d" / "expired" / null when there is no date to speak of. */
function expiryLabel(validUntil: string | null): { text: string; urgent: boolean } | null {
  if (!validUntil) return null
  const days = Math.ceil((new Date(validUntil).getTime() - Date.now()) / 86_400_000)
  if (days < 0) return { text: 'expired', urgent: true }
  if (days === 0) return { text: 'expires today', urgent: true }
  return { text: `expires in ${days}d`, urgent: days <= 2 }
}

/** Oldest-sent first; the rest are one tap away on /hq/quotes. */
const SHOWN = 10

export async function QuotesWaiting() {
  // `count: 'exact'` reports every matching row, not just the ten fetched —
  // the heading must not call ten "the number waiting" when there are more.
  const { data, count } = await getAdminClient()
    .from('quotes')
    .select('id, quote_number, total, valid_until, sent_at, customers(name)', { count: 'exact' })
    .eq('status', 'sent')
    .order('sent_at', { ascending: true, nullsFirst: false })
    .limit(SHOWN)

  const quotes = (data ?? []) as unknown as QuoteRow[]
  if (quotes.length === 0) return null
  const total = count ?? quotes.length

  return (
    <section aria-labelledby="quotes-waiting-heading">
      <h2
        id="quotes-waiting-heading"
        className="mb-2 flex items-baseline gap-2 font-display text-[14px] font-bold uppercase tracking-[0.06em] text-(--text-secondary)"
      >
        Quotes waiting on an answer
        <span className="font-mono text-[11px] tracking-[0.04em] text-(--text-tertiary)">
          {total}
        </span>
      </h2>

      <ul className="overflow-hidden rounded-md border border-(--border-subtle) bg-(--surface-2)">
        {quotes.map((q) => {
          const expiry = expiryLabel(q.valid_until)
          const stale = isStale(q.sent_at)
          return (
            <li key={q.id} className="border-b border-(--border-subtle) last:border-b-0">
              <Link
                href={`/hq/quotes/${q.id}`}
                className="tap-list flex min-h-[66px] items-center gap-3 px-4 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[17px] font-semibold text-(--text-primary)">
                    {q.customers?.name ?? 'Unknown customer'}
                  </p>
                  <p
                    className={`mt-0.5 truncate font-mono text-[11px] uppercase tracking-[0.04em] ${
                      expiry?.urgent || stale ? 'text-hq-red' : 'text-(--text-tertiary)'
                    }`}
                  >
                    {fmtUSD(Number(q.total ?? 0))}
                    {expiry ? ` · ${expiry.text}` : ''}
                    {stale ? ' · no answer' : ''}
                  </p>
                </div>
                <ChevronRight
                  size={18}
                  strokeWidth={2.2}
                  className="shrink-0 text-(--text-tertiary)"
                  aria-hidden
                />
              </Link>
            </li>
          )
        })}
      </ul>

      {total > quotes.length && (
        <Link
          href="/hq/quotes"
          className="mt-2 block font-mono text-[11px] uppercase tracking-[0.04em] text-(--link-fg)"
        >
          {total - quotes.length} more waiting
        </Link>
      )}
    </section>
  )
}
