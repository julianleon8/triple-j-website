import type { ReactNode } from 'react'
import { GroupedRow, type GroupedRowProps } from './GroupedRow'

type Group = {
  title?: string
  rows: GroupedRowProps[]
}

type Props = {
  groups: Group[]
  footer?: ReactNode
  className?: string
}

/**
 * iOS Settings-style grouped inset list. Each group is a rounded card with
 * divided rows and an optional sticky uppercase title above.
 */
export function GroupedList({ groups, footer, className }: Props) {
  return (
    <div className={`space-y-5 ${className ?? ''}`}>
      {groups.map((group, gi) => (
        <section key={gi}>
          {group.title && (
            <h2 className="mb-2 px-4 text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
              {group.title}
            </h2>
          )}
          <div className="overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-2) divide-y divide-(--border-subtle)">
            {group.rows.map((row, ri) => (
              <GroupedRow key={`${gi}-${ri}`} {...row} />
            ))}
          </div>
        </section>
      ))}
      {footer && <div className="pt-2">{footer}</div>}
    </div>
  )
}
