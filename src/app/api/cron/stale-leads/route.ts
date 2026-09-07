import { cronRoute, type CronContext, type CronResult } from '@/lib/cron'
import { staleCutoff, buildStaleDigest, type StaleLeadRow } from '@/lib/jobs/stale-leads'
import { notifyOwner } from '@/lib/notify'
import { getSiteUrl } from '@/lib/site-url'
import CronDigestOwnerAlert, { cronDigestOwnerAlertText } from '@/emails/CronDigestOwnerAlert'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * Speed-to-lead alarm. Fires every 2h through the working day (vercel.json).
 *
 * A lead sitting in status 'new' past COLD_THRESHOLD_HOURS has had no
 * response — leads.first_response_at is stamped by a DB trigger the moment
 * status leaves 'new' (migration 015), so status IS the answered/unanswered
 * signal and no extra column is needed to detect it.
 *
 * Each lead is nudged at most once, ever (leads.nudged_at, migration 027).
 * /hq NeedsAttentionFeed keeps showing it until it is actually worked; this
 * push exists only to say "you have not seen this yet".
 */
async function runStaleLeads({ db }: CronContext): Promise<CronResult> {
  const now = new Date()

  const { data, error } = await db
    .from('leads')
    .select('id, name, city, zip, service_type, timeline, created_at')
    .eq('status', 'new')
    .is('nudged_at', null)
    .lt('created_at', staleCutoff(now))
    .order('created_at', { ascending: true })

  if (error) return { ok: false, error: `query failed: ${error.message}` }

  const rows = (data ?? []) as StaleLeadRow[]
  if (rows.length === 0) return { ok: true, yield: 0, notified: 0 }

  const digest = buildStaleDigest(rows, now)
  const emailProps = {
    badge: 'STALE LEADS',
    heading: digest.heading,
    subhead: digest.subhead,
    items: digest.items,
    moreCount: digest.moreCount,
    footnote: 'First-response time is the single biggest lever on close rate. Call, do not email.',
    ctaLabel: 'Open HQ',
    ctaHref: `${getSiteUrl()}/hq`,
  }

  const sent = await notifyOwner({
    push: {
      title: digest.title,
      body: digest.body,
      url: '/hq',
      tag: 'stale-leads',
    },
    email: {
      subject: digest.title,
      react: CronDigestOwnerAlert(emailProps),
      text: cronDigestOwnerAlertText(emailProps),
      tags: [{ name: 'email_type', value: 'cron_stale_leads' }],
    },
  })

  // Mark only after a successful notify — if both channels failed, leave the
  // leads unnudged so the next run tries again rather than silently burning
  // the one nudge each lead gets.
  const delivered = sent.pushed > 0 || sent.emailed
  if (delivered) {
    const { error: markError } = await db
      .from('leads')
      .update({ nudged_at: now.toISOString() })
      .in('id', rows.map((r) => r.id))
    if (markError) {
      return { ok: false, yield: rows.length, error: `mark failed: ${markError.message}` }
    }
  }

  return {
    ok: delivered,
    yield: rows.length,
    notified: sent.pushed + (sent.emailed ? 1 : 0),
    error: sent.errors.length > 0 ? sent.errors.join('; ') : undefined,
  }
}

export const GET = cronRoute('stale-leads', runStaleLeads)
export const POST = GET
