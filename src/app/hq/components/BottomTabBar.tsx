'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Inbox, Hammer, Images, MoreHorizontal, type LucideIcon } from 'lucide-react'

type Tab = { href: string; label: string; icon: LucideIcon; match: (pathname: string) => boolean }

const TABS: Tab[] = [
  { href: '/hq',         label: 'Today',   icon: Home,           match: (p) => p === '/hq' },
  { href: '/hq/leads',   label: 'Leads',   icon: Inbox,          match: (p) => p.startsWith('/hq/leads') },
  { href: '/hq/jobs',    label: 'Jobs',    icon: Hammer,         match: (p) => p.startsWith('/hq/jobs') },
  { href: '/hq/gallery', label: 'Gallery', icon: Images,         match: (p) => p.startsWith('/hq/gallery') },
  { href: '/hq/more',    label: 'More',    icon: MoreHorizontal, match: (p) => p.startsWith('/hq/more') },
]

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-(--border-subtle) bg-(--surface-2)/90 backdrop-blur-md sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary"
    >
      <div className="grid grid-cols-5 items-end px-1 pt-1">
        {TABS.map((tab) => (
          <TabButton key={tab.href} tab={tab} active={tab.match(pathname)} />
        ))}
      </div>
    </nav>
  )
}

function TabButton({ tab, active }: { tab: Tab; active: boolean }) {
  const Icon = tab.icon
  return (
    <Link
      href={tab.href}
      className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-2 py-1 text-[11px] font-semibold transition-colors ${
        active ? 'text-(--brand-fg)' : 'text-(--text-tertiary)'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={24} strokeWidth={active ? 2.3 : 2} aria-hidden="true" />
      <span>{tab.label}</span>
    </Link>
  )
}
