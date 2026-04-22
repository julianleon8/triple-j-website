'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function titleFor(pathname: string, tab: string | null): string {
  if (pathname === '/hq') return tab === 'funnel' ? 'Funnel' : 'Now'
  if (pathname.startsWith('/hq/permit-leads')) return 'Permits'
  if (pathname.startsWith('/hq/customers'))    return 'Customers'
  if (pathname.startsWith('/hq/quotes'))       return 'Quotes'
  if (pathname.startsWith('/hq/jobs'))         return 'Jobs'
  if (pathname.startsWith('/hq/gallery'))      return 'Gallery'
  if (pathname.startsWith('/hq/settings'))     return 'Settings'
  return 'Triple J'
}

/**
 * iOS-style large title header for HQ.
 * - Mobile-only (sm:hidden)
 * - Large 34px title at scroll=0, collapses to compact 17px on scroll
 * - Right side: profile avatar dropdown (Gallery, QuickBooks, Sign out)
 * - Sits below status bar via safe-area-inset-top
 */
export function HqHeader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const title = titleFor(pathname, searchParams.get('tab'))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname, searchParams])

  useEffect(() => {
    if (!menuOpen) return
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header
      className="sticky top-0 z-30 border-b border-(--border-subtle) bg-(--surface-1)/85 backdrop-blur-md sm:hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <h1
          className={`font-(--font-ios) font-bold text-(--text-primary) tracking-tight transition-all ${
            scrolled ? 'text-[17px]' : 'text-[28px]'
          }`}
        >
          {title}
        </h1>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white text-sm font-bold active:scale-95 transition-transform"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Menu"
          >
            JL
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-(--border-subtle) bg-(--surface-2) shadow-lg"
            >
              <MenuItem href="/hq/gallery">Gallery</MenuItem>
              <MenuItem href="/hq/settings/quickbooks">QuickBooks</MenuItem>
              <div className="border-t border-(--border-subtle)" />
              <button
                type="button"
                onClick={() => void signOut()}
                className="block w-full px-4 py-3 text-left text-[15px] font-medium text-(--text-primary) hover:bg-(--surface-3)"
                role="menuitem"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function MenuItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-4 py-3 text-[15px] font-medium text-(--text-primary) hover:bg-(--surface-3)"
      role="menuitem"
    >
      {children}
    </Link>
  )
}
