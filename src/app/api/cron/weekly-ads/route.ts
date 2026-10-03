import { cronRoute, type CronResult } from '@/lib/cron'
import { buildWeeklyPush, parseWeeklyRow, WEEKLY_ADS_QUERY } from '@/lib/jobs/weekly-ads'
import { notifyOwner } from '@/lib/notify'
import { POSTHOG_DASHBOARD_URL, runHogQL } from '@/lib/posthog-server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * Monday push with last week's website numbers from PostHog: leads (and how
 * many came from Google Ads), call taps, visitors, failed quote sends, and
 * the change against the week before. Tapping it opens the Ad funnel
 * dashboard. Push only — the full dashboard email is PostHog's subscription.
 */
async function runWeeklyAds(): Promise<CronResult> {
  const result = await runHogQL(WEEKLY_ADS_QUERY)
  if (!result) {
    return { ok: false, yield: 0, notified: 0, error: 'POSTHOG_PERSONAL_API_KEY is not set' }
  }

  const numbers = parseWeeklyRow(result.columns, result.results[0])
  const sent = await notifyOwner({ push: buildWeeklyPush(numbers, POSTHOG_DASHBOARD_URL) })

  return {
    ok: sent.errors.length === 0,
    yield: numbers.leads,
    notified: sent.pushed,
    error: sent.errors[0],
    detail: numbers,
  }
}

export const GET = cronRoute('weekly-ads', runWeeklyAds)
export const POST = GET
