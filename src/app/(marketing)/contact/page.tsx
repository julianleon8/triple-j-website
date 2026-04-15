import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { ButtonLink } from '@/components/ui/Button'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact Triple J Metal LLC | Temple, TX | Free Quote',
  description:
    'Contact Triple J Metal LLC in Temple, TX. Call 254-346-7764 for a same-day callback. We build metal carports, garages, barns, and RV covers across Central Texas.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Triple J Metal LLC | Temple, TX',
    description: 'Call 254-346-7764 for a same-day callback. Temple-based metal building contractor.',
    type: 'website',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: SITE.name,
  telephone: SITE.phone,
  email: SITE.email,
  url: 'https://triplejjjmetal.com/contact',
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
    latitude: 31.0982,
    longitude: -97.3428,
  },
  openingHours: 'Mo-Sa 08:00-18:00',
  priceRange: '$$',
  areaServed: [
    'Temple, TX',
    'Belton, TX',
    'Killeen, TX',
    'Harker Heights, TX',
    'Copperas Cove, TX',
    'Central Texas',
  ],
}

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {/* ── Hero ── */}
      <section className="relative bg-ink-900 text-white py-20 md:py-24 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <Container className="relative">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400">
              Contact Us
            </span>
            <h1 className="mt-3 text-white">Get in Touch — We Call Back Same Day</h1>
            <p className="mt-5 text-lg text-white/75 leading-relaxed">
              Have a question about your project? Ready for a quote? Call us directly or fill out
              the form below. A real person from our Temple crew picks up or calls you back the same day.
            </p>
          </div>
        </Container>
      </section>

      {/* ── Contact info + map ── */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left: contact details */}
            <div>
              <h2 className="mb-8">Reach Us Directly</h2>

              <div className="space-y-6">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-(--color-brand-600) flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1">Phone</div>
                    <a
                      href={SITE.phoneHref}
                      className="text-2xl font-extrabold text-ink-900 hover:text-(--color-brand-600) transition-colors"
                    >
                      {SITE.phone}
                    </a>
                    <p className="text-sm text-ink-500 mt-1">Same-day callback guaranteed</p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1">Hours</div>
                    <div className="text-base font-bold text-ink-900">{SITE.hours}</div>
                    <p className="text-sm text-ink-500 mt-1">Emergency quotes available by phone</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1">Location</div>
                    <div className="text-base font-bold text-ink-900">
                      {SITE.address.street}<br />
                      {SITE.address.city}, {SITE.address.state} {SITE.address.zip}
                    </div>
                    <p className="text-sm text-ink-500 mt-1">Temple, TX — serving all of Central Texas</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1">Email</div>
                    <a
                      href={`mailto:${SITE.email}`}
                      className="text-base font-bold text-ink-900 hover:text-(--color-brand-600) transition-colors"
                    >
                      {SITE.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Service area note */}
              <div className="mt-10 rounded-xl bg-ink-50 border border-ink-100 p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">
                  Service Area
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Temple', 'Belton', 'Killeen', 'Harker Heights', 'Copperas Cove', 'Salado', 'Waco', 'Georgetown', 'Round Rock', 'Lampasas'].map((city) => (
                    <span key={city} className="text-xs font-medium bg-white border border-ink-200 text-ink-700 px-3 py-1 rounded-full">
                      {city}, TX
                    </span>
                  ))}
                </div>
                <p className="text-xs text-ink-400 mt-3">
                  Within ~90 minutes of Temple. Call to confirm your area.
                </p>
              </div>
            </div>

            {/* Right: Google Maps embed */}
            <div>
              <h2 className="mb-6">Find Us</h2>
              <div className="rounded-2xl overflow-hidden border border-ink-200 aspect-[4/3] bg-ink-100">
                <iframe
                  title="Triple J Metal LLC location — 3319 Tem-Bel Ln, Temple TX 76502"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3432.0!2d-97.3428!3d31.0982!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDA1JzUzLjUiTiA5N8KwMjAnMzQuMSJX!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <p className="text-xs text-ink-400 mt-3 text-center">
                3319 Tem-Bel Ln · Temple, TX 76502
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Quick CTA ── */}
      <section className="py-12 bg-ink-50 border-t border-ink-100">
        <Container className="text-center">
          <p className="text-ink-600 text-lg mb-6">
            Prefer a form? Fill out the quote request below and we&rsquo;ll call you back same day.
          </p>
          <ButtonLink href="#quote" variant="primary" size="lg">
            Start Your Free Quote
          </ButtonLink>
        </Container>
      </section>

      {/* ── Quote form ── */}
      <QuoteForm />
    </>
  )
}
