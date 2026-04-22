'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import type { PipelineKind, PipelineRow } from '@/lib/pipeline'
import { ListRow } from './ListRow'

type FilterKey = 'all' | PipelineKind | 'done'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'lead',     label: 'Leads' },
  { key: 'permit',   label: 'Permits' },
  { key: 'customer', label: 'Customers' },
  { key: 'quote',    label: 'Quotes' },
  { key: 'job',      label: 'Jobs' },
  { key: 'done',     label: 'Done' },
]

// "Done" = terminal states across all kinds
function isDone(r: PipelineRow): boolean {
  const status = r.trailing && (r.trailing.type === 'status' ? r.trailing.value : r.trailing.type === 'amount' ? r.trailing.sub : null)
  if (!status) return false
  return ['won', 'lost', 'completed', 'accepted', 'declined', 'expired', 'junk', 'cancelled'].includes(status)
}

type PipelineListProps = {
  rows: PipelineRow[]
  /** Query param key that sets the active filter. Default "type". */
  paramKey?: string
}

export function PipelineList({ rows, paramKey = 'type' }: PipelineListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = (searchParams.get(paramKey) ?? 'all') as FilterKey

  const filtered = useMemo(() => {
    if (current === 'all') return rows
    if (current === 'done') return rows.filter(isDone)
    // kind-matching filters also exclude terminal states so Done is a clean bucket
    return rows.filter((r) => r.kind === current && !isDone(r))
  }, [rows, current])

  function setFilter(key: FilterKey) {
    const next = new URLSearchParams(searchParams)
    next.set('tab', 'funnel')
    if (key === 'all') next.delete(paramKey)
    else next.set(paramKey, key)
    router.replace(`?${next.toString()}`, { scroll: false })
  }

  return (
    <div className="space-y-3">
      {/* Filter pills — horizontal scroll on mobile */}
      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: 'none' }}
        aria-label="Filter pipeline by type"
      >
        {FILTERS.map(({ key, label }) => {
          const active = current === key
          const count =
            key === 'all'  ? rows.length :
            key === 'done' ? rows.filter(isDone).length :
                             rows.filter((r) => r.kind === key && !isDone(r)).length
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                active
                  ? 'bg-brand-600 text-white'
                  : 'bg-(--surface-2) text-(--text-secondary) hover:text-(--text-primary)'
              }`}
              aria-pressed={active}
            >
              {label}
              <span className={`ml-1.5 text-[11px] ${active ? 'text-white/70' : 'text-(--text-tertiary)'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-(--border-subtle) bg-(--surface-2) p-10 text-center">
          <p className="text-sm text-(--text-secondary)">
            {current === 'all'
              ? 'Nothing in the pipeline yet.'
              : `No ${current === 'done' ? 'completed items' : current + 's'} to show.`}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-(--border-subtle) overflow-hidden rounded-xl border border-(--border-subtle) bg-(--surface-2)">
          {filtered.map((row) => (
            <li key={`${row.kind}-${row.id}`}>
              <ListRow row={row} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
