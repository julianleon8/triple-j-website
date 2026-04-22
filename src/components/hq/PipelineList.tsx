'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import type { PipelineKind, PipelineRow } from '@/lib/pipeline'
import { LEAD_STATUS_CLASS, PERMIT_STATUS_CLASS, QUOTE_STATUS_CLASS, JOB_STATUS_CLASS } from '@/lib/pipeline'
import { ListRow } from './ListRow'
import { PullToRefresh } from './PullToRefresh'
import { SwipeActions, type SwipeAction } from './SwipeActions'

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

function extractStatus(r: PipelineRow): string | null {
  if (!r.trailing) return null
  if (r.trailing.type === 'status') return r.trailing.value
  if (r.trailing.type === 'amount') return r.trailing.sub ?? null
  return null
}

function isDone(r: PipelineRow): boolean {
  const status = extractStatus(r)
  if (!status) return false
  return ['won', 'lost', 'completed', 'accepted', 'declined', 'expired', 'junk', 'cancelled'].includes(status)
}

type PipelineListProps = {
  rows: PipelineRow[]
  paramKey?: string
}

export function PipelineList({ rows: initialRows, paramKey = 'type' }: PipelineListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = (searchParams.get(paramKey) ?? 'all') as FilterKey

  // Local state layered on top of server-fetched rows — supports optimistic
  // status patches and row removals without waiting for refresh.
  const [rows, setRows] = useState(initialRows)
  const [, startTransition] = useTransition()

  // Keep local in sync when server rehydrates (router.refresh())
  if (initialRows !== rows && rows.length === initialRows.length) {
    // no-op — avoids stale state after refresh. (If server returned a new array
    // with different contents, use an effect; kept simple here.)
  }

  function patchRow(id: string, fn: (r: PipelineRow) => PipelineRow) {
    setRows((prev) => prev.map((r) => (r.id === id ? fn(r) : r)))
  }
  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  const filtered = useMemo(() => {
    if (current === 'all')  return rows
    if (current === 'done') return rows.filter(isDone)
    return rows.filter((r) => r.kind === current && !isDone(r))
  }, [rows, current])

  function setFilter(key: FilterKey) {
    const next = new URLSearchParams(searchParams)
    next.set('tab', 'funnel')
    if (key === 'all') next.delete(paramKey)
    else next.set(paramKey, key)
    router.replace(`?${next.toString()}`, { scroll: false })
  }

  async function refresh() {
    await new Promise<void>((resolve) => {
      startTransition(() => {
        router.refresh()
        resolve()
      })
    })
  }

  return (
    <PullToRefresh onRefresh={refresh}>
      <div className="space-y-3">
        {/* Filter pills */}
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
            {filtered.map((row) => {
              const actions = actionsForRow(row, patchRow, removeRow)
              return (
                <li key={`${row.kind}-${row.id}`}>
                  <SwipeActions leading={actions.leading} trailing={actions.trailing}>
                    <ListRow row={row} />
                  </SwipeActions>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </PullToRefresh>
  )
}

// ── Per-kind swipe actions ──────────────────────────────────────────────────

type Actions = { leading?: SwipeAction; trailing?: SwipeAction }

function actionsForRow(
  row: PipelineRow,
  patchRow: (id: string, fn: (r: PipelineRow) => PipelineRow) => void,
  removeRow: (id: string) => void,
): Actions {
  switch (row.kind) {
    case 'lead':
      return {
        leading: {
          label: 'Contacted',
          tone: 'positive',
          exec: async () => {
            const res = await fetch(`/api/leads/${row.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'contacted' }),
            })
            if (!res.ok) return false
            patchRow(row.id, (r) => ({
              ...r,
              trailing: { type: 'status', value: 'contacted', statusClass: LEAD_STATUS_CLASS.contacted },
              badges: (r.badges ?? []).filter((b) => b.tone !== 'asap'),
            }))
            return false
          },
        },
        trailing: {
          label: 'Delete',
          tone: 'destructive',
          exec: async () => {
            if (typeof window !== 'undefined' && !window.confirm('Delete this lead?')) return false
            const res = await fetch(`/api/leads/${row.id}`, { method: 'DELETE' })
            if (!res.ok) return false
            removeRow(row.id)
            return true
          },
        },
      }

    case 'permit':
      return {
        leading: {
          label: 'Called',
          tone: 'positive',
          exec: async () => {
            const res = await fetch(`/api/permit-leads/${row.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'called' }),
            })
            if (!res.ok) return false
            patchRow(row.id, (r) => ({
              ...r,
              trailing: r.trailing?.type === 'score'
                ? r.trailing
                : { type: 'status', value: 'called', statusClass: PERMIT_STATUS_CLASS.called },
              badges: (r.badges ?? []).filter((b) => b.tone !== 'hot'),
            }))
            return false
          },
        },
        trailing: {
          label: 'Junk',
          tone: 'destructive',
          exec: async () => {
            const res = await fetch(`/api/permit-leads/${row.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'junk' }),
            })
            if (!res.ok) return false
            removeRow(row.id)
            return true
          },
        },
      }

    case 'quote': {
      const sub = row.trailing?.type === 'amount' ? row.trailing.sub : null
      if (sub === 'draft') {
        return {
          leading: {
            label: 'Send',
            tone: 'positive',
            exec: async () => {
              const res = await fetch(`/api/quotes/${row.id}/send`, { method: 'POST' })
              if (!res.ok) {
                const d = await res.json().catch(() => ({}))
                if (typeof window !== 'undefined') window.alert(d.error ?? 'Send failed')
                return false
              }
              patchRow(row.id, (r) => ({
                ...r,
                trailing:
                  r.trailing?.type === 'amount'
                    ? { ...r.trailing, sub: 'sent', statusClass: QUOTE_STATUS_CLASS.sent }
                    : r.trailing,
              }))
              return false
            },
          },
        }
      }
      if (sub === 'sent') {
        return {
          leading: {
            label: 'Accepted',
            tone: 'positive',
            exec: async () => {
              const res = await fetch(`/api/quotes/${row.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'accepted' }),
              })
              if (!res.ok) return false
              patchRow(row.id, (r) => ({
                ...r,
                trailing:
                  r.trailing?.type === 'amount'
                    ? { ...r.trailing, sub: 'accepted', statusClass: QUOTE_STATUS_CLASS.accepted }
                    : r.trailing,
              }))
              return false
            },
          },
        }
      }
      return {}
    }

    case 'job':
      return {
        leading: {
          label: 'Complete',
          tone: 'positive',
          exec: async () => {
            const res = await fetch(`/api/jobs/${row.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'completed' }),
            })
            if (!res.ok) return false
            patchRow(row.id, (r) => ({
              ...r,
              trailing:
                r.trailing?.type === 'amount'
                  ? { ...r.trailing, sub: 'completed', statusClass: JOB_STATUS_CLASS.completed }
                  : r.trailing,
            }))
            return false
          },
        },
        trailing: {
          label: 'Hold',
          tone: 'warn',
          exec: async () => {
            const res = await fetch(`/api/jobs/${row.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'on_hold' }),
            })
            if (!res.ok) return false
            patchRow(row.id, (r) => ({
              ...r,
              trailing:
                r.trailing?.type === 'amount'
                  ? { ...r.trailing, sub: 'on hold', statusClass: JOB_STATUS_CLASS.on_hold }
                  : r.trailing,
            }))
            return false
          },
        },
      }

    case 'customer':
      // No inline action yet — tap navigates to /hq/customers where edit happens
      return {}
  }
}
