'use client'

import { useMemo, useState } from 'react'
import type { PipelineRow } from '@/lib/pipeline'
import { PipelineList } from '@/components/hq/PipelineList'
import { SegmentedControl } from '@/components/hq/ui/SegmentedControl'
import { inSegment, type QuoteCounts, type QuoteSegment } from '@/lib/hq/quote-segments'

type Props = {
  rows: PipelineRow[]
  counts: QuoteCounts
}

function statusOf(row: PipelineRow): string | null {
  if (!row.trailing) return null
  if (row.trailing.type === 'amount') return row.trailing.sub ?? null
  if (row.trailing.type === 'status') return row.trailing.value
  return null
}

export function QuotesList({ rows, counts }: Props) {
  const [seg, setSeg] = useState<QuoteSegment>('all')

  const filtered = useMemo(
    () => rows.filter((r) => inSegment(statusOf(r), seg)),
    [rows, seg],
  )

  return (
    <div className="space-y-3">
      {/* Quotes are tracked here, not built here. Stated on the screen rather
          than left as a missing button, so the absence reads as a decision. */}
      <div className="rounded-md border border-dashed border-(--border-strong) p-3.5">
        <p className="font-display text-[14px] font-bold uppercase tracking-[0.06em] text-(--text-secondary)">
          Tracking only
        </p>
        <p className="mt-1 text-[14px] leading-snug text-(--text-tertiary)">
          Quotes are built outside HQ. This list tracks what went out and what came back.
        </p>
      </div>

      <SegmentedControl
        ariaLabel="Filter quotes"
        value={seg}
        onChange={(k) => setSeg(k as QuoteSegment)}
        options={[
          { key: 'out',  label: 'Out',  count: counts.out },
          { key: 'won',  label: 'Won',  count: counts.won },
          { key: 'lost', label: 'Lost', count: counts.lost },
          { key: 'all',  label: 'All',  count: counts.all },
        ]}
      />

      <PipelineList rows={filtered} hideFilters />
    </div>
  )
}
