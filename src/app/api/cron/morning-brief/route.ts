import { cronRoute, type CronContext, type CronResult } from '@/lib/cron'
import {
  BRIEF_LIST_LIMIT,
  briefWindowStart,
  buildMorningBrief,
  morningBriefRecipients,
  type BriefLeadRow,
} from '@/lib/jobs/morning-brief'
import { getResend } from '@/lib/resend'
import { getSiteUrl } from '@/lib/site-url'
import MorningBriefEmail, { morningBriefText } from '@/emails/MorningBrief'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const LEAD_COLUMNS =
  'id, name, city, zip, service_type, source, utm_source, utm_medium, utm_content, gclid, created_at'

/**
 * Weekday morning brief (vercel.json). Email only, to the recipients in
 * morningBriefRecipients() — not OWNER_EMAIL, because the owner chose who
 * reads it. Sent every run, even with nothing new: an empty inbox reads as
 * "all caught up", where a skipped send would read the same as a broken job.
 */
async function runMorningBrief({ db, lastSuccessAt }: CronContext): Promise<CronResult> {
  const now = new Date()
  const since = briefWindowStart(lastSuccessAt, now)

  const [fresh, waiting, drafts] = await Promise.all([
    db.from('leads').select(LEAD_COLUMNS).gte('created_at', since.toISOString())
      .order('created_at', { ascending: false }).limit(BRIEF_LIST_LIMIT + 50),
    db.from('leads').select(LEAD_COLUMNS, { count: 'exact' })
      .eq('status', 'new').eq('is_draft', false)
      .order('created_at', { ascending: true }).limit(BRIEF_LIST_LIMIT),
    db.from('leads').select('id', { count: 'exact', head: true }).eq('is_draft', true),
  ])
  const failed = fresh.error ?? waiting.error ?? drafts.error
  if (failed) return { ok: false, error: `query failed: ${failed.message}` }

  const brief = buildMorningBrief({
    newLeads: (fresh.data ?? []) as BriefLeadRow[],
    waiting: (waiting.data ?? []) as BriefLeadRow[],
    waitingTotal: waiting.count ?? 0,
    draftCount: drafts.count ?? 0,
    since,
    now,
  })

  const hqHref = `${getSiteUrl()}/hq`
  const to = morningBriefRecipients(process.env.MORNING_BRIEF_TO)
  const sent = await getResend().emails.send({
    from: 'Triple J Metal <leads@triplejmetaltx.com>',
    to,
    subject: brief.subject,
    react: MorningBriefEmail({ brief, hqHref }),
    text: morningBriefText(brief, hqHref),
    tags: [{ name: 'email_type', value: 'cron_morning_brief' }],
  })
  if (sent.error) return { ok: false, error: `email: ${sent.error.message}` }

  return {
    ok: true,
    yield: (fresh.data ?? []).length,
    notified: 1,
    detail: { since: since.toISOString(), waiting: waiting.count ?? 0, drafts: drafts.count ?? 0, to: to.length },
  }
}

export const GET = cronRoute('morning-brief', runMorningBrief)
export const POST = GET
