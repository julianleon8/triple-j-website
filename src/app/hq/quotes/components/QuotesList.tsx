'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import type { PipelineRow } from '@/lib/pipeline'
import { PipelineList } from '@/components/hq/PipelineList'
import { SegmentedControl } from '@/components/hq/ui/SegmentedControl'

type Segment = 'all' | 'draft' | 'sent' | 'accepted'

type Counts = { all: number; draft: number; sent: number; accepted: number }

type Props = {
  rows: PipelineRow[]
  counts: Counts
}

function statusOf(row: PipelineRow): string | null {
  if (!row.trailing) return null
  if (row.trailing.type === 'amount') return row.trailing.sub ?? null
  if (row.trailing.type === 'status') return row.trailing.value
  return null
}

export function QuotesList({ rows, counts }: Props) {
  const [seg, setSeg] = useState<Segment>('all')

  const filtered = useMemo(() => {
    if (seg === 'all') return rows
    return rows.filter((r) => statusOf(r) === seg)
  }, [rows, seg])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <SegmentedControl
          ariaLabel="Filter quotes"
          value={seg}
          onChange={(k) => setSeg(k as Segment)}
          options={[
            { key: 'all',      label: 'All',      count: counts.all },
            { key: 'draft',    label: 'Draft',    count: counts.draft },
            { key: 'sent',     label: 'Sent',     count: counts.sent },
            { key: 'accepted', label: 'Accepted', count: counts.accepted },
          ]}
          className="flex-1"
        />
        <Link
          href="/hq/quotes/new"
          className="shrink-0 inline-flex items-center gap-1 rounded-full bg-(--brand-fg) px-3 py-1.5 text-[13px] font-semibold text-white tap-solid"
        >
          <Plus size={14} strokeWidth={2} /> New
        </Link>
      </div>

      <PipelineList rows={filtered} hideFilters />
    </div>
  )
}
