'use client'

import Link from 'next/link'
import { useEffect, useRef, type RefObject } from 'react'
import {
  UserPlus,
  UserSquare2,
  FileText,
  Hammer,
  Camera,
  type LucideIcon,
} from 'lucide-react'
import { useHaptics } from '@/lib/hq/haptics'

type Action = {
  key: string
  label: string
  sub: string
  href?: string
  icon: LucideIcon
  tone: string
  disabled?: boolean
  stub?: string
}

const ACTIONS: Action[] = [
  { key: 'lead',     label: 'New Lead',     sub: 'Phone call or walk-in',         href: '/hq/leads?new=1',    icon: UserPlus,    tone: 'bg-blue-500'   },
  { key: 'customer', label: 'New Customer', sub: 'Add without a lead',            href: '/hq/customers',      icon: UserSquare2, tone: 'bg-green-500'  },
  { key: 'quote',    label: 'New Quote',    sub: 'Build for existing customer',   href: '/hq/quotes/new',     icon: FileText,    tone: 'bg-amber-500'  },
  { key: 'job',      label: 'New Job',      sub: 'Schedule a build',              href: '/hq/jobs?new=1',     icon: Hammer,      tone: 'bg-rose-500'   },
  { key: 'camera',   label: 'Camera',       sub: 'Capture site photo',            icon: Camera,              tone: 'bg-gray-400',  disabled: true, stub: 'Soon' },
]

export function CreatePopover({
  open,
  onClose,
  anchorRef,
}: {
  open: boolean
  onClose: () => void
  anchorRef: RefObject<HTMLElement | null>
}) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const { tap } = useHaptics()

  useEffect(() => {
    if (open) tap()
  }, [open, tap])

  useEffect(() => {
    if (!open) return
    function onPointer(e: MouseEvent | TouchEvent) {
      const target = e.target as Node
      if (popoverRef.current?.contains(target)) return
      if (anchorRef.current?.contains(target)) return
      onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer, { passive: true })
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, anchorRef])

  if (!open) return null

  return (
    <div
      ref={popoverRef}
      role="menu"
      aria-label="Create"
      className="absolute right-0 top-full z-40 mt-1.5 w-64 origin-top-right overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-2)/95 shadow-xl backdrop-blur-xl animate-[hqPopIn_140ms_ease-out]"
      style={{ boxShadow: '0 12px 40px -8px rgba(0,0,0,0.25)' }}
    >
      <ul className="py-1">
        {ACTIONS.map((a) => (
          <li key={a.key}>
            <ActionRow action={a} onSelect={onClose} />
          </li>
        ))}
      </ul>
      <style>{`@keyframes hqPopIn { from { opacity: 0; transform: translateY(-4px) scale(0.98); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  )
}

function ActionRow({ action, onSelect }: { action: Action; onSelect: () => void }) {
  const Icon = action.icon
  const inner = (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${action.tone} ${action.disabled ? 'opacity-50' : ''}`}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`text-[15px] font-semibold ${action.disabled ? 'text-(--text-tertiary)' : 'text-(--text-primary)'}`}>
            {action.label}
          </span>
          {action.stub && (
            <span className="rounded-full bg-(--surface-3) px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-(--text-tertiary)">
              {action.stub}
            </span>
          )}
        </div>
        <div className="text-[12px] text-(--text-secondary) truncate">{action.sub}</div>
      </div>
    </div>
  )

  if (action.disabled || !action.href) {
    return (
      <div aria-disabled="true" className="cursor-not-allowed">
        {inner}
      </div>
    )
  }

  return (
    <Link href={action.href} onClick={onSelect} role="menuitem" className="block tap-list">
      {inner}
    </Link>
  )
}
