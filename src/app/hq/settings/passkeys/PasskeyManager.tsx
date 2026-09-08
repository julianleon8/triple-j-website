'use client'

import { useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePasskeySupport, passkeyErrorMessage } from '@/lib/passkey'

export type Passkey = {
  id: string
  friendly_name?: string | null
  created_at: string
  last_used_at?: string | null
}

function relative(iso: string | null | undefined): string {
  if (!iso) return 'never used'
  const ms = Date.now() - new Date(iso).getTime()
  const days = Math.floor(ms / 86_400_000)
  if (days >= 1) return `${days}d ago`
  const hrs = Math.floor(ms / 3_600_000)
  if (hrs >= 1) return `${hrs}h ago`
  const mins = Math.floor(ms / 60_000)
  if (mins >= 1) return `${mins}m ago`
  return 'just now'
}

/**
 * Register and manage WebAuthn passkeys for the signed-in owner.
 *
 * Everything here runs against the user's own session through supabase-js —
 * there is no API route, because these endpoints authorize the caller by their
 * access token and a service-role round-trip would only weaken that.
 */
export function PasskeyManager({ initial }: { initial: Passkey[] }) {
  const [keys, setKeys] = useState<Passkey[]>(initial)
  const supported = usePasskeySupport()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Re-read after a register or delete. The first render is seeded from the
  // server, so nothing fetches on mount.
  const load = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.passkey.list()
    if (error) {
      setError(passkeyErrorMessage(error) ?? '')
      return
    }
    setKeys((data ?? []) as Passkey[])
  }, [])

  async function register() {
    setError('')
    setNotice('')
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.auth.registerPasskey()
    if (error) {
      // null means the OS prompt was dismissed — silence is the right answer.
      const message = passkeyErrorMessage(error)
      if (message) setError(message)
    } else {
      setNotice('Passkey added. You can now sign in without your password.')
      await load()
    }
    setBusy(false)
  }

  async function remove(key: Passkey) {
    const label = key.friendly_name || 'this passkey'
    if (typeof window !== 'undefined' && !window.confirm(`Remove ${label}?`)) return
    setError('')
    setNotice('')
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.auth.passkey.delete({ passkeyId: key.id })
    if (error) setError(passkeyErrorMessage(error) ?? '')
    else await load()
    setBusy(false)
  }

  if (!supported) {
    return (
      <p className="rounded-xl bg-(--surface-2) px-4 py-3 text-sm text-(--text-secondary)">
        This browser doesn&apos;t support passkeys. Try Safari on iPhone or Mac, or Chrome.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={register}
        disabled={busy}
        className="w-full rounded-xl bg-(--brand-fg) py-3 text-sm font-semibold text-(--text-on-brand) transition disabled:opacity-50"
      >
        {busy ? 'Waiting for your device…' : 'Add a passkey'}
      </button>

      {notice && <p className="text-sm text-green-600 dark:text-green-400">{notice}</p>}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {keys.length === 0 ? (
        <p className="text-sm text-(--text-tertiary)">
          No passkeys yet. Adding one lets you sign in with Face ID, Touch ID, or a security key
          instead of a password.
        </p>
      ) : (
        <ul className="divide-y divide-(--separator) overflow-hidden rounded-xl bg-(--surface-1)">
          {keys.map((key) => (
            <li key={key.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{key.friendly_name || 'Passkey'}</p>
                <p className="text-xs text-(--text-tertiary)">
                  Added {relative(key.created_at)} · {relative(key.last_used_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(key)}
                disabled={busy}
                className="shrink-0 text-sm font-medium text-red-600 dark:text-red-400 disabled:opacity-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {keys.length > 0 && (
        <p className="text-xs text-(--text-tertiary)">
          Keep your password until you have confirmed a passkey sign-in works. Removing your last
          passkey leaves the password as the only way in.
        </p>
      )}
    </div>
  )
}
