'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/hq', label: 'Leads' },
  { href: '/hq/permit-leads', label: 'Permits' },
  { href: '/hq/customers', label: 'Customers' },
  { href: '/hq/quotes', label: 'Quotes' },
  { href: '/hq/jobs', label: 'Jobs' },
  { href: '/hq/gallery', label: 'Gallery' },
  { href: '/hq/settings/quickbooks', label: 'QuickBooks' },
] as const

export default function HqChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-yellow-500 text-black shadow-sm pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link
            href="/hq"
            className="min-h-11 min-w-0 shrink font-bold tracking-tight sm:text-xl"
          >
            <span className="block truncate leading-tight">Triple J Metal</span>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-black/70 sm:text-xs">
              Headquarters
            </span>
          </Link>

          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-black/15 bg-black/5 text-black hover:bg-black/10 sm:hidden"
            aria-expanded={menuOpen}
            aria-controls="hq-nav-menu"
            onClick={() => setMenuOpen(o => !o)}
          >
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>

          <nav className="hidden items-center gap-1 text-sm font-semibold sm:flex sm:flex-wrap sm:justify-end sm:gap-x-5 sm:gap-y-1">
            {NAV.map(({ href, label }) => {
              const active = pathname === href || (href !== '/hq' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-md px-2 py-2 hover:underline ${active ? 'underline decoration-2 underline-offset-4' : ''}`}
                >
                  {label}
                </Link>
              )
            })}
            <button
              type="button"
              onClick={() => void signOut()}
              className="ml-2 rounded-md border border-black/20 px-3 py-2 text-xs font-bold uppercase tracking-wide hover:bg-black/10"
            >
              Sign out
            </button>
          </nav>
        </div>

        {menuOpen && (
          <nav
            id="hq-nav-menu"
            className="border-t border-black/10 bg-yellow-400 px-4 py-3 sm:hidden"
          >
            <ul className="flex flex-col gap-1">
              {NAV.map(({ href, label }) => {
                const active = pathname === href || (href !== '/hq' && pathname.startsWith(href))
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`block min-h-11 rounded-lg px-3 py-3 text-base font-semibold hover:bg-black/10 ${active ? 'bg-black/10' : ''}`}
                    >
                      {label}
                    </Link>
                  </li>
                )
              })}
              <li>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="mt-1 w-full min-h-11 rounded-lg border border-black/20 px-3 py-3 text-left text-base font-bold hover:bg-black/10"
                >
                  Sign out
                </button>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">{children}</main>
    </div>
  )
}
