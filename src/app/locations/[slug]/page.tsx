import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LOCATIONS, LOCATION_SLUGS } from '@/lib/locations'

export async function generateStaticParams() {
  return LOCATION_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata(
  { params }: PageProps<'/locations/[slug]'>
): Promise<Metadata> {
  const { slug } = await params
  const loc = LOCATIONS[slug]
  if (!loc) return {}

  return {
    title: loc.metaTitle,
    description: loc.metaDescription,
    keywords: [
      `carport builders ${loc.name} tx`,
      `metal carports ${loc.name} texas`,
      `carport installation ${loc.name} tx`,
      `metal building contractor ${loc.name} texas`,
      `welded carport ${loc.name} tx`,
      `affordable carport ${loc.name} texas`,
    ],
    openGraph: {
      title: loc.metaTitle,
      description: loc.metaDescription,
      type: 'website',
      locale: 'en_US',
    },
    alternates: {
      canonical: `/locations/${slug}`,
    },
  }
}

export default async function LocationPage(
  { params }: PageProps<'/locations/[slug]'>
) {
  const { slug } = await params
  const loc = LOCATIONS[slug]
  if (!loc) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `Triple J Metal LLC \u2014 ${loc.name} TX Carports`,
    description: loc.metaDescription,
    telephone: '254-346-7764',
    url: `https://triplejjjmetal.com/locations/${slug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: loc.name,
      addressRegion: 'TX',
      postalCode: loc.zip,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: loc.lat,
      longitude: loc.lng,
    },
    areaServed: {
      '@type': 'City',
      name: loc.name,
    },
    serviceType: 'Metal Carport Installation',
    priceRange: '$',
    paymentAccepted: 'Cash, Check',
    currenciesAccepted: 'USD',
    openingHours: 'Mo-Sa 07:00-18:00',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <main>
        {/* Hero */}
        <section>
          <h1>{loc.heroHeadline}</h1>
          <p>{loc.heroCopy}</p>
          <div>
            <a href="tel:254-346-7764">Call 254-346-7764</a>
            <a href="/get-a-quote">Get a Free Quote</a>
          </div>
        </section>

        {/* Services */}
        <section>
          <h2>Metal Building Services in {loc.name}, TX</h2>
          <ul>
            {loc.services.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        </section>

        {/* Why Triple J — local advantage */}
        <section>
          <h2>Why Choose Triple J Metal LLC in {loc.name}?</h2>
          <p>{loc.whyLocal}</p>
          <ul>
            <li>Local Temple, TX family business — 8 years experience</li>
            <li>Welded AND bolted red iron steel — your choice</li>
            <li>Cheapest full-service installer in Central Texas</li>
            <li>Same-week installs available</li>
            <li>Licensed and insured</li>
            <li>Steel from MetalMax (Waco) and MetalMart — 100% Texas suppliers</li>
          </ul>
        </section>

        {/* City context */}
        <section>
          <h2>Serving {loc.name} and {loc.county}</h2>
          <p>{loc.areaContext}</p>
        </section>

        {/* Quote CTA */}
        <section>
          <h2>Get a Free Carport Quote in {loc.name}</h2>
          <p>
            We respond within 24 hours. Call{' '}
            <a href="tel:254-346-7764">254-346-7764</a> or submit a quote
            request and we&apos;ll get back to you same day.
          </p>
          <a href="/get-a-quote">Request a Free Quote</a>
        </section>
      </main>
    </>
  )
}
