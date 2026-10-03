import type { Locale } from '@/i18n/config'
import { formatLongDate } from '@/i18n/config'
import { SHARED } from '@/i18n/copy/shared'
import { SITE } from '@/lib/site'

type Props = {
  /** ISO date when this page was last verified for accuracy. */
  asOf: string
  locale?: Locale
}

/**
 * E-E-A-T byline for comparison + alternatives pages.
 *
 * Surfaces:
 *   - Who reviewed the page (the company, by role and city)
 *   - Last updated date (Trustworthiness — shows you maintain the page)
 *
 * Renders inline in the page hero section, below the H1+subhead.
 * No person is named on the site (Locked Decisions → No names on the
 * site, 2026-10-03), so there is no Person schema: the reviewer is the
 * Organization the layout already describes.
 */
export function AuthorByline({ asOf, locale = 'en' }: Props) {
  const t = SHARED[locale].byline
  const formattedDate = formatLongDate(asOf, locale)

  return (
    <>
      {/* Forge: sits under the hero actions on a navy band. */}
      <div className="mt-8 flex flex-col gap-3 text-[14px] text-white/70 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-forge-silver/30 bg-forge-navy-raised font-forge-display text-[12px] font-bold text-forge-silver">
            TJ
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-white">
              {t.reviewed(SITE.name)}
            </div>
            <div className="mt-0.5 text-[12px] text-forge-steel-light">
              {t.role}
            </div>
          </div>
        </div>
        <div className="hidden h-6 w-px bg-white/20 sm:block" aria-hidden="true" />
        <div className="text-[12px] text-forge-steel-light">
          {t.verified} <time dateTime={asOf}>{formattedDate}</time>
        </div>
      </div>
    </>
  )
}
