/**
 * HQ skeleton primitives. Server-component-safe (no client deps) so they
 * can be passed as Suspense fallbacks in async server components.
 *
 * The visual language matches the iOS PWA: rounded surfaces, surface-2
 * background, gentle pulse. Each component represents a common HQ shape:
 *
 *   <CardSkeleton />     — rectangle ~card height (header card on detail pages)
 *   <RowSkeleton n={?} /> — vertical list of fake rows (lists, feeds)
 *   <StripSkeleton />    — short horizontal pill (KPI strip, action bar)
 *   <HeaderSkeleton />   — ~header-card-height tall, used to anchor first paint
 *
 * Usage:
 *
 *   <Suspense fallback={<HeaderSkeleton />}>
 *     <LeadHeader id={id} />
 *   </Suspense>
 */

type RowSkeletonProps = {
  /** Number of rows to render. Default 4. */
  n?: number
  /** Row height in Tailwind unit (e.g. "16" → h-16). Default "16". */
  rowH?: '12' | '14' | '16' | '20'
  /** Whether to render a small heading bar above the rows. Default true. */
  withHeading?: boolean
}

const ROW_H_CLASS: Record<NonNullable<RowSkeletonProps['rowH']>, string> = {
  '12': 'h-12',
  '14': 'h-14',
  '16': 'h-16',
  '20': 'h-20',
}

export function RowSkeleton({ n = 4, rowH = '16', withHeading = true }: RowSkeletonProps = {}) {
  return (
    <section aria-hidden="true" className="space-y-2">
      {withHeading && (
        <div className="h-4 w-28 rounded-full bg-(--surface-2) animate-pulse" />
      )}
      <div className="space-y-1.5">
        {Array.from({ length: n }).map((_, i) => (
          <div key={i} className={`${ROW_H_CLASS[rowH]} rounded-xl bg-(--surface-2) animate-pulse`} />
        ))}
      </div>
    </section>
  )
}

type CardSkeletonProps = {
  /** Tailwind height class. Default "h-40" (matches NextActionCard). */
  height?: 'h-16' | 'h-24' | 'h-32' | 'h-40' | 'h-48'
  /** Border radius. Default "rounded-3xl" (matches HQ card style). */
  radius?: 'rounded-2xl' | 'rounded-3xl'
}

export function CardSkeleton({ height = 'h-40', radius = 'rounded-3xl' }: CardSkeletonProps = {}) {
  return (
    <div
      aria-hidden="true"
      className={`${height} ${radius} border border-(--border-subtle) bg-(--surface-2) animate-pulse`}
    />
  )
}

/** Compact strip — used for KPI bars, action drawers, ColdBanner-shaped slots. */
export function StripSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-16 rounded-2xl border border-(--border-subtle) bg-(--surface-2) animate-pulse"
    />
  )
}

/** Header card placeholder — same dimensions as the typical detail-page hero. */
export function HeaderSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-32 rounded-2xl border border-(--border-subtle) bg-(--surface-2) animate-pulse"
    />
  )
}
