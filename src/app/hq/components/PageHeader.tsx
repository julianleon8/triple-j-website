import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  actions?: ReactNode
  eyebrow?: string
}

export function PageHeader({ title, subtitle, actions, eyebrow }: Props) {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[color:var(--color-brand-600)] mb-1.5">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-[clamp(1.75rem,2vw+1rem,2.5rem)] font-extrabold text-[color:var(--color-ink-900)] leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[color:var(--color-ink-500)] mt-1.5 text-[15px]">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
