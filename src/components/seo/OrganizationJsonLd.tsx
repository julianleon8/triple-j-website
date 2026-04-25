import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'
import { LOCATIONS, LOCATION_SLUGS } from '@/lib/locations'

/**
 * Site-wide schema.org @graph.
 * Mounted once per marketing page via the marketing layout. Emits a single
 * JSON-LD document with three linked nodes:
 *
 *   - Organization (#organization)  — the legal entity (founder, contactPoint,
 *     availableLanguage, sameAs).
 *   - HomeAndConstructionBusiness   — Triple J's local-business presence,
 *     dual-typed as LocalBusiness for Rich Results validators that look for
 *     the LocalBusiness string. Links back to the Organization via @id.
 *   - WebSite (#website)            — the canonical site URL with the
 *     Organization as publisher.
 *
 * Per-page schemas (Service on /locations/[slug] and /services/[slug],
 * BlogPosting on /blog/[slug], FAQPage on /services/pbr-vs-pbu-panels) all
 * reference these nodes by @id rather than redefining the business inline.
 *
 * NOTE: any field added here must also be reflected in the audit report
 * in docs/SCHEMA-AUDIT.md.
 */
export function OrganizationJsonLd() {
  const url = getSiteUrl()

  const cityAreaServed = LOCATION_SLUGS.map((slug) => ({
    '@type': 'City',
    name: `${LOCATIONS[slug].name}, TX`,
    containedInPlace: { '@type': 'AdministrativeArea', name: `${LOCATIONS[slug].county}, Texas` },
  }))

  // De-duplicated counties for areaServed (cleaner signal for crawlers
  // than repeating the same county once per city).
  const counties = Array.from(
    new Set(LOCATION_SLUGS.map((slug) => LOCATIONS[slug].county)),
  ).map((county) => ({
    '@type': 'AdministrativeArea',
    name: `${county}, Texas`,
  }))

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${url}/#organization`,
        name: SITE.name,
        legalName: SITE.legalName,
        alternateName: SITE.shortName,
        description:
          'Family-owned Central Texas metal building contractor — welded or bolted carports, garages, barns, and RV covers with turnkey concrete pads.',
        url,
        logo: {
          '@type': 'ImageObject',
          url: `${url}/images/logo-lion.png`,
          width: 512,
          height: 512,
        },
        image: `${url}/og-default.jpg`,
        foundingDate: String(SITE.established),
        founder: {
          '@type': 'Person',
          name: 'Juan Leon',
          jobTitle: 'Founder',
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: SITE.address.street,
          addressLocality: SITE.address.city,
          addressRegion: SITE.address.state,
          postalCode: SITE.address.zip,
          addressCountry: 'US',
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: SITE.phone,
            email: SITE.email,
            contactType: 'customer service',
            areaServed: 'US-TX',
            availableLanguage: ['English', 'Spanish'],
          },
        ],
        sameAs: Object.values(SITE.social).filter(Boolean),
      },
      {
        '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
        '@id': `${url}/#localbusiness`,
        name: SITE.name,
        description:
          'Welded or bolted metal carports, garages, barns, and RV covers with turnkey concrete — built by our Temple, TX crew across Central Texas.',
        url,
        logo: `${url}/images/logo-lion.png`,
        image: `${url}/og-default.jpg`,
        telephone: SITE.phone,
        email: SITE.email,
        priceRange: '$$',
        currenciesAccepted: 'USD',
        paymentAccepted: 'Cash, Check, Credit Card, ACH',
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
          // Temple, TX 76502 — approximate centroid of the Tem-Bel Ln area.
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
        areaServed: [...cityAreaServed, ...counties],
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
          'HOA-compliant structures',
          'lean-to patios',
          'house additions',
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Triple J Metal services',
          itemListElement: [
            { name: 'Carports', url: `${url}/services/carports` },
            { name: 'Metal garages', url: `${url}/services/metal-garages` },
            { name: 'Metal barns', url: `${url}/services/barns` },
            { name: 'RV and boat covers', url: `${url}/services/rv-covers` },
            { name: 'Turnkey carports with concrete', url: `${url}/services/turnkey-carports-with-concrete` },
            { name: 'HOA-compliant structures', url: `${url}/services/hoa-compliant-structures` },
          ].map((svc, i) => ({
            '@type': 'Offer',
            position: i + 1,
            itemOffered: {
              '@type': 'Service',
              name: svc.name,
              url: svc.url,
            },
          })),
        },
        parentOrganization: { '@id': `${url}/#organization` },
      },
      {
        '@type': 'WebSite',
        '@id': `${url}/#website`,
        url,
        name: SITE.name,
        description:
          'Welded or bolted metal carports, garages, barns, and RV covers across Central Texas.',
        publisher: { '@id': `${url}/#organization` },
        inLanguage: 'en-US',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, '\\u003c'),
      }}
    />
  )
}
