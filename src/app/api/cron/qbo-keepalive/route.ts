import { cronRoute, type CronContext, type CronResult } from '@/lib/cron'
import { getValidAccessToken } from '@/lib/qbo'
import { assessRefreshToken, REFRESH_WARN_DAYS } from '@/lib/jobs/qbo-keepalive'
import { notifyOwner } from '@/lib/notify'
import { getSiteUrl } from '@/lib/site-url'
import CronDigestOwnerAlert, { cronDigestOwnerAlertText } from '@/emails/CronDigestOwnerAlert'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * Weekly QuickBooks connection keepalive.
 *
 * The QBO refresh token lives ~101 days and rotates only when it is used, so
 * an integration nobody exercises for a quarter dies on its own. Calling
 * getValidAccessToken() is the keepalive: it refreshes when the access token
 * is near expiry and re-saves the rotated pair.
 *
 * Also warns before the cliff, because recovery is a manual OAuth round-trip
 * that has to happen before the token is gone, not after.
 */
async function runKeepalive({ db }: CronContext): Promise<CronResult> {
  const { data: row } = await db
    .from('qbo_tokens')
    .select('realm_id, refresh_token_expires_at')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ realm_id: string; refresh_token_expires_at: string }>()

  // Never connected is not a failure — QBO is optional until someone links it.
  if (!row) return { ok: true, yield: 0, notified: 0, detail: { connected: false } }

  // getValidAccessToken throws when the stored tokens are unusable. Catch it
  // here so a dead connection is a reportable state rather than a stack trace,
  // and so the warning below still goes out.
  let refreshed = false
  let refreshError: string | null = null
  try {
    await getValidAccessToken()
    refreshed = true
  } catch (err) {
    refreshError = err instanceof Error ? err.message : String(err)
  }

  // Re-read: a successful refresh rotates the refresh token and pushes the
  // expiry out, so the pre-refresh value would understate how much runway is
  // left and warn every week forever.
  const { data: after } = await db
    .from('qbo_tokens')
    .select('refresh_token_expires_at')
    .eq('realm_id', row.realm_id)
    .maybeSingle<{ refresh_token_expires_at: string }>()

  const expiresAt = after?.refresh_token_expires_at ?? row.refresh_token_expires_at
  const verdict = assessRefreshToken(expiresAt, new Date())

  if (!verdict.shouldWarn && refreshed) {
    return {
      ok: true,
      yield: 1,
      notified: 0,
      detail: { daysLeft: verdict.daysLeft, refreshed },
    }
  }

  const title =
    verdict.severity === 'expired'
      ? '🔌 QuickBooks connection has expired'
      : refreshError
        ? '🔌 QuickBooks token refresh failed'
        : `🔌 QuickBooks reconnect needed in ${verdict.daysLeft}d`

  const emailProps = {
    badge: 'QUICKBOOKS',
    badgeColor: verdict.severity === 'expired' ? '#b91c1c' : '#b45309',
    heading: title.replace('🔌 ', ''),
    subhead:
      verdict.severity === 'expired'
        ? 'Receipt and invoice pushes are failing until it is relinked.'
        : `The refresh token rotates only when it is used, and has ${verdict.daysLeft} days left.`,
    items: [
      {
        primary: 'Reconnect QuickBooks',
        secondary: refreshError ?? `Expires ${new Date(expiresAt).toLocaleDateString('en-US')}`,
        href: `${getSiteUrl()}/hq/settings/quickbooks`,
      },
    ],
    footnote: `Warned at ${REFRESH_WARN_DAYS} days out because reconnecting is a manual OAuth round-trip — it has to happen before the token dies, not after.`,
    ctaLabel: 'Reconnect',
    ctaHref: `${getSiteUrl()}/hq/settings/quickbooks`,
  }

  const sent = await notifyOwner({
    push: {
      title,
      body: refreshError ?? `Reconnect at /hq/settings/quickbooks`,
      url: '/hq/settings/quickbooks',
      tag: 'qbo-keepalive',
    },
    email: {
      subject: title,
      react: CronDigestOwnerAlert(emailProps),
      text: cronDigestOwnerAlertText(emailProps),
      tags: [{ name: 'email_type', value: 'cron_qbo_keepalive' }],
    },
  })

  return {
    ok: refreshError === null,
    yield: refreshed ? 1 : 0,
    notified: sent.pushed + (sent.emailed ? 1 : 0),
    error: refreshError ?? undefined,
    detail: { daysLeft: verdict.daysLeft, severity: verdict.severity, refreshed },
  }
}

export const GET = cronRoute('qbo-keepalive', runKeepalive)
export const POST = GET
