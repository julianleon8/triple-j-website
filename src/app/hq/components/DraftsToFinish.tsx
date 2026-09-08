import Link from 'next/link'
import { ChevronRight, Pencil } from 'lucide-react'
import { getAdminClient } from '@/lib/supabase/admin'

/**
 * "N drafts to finish" — extracted from CompactKPIStrip when the KPI tiles were
 * cut from Today.
 *
 * It was never a stats row and must not follow them to /hq/more/stats: a draft
 * scores 0 in `urgencyScore`, deliberately, so it can never surface as the
 * call-next card. This is the only place on Today an unfinished capture is
 * allowed to ask for attention, and it is the only way back to one.
 */
export async function DraftsToFinish() {
  const { count } = await getAdminClient()
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('is_draft', true)

  const draftCount = count ?? 0
  if (draftCount === 0) return null

  return (
    <Link
      href="/hq/leads"
      className="tap-list flex min-h-[60px] items-center gap-3 rounded-md border border-(--border-subtle) bg-(--surface-2) px-4 py-2"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-(--surface-3) text-(--brand-fg)">
        <Pencil size={17} strokeWidth={2.2} aria-hidden />
      </span>
      <span className="flex-1 font-display text-[19px] font-semibold uppercase tracking-[0.04em] text-(--text-primary)">
        {draftCount} {draftCount === 1 ? 'draft' : 'drafts'} to finish
      </span>
      <ChevronRight size={18} strokeWidth={2.2} className="shrink-0 text-(--text-tertiary)" aria-hidden />
    </Link>
  )
}
