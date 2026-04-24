'use client'

import type { LucideIcon } from 'lucide-react'
import { Sheet } from './Sheet'
import { useHaptics } from '@/lib/hq/haptics'

export type DrawerAction = {
  label: string
  icon: LucideIcon
  tone?: 'default' | 'destructive'
  onPick: () => void | Promise<void>
}

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  actions: DrawerAction[]
}

/**
 * Bottom-sheet action drawer — iOS left-swipe pattern. Sits inside Sheet.
 * Destructive actions fire a `warn` haptic before executing; the rest fire `tap`.
 */
export function ActionDrawer({ open, onClose, title, actions }: Props) {
  const haptics = useHaptics()
  return (
    <Sheet open={open} onClose={onClose} title={title} snap={0.5}>
      <ul className="space-y-1">
        {actions.map((a, i) => {
          const Icon = a.icon
          const destructive = a.tone === 'destructive'
          return (
            <li key={i}>
              <button
                type="button"
                onClick={async () => {
                  if (destructive) haptics.warn()
                  else haptics.tap()
                  try {
                    await a.onPick()
                  } finally {
                    onClose()
                  }
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left active:bg-(--surface-3) transition-colors ${
                  destructive ? 'text-red-500' : 'text-(--text-primary)'
                }`}
              >
                <Icon size={20} strokeWidth={2.2} />
                <span className="text-[16px] font-medium">{a.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <button
        type="button"
        onClick={onClose}
        className="mt-3 w-full rounded-xl bg-(--surface-3) py-3 text-[16px] font-semibold text-(--text-primary) active:bg-(--surface-1)"
      >
        Cancel
      </button>
    </Sheet>
  )
}
