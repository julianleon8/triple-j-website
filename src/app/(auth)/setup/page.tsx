'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/hq/ui/Input'
import { AuthHeader } from '../AuthHeader'

export default function SetupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [setupKey, setSetupKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, setup_key: setupKey }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Setup failed')
      setLoading(false)
      return
    }

    router.push('/login')
  }

  return (
    <>
      <AuthHeader subtitle="Create Owner Account" />

      <form onSubmit={handleSubmit} className="space-y-3">
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
          autoComplete="new-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          hint="At least 8 characters."
          required
          minLength={8}
        />
        <Input
          label="Setup Key"
          type="password"
          value={setupKey}
          onChange={e => setSetupKey(e.target.value)}
          hint="The SETUP_KEY value from your Vercel environment."
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
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="mt-5 rounded-xl border border-accent-amber/40 bg-accent-amber/10 px-3 py-2 text-[12px] text-(--text-secondary)">
        This page creates the owner account and refuses to run once one exists.
        Delete it after you have signed in.
      </p>
    </>
  )
}
