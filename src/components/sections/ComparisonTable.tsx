import Link from 'next/link'

import { SectionHeading } from '@/components/forge/SectionHeading'
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
  /** Band background, so the host page can keep the white/fog rhythm. */
  tone?: 'white' | 'fog'
}

// TODO(hearth): once Hearth Financial Services integrates, the
// competitors data file will gain a 'monthly_financing' field per
// competitor. Add a "Monthly financing" row to the rows array on each
// page so the comparison table renders an "as low as $X/mo" cell.

// Forge status marks. The glyph carries the meaning (✓ ✗ ~ —), so no
// red/green is needed; Triple J's "yes" is the only filled navy mark.
const STATUS_STYLES = {
  yes: { icon: '✓', cls: 'border-forge-slate bg-forge-slate text-white', label: 'Yes' },
  no: { icon: '✗', cls: 'border-forge-steel bg-white text-forge-slate', label: 'No' },
  partial: { icon: '~', cls: 'border-forge-steel-light bg-forge-mist text-forge-slate', label: 'Partial' },
  unknown: { icon: '—', cls: 'border-forge-mist bg-white text-forge-steel', label: 'Unknown' },
} as const

const SELF_YES = 'border-forge-navy bg-forge-navy text-white'

/**
 * Comparison matrix used on /alternatives/[slug] and the local roundup.
 *
 * Forge: navy header row, white/fog zebra rows inside a silver 12px frame,
 * navy row headers, slate cells. Triple J's column is emphasised in navy 600
 * so it pops without disparaging the other columns. All cells include short
 * text notes when supplied so the reader gets context, not just an icon.
 *
 * Mobile: the table scrolls horizontally inside its frame — competitor
 * column widths are min-w-[140px] so multiple columns fit on phones without
 * shrinking text below readability, and the page itself never scrolls sideways.
 */
export function ComparisonTable({
  competitorSlugs,
  rows,
  eyebrow,
  heading,
  subheading,
  tone = 'white',
}: Props) {
  const competitors = competitorSlugs
    .map((slug) => COMPETITORS[slug])
    .filter(Boolean)
  // A two-column head-to-head reads badly stretched across 1360px.
  const frameMax = competitors.length <= 3 ? 'max-w-[1000px]' : ''

  return (
    <section
      aria-labelledby="comparison-table-heading"
      data-forge=""
      data-tone="light"
      className={`${tone === 'fog' ? 'bg-forge-fog' : 'bg-white'} py-[clamp(64px,7vw,104px)] text-forge-navy`}
    >
      <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
        <SectionHeading
          eyebrow={eyebrow}
          line1={heading}
          lede={subheading}
          ledeMax="max-w-[760px]"
          size="compact"
          headingId="comparison-table-heading"
          className="max-w-[860px]"
        />

        <div
          className={`mt-10 overflow-x-auto rounded-[12px] border border-forge-silver bg-white ${frameMax}`}
        >
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="bg-forge-navy text-white">
                <th
                  scope="col"
                  className="min-w-[180px] px-5 py-4 text-left align-bottom text-[11px] font-bold uppercase tracking-[.2em] text-forge-steel-light"
                >
                  Feature
                </th>
                {competitors.map((c) => {
                  const isSelf = c.type === 'self'
                  return (
                    <th
                      key={c.slug}
                      scope="col"
                      className={`min-w-[140px] px-5 py-4 text-left align-bottom ${
                        isSelf ? 'bg-forge-navy-raised shadow-[inset_0_3px_0_var(--color-silver)]' : ''
                      }`}
                    >
                      <div className="text-[14px] font-semibold leading-tight text-white">
                        {isSelf ? (
                          c.name
                        ) : (
                          <a
                            href={c.homeUrl}
                            target="_blank"
                            rel="nofollow noopener"
                            className="border-b border-white/30 transition-colors hover:border-white"
                          >
                            {c.name}
                          </a>
                        )}
                      </div>
                      <div
                        className={`mt-1.5 text-[10px] font-semibold uppercase tracking-[.16em] ${
                          isSelf ? 'text-forge-silver' : 'text-forge-steel-light'
                        }`}
                      >
                        {c.type === 'self' ? 'This is us' : c.type === 'national-kit' ? 'National kit' : 'Local builder'}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => {
                const last = rowIdx === rows.length - 1
                return (
                  <tr
                    key={row.label}
                    className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-forge-fog'}
                  >
                    <th
                      scope="row"
                      className={`px-5 py-4 text-left align-top font-normal ${last ? '' : 'border-b border-forge-mist'}`}
                    >
                      <div className="text-[14px] font-semibold leading-snug text-forge-navy">
                        {row.label}
                      </div>
                      {row.description && (
                        <div className="mt-1 max-w-[260px] text-[13px] leading-snug text-forge-slate">
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
                      const mark = isSelf && status === 'yes' ? SELF_YES : style.cls
                      return (
                        <td
                          key={c.slug}
                          className={`px-5 py-4 align-top ${last ? '' : 'border-b border-forge-mist'} ${
                            isSelf
                              ? 'border-x border-x-forge-silver font-semibold text-forge-navy'
                              : 'text-forge-slate'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span
                              aria-label={style.label}
                              className={`inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border text-[13px] font-bold leading-none ${mark}`}
                            >
                              {style.icon}
                            </span>
                            {note && (
                              <div className="max-w-[200px] pt-[3px] text-[13px] leading-snug">
                                {note}
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-6 max-w-[760px] text-[12px] leading-[1.6] text-forge-slate">
          Comparison based on each company&rsquo;s public website information as of the date below.
          Where a competitor&rsquo;s public materials don&rsquo;t document a feature, the cell shows
          &ldquo;—&rdquo; (unknown). We update this comparison quarterly or when competitors ship
          significant changes. Sources cited above link to each company&rsquo;s public site.{' '}
          <Link
            href="/contact"
            className="border-b border-forge-silver font-semibold text-forge-navy transition-colors hover:border-forge-navy"
          >
            Spot something inaccurate? Let us know.
          </Link>
        </p>
      </div>
    </section>
  )
}
