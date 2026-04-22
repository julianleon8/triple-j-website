'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { InstallPrompt } from '@/components/hq/InstallPrompt'
import { BottomTabBar } from './BottomTabBar'
import { HqHeader } from './HqHeader'

const NAV = [
  { href: '/hq', label: 'Leads' },
  { href: '/hq/permit-leads', label: 'Permits' },
  { href: '/hq/customers', label: 'Customers' },
  { href: '/hq/quotes', label: 'Quotes' },
  { href: '/hq/jobs', label: 'Jobs' },
  { href: '/hq/gallery', label: 'Gallery' },
  { href: '/hq/settings', label: 'Settings' },
] as const

export default function HqChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-(--surface-1) text-(--text-primary)">
      {/* Mobile: iOS-style large header (sm:hidden inside the component) */}
      <HqHeader />

      {/* Desktop top nav — hidden on mobile */}
      <header className="sticky top-0 z-30 hidden border-b border-white/10 bg-brand-600 text-white shadow-sm sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-4">
          <Link
            href="/hq"
            className="font-bold tracking-tight sm:text-xl min-w-0 shrink"
          >
            <span className="block truncate leading-tight">Triple J Metal</span>
            <span className="block text-xs font-semibold uppercase tracking-wider text-white/70">
              Headquarters
            </span>
          </Link>

          <nav className="flex flex-wrap items-center justify-end gap-x-5 gap-y-1 text-sm font-semibold">
            {NAV.map(({ href, label }) => {
              const active = pathname === href || (href !== '/hq' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-md px-2 py-2 hover:underline ${
                    active ? 'underline decoration-2 underline-offset-4' : ''
                  }`}
                >
                  {label}
                </Link>
              )
            })}
            <button
              type="button"
              onClick={() => void signOut()}
              className="ml-2 rounded-md border border-white/30 px-3 py-2 text-xs font-bold uppercase tracking-wide hover:bg-white/10"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>

      {/* Main content — bottom padding on mobile leaves room for BottomTabBar (~64px + safe-area) */}
      <main className="mx-auto max-w-7xl px-4 pt-4 pb-24 sm:px-6 sm:py-6 sm:pb-6">{children}</main>

      {/* Mobile bottom tab bar (hidden on sm:+) */}
      <BottomTabBar />

      {/* iOS install banner (mobile, visits-gated) */}
      <InstallPrompt />
    </div>
  )
}
