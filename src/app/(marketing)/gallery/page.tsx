import type { Metadata } from 'next'
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { ButtonLink } from '@/components/ui/Button'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Project Gallery | Triple J Metal LLC — 150+ Central Texas Builds',
  description:
    'Browse completed metal carports, garages, barns, and RV covers built by Triple J Metal LLC across Temple, Belton, Killeen, and Central Texas. 150+ projects, welded and bolted.',
  alternates: { canonical: '/gallery' },
  openGraph: {
    title: 'Project Gallery | Triple J Metal LLC',
    description: '150+ completed metal building projects across Central Texas.',
    type: 'website',
  },
}

const PROJECTS = [
  {
    src: '/images/carport-residential-completed.jpg',
    alt: 'Completed residential carport with welded red iron frame',
    title: 'Residential Welded Carport',
    city: 'Central Texas',
    type: 'Carport',
    tag: 'Welded',
  },
  {
    src: '/images/metal-garage-green.jpg',
    alt: 'Fully enclosed metal garage in green finish',
    title: 'Enclosed Metal Garage',
    city: 'Central Texas',
    type: 'Garage',
    tag: 'Bolted',
  },
  {
    src: '/images/carport-concrete-rural.jpg',
    alt: 'Rural carport with fresh concrete pad poured same contract',
    title: 'Carport + Concrete Pad',
    city: 'Central Texas',
    type: 'Carport',
    tag: 'Turnkey',
  },
  {
    src: '/images/double-carport-install.jpg',
    alt: 'Double-width carport during installation by Triple J crew',
    title: 'Double-Width Carport',
    city: 'Central Texas',
    type: 'Carport',
    tag: 'Welded',
  },
  {
    src: '/images/carport-gable-residential.jpg',
    alt: 'Residential gable-roof carport with clean finish',
    title: 'Gable-Roof Carport',
    city: 'Central Texas',
    type: 'Carport',
    tag: 'Welded',
  },
  {
    src: '/images/porch-cover-lean-to.jpg',
    alt: 'Metal lean-to porch cover attached to home',
    title: 'Lean-To Porch Cover',
    city: 'Central Texas',
    type: 'Porch Cover',
    tag: 'Bolted',
  },
] as const

const TAG_COLORS: Record<string, string> = {
  Welded:  'bg-blue-100 text-blue-800',
  Bolted:  'bg-ink-100 text-ink-600',
  Turnkey: 'bg-amber-100 text-amber-800',
}

export default function GalleryPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-ink-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <Container className="relative">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400">
              Our Work
            </span>
            <h1 className="mt-3 text-white">150+ Completed Projects in Central Texas</h1>
            <p className="mt-5 text-lg text-white/75 leading-relaxed max-w-2xl">
              Every structure you see below was built by our local Temple crew — welded or bolted on-site,
              concrete poured when needed, handed over complete. No kits shipped. No subcontractors.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="#quote" variant="primary" size="lg">
                Start Your Free Quote
              </ButtonLink>
              <a
                href={`tel:${SITE.phone}`}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border-2 border-white/30 text-white font-semibold hover:border-white/60 transition-colors text-sm"
              >
                Call {SITE.phone}
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Stats strip ── */}
      <section className="bg-(--color-brand-600) text-white py-5">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { stat: '150+',      label: 'Projects Completed' },
              { stat: 'Same-Week', label: 'On-Site After Approval' },
              { stat: '1',         label: 'Contract for Everything' },
              { stat: 'Temple TX', label: 'Local Family Business' },
            ].map(({ stat, label }) => (
              <div key={label}>
                <div className="text-xl font-extrabold">{stat}</div>
                <div className="text-xs text-white/75 mt-0.5 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Project grid ── */}
      <section className="py-16 md:py-24 bg-white">
        <Container size="wide">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROJECTS.map((project) => (
              <article
                key={project.src}
                className="group rounded-2xl overflow-hidden border border-ink-100 bg-ink-50 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-ink-200">
                  <Image
                    src={project.src}
                    alt={project.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-ink-400 uppercase tracking-wide">
                      {project.type} · {project.city}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${TAG_COLORS[project.tag] ?? 'bg-ink-100 text-ink-600'}`}>
                      {project.tag}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-ink-900 leading-snug">
                    {project.title}
                  </h2>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-ink-500 text-sm mb-6">
              These are just 6 of 150+ completed jobs. More project photos coming soon.
            </p>
            <ButtonLink href="#quote" variant="primary" size="lg">
              Get a Free Quote for Your Project
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ── Why Triple J section ── */}
      <section className="py-16 md:py-20 bg-ink-50">
        <Container size="narrow">
          <h2 className="mb-6">Every Build Backed by a Local Crew</h2>
          <p className="text-ink-600 text-lg leading-relaxed mb-8">
            When you see a project photo on this page, it was built by Triple J Metal LLC — a
            Temple, TX family company. Not a national brand. Not a franchise. Not a dealer shipping
            a kit. Our crew shows up, welds it, pours the concrete if needed, and hands you the keys
            on the same contract.
          </p>
          <ul className="space-y-3">
            {[
              'Welded red iron steel — permanent structure, not a bolt-together kit',
              'Concrete pad pouring included in the same contract',
              'Same-week scheduling — no 4–16 week wait lists',
              'Custom dimensions — any width, length, or height configuration',
              'Licensed and insured, Temple TX family business',
            ].map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-ink-700">
                <span className="text-(--color-brand-600) mt-0.5 font-bold shrink-0">✓</span>
                {point}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── Quote form ── */}
      <QuoteForm />
    </>
  )
}
