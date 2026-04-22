'use client'

import { useRouter } from 'next/navigation'
import { Sheet } from '@/components/hq/Sheet'

type CreateActionSheetProps = {
  open: boolean
  onClose: () => void
}

const ACTIONS: { key: string; label: string; sub: string; href: string; tone: string }[] = [
  {
    key: 'lead',
    label: 'New Lead',
    sub: 'From a phone call or walk-in',
    href: '/hq?tab=funnel&type=leads',
    tone: 'bg-blue-600',
  },
  {
    key: 'customer',
    label: 'New Customer',
    sub: 'Add directly without a lead',
    href: '/hq/customers',
    tone: 'bg-green-600',
  },
  {
    key: 'quote',
    label: 'New Quote',
    sub: 'Build a quote for an existing customer',
    href: '/hq/quotes/new',
    tone: 'bg-amber-600',
  },
]

export function CreateActionSheet({ open, onClose }: CreateActionSheetProps) {
  const router = useRouter()

  function go(href: string) {
    onClose()
    router.push(href)
  }

  return (
    <Sheet open={open} onClose={onClose} title="What are you adding?" snap={0.5}>
      <ul className="mt-2 space-y-2">
        {ACTIONS.map((a) => (
          <li key={a.key}>
            <button
              type="button"
              onClick={() => go(a.href)}
              className="flex w-full items-center gap-3 rounded-2xl border border-(--border-subtle) bg-(--surface-3) p-4 text-left active:scale-[0.99] transition-transform"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-full text-white ${a.tone}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[17px] font-semibold text-(--text-primary)">{a.label}</div>
                <div className="text-[13px] text-(--text-secondary)">{a.sub}</div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-(--text-tertiary)">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}
