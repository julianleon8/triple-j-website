import { cronRoute, type CronContext, type CronResult } from '@/lib/cron'
import {
  bounceWindowStart,
  dedupeBounces,
  WATCHED_EVENTS,
  type BounceEvent,
} from '@/lib/jobs/bounce-watch'
import { notifyOwner } from '@/lib/notify'
import { getSiteUrl } from '@/lib/site-url'
import { BUSINESS_TZ } from '@/lib/calendar'
import CronDigestOwnerAlert, { cronDigestOwnerAlertText } from '@/emails/CronDigestOwnerAlert'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * Watches outbound email for bounces and spam complaints.
 *
 * Resend delivery events land in email_events via the webhook, but the only
 * surface is a filter tab in /hq/settings/logs — you have to go looking. A
 * silently bouncing domain takes down every lead alert and every quote email
 * at once, and Connectors.md names that as the standing risk while DKIM/SPF
 * verification is outstanding.
 *
 * Channel is push-first: this must not depend on the delivery path it
 * monitors. It still falls back to email if the push reached nobody, because
 * a bounce is normally per-recipient rather than domain-wide, and a silent
 * alarm is worse than one sent over a partly-degraded channel.
 */

const NAMED_LIMIT = 4

async function runBounceWatch({ db, lastSuccessAt }: CronContext): Promise<CronResult> {
  const now = new Date()
  const since = bounceWindowStart(lastSuccessAt, now)

  const { data, error } = await db
    .from('email_events')
    .select('resend_id, event_type, to_email, subject, occurred_at')
    .in('event_type', WATCHED_EVENTS)
    .gt('occurred_at', since)
    .order('occurred_at', { ascending: false })

  if (error) return { ok: false, error: `query failed: ${error.message}` }

  const events = dedupeBounces((data ?? []) as BounceEvent[])
  if (events.length === 0) return { ok: true, yield: 0, notified: 0, detail: { since } }

  const complaints = events.filter((e) => e.event_type === 'email.complained').length
  const bounces = events.length - complaints
  const named = events.slice(0, NAMED_LIMIT)
  const moreCount = events.length - named.length

  const parts = [
    bounces > 0 ? `${bounces} bounce${bounces === 1 ? '' : 's'}` : null,
    complaints > 0 ? `${complaints} spam complaint${complaints === 1 ? '' : 's'}` : null,
  ].filter(Boolean)
  const title = `📮 Email trouble: ${parts.join(' · ')}`

  const emailProps = {
    badge: complaints > 0 ? 'SPAM COMPLAINT' : 'EMAIL BOUNCED',
    badgeColor: '#b91c1c',
    heading: parts.join(' and '),
    subhead: `Since ${new Date(since).toLocaleString('en-US', { timeZone: BUSINESS_TZ })} CST.`,
    items: named.map((e) => ({
      primary: e.to_email ?? 'unknown recipient',
      secondary: [e.event_type.replace('email.', ''), e.subject].filter(Boolean).join(' · '),
      href: null,
    })),
    moreCount,
    footnote:
      'Repeated bounces to different domains usually mean DKIM/SPF/DMARC are not verified for triplejmetaltx.com in Resend. Until that is green, lead alerts and quote emails can fail silently.',
    ctaLabel: 'Open email log',
    ctaHref: `${getSiteUrl()}/hq/settings/logs`,
  }

  const sent = await notifyOwner({
    channel: 'push-first',
    push: {
      title,
      body: named.map((e) => e.to_email ?? 'unknown').join(', '),
      url: '/hq/settings/logs',
      tag: 'bounce-watch',
    },
    email: {
      subject: title,
      react: CronDigestOwnerAlert(emailProps),
      text: cronDigestOwnerAlertText(emailProps),
      tags: [{ name: 'email_type', value: 'cron_bounce_watch' }],
    },
  })

  // Deliberately ok:true even when nothing was delivered. Marking the run
  // failed would freeze lastSuccessAt, so the next run would re-report this
  // same batch on top of anything new — an alarm that cannot be delivered
  // must not also become an alarm that repeats forever. The undelivered
  // state is still visible in cron_runs.error and notified = 0.
  return {
    ok: true,
    yield: events.length,
    notified: sent.pushed + (sent.emailed ? 1 : 0),
    error: sent.errors.length > 0 ? sent.errors.join('; ') : undefined,
    detail: { since, bounces, complaints },
  }
}

export const GET = cronRoute('bounce-watch', runBounceWatch)
export const POST = GET
