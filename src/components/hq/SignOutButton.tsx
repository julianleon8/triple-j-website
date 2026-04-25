'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Variant = 'row' | 'compact'

export function SignOutButton({ variant = 'row' }: { variant?: Variant }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handle() {
    if (pending) return
    setPending(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handle}
        disabled={pending}
        className="ml-2 rounded-md border border-white/30 px-3 py-2 text-xs font-bold uppercase tracking-wide hover:bg-white/10 disabled:opacity-60"
      >
        {pending ? 'Signing out…' : 'Sign out'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-(--border-subtle) bg-(--surface-2) px-4 py-3.5 text-[16px] font-semibold text-red-500 tap-list disabled:opacity-60"
    >
      <LogOut size={18} strokeWidth={2} /> {pending ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
