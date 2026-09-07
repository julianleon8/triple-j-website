'use client'
export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePasskeySupport, passkeyErrorMessage } from '@/lib/passkey'
import { Input } from '@/components/hq/ui/Input'
import { AuthHeader } from '../AuthHeader'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passkeyBusy, setPasskeyBusy] = useState(false)
  const router = useRouter()

  // False during SSR, resolved on hydration — see usePasskeySupport.
  const canUsePasskey = usePasskeySupport()

  // The proxy (and the QBO callback) bounces signed-in accounts that aren't in
  // OWNER_EMAIL back here. Without this the redirect looks like a silent failure.
  const notAuthorized = useSearchParams().get('error') === 'not_authorized'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/hq')
    router.refresh()
  }

  /**
   * Discoverable-credential sign-in: the authenticator resolves which account
   * this is, so no email is collected first.
   */
  const handlePasskey = async () => {
    setError('')
    setPasskeyBusy(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPasskey()

    if (error) {
      // null means the user dismissed the OS prompt — not worth a red banner.
      const message = passkeyErrorMessage(error)
      if (message) setError(message)
      setPasskeyBusy(false)
      return
    }

    router.push('/hq')
    router.refresh()
  }

  return (
    <>
      <AuthHeader subtitle="Owner Dashboard" />

      {notAuthorized && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-500">
          That account isn&apos;t authorized for HQ.
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
          disabled={loading}
          className="tap-solid w-full rounded-xl bg-(--brand-fg) py-3 text-[15px] font-semibold text-(--text-on-brand) transition-colors hover:bg-(--brand-fg-hover) disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign In'}
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
            disabled={passkeyBusy}
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

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary above it.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
