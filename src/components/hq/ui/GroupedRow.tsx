import Link from 'next/link'
import type { ComponentType, ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

type IconComponent = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>

export type GroupedRowProps = {
  icon?: IconComponent
  /** Tint bg color for the icon circle — Tailwind class like "bg-blue-500". */
  iconTone?: string
  label: string
  sublabel?: string
  /** Count or status pill rendered between label and trailing value. */
  badge?: { text: string; tone?: 'default' | 'positive' | 'warn' | 'negative' }
  /** Small trailing value (e.g. "Connected"). */
  trailingValue?: string
  trailingValueTone?: 'positive' | 'neutral'
  /** If provided, row renders as <Link>. Otherwise <button>. */
  href?: string
  onClick?: () => void
  /** Disables pointer + chevron + dims text. */
  disabled?: boolean
  /** Replace the trailing chevron with custom element (e.g. a trailing button). */
  trailing?: ReactNode
}

const BADGE_TONE: Record<NonNullable<NonNullable<GroupedRowProps['badge']>['tone']>, string> = {
  default:  'bg-(--surface-3) text-(--text-secondary)',
  positive: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  warn:     'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  negative: 'bg-red-500/15 text-red-600 dark:text-red-400',
}

/**
 * iOS Settings-style row. Use inside <GroupedList>.
 * Left: optional Lucide icon in a rounded square tile.
 * Center: label (bold) + optional sublabel.
 * Right: optional badge, trailing value, chevron.
 */
export function GroupedRow(props: GroupedRowProps) {
  const Icon = props.icon
  const body = (
    <div className={`flex min-h-14 items-center gap-3 px-4 py-2.5 ${props.disabled ? 'opacity-50' : ''}`}>
      {Icon && (
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-white ${props.iconTone ?? 'bg-(--brand-fg)'}`}
          aria-hidden="true"
        >
          <Icon size={16} strokeWidth={2} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[16px] font-medium text-(--text-primary)">{props.label}</div>
        {props.sublabel && (
          <div className="mt-0.5 text-[13px] text-(--text-tertiary)">{props.sublabel}</div>
        )}
      </div>
      {props.badge && (
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${BADGE_TONE[props.badge.tone ?? 'default']}`}>
          {props.badge.text}
        </span>
      )}
      {props.trailingValue && (
        <span
          className={`shrink-0 text-[14px] ${
            props.trailingValueTone === 'positive'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-(--text-tertiary)'
          }`}
        >
          {props.trailingValue}
        </span>
      )}
      {props.trailing ?? (
        props.href || props.onClick ? (
          <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-(--text-tertiary)" />
        ) : null
      )}
    </div>
  )

  if (props.href && !props.disabled) {
    return (
      <Link href={props.href} className="block tap-list">
        {body}
      </Link>
    )
  }

  if (props.onClick && !props.disabled) {
    return (
      <button
        type="button"
        onClick={props.onClick}
        className="block w-full text-left tap-list"
      >
        {body}
      </button>
    )
  }

  return <div>{body}</div>
}
