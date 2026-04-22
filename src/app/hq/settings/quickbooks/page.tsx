import { getStoredTokens } from '@/lib/qbo'

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

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">QuickBooks Online</h1>
        <p className="text-sm text-gray-500 mt-1">
          Connect your QBO account so accepted quotes automatically create draft invoices.
        </p>
      </div>

      {connected === '1' && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          QuickBooks connected successfully.
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {errorMessages[error] ?? `Connection error: ${error}`}
          {error === 'missing_config' && missing && (
            <p className="mt-2 text-xs">
              Missing: <code>{decodeURIComponent(missing)}</code>
            </p>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">Connection Status</p>
            {isConnected && tokens && (
              <p className="text-xs text-gray-400 mt-0.5">
                Company ID: {tokens.realm_id} · Last updated{' '}
                {new Date(tokens.updated_at).toLocaleDateString()}
              </p>
            )}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              isConnected
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {isConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>

        {/* Connect / Reconnect button */}
        <a
          href="/api/qbo/connect"
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
            isConnected
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              : 'bg-yellow-500 hover:bg-yellow-400 text-black'
          }`}
        >
          {isConnected ? 'Reconnect QuickBooks' : 'Connect QuickBooks'}
        </a>

        {!process.env.QBO_CLIENT_ID && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
            <strong>Setup required:</strong> Add <code>QBO_CLIENT_ID</code>, <code>QBO_CLIENT_SECRET</code>,
            <code>QBO_REDIRECT_URI</code>, and <code>QBO_ENVIRONMENT</code> to your environment variables (Vercel
            dashboard or <code>.env.local</code>). Then create an app at{' '}
            <span className="font-mono">developer.intuit.com</span> and set your redirect URI to{' '}
            <code>https://triplejmetaltx.com/api/qbo/callback</code> (or your <code>www</code> URL if that is what
            you registered — it must match exactly).
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-semibold text-gray-800 text-sm">How It Works</h2>
        <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
          <li>Customer accepts a quote via the emailed link.</li>
          <li>Triple J system automatically creates a <strong>Draft invoice</strong> in QuickBooks with matching line items, customer, and amount.</li>
          <li>You review and send the invoice from QuickBooks as normal.</li>
          <li>You can also push any accepted quote manually using the <strong>Push to QuickBooks</strong> button on the quote detail page.</li>
        </ol>
      </div>

      {/* Token expiry info */}
      {isConnected && tokens && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-2 text-xs text-gray-500">
          <p className="font-semibold text-gray-700 text-sm">Token Details</p>
          <p>
            Access token expires:{' '}
            {new Date(tokens.access_token_expires_at).toLocaleString()}
          </p>
          <p>
            Refresh token expires:{' '}
            {new Date(tokens.refresh_token_expires_at).toLocaleString()}
          </p>
          <p className="text-gray-400">
            Access tokens auto-refresh on each use. Refresh tokens expire every 100 days — reconnect
            before that date if you don&apos;t use the system for 100+ days.
          </p>
        </div>
      )}
    </div>
  )
}
