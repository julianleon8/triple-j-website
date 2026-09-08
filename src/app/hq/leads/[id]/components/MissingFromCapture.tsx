import Link from 'next/link'
import { Plus } from 'lucide-react'
import {
  FIELD_LABELS,
  missingCaptureFields,
  type CapturedLead,
} from '@/lib/hq/capture-draft'

/**
 * The blanks a capture left behind, with one tap back into the screen that
 * fills them.
 *
 * What counts as missing comes from `missingCaptureFields()` in the tested
 * capture module — the same definition the checklist uses — so this card and
 * /hq/capture can never disagree about what is still empty.
 */
export function MissingFromCapture({ leadId, lead }: { leadId: string; lead: CapturedLead }) {
  const missing = missingCaptureFields(lead)
  if (missing.length === 0) return null

  return (
    <section
      aria-labelledby="missing-heading"
      className="rounded-md border border-dashed border-(--border-strong) p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="missing-heading"
          className="font-display text-[14px] font-bold uppercase tracking-[0.06em] text-(--text-secondary)"
        >
          Missing from capture
        </h2>
        <Link
          href={`/hq/capture?id=${leadId}`}
          className="tap-solid inline-flex shrink-0 items-center gap-1 rounded-md bg-(--brand-fg) px-3 py-1.5 text-[13px] font-bold uppercase tracking-[0.04em] text-(--text-on-brand)"
        >
          <Plus size={14} strokeWidth={2.6} aria-hidden /> Add
        </Link>
      </div>

      <p className="mt-2 font-mono text-[11px] uppercase leading-relaxed tracking-[0.04em] text-(--text-tertiary)">
        {missing.map((k) => FIELD_LABELS[k]).join(' · ')}
      </p>
    </section>
  )
}
