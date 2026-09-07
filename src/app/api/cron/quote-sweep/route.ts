import { cronRoute, type CronContext, type CronResult } from '@/lib/cron'
import { QUOTE_STALL_HOURS } from '@/lib/pipeline'
import { todayInCentral } from '@/lib/calendar'
import {
  countOpensByQuote,
  engagementPhrase,
  type ExpiringQuote,
  type StalledQuote,
} from '@/lib/jobs/quote-sweep'
import { notifyOwner } from '@/lib/notify'
import { getSiteUrl } from '@/lib/site-url'
import CronDigestOwnerAlert, { cronDigestOwnerAlertText } from '@/emails/CronDigestOwnerAlert'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * Daily quote hygiene. Two independent units, expiry first so a quote is
 * never nudged about on the same run that retires it.
 *
 * 1. EXPIRE — quotes.status has carried 'expired' in its documented set since
 *    migration 001 and QUOTE_STATUS_CLASS styles it, but nothing has ever
 *    written it. Every quote ever sent is still 'sent' forever.
 *
 * 2. STALL NUDGE — a sent quote with no answer after QUOTE_STALL_HOURS.
 *    Enriched with email_events: "opened 3x, never accepted" is a call-now
 *    signal, and is the whole reason this job is worth more than its cost.
 *    Nudged at most once per quote (quotes.stall_nudged_at, migration 027).
 */

const NAMED_LIMIT = 3

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)

async function expireQuotes(db: CronContext['db'], today: string) {
  // valid_until has no server-side default — QuoteWizard sets +30d client
  // side, so a quote created by any other path has NULL. NULL means "no
  // expiry stated", never "expired"; .lt() already excludes nulls, and the
  // explicit not-null keeps that intent readable.
  const { data, error } = await db
    .from('quotes')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .eq('status', 'sent')
    .not('valid_until', 'is', null)
    .lt('valid_until', today)
    .select('id, quote_number')

  if (error) throw new Error(`expire failed: ${error.message}`)
  return (data ?? []) as ExpiringQuote[]
}

async function findStalled(db: CronContext['db'], now: Date) {
  const cutoff = new Date(now.getTime() - QUOTE_STALL_HOURS * 3_600_000).toISOString()
  const { data, error } = await db
    .from('quotes')
    .select('id, quote_number, total, sent_at, customers(name)')
    .eq('status', 'sent')
    .is('stall_nudged_at', null)
    .not('sent_at', 'is', null)
    .lt('sent_at', cutoff)
    .order('sent_at', { ascending: true })

  if (error) throw new Error(`stall query failed: ${error.message}`)
  return (data ?? []) as unknown as StalledQuote[]
}

async function runQuoteSweep({ db }: CronContext): Promise<CronResult> {
  const now = new Date()
  const today = todayInCentral(now)

  const expired = await expireQuotes(db, today)
  const stalled = await findStalled(db, now)

  if (stalled.length === 0) {
    return {
      ok: true,
      yield: expired.length,
      notified: 0,
      detail: { expired: expired.map((q) => q.quote_number) },
    }
  }

  const { data: events } = await db
    .from('email_events')
    .select('quote_id, resend_id, event_type')
    .in('quote_id', stalled.map((q) => q.id))
  const opens = countOpensByQuote(events ?? [])

  const named = stalled.slice(0, NAMED_LIMIT)
  const moreCount = stalled.length - named.length
  const describe = (q: StalledQuote) => {
    const days = Math.floor((now.getTime() - new Date(q.sent_at).getTime()) / 86_400_000)
    return [
      q.total ? usd(Number(q.total)) : null,
      `${days}d silent`,
      engagementPhrase(opens[q.id] ?? 0),
    ]
      .filter(Boolean)
      .join(' · ')
  }

  const single = stalled.length === 1
  const title = single
    ? `📄 Quote silent: ${stalled[0].customers?.name ?? stalled[0].quote_number}`
    : `📄 ${stalled.length} quotes with no answer`

  const emailProps = {
    badge: 'QUOTES STALLED',
    badgeColor: '#1d4ed8',
    heading: single
      ? `${stalled[0].customers?.name ?? 'A customer'} has not answered`
      : `${stalled.length} sent quotes have gone quiet`,
    subhead: `No response in over ${QUOTE_STALL_HOURS} hours since the quote went out.`,
    items: named.map((q) => ({
      primary: `${q.customers?.name ?? 'Unknown customer'} · #${q.quote_number}`,
      secondary: describe(q),
      href: `${getSiteUrl()}/hq/quotes/${q.id}`,
    })),
    moreCount,
    footnote:
      'A quote that was opened and not accepted is a live objection, not a dead lead. Call and ask what stopped them.',
    ctaLabel: 'Open quotes',
    ctaHref: `${getSiteUrl()}/hq/quotes`,
  }

  const sent = await notifyOwner({
    push: {
      title,
      body: single
        ? describe(stalled[0])
        : `${named.map((q) => q.customers?.name ?? q.quote_number).join(', ')}${moreCount > 0 ? ` +${moreCount} more` : ''}`,
      url: '/hq/quotes',
      tag: 'quote-stall',
    },
    email: {
      subject: title,
      react: CronDigestOwnerAlert(emailProps),
      text: cronDigestOwnerAlertText(emailProps),
      tags: [{ name: 'email_type', value: 'cron_quote_stall' }],
    },
  })

  const delivered = sent.pushed > 0 || sent.emailed
  if (delivered) {
    const { error: markError } = await db
      .from('quotes')
      .update({ stall_nudged_at: now.toISOString() })
      .in('id', stalled.map((q) => q.id))
    if (markError) {
      return {
        ok: false,
        yield: expired.length + stalled.length,
        error: `mark failed: ${markError.message}`,
      }
    }
  }

  return {
    ok: delivered,
    yield: expired.length + stalled.length,
    notified: sent.pushed + (sent.emailed ? 1 : 0),
    error: sent.errors.length > 0 ? sent.errors.join('; ') : undefined,
    detail: {
      expired: expired.map((q) => q.quote_number),
      stalled: stalled.map((q) => q.quote_number),
    },
  }
}

export const GET = cronRoute('quote-sweep', runQuoteSweep)
export const POST = GET
