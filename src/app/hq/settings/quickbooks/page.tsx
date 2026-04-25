import { getStoredTokens } from '@/lib/qbo'
import { getAdminClient } from '@/lib/supabase/admin'
import { ExpenseAccountPicker } from './components/ExpenseAccountPicker'
import { PendingReceiptsCard } from './components/PendingReceiptsCard'

export const dynamic = 'force-dynamic'

export default async function QuickBooksSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string; missing?: string }>
}) {
  const { connected, error, missing } = await searchParams
  const tokens = await getStoredTokens()
  const isConnected = !!tokens

  const errorMessages: Record<string, string> = {
    missing_params: 'OAuth callback was missing required parameters.',
    invalid_state: 'Security check failed. Please try connecting again.',
    token_exchange_failed: 'Failed to exchange authorization code. Check your QBO app credentials.',
    missing_config: 'QuickBooks is not configured yet. Add all required QBO environment variables, then try again.',
  }

  // Phase 4.2 — pending push count for the batch-retry card.
  let pendingCount = 0
  let pushedThisMonth = 0
  if (isConnected) {
    const db = getAdminClient()
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const [{ count: pending }, { count: pushed }] = await Promise.all([
      db.from('job_receipts').select('id', { count: 'exact', head: true }).is('qbo_pushed_at', null),
      db
        .from('job_receipts')
        .select('id', { count: 'exact', head: true })
        .gte('qbo_pushed_at', monthStart.toISOString()),
    ])
    pendingCount = pending ?? 0
    pushedThisMonth = pushed ?? 0
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-(--text-primary)">QuickBooks Online</h1>
        <p className="mt-1 text-sm text-(--text-secondary)">
          Connect your QBO account so accepted quotes auto-create draft invoices and
          jobsite receipts post as Purchases.
        </p>
      </div>

      {connected === '1' && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
          QuickBooks connected successfully.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {errorMessages[error] ?? `Connection error: ${error}`}
          {error === 'missing_config' && missing && (
            <p className="mt-2 text-xs">
              Missing: <code>{decodeURIComponent(missing)}</code>
            </p>
          )}
        </div>
      )}

      <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-(--text-primary)">Connection Status</p>
            {isConnected && tokens && (
              <p className="mt-0.5 text-xs text-(--text-tertiary)">
                Company ID: {tokens.realm_id} · Last updated{' '}
                {new Date(tokens.updated_at).toLocaleDateString()}
              </p>
            )}
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              isConnected
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-(--surface-3) text-(--text-tertiary)'
            }`}
          >
            {isConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>

        <a
          href="/api/qbo/connect"
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold tap-solid ${
            isConnected
              ? 'bg-(--surface-3) text-(--text-primary)'
              : 'bg-amber-500 text-black'
          }`}
        >
          {isConnected ? 'Reconnect QuickBooks' : 'Connect QuickBooks'}
        </a>

        {!process.env.QBO_CLIENT_ID && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-600 dark:text-amber-400">
            <strong>Setup required:</strong> Add <code>QBO_CLIENT_ID</code>, <code>QBO_CLIENT_SECRET</code>,
            <code>QBO_REDIRECT_URI</code>, and <code>QBO_ENVIRONMENT</code> to your environment variables.
            Create an app at <span className="font-mono">developer.intuit.com</span> and set your redirect URI
            to <code>https://triplejmetaltx.com/api/qbo/callback</code>.
          </div>
        )}
      </section>

      {/* Phase 4.2 — Receipt OCR posting target */}
      {isConnected && tokens && (
        <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5 space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-(--text-primary)">
              Receipt OCR — posting account
            </h2>
            <p className="mt-1 text-xs text-(--text-tertiary)">
              Every receipt you snap from a job posts to QuickBooks as a Purchase
              against this account. Pick once; you can re-categorize in QuickBooks later.
            </p>
          </div>
          <ExpenseAccountPicker
            currentId={tokens.expense_account_id ?? null}
            currentName={tokens.expense_account_name ?? null}
          />
        </section>
      )}

      {/* Phase 4.2 — pending receipts batch retry */}
      {isConnected && (
        <PendingReceiptsCard
          pendingCount={pendingCount}
          pushedThisMonth={pushedThisMonth}
          accountConfigured={!!tokens?.expense_account_id}
        />
      )}

      <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5 space-y-3">
        <h2 className="text-sm font-semibold text-(--text-primary)">How it works</h2>
        <ol className="list-inside list-decimal space-y-2 text-sm text-(--text-secondary)">
          <li>Customer accepts a quote via the emailed link.</li>
          <li>
            Triple J system automatically creates a <strong>Draft invoice</strong> in QuickBooks with
            matching line items, customer, and amount.
          </li>
          <li>You review and send the invoice from QuickBooks as normal.</li>
          <li>
            You can also push any accepted quote manually using the <strong>Push to QuickBooks</strong> button
            on the quote detail page.
          </li>
          <li>
            On a job, tap <strong>Receipt</strong> to OCR a receipt and post it as a Purchase
            against the account picked above. The receipt photo gets attached.
          </li>
        </ol>
      </section>

      {isConnected && tokens && (
        <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5 space-y-2 text-xs text-(--text-tertiary)">
          <p className="text-sm font-semibold text-(--text-secondary)">Token details</p>
          <p>Access token expires: {new Date(tokens.access_token_expires_at).toLocaleString()}</p>
          <p>Refresh token expires: {new Date(tokens.refresh_token_expires_at).toLocaleString()}</p>
          <p className="text-(--text-tertiary)">
            Access tokens auto-refresh on each use. Refresh tokens expire every 100 days —
            reconnect before that date if you don&apos;t use the system for 100+ days.
          </p>
        </section>
      )}
    </div>
  )
}
