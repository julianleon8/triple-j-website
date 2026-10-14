import { PlanView } from '@/components/builder/PlanView'
import { designSchema } from '@/lib/builder/design'
import { encodeDesign } from '@/lib/builder/share'
import { summaryRows } from '@/lib/builder/summary'

/**
 * The design a 3D-builder lead was sent with: the plan, the spec rows and a
 * link that reopens it in the builder. The builder is a public page, so the
 * link opens a new tab rather than leaving the installed HQ app with no way
 * back. A row whose design no longer parses (an older schema) renders nothing;
 * its message still carries the summary and link.
 */
export function BuilderDesignCard({ design }: { design: unknown }) {
  const parsed = designSchema.safeParse(design)
  if (!parsed.success) return null
  const d = parsed.data
  return (
    <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">3D design</h2>
        <a
          href={`/build#d=${encodeDesign(d)}`}
          target="_blank"
          rel="noopener"
          className="text-[13px] font-semibold text-(--link-fg)"
        >
          Open in 3D →
        </a>
      </div>
      <PlanView design={d} tone="dark" className="mt-3 h-[220px] w-full" />
      <dl className="mt-3 grid grid-cols-1 gap-y-2 text-[14px]">
        {summaryRows(d).map((r) => (
          <div key={r.k} className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
            <dt className="text-(--text-tertiary)">{r.k}</dt>
            <dd className="text-(--text-primary)">{r.v}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
