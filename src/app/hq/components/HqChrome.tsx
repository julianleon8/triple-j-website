'use client'

import Link from 'next/link'
import { Suspense, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { InstallPrompt } from '@/components/hq/InstallPrompt'
import { SignOutButton } from '@/components/hq/SignOutButton'
import { BottomTabBar } from './BottomTabBar'
import { HqHeader } from './HqHeader'

const NAV = [
  { href: '/hq',         label: 'Today' },
  { href: '/hq/leads',   label: 'Leads' },
  { href: '/hq/jobs',    label: 'Jobs' },
  { href: '/hq/gallery', label: 'Gallery' },
  { href: '/hq/more',    label: 'More' },
] as const

export default function HqChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isRefreshing, startRefreshTransition] = useTransition()
  const handleRefresh = () => startRefreshTransition(() => router.refresh())

  return (
    <div className="min-h-screen bg-(--surface-1) text-(--text-primary)">
      {/* Mobile: iOS-style large header (sm:hidden inside the component) */}
      <Suspense fallback={null}>
        <HqHeader />
      </Suspense>

      {/* Desktop top nav — hidden on mobile */}
      <header className="sticky top-0 z-30 hidden border-b border-white/10 bg-(--brand-fg) text-white shadow-sm sm:block">
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
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 transition-colors"
              aria-label="Refresh page"
            >
              <RefreshCw size={15} strokeWidth={2.3} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <SignOutButton variant="compact" />
          </nav>
        </div>
      </header>

      {/* Main content — bottom padding on mobile leaves room for BottomTabBar (~64px + safe-area) */}
      <main className="mx-auto max-w-7xl px-4 pt-4 pb-24 sm:px-6 sm:py-6 sm:pb-6">{children}</main>

      {/* Mobile bottom tab bar (hidden on sm:+) */}
      <Suspense fallback={null}>
        <BottomTabBar />
      </Suspense>

      {/* iOS install banner (mobile, visits-gated) */}
      <InstallPrompt />
    </div>
  )
}
