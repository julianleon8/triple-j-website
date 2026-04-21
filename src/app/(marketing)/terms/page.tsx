import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Terms of Service | Triple J Metal LLC',
  description:
    'Terms for quotes, scheduling, payment, warranty, and limitation of liability when working with Triple J Metal LLC.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
}

const LAST_UPDATED = 'April 21, 2026'

export default function TermsPage() {
  return (
    <>
      <section className="relative bg-ink-900 text-white py-16 md:py-20 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <Container className="relative">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400">
              Legal
            </span>
            <h1 className="mt-3 text-white">Terms of Service</h1>
            <p className="mt-4 text-white/70 text-sm">Last updated {LAST_UPDATED}</p>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20 bg-white">
        <Container size="narrow">
          <div className="prose-content space-y-8 text-ink-700 leading-relaxed">
            <p className="text-lg">
              These terms govern your use of {SITE.name}&rsquo;s website and the services we
              provide. By requesting a quote or signing a build contract with us, you agree
              to the following.
            </p>

            <div>
              <h2 className="mb-3">Services</h2>
              <p>
                {SITE.name} designs and builds welded or bolted metal structures — carports,
                garages, barns, RV/boat covers, lean-to patios, house additions, and custom
                ranch structures — across Central Texas. Site prep and concrete pads are
                offered under the same contract where included in your quote.
              </p>
            </div>

            <div>
              <h2 className="mb-3">Quotes &amp; quote validity</h2>
              <p>
                Written quotes are valid for <strong>30 days</strong> from the date of issue.
                Steel, concrete, and fuel prices move; after 30 days we may need to reissue.
                A quote is an estimate, not a binding contract — work begins only after both
                parties sign a written build agreement.
              </p>
            </div>

            <div>
              <h2 className="mb-3">Payment &amp; deposits</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  A deposit is typically required to order materials and hold your build
                  slot. The exact amount is listed on your signed agreement.
                </li>
                <li>
                  Progress payments may be scheduled for larger projects (e.g. on concrete
                  cure, on frame raise, on completion). All milestones are written into the
                  signed agreement.
                </li>
                <li>
                  Final payment is due on completion and walk-through approval.
                </li>
                <li>
                  We accept check, ACH, and major cards. Card payments may carry a
                  processing surcharge.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3">Scheduling &amp; site readiness</h2>
              <p>
                Once deposits clear and materials arrive, we schedule builds on a same-week
                basis where possible. Your site must be cleared, accessible, and free of
                overhead obstructions (power lines, branches) on the scheduled day. Delays
                caused by unreadiness, weather, or owner-side permitting may push the start
                date; we will reschedule at the next available slot with no cancellation
                penalty.
              </p>
            </div>

            <div>
              <h2 className="mb-3">Permits &amp; HOAs</h2>
              <p>
                Permit and HOA approval are the property owner&rsquo;s responsibility unless
                we have explicitly contracted to handle them as an add-on service. We will
                provide any engineering letters, drawings, or manufacturer specs you need
                to file.
              </p>
            </div>

            <div>
              <h2 className="mb-3">Warranty</h2>
              <p>
                We warrant our <strong>workmanship for one (1) year</strong> from the date
                of final walk-through — any structural or weld defect attributable to our
                crew&rsquo;s installation will be corrected at no charge. Structural steel
                and panels carry the <strong>manufacturer&rsquo;s warranty</strong>, which is
                typically 20 years on galvalume roofing and up to 40 years on premium
                coatings; details vary by product.
              </p>
              <p className="mt-3">Warranty does not cover:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Damage from named storms, hail above roofing rating, flood, or fire.</li>
                <li>
                  Damage from owner modifications (cutting, drilling, adding load),
                  third-party work, or attachments installed after our completion.
                </li>
                <li>Normal cosmetic wear, fading, or settling of concrete pads.</li>
                <li>Structures neglected of routine care (e.g. buildup of corrosive debris).</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3">Limitation of liability</h2>
              <p>
                Our total liability for any claim related to a project is limited to the
                amount paid under the relevant contract. We are not liable for indirect,
                incidental, or consequential damages (lost income, loss of use, stored
                property damage) except where required by Texas law. Nothing here limits
                liability for gross negligence or willful misconduct.
              </p>
            </div>

            <div>
              <h2 className="mb-3">Website content</h2>
              <p>
                Project photos, copy, and design elements on triplejjjmetal.com are the
                property of {SITE.name}. Don&rsquo;t reuse them for commercial purposes
                without permission. Third-party names and trademarks (e.g. MetalMax,
                Galvalume®, WeatherXL™) belong to their respective owners.
              </p>
            </div>

            <div>
              <h2 className="mb-3">Governing law</h2>
              <p>
                These terms are governed by the laws of the State of Texas. Any dispute
                will be resolved in the courts of Bell County, Texas.
              </p>
            </div>

            <div>
              <h2 className="mb-3">Contact</h2>
              <p>
                Questions about a contract, quote, or these terms?{' '}
                <a href={SITE.phoneHref} className="text-brand-600 hover:underline">
                  {SITE.phone}
                </a>
                {' '}or{' '}
                <a href={`mailto:${SITE.email}`} className="text-brand-600 hover:underline">
                  {SITE.email}
                </a>
                .
              </p>
            </div>

            <div className="pt-4 border-t border-ink-100">
              <Link href="/privacy" className="text-sm text-brand-600 hover:underline">
                Read our Privacy Policy →
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
