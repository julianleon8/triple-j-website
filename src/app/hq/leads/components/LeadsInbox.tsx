'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ChevronDown, FileText, Trash2 } from 'lucide-react'
import type { PipelineRow } from '@/lib/pipeline'
import { LEAD_STATUS_CLASS, leadToRow, type LeadForRow } from '@/lib/pipeline'
import { SegmentedControl } from '@/components/hq/ui/SegmentedControl'
import { MessagesRow } from '@/components/hq/MessagesRow'
import { SwipeActions, type SwipeAction } from '@/components/hq/SwipeActions'
import { PullToRefresh } from '@/components/hq/PullToRefresh'
import { ActionDrawer } from '@/components/hq/ActionDrawer'

type Counts = { new: number; hot: number; all: number; done: number }
type Segment = 'new' | 'hot' | 'all' | 'done'

type Props = {
  rows: PipelineRow[]
  counts: Counts
  /** How many leads were fetched server-side. */
  pageSize?: number
  /** Total leads in the DB (for the "older leads exist" footer). */
  totalAll?: number
}

function statusOf(row: PipelineRow): string | null {
  if (!row.trailing || row.trailing.type !== 'status') return null
  return row.trailing.value
}

function matchesSegment(row: PipelineRow, seg: Segment): boolean {
  const s = statusOf(row)
  if (!s) return false
  if (seg === 'all') return true
  if (seg === 'new') return s === 'new'
  if (seg === 'hot') return s === 'contacted' || s === 'quoted'
  return s === 'won' || s === 'lost'
}

export function LeadsInbox({ rows: initialRows, counts, pageSize, totalAll }: Props) {
  const router = useRouter()
  const [rows, setRows] = useState(initialRows)
  const [seg, setSeg] = useState<Segment>('new')
  const [, startTransition] = useTransition()
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)
  /** Track exhaustion: once we've fetched and got fewer rows than asked
   *  for, OR we've loaded as many as totalAll claims exists, hide the
   *  Load-older button. */
  const [exhausted, setExhausted] = useState(false)

  const filtered = useMemo(() => rows.filter((r) => matchesSegment(r, seg)), [rows, seg])

  function patchRow(id: string, fn: (r: PipelineRow) => PipelineRow) {
    setRows((prev) => prev.map((r) => (r.id === id ? fn(r) : r)))
  }
  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  async function refresh() {
    await new Promise<void>((resolve) => {
      startTransition(() => { router.refresh(); resolve() })
    })
  }

  async function markContacted(id: string) {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'contacted' }),
    })
    if (!res.ok) return
    patchRow(id, (r) => ({
      ...r,
      trailing: { type: 'status', value: 'contacted', statusClass: LEAD_STATUS_CLASS.contacted },
      badges: (r.badges ?? []).filter((b) => b.tone !== 'asap'),
    }))
  }

  async function deleteLead(id: string) {
    if (typeof window !== 'undefined' && !window.confirm('Delete this lead?')) return
    const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' })
    if (!res.ok) return
    removeRow(id)
  }

  function sendQuote(id: string) {
    router.push(`/hq/quotes/new?leadId=${id}`)
  }

  async function loadOlder() {
    if (loadingMore || exhausted) return
    setLoadingMore(true)
    setLoadMoreError(null)
    // Use the oldest currently-loaded created_at as the cursor.
    const oldest = rows[rows.length - 1]?.created_at
    if (!oldest) {
      setLoadingMore(false)
      setExhausted(true)
      return
    }
    const requested = pageSize ?? 50
    try {
      const res = await fetch(
        `/api/leads?before=${encodeURIComponent(oldest)}&limit=${requested}`,
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = (await res.json()) as { leads: LeadForRow[] }
      const fetched = body.leads ?? []
      const newRows = fetched.map(leadToRow)
      setRows((prev) => [...prev, ...newRows])
      // If we got fewer than asked OR the cumulative count hits totalAll,
      // there's nothing older to load.
      if (
        fetched.length < requested ||
        (totalAll !== undefined && rows.length + fetched.length >= totalAll)
      ) {
        setExhausted(true)
      }
    } catch (err) {
      setLoadMoreError(err instanceof Error ? err.message : 'Failed to load older leads')
    } finally {
      setLoadingMore(false)
    }
  }

  function callAction(phone: string | null | undefined): SwipeAction {
    return {
      label: 'Call',
      tone: 'positive',
      exec: async () => {
        if (phone && typeof window !== 'undefined') {
          window.location.href = `tel:${phone}`
        }
        return false
      },
    }
  }

  function actionsAction(id: string): SwipeAction {
    return {
      label: 'Actions',
      tone: 'neutral',
      exec: async () => {
        setDrawerId(id)
        return false
      },
    }
  }

  return (
    <>
      <PullToRefresh onRefresh={refresh}>
        <div className="space-y-3">
          <SegmentedControl
            ariaLabel="Filter leads"
            value={seg}
            onChange={(k) => setSeg(k as Segment)}
            options={[
              { key: 'new',  label: 'New',  count: counts.new },
              { key: 'hot',  label: 'Hot',  count: counts.hot },
              { key: 'all',  label: 'All',  count: counts.all },
              { key: 'done', label: 'Done', count: counts.done },
            ]}
          />

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-(--border-subtle) bg-(--surface-2) p-10 text-center">
              <p className="text-sm text-(--text-secondary)">No leads in this segment.</p>
            </div>
          ) : (
            <ul className="divide-y divide-(--border-subtle) overflow-hidden rounded-xl border border-(--border-subtle) bg-(--surface-2)">
              {filtered.map((row) => (
                <li key={row.id}>
                  <SwipeActions
                    leading={callAction(row.meta?.phone)}
                    trailing={actionsAction(row.id)}
                    hapticOnCommit="success"
                  >
                    <MessagesRow row={row} />
                  </SwipeActions>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination footer: live "Load older" cursor button.
              Phase 3 paginates the server fetch to 50 rows; this hooks
              up the cursor request so the operator can incrementally
              grow the list. */}
          {pageSize !== undefined && totalAll !== undefined && rows.length < totalAll && !exhausted && (
            <div className="pt-2">
              <button
                type="button"
                onClick={loadOlder}
                disabled={loadingMore}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-(--border-subtle) bg-(--surface-2) px-4 py-3 text-[14px] font-semibold text-(--text-primary) tap-list disabled:opacity-50"
              >
                <ChevronDown size={16} strokeWidth={2} />
                {loadingMore ? 'Loading…' : `Load ${pageSize} older leads`}
              </button>
              <p className="text-center text-[12px] text-(--text-tertiary) pt-2">
                Showing {rows.length} of {totalAll} total leads.
              </p>
              {loadMoreError && (
                <p className="text-center text-[12px] text-red-500 pt-1">{loadMoreError}</p>
              )}
            </div>
          )}
          {exhausted && (
            <p className="text-center text-[12px] text-(--text-tertiary) pt-2">
              That&rsquo;s every lead in the database.
            </p>
          )}
        </div>
      </PullToRefresh>

      <ActionDrawer
        open={drawerId !== null}
        onClose={() => setDrawerId(null)}
        title="Lead actions"
        actions={[
          {
            label: 'Mark Contacted',
            icon: CheckCircle2,
            onPick: async () => { if (drawerId) await markContacted(drawerId) },
          },
          {
            label: 'Send Quote',
            icon: FileText,
            onPick: () => { if (drawerId) sendQuote(drawerId) },
          },
          {
            label: 'Delete',
            icon: Trash2,
            tone: 'destructive',
            onPick: async () => { if (drawerId) await deleteLead(drawerId) },
          },
        ]}
      />
    </>
  )
}
