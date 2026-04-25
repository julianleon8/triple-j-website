import type { Metadata } from 'next'
import Link from 'next/link'
import { LOCATIONS, LOCATION_SLUGS } from '@/lib/locations'

export const metadata: Metadata = {
  title: 'Metal Carport Service Areas in Central Texas',
  description:
    'Triple J Metal installs welded or bolted carports, garages, RV covers, and barns across Central Texas — Temple, Belton, Killeen, Harker Heights, Copperas Cove, Waco, Georgetown, and Round Rock. Same-week installs.',
  alternates: {
    canonical: '/locations',
  },
}

export default function LocationsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Triple J Metal Service Areas',
    description: 'Cities served by Triple J Metal for metal carport installation in Central Texas',
    itemListElement: LOCATION_SLUGS.map((slug, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `Metal Carports ${LOCATIONS[slug].name}, TX`,
      url: `https://www.triplejmetaltx.com/locations/${slug}`,
    })),
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
        <section>
          <h1>Metal Carport Service Areas — Central Texas</h1>
          <p>
            Triple J Metal is based in Temple, TX and installs metal carports,
            garages, barns, and RV covers across Central Texas. Our coverage
            now spans Bell, McLennan, and Williamson counties — including
            recently expanded same-week service into{' '}
            <Link href="/locations/waco"><strong>Waco</strong></Link>,{' '}
            <Link href="/locations/georgetown"><strong>Georgetown</strong></Link>, and{' '}
            <Link href="/locations/round-rock"><strong>Round Rock</strong></Link>.
            Call <a href="tel:+12543467764">254-346-7764</a> for same-week availability.
          </p>
        </section>

        <section>
          <h2>Cities We Serve</h2>
          <ul>
            {LOCATION_SLUGS.map((slug) => {
              const loc = LOCATIONS[slug]
              return (
                <li key={slug}>
                  <Link href={`/locations/${slug}`}>
                    <strong>
                      Metal Carports {loc.name}, TX
                    </strong>
                    <span>{loc.county}</span>
                    <p>{loc.heroHeadline}</p>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        <section>
          <h2>Don&apos;t See Your City?</h2>
          <p>
            We serve all of Central Texas. If your city isn&apos;t listed, call us at{' '}
            <a href="tel:+12543467764">254-346-7764</a> — chances are we work
            in your area.
          </p>
          <a href="/get-a-quote">Request a Free Quote</a>
        </section>
      </main>
    </>
  )
}
