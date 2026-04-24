'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { OfflineBadge } from '@/components/hq/OfflineBadge'
import { CreatePopover } from '@/components/hq/CreatePopover'

function titleFor(pathname: string, tab: string | null): string {
  if (pathname === '/hq') return tab === 'funnel' ? 'Funnel' : 'Today'
  // Detail routes (singular) — checked before list-prefix matches.
  if (/^\/hq\/leads\/[^/]+$/.test(pathname))     return 'Lead'
  if (/^\/hq\/jobs\/[^/]+$/.test(pathname))      return 'Job'
  if (/^\/hq\/customers\/[^/]+$/.test(pathname)) return 'Customer'
  if (pathname.startsWith('/hq/leads'))                  return 'Leads'
  if (pathname.startsWith('/hq/permit-leads'))           return 'Permits'
  if (pathname.startsWith('/hq/customers'))              return 'Customers'
  if (pathname.startsWith('/hq/quotes'))                 return 'Quotes'
  if (pathname.startsWith('/hq/jobs'))                   return 'Jobs'
  if (pathname.startsWith('/hq/gallery'))                return 'Gallery'
  if (pathname.startsWith('/hq/more'))                   return 'More'
  if (pathname.startsWith('/hq/settings/notifications')) return 'Notifications'
  if (pathname.startsWith('/hq/settings/testing'))       return 'Testing'
  if (pathname.startsWith('/hq/settings/logs'))          return 'Logs'
  if (pathname.startsWith('/hq/settings/quickbooks'))    return 'QuickBooks'
  if (pathname.startsWith('/hq/settings'))               return 'Settings'
  return 'Triple J'
}

/**
 * iOS-style large-title header for HQ.
 * - Large 28px title at scroll=0, collapses to compact 17px on scroll
 * - Right side: Plus button (opens CreatePopover) + avatar (tap → /hq/settings)
 */
export function HqHeader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const plusRef = useRef<HTMLButtonElement>(null)

  const title = titleFor(pathname, searchParams.get('tab'))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setCreateOpen(false)
  }, [pathname, searchParams])

  return (
    <header
      className="sticky top-0 z-30 border-b border-(--border-subtle) bg-(--surface-1)/85 backdrop-blur-md sm:hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <h1
            className={`font-(--font-ios) font-bold text-(--text-primary) tracking-tight transition-all ${
              scrolled ? 'text-[17px]' : 'text-[28px]'
            }`}
          >
            {title}
          </h1>
          <OfflineBadge />
        </div>
        <div className="relative flex items-center gap-1.5">
          <button
            ref={plusRef}
            type="button"
            onClick={() => setCreateOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-(--text-primary) bg-(--surface-2) border border-(--border-subtle) active:scale-95 transition-transform"
            aria-haspopup="menu"
            aria-expanded={createOpen}
            aria-label="Create new"
          >
            <Plus size={20} strokeWidth={2.3} />
          </button>
          <button
            type="button"
            onClick={() => router.push('/hq/settings')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white text-sm font-bold active:scale-95 transition-transform"
            aria-label="Settings"
          >
            JL
          </button>
          <CreatePopover
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            anchorRef={plusRef}
          />
        </div>
      </div>
    </header>
  )
}
