import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { COMPETITORS, type ComparisonRow, type CompetitorSlug } from '@/lib/competitors'

type Props = {
  /** Competitor slugs to render as columns. Triple J should be in this list
   *  if you want it highlighted. Order = column order (left to right). */
  competitorSlugs: CompetitorSlug[]
  /** Feature rows to render. Cells without a value for a given slug render
   *  as 'unknown' (—). */
  rows: ComparisonRow[]
  /** Optional eyebrow above the table heading. */
  eyebrow?: string
  /** Heading text. */
  heading: string
  /** Sub-heading shown under the heading. */
  subheading?: string
}

// TODO(hearth): once Hearth Financial Services integrates, the
// competitors data file will gain a 'monthly_financing' field per
// competitor. Add a "Monthly financing" row to the rows array on each
// page so the comparison table renders an "as low as $X/mo" cell.

const STATUS_STYLES = {
  yes: { icon: '✓', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Yes' },
  no: { icon: '✗', cls: 'bg-red-50 text-red-700 border-red-200', label: 'No' },
  partial: { icon: '~', cls: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Partial' },
  unknown: { icon: '—', cls: 'bg-ink-50 text-ink-400 border-ink-100', label: 'Unknown' },
} as const

/**
 * Comparison matrix used on /alternatives/[slug] and the local roundup.
 *
 * Renders Triple J's column with a brand-blue accent border so it visually
 * pops without disparaging the other columns. All cells include short text
 * notes when supplied so the reader gets context, not just an icon.
 *
 * Mobile: the table scrolls horizontally inside the container — competitor
 * column widths are min-w-[140px] so multiple columns fit on phones without
 * shrinking text below readability.
 */
export function ComparisonTable({
  competitorSlugs,
  rows,
  eyebrow,
  heading,
  subheading,
}: Props) {
  const competitors = competitorSlugs
    .map((slug) => COMPETITORS[slug])
    .filter(Boolean)

  return (
    <section
      aria-labelledby="comparison-table-heading"
      className="py-14 md:py-20 bg-white"
    >
      <Container>
        <div className="max-w-3xl mb-8">
          {eyebrow && (
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-(--color-brand-700)">
              {eyebrow}
            </span>
          )}
          <h2 id="comparison-table-heading" className="mt-2">
            {heading}
          </h2>
          {subheading && (
            <p className="mt-3 text-ink-600 text-base leading-relaxed">{subheading}</p>
          )}
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="text-left text-[11px] font-bold uppercase tracking-wider text-ink-500 px-4 py-3 border-b border-ink-200 align-bottom"
                >
                  Feature
                </th>
                {competitors.map((c) => {
                  const isSelf = c.type === 'self'
                  return (
                    <th
                      key={c.slug}
                      scope="col"
                      className={`text-left px-4 py-3 border-b align-bottom min-w-[140px] ${
                        isSelf
                          ? 'border-(--color-brand-400) bg-(--color-brand-50)'
                          : 'border-ink-200'
                      }`}
                    >
                      <div
                        className={`text-sm font-bold leading-tight ${
                          isSelf ? 'text-(--color-brand-700)' : 'text-ink-900'
                        }`}
                      >
                        {isSelf ? (
                          c.name
                        ) : (
                          <a
                            href={c.homeUrl}
                            target="_blank"
                            rel="nofollow noopener"
                            className="hover:underline"
                          >
                            {c.name}
                          </a>
                        )}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-ink-400 mt-1">
                        {c.type === 'self' ? 'This is us' : c.type === 'national-kit' ? 'National kit' : 'Local builder'}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr
                  key={row.label}
                  className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-ink-50/40'}
                >
                  <th
                    scope="row"
                    className="text-left align-top px-4 py-4 border-b border-ink-100"
                  >
                    <div className="text-[14px] font-semibold text-ink-900 leading-snug">
                      {row.label}
                    </div>
                    {row.description && (
                      <div className="text-[12px] text-ink-500 mt-1 leading-snug max-w-[260px]">
                        {row.description}
                      </div>
                    )}
                  </th>
                  {competitors.map((c) => {
                    const cell = row.cells[c.slug]
                    const status =
                      typeof cell === 'string' ? cell : cell?.status ?? 'unknown'
                    const note = typeof cell === 'object' && cell !== null ? cell.note : null
                    const style = STATUS_STYLES[status]
                    const isSelf = c.type === 'self'
                    return (
                      <td
                        key={c.slug}
                        className={`align-top px-4 py-4 border-b border-ink-100 ${
                          isSelf ? 'bg-(--color-brand-50)/60 border-l border-r border-(--color-brand-100)' : ''
                        }`}
                      >
                        <span
                          aria-label={style.label}
                          className={`inline-flex items-center justify-center h-6 w-6 rounded-full border text-[13px] font-bold leading-none ${style.cls}`}
                        >
                          {style.icon}
                        </span>
                        {note && (
                          <div className="mt-1.5 text-[12px] text-ink-700 leading-snug max-w-[180px]">
                            {note}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-[11px] text-ink-400 leading-relaxed max-w-3xl">
          Comparison based on each company&rsquo;s public website information as of the date below.
          Where a competitor&rsquo;s public materials don&rsquo;t document a feature, the cell shows
          &ldquo;—&rdquo; (unknown). We update this comparison quarterly or when competitors ship
          significant changes. Sources cited above link to each company&rsquo;s public site.{' '}
          <Link
            href="/contact"
            className="text-(--color-brand-700) underline underline-offset-2"
          >
            Spot something inaccurate? Let us know.
          </Link>
        </p>
      </Container>
    </section>
  )
}
