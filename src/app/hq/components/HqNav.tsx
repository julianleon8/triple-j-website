'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Container } from '@/components/ui/Container'
import { CloseIcon, MenuIcon } from '@/components/ui/icons'

const NAV_LINKS = [
  { href: '/hq', label: 'Leads' },
  { href: '/hq/permit-leads', label: 'Permits' },
  { href: '/hq/customers', label: 'Customers' },
  { href: '/hq/quotes', label: 'Quotes' },
  { href: '/hq/jobs', label: 'Jobs' },
  { href: '/hq/gallery', label: 'Gallery' },
  { href: '/hq/settings/quickbooks', label: 'QuickBooks' },
] as const

function isActive(pathname: string, href: string) {
  if (href === '/hq') return pathname === '/hq'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function HqNav() {
  const pathname = usePathname() ?? '/hq'
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="sticky top-0 z-40 bg-[color:var(--color-ink-900)] border-b border-white/10">
      <Container size="wide">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/hq"
            className="flex items-center gap-2.5 shrink-0"
            aria-label="Triple J HQ"
          >
            <Image
              src="/images/logo-lion.png"
              alt=""
              width={34}
              height={34}
              priority
              className="h-8 w-8 object-contain"
            />
            <div className="flex flex-col leading-none">
              <span className="text-white font-extrabold tracking-tight text-[15px]">
                Triple J HQ
              </span>
              <span className="text-[color:var(--color-brand-300)] text-[10px] font-semibold mt-0.5 tracking-[0.15em] uppercase">
                Operations
              </span>
            </div>
          </Link>

          <nav
            aria-label="Dashboard"
            className="hidden lg:flex items-center gap-0.5"
          >
            {NAV_LINKS.map(link => {
              const active = isActive(pathname, link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 text-[14px] font-medium rounded-md transition-colors ${
                    active
                      ? 'text-white bg-white/5'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute left-3 right-3 -bottom-[1px] h-[2px] bg-[color:var(--color-brand-500)] rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden md:inline-flex text-white/60 hover:text-white text-[13px] font-medium"
            >
              View site →
            </Link>
            <button
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen(v => !v)}
              className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-md text-white hover:bg-white/10"
            >
              {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </Container>

      <div
        className={`lg:hidden fixed inset-x-0 top-16 bottom-0 z-30 bg-[color:var(--color-ink-900)] transition-transform duration-300 ease-out ${
          open ? 'translate-y-0' : '-translate-y-[200%]'
        }`}
        aria-hidden={!open}
      >
        <Container size="wide">
          <nav aria-label="Mobile dashboard" className="flex flex-col py-4 divide-y divide-white/10">
            {NAV_LINKS.map(link => {
              const active = isActive(pathname, link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`py-4 text-base font-semibold ${
                    active
                      ? 'text-[color:var(--color-brand-300)]'
                      : 'text-white hover:text-[color:var(--color-brand-300)]'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="py-4 text-base font-semibold text-white/60 hover:text-white"
            >
              View public site →
            </Link>
          </nav>
        </Container>
      </div>
    </header>
  )
}
