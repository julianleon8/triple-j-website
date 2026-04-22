'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { CreateActionSheet } from './CreateActionSheet'

type TabKey = 'now' | 'funnel'

function activeTabFromQS(pathname: string, tab: string | null): TabKey {
  if (pathname.startsWith('/hq/')) return 'now'
  return tab === 'funnel' ? 'funnel' : 'now'
}

export function BottomTabBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const active = activeTabFromQS(pathname, searchParams.get('tab'))
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-(--border-subtle) bg-(--surface-2)/90 backdrop-blur-md sm:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Primary"
      >
        <div className="relative grid grid-cols-3 items-end px-2 pt-1.5">
          <TabButton active={active === 'now'} href="/hq" label="Now" icon={<NowIcon />} />

          {/* Center FAB — sits raised above the bar */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="relative -top-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-900/30 active:scale-95 transition-transform"
              aria-label="Create new"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>

          <TabButton active={active === 'funnel'} href="/hq?tab=funnel" label="Funnel" icon={<FunnelIcon />} />
        </div>
      </nav>

      <CreateActionSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  )
}

function TabButton({
  active,
  href,
  label,
  icon,
}: {
  active: boolean
  href: string
  label: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-2 py-1 text-[11px] font-semibold transition-colors ${
        active ? 'text-(--brand-fg)' : 'text-(--text-tertiary)'
      }`}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}

function NowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function FunnelIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h18l-7 9v6l-4-2v-4z" />
    </svg>
  )
}
