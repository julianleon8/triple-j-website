import { cronRoute, type CronContext, type CronResult } from '@/lib/cron'
import { pushPendingReceipts, RECEIPT_BATCH_LIMIT } from '@/lib/jobs/receipt-push'
import { notifyOwner } from '@/lib/notify'
import { getSiteUrl } from '@/lib/site-url'
import CronDigestOwnerAlert, { cronDigestOwnerAlertText } from '@/emails/CronDigestOwnerAlert'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Nightly QuickBooks receipt push.
 *
 * Receipts previously sat pending until someone opened
 * /hq/settings/quickbooks and pressed the button. This does the same work on
 * a schedule, and only notifies when something needs a human — a clean run
 * that posted a few expenses is not worth a push at 2am.
 */
async function runReceiptPush({ db }: CronContext): Promise<CronResult> {
  const result = await pushPendingReceipts(db)

  if (result.blocked) {
    // Not connected is not a job failure — QBO may simply never have been
    // linked. It is reported so the ledger shows why nothing moved.
    return { ok: true, yield: 0, notified: 0, detail: { blocked: result.blocked } }
  }

  const moved = result.succeeded + result.reconciled
  if (result.failures.length === 0) {
    return { ok: true, yield: moved, notified: 0, detail: { ...result } }
  }

  const named = result.failures.slice(0, 3)
  const title = `🧾 ${result.failures.length} receipt${result.failures.length === 1 ? '' : 's'} failed to reach QuickBooks`
  const emailProps = {
    badge: 'QUICKBOOKS',
    badgeColor: '#b45309',
    heading: title.replace('🧾 ', ''),
    subhead:
      moved > 0 ? `${moved} pushed cleanly in the same run.` : 'Nothing was pushed this run.',
    items: named.map((f) => ({
      primary: f.vendor ?? 'Unknown vendor',
      secondary: f.error,
      href: null,
    })),
    moreCount: result.failures.length - named.length,
    footnote:
      'Each failed receipt keeps its error in qbo_push_error and will be retried on the next run. A receipt already posted in QuickBooks is detected by its DocNumber and reconciled rather than posted twice.',
    ctaLabel: 'Open QuickBooks settings',
    ctaHref: `${getSiteUrl()}/hq/settings/quickbooks`,
  }

  const sent = await notifyOwner({
    push: {
      title,
      body: named.map((f) => f.vendor ?? 'Unknown').join(', '),
      url: '/hq/settings/quickbooks',
      tag: 'receipt-push',
    },
    email: {
      subject: title,
      react: CronDigestOwnerAlert(emailProps),
      text: cronDigestOwnerAlertText(emailProps),
      tags: [{ name: 'email_type', value: 'cron_receipt_push' }],
    },
  })

  return {
    ok: true,
    yield: moved,
    notified: sent.pushed + (sent.emailed ? 1 : 0),
    error: `${result.failures.length} of ${result.attempted} failed`,
    detail: { ...result, batchLimit: RECEIPT_BATCH_LIMIT },
  }
}

export const GET = cronRoute('receipt-push', runReceiptPush)
export const POST = GET
