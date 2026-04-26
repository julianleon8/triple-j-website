import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

type Props = {
  /** ISO date when this page was last verified for accuracy. */
  asOf: string
}

/**
 * E-E-A-T byline for comparison + alternatives pages.
 *
 * Surfaces:
 *   - Reviewer name + role + city (Experience signal)
 *   - Last updated date (Trustworthiness — shows you maintain the page)
 *   - JSON-LD Person schema (machine-readable authorship)
 *
 * Renders inline in the page hero section, below the H1+subhead.
 * Per Decisions.md / locked answers — Juan Luis Leon fronts the brand
 * for SEO authorship purposes; he's the LLC's registered owner.
 */
export function AuthorByline({ asOf }: Props) {
  const baseUrl = getSiteUrl()
  const formattedDate = new Date(asOf).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Juan Luis Leon',
    jobTitle: 'Foreman & Founder',
    worksFor: { '@id': `${baseUrl}/#organization`, name: SITE.name },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Temple',
      addressRegion: 'TX',
      addressCountry: 'US',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personLd).replace(/</g, '\\u003c'),
        }}
      />
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 text-sm text-white/70">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-brand-600) text-white text-xs font-extrabold shrink-0">
            JL
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-white">
              Reviewed by Juan Luis Leon
            </div>
            <div className="text-[12px] text-white/55">
              Foreman & founder · Triple J Metal · Temple, TX
            </div>
          </div>
        </div>
        <div className="hidden sm:block h-px w-px bg-white/15" aria-hidden="true" />
        <div className="text-[12px] text-white/55">
          Last verified <time dateTime={asOf}>{formattedDate}</time>
        </div>
      </div>
    </>
  )
}
