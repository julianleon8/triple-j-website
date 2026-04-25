import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'
import { LOCATIONS, LOCATION_SLUGS } from '@/lib/locations'

/**
 * Site-wide LocalBusiness / Organization schema.
 * Emits once per marketing page via the marketing layout so every crawl
 * establishes the canonical business entity with full NAP + areaServed.
 *
 * Google Search + GBP prefer the most complete LocalBusiness node they
 * find; having this on every marketing page (with matching data) is the
 * strongest local-SEO signal a single-location contractor can give.
 */
export function OrganizationJsonLd() {
  const url = getSiteUrl()

  const areaServed = LOCATION_SLUGS.map((slug) => ({
    '@type': 'City',
    name: `${LOCATIONS[slug].name}, TX`,
    containedInPlace: { '@type': 'State', name: 'Texas' },
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${url}/#localbusiness`,
    name: SITE.name,
    legalName: SITE.legalName,
    alternateName: SITE.shortName,
    description:
      'Welded or bolted metal carports, garages, barns, and RV covers with turnkey concrete — built by our Temple, TX crew across Central Texas.',
    url,
    logo: `${url}/images/logo-lion.png`,
    image: `${url}/og-default.jpg`,
    telephone: SITE.phone,
    email: SITE.email,
    priceRange: '$$',
    foundingDate: String(SITE.established),
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.zip,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      // Temple, TX 76502 approximate
      latitude: 31.0982,
      longitude: -97.3428,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:00',
        closes: '18:00',
      },
    ],
    areaServed,
    sameAs: Object.values(SITE.social).filter(Boolean),
    knowsAbout: [
      'metal carports',
      'metal garages',
      'metal barns',
      'RV covers',
      'red iron construction',
      'welded metal buildings',
      'bolted metal buildings',
      'PBR panels',
      'PBU panels',
      'concrete pads',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Triple J Metal services',
      itemListElement: [
        'Carports',
        'Metal garages',
        'Metal barns',
        'RV and boat covers',
        'Turnkey installations with concrete',
      ].map((svc) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: svc },
      })),
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
  )
}
