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
 * Per Decisions.md / locked answers — Julian is the only person named on the
 * public site (2026-10-03), so he is the reviewer. His title is the one About
 * gives him: Sales & Operations.
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
    name: 'Julian Leon',
    jobTitle: 'Sales & Operations',
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
      {/* Forge: sits under the hero actions on a navy band. */}
      <div className="mt-8 flex flex-col gap-3 text-[14px] text-white/70 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-forge-silver/30 bg-forge-navy-raised font-forge-display text-[12px] font-bold text-forge-silver">
            JL
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-white">
              Reviewed by Julian Leon
            </div>
            <div className="mt-0.5 text-[12px] text-forge-steel-light">
              Sales & Operations · {SITE.name} · Temple, TX
            </div>
          </div>
        </div>
        <div className="hidden h-6 w-px bg-white/20 sm:block" aria-hidden="true" />
        <div className="text-[12px] text-forge-steel-light">
          Last verified <time dateTime={asOf}>{formattedDate}</time>
        </div>
      </div>
    </>
  )
}
