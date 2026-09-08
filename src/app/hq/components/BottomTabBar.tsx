'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HQ_TABS, type HqTab } from '../nav'

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-(--border-subtle) bg-(--surface-1)/95 backdrop-blur-md sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary"
    >
      {/* Derived from HQ_TABS rather than a literal grid-cols-N: Tailwind only
          generates classes it can see as complete strings, so an interpolated
          `grid-cols-${n}` would compile to nothing. */}
      <div
        className="grid items-end px-1 pt-1"
        style={{ gridTemplateColumns: `repeat(${HQ_TABS.length}, minmax(0, 1fr))` }}
      >
        {HQ_TABS.map((tab) => (
          <TabButton key={tab.href} tab={tab} active={tab.match(pathname)} />
        ))}
      </div>
    </nav>
  )
}

function TabButton({ tab, active }: { tab: HqTab; active: boolean }) {
  const Icon = tab.icon
  return (
    <Link
      href={tab.href}
      className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-1 font-display text-[12px] uppercase tracking-[0.06em] transition-colors ${
        active ? 'font-bold text-(--brand-fg)' : 'font-semibold text-(--text-tertiary)'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={23} strokeWidth={active ? 2.3 : 2} aria-hidden="true" />
      <span>{tab.label}</span>
    </Link>
  )
}
