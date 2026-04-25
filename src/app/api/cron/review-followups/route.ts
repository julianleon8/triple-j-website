import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendPush } from '@/lib/push'

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
 * trigger via the /hq UI uses Supabase auth, same dual-auth pattern as
 * the permit scraper.
 */
async function runFollowups() {
  const db = getAdminClient()
  const nowIso = new Date().toISOString()

  const { data: due, error } = await db
    .from('customers')
    .select('id, name, review_followup_due_at')
    .lte('review_followup_due_at', nowIso)
    .is('review_left_at', null)
    .order('review_followup_due_at', { ascending: true })

  if (error) {
    return { ok: false, error: 'query failed' }
  }

  const rows = due ?? []
  if (rows.length === 0) {
    return { ok: true, dueCount: 0, pushed: false }
  }

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

  return { ok: true, dueCount: rows.length, pushed: result.sent > 0, sent: result.sent }
}

export async function GET(request: NextRequest) {
  // Dual auth: Vercel Cron uses Bearer CRON_SECRET; manual trigger from
  // /hq uses Supabase session cookie.
  const auth = request.headers.get('authorization')
  if (auth && auth === `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(await runFollowups())
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return NextResponse.json(await runFollowups())
}
