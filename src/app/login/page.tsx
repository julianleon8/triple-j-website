'use client'
export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePasskeySupport, passkeyErrorMessage } from '@/lib/passkey'

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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Triple J Metal</h1>
          <p className="text-gray-500 text-sm mt-1">Owner Dashboard</p>
        </div>
        {notAuthorized && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            That account isn&apos;t authorized for HQ.
          </p>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-200 text-black font-bold py-2.5 rounded-lg transition text-sm"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {canUsePasskey && (
          <>
            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">or</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>
            <button
              type="button"
              onClick={handlePasskey}
              disabled={passkeyBusy}
              className="w-full rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:opacity-50"
            >
              {passkeyBusy ? 'Waiting for your device…' : 'Sign in with a passkey'}
            </button>
            <p className="mt-3 text-center text-xs text-gray-400">
              Add a passkey from HQ → Settings after signing in.
            </p>
          </>
        )}
      </div>
    </div>
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
