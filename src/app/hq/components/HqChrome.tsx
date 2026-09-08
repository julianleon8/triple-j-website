'use client'

import Link from 'next/link'
import { Suspense, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { InstallPrompt } from '@/components/hq/InstallPrompt'
import { SignOutButton } from '@/components/hq/SignOutButton'
import { BottomTabBar } from './BottomTabBar'
import { HqHeader } from './HqHeader'
import { HQ_DESKTOP_NAV } from '../nav'


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
      {/* Was a solid brand-blue slab. --brand-fg is gold inside HQ now, and a
          full-width gold bar reads as a warning banner rather than as chrome,
          so the desktop header sits on the card surface instead. Desktop is
          not drawn in the 2b direction; this keeps it quiet and consistent. */}
      <header className="sticky top-0 z-30 hidden border-b border-(--border-subtle) bg-(--surface-2) text-(--text-primary) shadow-sm sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-4">
          <Link
            href="/hq"
            className="font-bold tracking-tight sm:text-xl min-w-0 shrink"
          >
            <span className="block truncate leading-tight">Triple J Metal</span>
            <span className="block text-xs font-semibold uppercase tracking-wider text-(--text-secondary)">
              Headquarters
            </span>
          </Link>

          <nav className="flex flex-wrap items-center justify-end gap-x-5 gap-y-1 text-sm font-semibold">
            {HQ_DESKTOP_NAV.map(({ href, label, match }) => {
              const active = match(pathname)
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
              className="flex h-8 w-8 items-center justify-center rounded-full border border-(--border-subtle) bg-(--surface-3) text-(--text-primary) hover:bg-(--surface-1) disabled:opacity-50 transition-colors"
              aria-label="Refresh page"
            >
              <RefreshCw size={15} strokeWidth={2.3} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <SignOutButton variant="compact" />
          </nav>
        </div>
      </header>

      {/* Main content. pb-24 is the tab-bar clearance (57px + safe-area, with
          room to spare) and it only actually applies now that globals.css' own
          unlayered `main { padding-bottom }` rule is scoped to non-HQ pages. */}
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
