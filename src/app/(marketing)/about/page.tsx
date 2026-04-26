import type { Metadata } from 'next'
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { ButtonLink } from '@/components/ui/Button'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { TrackedPhoneLink } from '@/components/site/TrackedPhone'
import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'About — Temple, TX Metal Building Family',
  description:
    'Temple, TX family metal building contractor. 150+ completed projects, welded red iron steel, turnkey concrete. Not a national chain.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Triple J Metal | Temple, TX',
    description: 'Local Temple family business. 150+ completed metal building projects across Central Texas.',
    type: 'website',
  },
}

// Layout-mounted <OrganizationJsonLd /> already emits the comprehensive
// LocalBusiness + Organization graph on every marketing page. Per-page
// schema here is a focused AboutPage WebPage node referencing the
// canonical Organization via @id — no duplicate LocalBusiness.
function jsonLd(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${baseUrl}/about`,
    url: `${baseUrl}/about`,
    name: `About ${SITE.name}`,
    description:
      'Family-owned Temple, TX metal building contractor. 150+ completed projects, welded red iron steel, turnkey concrete.',
    isPartOf: { '@id': `${baseUrl}/#website` },
    about: { '@id': `${baseUrl}/#organization` },
    inLanguage: 'en-US',
  }
}

export default function AboutPage() {
  const baseUrl = getSiteUrl()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(baseUrl)).replace(/</g, '\\u003c') }}
      />

      {/* ── Hero ── */}
      <section className="relative bg-ink-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <Container className="relative">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400">
              About Us
            </span>
            <h1 className="mt-3 text-white">
              Temple&rsquo;s Local Metal Building Family — Not a National Chain
            </h1>
            <p className="mt-5 text-lg text-white/75 leading-relaxed max-w-2xl">
              Triple J Metal was founded by a Temple family and operates out of Temple, TX.
              We build every structure ourselves — no subcontractors, no kit drops, no hand-offs.
              One crew. One contract. Done right.
            </p>
          </div>
        </Container>
      </section>

      {/* ── Stats strip ── */}
      <section className="bg-(--color-brand-600) text-white py-5">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { stat: '150+',      label: 'Projects Completed' },
              { stat: 'Mon–Sat',   label: 'On-Site Availability' },
              { stat: 'Same-Week', label: 'On-Site After Approval' },
              { stat: 'Temple TX', label: 'Family Business' },
            ].map(({ stat, label }) => (
              <div key={label}>
                <div className="text-xl font-extrabold">{stat}</div>
                <div className="text-xs text-white/75 mt-0.5 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Our story ── */}
      <section className="py-16 md:py-24 bg-white">
        <Container size="narrow">
          <h2 className="mb-6">A Temple Family Business</h2>
          <div className="space-y-5 text-ink-600 text-lg leading-relaxed">
            <p>
              Triple J Metal was started by Juan Luis Leon — a long-time member of the Temple,
              TX community — and his son Julian Leon Alvarez, who handles day-to-day operations and
              the technology side of the business. Together, they built Triple J Metal from the ground up
              starting in 2025, and have since completed over 150 projects across Central Texas.
            </p>
            <p>
              We started Triple J because we saw what the big national companies were doing to local
              homeowners: shipping a boxed kit, leaving instructions, and calling it &ldquo;installation.&rdquo;
              That&rsquo;s not a building company — that&rsquo;s a parts supplier with a landing page.
              We do it differently. Our crew shows up, builds it, and stands behind the work.
            </p>
            <p>
              Fifty-plus satisfied clients later, our model is proving itself. We&rsquo;re growing entirely
              on referrals and reputation — because when you show up on time, build it right, and
              include the concrete pad in the same contract, people notice.
            </p>
          </div>
        </Container>
      </section>

      {/* ── What makes us different ── */}
      <section className="py-16 md:py-20 bg-ink-50">
        <Container>
          <h2 className="mb-10 text-center">What Sets Us Apart</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                headline: 'Local Crew — Not a Dealer',
                body: 'We don\'t sell kits. We build structures. Every job is handled by our own Temple-based crew from start to finish.',
              },
              {
                headline: 'Welded Steel Option',
                body: 'We offer real welded red iron steel — a permanent structure that improves your property value. Bolted kits rattle in Central Texas storms. Welded ones don\'t.',
              },
              {
                headline: 'Turnkey Concrete — Same Contract',
                body: 'No other local installer includes concrete pad pouring in the same contract. We handle site prep, concrete, and structure — one call, one crew, one invoice.',
              },
              {
                headline: 'Same-Week Scheduling',
                body: 'National companies quote 4–16 week lead times. We schedule same-week after your approval — small carports done in a day, larger structures in two.',
              },
              {
                headline: 'Custom Dimensions',
                body: 'Our structures aren\'t catalog sizes. You tell us the width, length, and height — we build exactly that. Any configuration, any roof style.',
              },
              {
                headline: 'Licensed & Insured',
                body: 'Triple J Metal is fully licensed and insured in Texas. We also handle permitting as an add-on service when your county or HOA requires it.',
              },
            ].map(({ headline, body }) => (
              <div
                key={headline}
                className="rounded-xl border border-ink-100 bg-white p-6"
              >
                <div className="w-8 h-1 bg-(--color-brand-600) rounded mb-4" />
                <h3 className="text-base font-bold text-ink-900 mb-2">{headline}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Our Rig (equipment trust signal) ─────────────────────────────
          Two branded trucks + skid-steer = "we own the gear, not just the
          marketing site." Sits between the differentiators list and the
          supplier story so the page reads: what we are (story) → why we're
          different (sets us apart) → proof we're real (rig) → who we buy
          from (suppliers) → how we work (values). Equipment photos come
          from the /hq/gallery "Triple J Equipment" item — refreshed when
          Julian uploads new equipment shots there. */}
      <section className="py-16 md:py-24 bg-ink-900 text-white overflow-hidden">
        <Container>
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-400">
              Our Rig
            </span>
            <h2 className="mt-3 text-white">
              Two branded trucks. One crew. Our own gear.
            </h2>
            <p className="mt-4 text-white/70 text-lg leading-relaxed">
              When a national kit dealer drops your structure off, that&rsquo;s the last you see
              of them. Triple J shows up with the equipment to actually build it — and we own
              every piece of it ourselves. No rentals, no sub-rentals, no &ldquo;the guy didn&rsquo;t
              show up&rdquo; excuses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <figure className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-800 border border-white/10">
                <Image
                  src="https://idrbgxlvvnqduvbqtaei.supabase.co/storage/v1/object/public/gallery/1777195958360.jpg"
                  alt="Triple J Metal RAM and second branded work truck on a Central Texas job site"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink-900/40 via-transparent to-transparent" />
              </div>
              <figcaption className="mt-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-400">
                  Branded fleet
                </p>
                <p className="mt-1 text-base text-white/85 leading-relaxed">
                  Two trucks, both branded, both ours. If you see them in your driveway it means
                  the build crew is here — not a salesperson, not a sub.
                </p>
              </figcaption>
            </figure>

            <figure className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-800 border border-white/10">
                <Image
                  src="https://idrbgxlvvnqduvbqtaei.supabase.co/storage/v1/object/public/gallery/items/c99a3a48-34c9-4caa-9343-7e65a87e5110/1777195959738.jpeg"
                  alt="Triple J Metal skid steer lifting structural steel next to a warehouse under construction"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink-900/40 via-transparent to-transparent" />
              </div>
              <figcaption className="mt-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-400">
                  40-ft vertical reach
                </p>
                <p className="mt-1 text-base text-white/85 leading-relaxed">
                  Our skid-steer handles ranch warehouses, two-story barns, and tall-clearance
                  RV covers — without renting boom trucks or waiting on outside operators.
                </p>
              </figcaption>
            </figure>
          </div>
        </Container>
      </section>

      {/* ── Materials & suppliers ── */}
      <section className="py-16 md:py-20 bg-white">
        <Container size="narrow">
          <h2 className="mb-6">Texas Steel. Texas Suppliers.</h2>
          <p className="text-ink-600 text-lg leading-relaxed mb-8">
            We source steel from leading regional Texas suppliers — PBR and PBU panels, Galvalume®
            roofing, and premium concealed-fastener standing-seam systems for HOA-grade builds.
            Multi-source by design: we&rsquo;re never bottlenecked when a single supplier runs short
            on a color or gauge. Keeping the supply chain in Texas means faster turnarounds and
            direct support from people who know the local climate.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink-700">
              <span className="text-(--color-brand-600)">✓</span> Regional Texas suppliers — multi-source
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-ink-700">
              <span className="text-(--color-brand-600)">✓</span> 100% Texas-Sourced Materials
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-ink-700">
              <span className="text-(--color-brand-600)">✓</span> Galvalume® substrate · 40-year paint warranty
            </div>
          </div>
        </Container>
      </section>

      {/* ── Values / mission ── */}
      <section className="py-16 bg-ink-900 text-white">
        <Container size="narrow">
          <h2 className="text-white mb-6">How We Work</h2>
          <ul className="space-y-4">
            {[
              ['Show up when we say we will', 'If we schedule a build date, we\'re there. No rescheduling after you\'ve cleared the site.'],
              ['One company, start to finish', 'Site prep, concrete, steel structure, cleanup — all done by the same crew under one contract.'],
              ['Built to outlast the contract', 'Welded red iron + permanent bolts on Galvalume® substrate. These structures are real estate improvements that outlast the buyer who paid for them — your kids will inherit them in working condition.'],
              ['Permanent, not portable', 'We don\'t ship kits that rattle loose in the first Texas thunderstorm. Every weld and every anchor bolt is rated for the wind loads our county actually sees.'],
              ['Honest pricing, no surprises', 'We quote the full job upfront — including concrete if you need it. No add-ons after the fact.'],
            ].map(([title, desc]) => (
              <li key={title as string} className="flex items-start gap-4">
                <span className="text-(--color-brand-400) font-bold shrink-0 mt-1">✓</span>
                <div>
                  <div className="font-bold text-white">{title}</div>
                  <div className="text-sm text-white/65 mt-0.5 leading-relaxed">{desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-ink-50">
        <Container size="narrow" className="text-center">
          <h2 className="mb-4">Ready to Build?</h2>
          <p className="text-ink-500 text-lg mb-8">
            Get a free quote from Temple&rsquo;s local metal building crew. We call back same day.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <ButtonLink href="#quote" variant="primary" size="lg">
              Get a Free Quote
            </ButtonLink>
            <TrackedPhoneLink
              surface="about_hero"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border-2 border-ink-300 text-ink-800 font-semibold hover:border-ink-500 transition-colors text-sm"
            >
              Call&nbsp;
            </TrackedPhoneLink>
          </div>
        </Container>
      </section>

      {/* ── Quote form ── */}
      <QuoteForm />
    </>
  )
}
