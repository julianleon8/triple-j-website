'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { usePasskeySupport, passkeyErrorMessage } from '@/lib/passkey'
import { Input } from '@/components/hq/ui/Input'
import { AuthHeader } from '../AuthHeader'

/**
 * The sign-in form itself.
 *
 * `notAuthorized` arrives as a prop rather than being read here with
 * `useSearchParams`. Reading it on the client forced a Suspense boundary
 * around the whole form, and the empty fallback was all the server ever sent —
 * every pixel of this page waited on hydration. page.tsx reads the param on
 * the server instead, so the markup below is server-rendered.
 */
export function LoginForm({ notAuthorized }: { notAuthorized: boolean }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passkeyBusy, setPasskeyBusy] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const router = useRouter()

  /**
   * The trip to /hq after Supabase accepts the credentials. It has to be a
   * transition: the proxy can bounce a signed-in account straight back here
   * (not on OWNER_EMAIL, or the session cookie didn't reach the server), and
   * this form then stays mounted. A plain `loading` flag set before the push
   * was never cleared on that path, so the button read "Signing in…" forever.
   * `navigating` ends when the navigation lands, wherever it lands.
   */
  const [navigating, startNavigation] = useTransition()
  const busy = loading || passkeyBusy || navigating

  // Signed in, the navigation finished, and this form is still on screen. The
  // not-authorized bounce has its own banner, so this covers the other one.
  // Its copy asks for a reopen rather than a retry: Next's client router keeps
  // the /hq → /login redirect for about five minutes, so a second push replays
  // it without asking the server. Only a full reload clears that.
  const bounced = signedIn && !navigating && !notAuthorized

  // False during SSR, resolved on hydration — see usePasskeySupport.
  const canUsePasskey = usePasskeySupport()

  const openHq = () => {
    setSignedIn(true)
    startNavigation(() => {
      router.push('/hq')
      router.refresh()
    })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSignedIn(false)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(error.message)
        return
      }

      openHq()
    } catch {
      setError('Sign-in failed. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Discoverable-credential sign-in: the authenticator resolves which account
   * this is, so no email is collected first.
   */
  const handlePasskey = async () => {
    setError('')
    setSignedIn(false)
    setPasskeyBusy(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPasskey()

      if (error) {
        // null means the user dismissed the OS prompt — not worth a red banner.
        const message = passkeyErrorMessage(error)
        if (message) setError(message)
        return
      }

      openHq()
    } catch (err) {
      const message = passkeyErrorMessage(err as Error)
      if (message) setError(message)
    } finally {
      setPasskeyBusy(false)
    }
  }

  return (
    <>
      <AuthHeader subtitle="Owner Dashboard" />

      {notAuthorized && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-500">
          Signed in, but that account isn&apos;t authorized for HQ.
        </p>
      )}

      {bounced && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-500">
          Signed in, but HQ didn&apos;t open. Close the app and open it again.
        </p>
      )}

      <form onSubmit={handleLogin} className="space-y-3">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="tap-solid w-full rounded-xl bg-(--brand-fg) py-3 text-[15px] font-semibold text-(--text-on-brand) transition-colors hover:bg-(--brand-fg-hover) disabled:opacity-50"
        >
          {loading || navigating ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      {canUsePasskey && (
        <>
          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-(--border-subtle)" />
            <span className="text-[11px] font-medium uppercase tracking-wide text-(--text-tertiary)">
              or
            </span>
            <span className="h-px flex-1 bg-(--border-subtle)" />
          </div>
          <button
            type="button"
            onClick={handlePasskey}
            disabled={busy}
            className="tap-solid w-full rounded-xl border border-(--border-subtle) py-3 text-[15px] font-semibold text-(--text-primary) transition-colors hover:bg-(--surface-3) disabled:opacity-50"
          >
            {passkeyBusy ? 'Waiting for your device…' : 'Sign in with a passkey'}
          </button>
          <p className="mt-3 text-center text-[12px] text-(--text-tertiary)">
            Add a passkey from HQ → Settings after signing in.
          </p>
        </>
      )}
    </>
  )
}
