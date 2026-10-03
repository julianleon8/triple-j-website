import Link from 'next/link'

import type { Locale } from '@/i18n/config'
import { SHARED } from '@/i18n/copy/shared'
import { localizeHref } from '@/i18n/routes'
import { ALTERNATIVES_SLUGS, type AlternativesSlug } from '@/lib/competitors'
import { getAlternativesContent } from '@/lib/competitors.es'

type Props = {
  /** Current page's slug — excluded from the rendered list so we don't
   *  link to ourselves. Pass 'roundup' for the local roundup page (it's
   *  not in the AlternativesSlug enum). */
  currentSlug: AlternativesSlug | 'roundup'
  locale?: Locale
}

/**
 * Bottom-of-page cluster linking to the other comparison pages.
 *
 * Builds a topical authority cluster — every comparison page links to the
 * other 4, plus the local roundup. Improves dwell time + internal linking
 * signal for the comparison content category.
 *
 * Forge: white band (the fog quote band follows it), silver-framed white
 * tiles; the local roundup tile is the navy one.
 */
export function RelatedComparisons({ currentSlug, locale = 'en' }: Props) {
  const t = SHARED[locale].comparisons
  const otherAlternatives = ALTERNATIVES_SLUGS.filter((s) => s !== currentSlug).flatMap((s) => {
    const content = getAlternativesContent(s, locale)
    return content ? [content] : []
  })

  // Local roundup is a separate route, not in the alternatives data — link
  // it explicitly. Hidden when we're already on the roundup page.
  const showRoundupLink = currentSlug !== 'roundup'

  return (
    <section
      aria-labelledby="related-comparisons-heading"
      data-forge=""
      data-tone="light"
      className="bg-white py-[clamp(48px,5vw,80px)] text-forge-navy"
    >
      <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
        <div className="mb-7 flex items-center gap-4">
          <span
            id="related-comparisons-heading"
            className="forge-eyebrow m-0 text-forge-slate"
          >
            {t.other}
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-forge-mist" />
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
          {otherAlternatives.map((alt) => (
            <Link
              key={alt.slug}
              href={localizeHref(`/alternatives/${alt.slug}`, locale)}
              className="group flex flex-col rounded-[12px] border border-forge-silver bg-white px-6 pt-6 pb-[22px] transition-colors duration-200 hover:border-forge-navy"
            >
              <p className="m-0 text-[11px] font-bold uppercase tracking-[.2em] text-forge-slate">
                {t.alternative}
              </p>
              <h3 className="mt-2.5 font-forge-display text-[19px] font-bold leading-[1.25] text-forge-navy">
                {alt.h1}
              </h3>
              <span className="mt-auto pt-4 text-[14px] font-semibold text-forge-navy">
                {t.compare}{' '}
                <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          ))}
          {showRoundupLink && (
            <Link
              href={localizeHref('/best-metal-carport-builders-temple-tx', locale)}
              data-tone="dark"
              className="group flex flex-col rounded-[12px] border border-forge-navy bg-forge-navy px-6 pt-6 pb-[22px] text-white transition-colors duration-200 hover:bg-forge-navy-raised"
            >
              <p className="m-0 text-[11px] font-bold uppercase tracking-[.2em] text-forge-silver">
                {t.roundupKicker}
              </p>
              <h3 className="mt-2.5 font-forge-display text-[19px] font-bold leading-[1.25] text-white">
                {t.roundupTitle}
              </h3>
              <span className="mt-auto pt-4 text-[14px] font-semibold text-forge-silver group-hover:text-white">
                {t.roundupLink}{' '}
                <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
