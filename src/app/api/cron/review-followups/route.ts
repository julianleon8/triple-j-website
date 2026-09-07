import { sendPush } from '@/lib/push'
import { cronRoute, type CronContext, type CronResult } from '@/lib/cron'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * Daily cron — surfaces customers whose review_followup_due_at has
 * passed AND review_left_at is still null. Sends a single batched
 * web-push to Julian's device(s) with the count + names of the first
 * three. /hq/customers also shows a persistent "Reviews due" section,
 * so this push is best-effort nudge — not a hard requirement.
 *
 * Vercel Cron schedules this at 14:30 UTC daily (vercel.json). Manual
 * trigger via the /hq UI uses Supabase auth; both paths go through
 * cronRoute, which also records the run in cron_runs.
 */
async function runFollowups({ db }: CronContext): Promise<CronResult> {
  const nowIso = new Date().toISOString()

  const { data: due, error } = await db
    .from('customers')
    .select('id, name, review_followup_due_at')
    .lte('review_followup_due_at', nowIso)
    .is('review_left_at', null)
    .order('review_followup_due_at', { ascending: true })

  if (error) return { ok: false, error: `query failed: ${error.message}` }

  const rows = (due ?? []) as { id: string; name: string }[]
  if (rows.length === 0) return { ok: true, yield: 0, notified: 0 }

  const names = rows.slice(0, 3).map((r) => r.name)
  const more = rows.length > 3 ? ` +${rows.length - 3} more` : ''
  const result = await sendPush({
    title: rows.length === 1
      ? `⭐ Review follow-up due: ${rows[0].name}`
      : `⭐ ${rows.length} review follow-ups due`,
    body: rows.length === 1
      ? `Tap to open ${rows[0].name}`
      : `${names.join(', ')}${more}`,
    url: '/hq/customers',
    tag: 'review-followups',
  })

  return { ok: true, yield: rows.length, notified: result.sent }
}

export const GET = cronRoute('review-followups', runFollowups)
