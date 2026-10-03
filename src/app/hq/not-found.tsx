import Link from 'next/link'

/**
 * An HQ page's `notFound()` (a deleted lead, quote, job or customer). HQ is
 * its own root layout, so it needs its own not-found; this renders inside
 * the HQ chrome and points back to the dashboard.
 */
export default function HqNotFound() {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-20 text-center">
      <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-(--text-tertiary)">Not found</p>
      <h1 className="mt-3 text-[22px] font-bold text-(--text-primary)">That record isn’t here.</h1>
      <p className="mt-2 text-[15px] text-(--text-secondary)">It may have been deleted or merged.</p>
      <Link href="/hq" className="mt-6 rounded-xl bg-(--surface-3) px-5 py-3 text-[15px] font-semibold text-(--text-primary)">
        Back to HQ
      </Link>
    </div>
  )
}
