import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { ArrowRightIcon } from '@/components/ui/icons'
import {
  ALTERNATIVES_CONTENT,
  ALTERNATIVES_SLUGS,
  type AlternativesSlug,
} from '@/lib/competitors'

type Props = {
  /** Current page's slug — excluded from the rendered list so we don't
   *  link to ourselves. Pass 'roundup' for the local roundup page (it's
   *  not in the AlternativesSlug enum). */
  currentSlug: AlternativesSlug | 'roundup'
}

/**
 * Bottom-of-page cluster linking to the other comparison pages.
 *
 * Builds a topical authority cluster — every comparison page links to the
 * other 4, plus the local roundup. Improves dwell time + internal linking
 * signal for the comparison content category.
 */
export function RelatedComparisons({ currentSlug }: Props) {
  const otherAlternatives = ALTERNATIVES_SLUGS.filter((s) => s !== currentSlug).map(
    (s) => ALTERNATIVES_CONTENT[s],
  )

  // Local roundup is a separate route, not in the alternatives data — link
  // it explicitly. Hidden when we're already on the roundup page.
  const showRoundupLink = currentSlug !== 'roundup'

  return (
    <section
      aria-labelledby="related-comparisons-heading"
      className="py-14 md:py-16 bg-(--color-brand-50) border-y border-(--color-brand-100)"
    >
      <Container>
        <div className="flex items-center gap-3 mb-6">
          <span
            id="related-comparisons-heading"
            className="text-xs font-bold uppercase tracking-[0.18em] text-(--color-brand-700)"
          >
            Other Comparisons
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-(--color-brand-200)" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherAlternatives.map((alt) => (
            <Link
              key={alt.slug}
              href={`/alternatives/${alt.slug}`}
              className="group block rounded-xl border border-(--color-brand-100) bg-white p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-(--color-brand-700) mb-2">
                Alternative
              </p>
              <h3 className="text-base font-extrabold text-ink-900 leading-snug group-hover:text-(--color-brand-700) transition-colors">
                {alt.h1}
              </h3>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-(--color-brand-600) group-hover:gap-2.5 transition-all">
                Compare
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
          {showRoundupLink && (
            <Link
              href="/best-metal-carport-builders-temple-tx"
              className="group block rounded-xl border border-(--color-brand-300) bg-(--color-brand-100)/40 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-(--color-brand-700) mb-2">
                Local Roundup
              </p>
              <h3 className="text-base font-extrabold text-ink-900 leading-snug group-hover:text-(--color-brand-700) transition-colors">
                Best Metal Carport Builders in Temple, TX
              </h3>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-(--color-brand-600) group-hover:gap-2.5 transition-all">
                See the roundup
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </span>
            </Link>
          )}
        </div>
      </Container>
    </section>
  )
}
