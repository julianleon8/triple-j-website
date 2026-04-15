import type { Metadata } from 'next'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { SERVICES, SERVICE_SLUGS } from '@/lib/services'

export const metadata: Metadata = {
  title: 'Metal Building Services — Carports, Garages, Barns & More',
  description:
    'Triple J Metal LLC builds custom metal carports, garages, barns, RV covers, and HOA-compliant structures across Central Texas. Welded or bolted, concrete included. Call 254-346-7764.',
  alternates: { canonical: '/services' },
}

const GAP_LABELS: Record<number, string> = {
  1: 'Turnkey + Concrete Gap',
  2: 'Welded Quality Gap',
  3: 'Speed / Military Gap',
  4: 'HOA Luxury Gap',
}

const SERVICE_ICONS: Record<string, string> = {
  carports:                    '🏠',
  'turnkey-carports-with-concrete': '🏗️',
  'metal-garages':             '🚗',
  barns:                       '🌾',
  'rv-covers':                 '🚐',
  'hoa-compliant-structures':  '⭐',
}

export default function ServicesPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-[color:var(--color-ink-900)] text-white py-20 md:py-28 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <Container className="relative">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--color-brand-400)]">
              Services
            </span>
            <h1 className="mt-3 text-white">Metal Buildings Built the Way Competitors Won&rsquo;t</h1>
            <p className="mt-5 text-lg text-white/75 leading-relaxed">
              We identified four gaps that every national carport brand leaves wide open.
              Triple J Metal fills all of them — turnkey concrete, welded steel, 48-hour
              speed, and HOA-grade architectural finishes.
            </p>
          </div>
        </Container>
      </section>

      {/* ── Services grid ── */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICE_SLUGS.map((slug) => {
              const svc = SERVICES[slug]
              return (
                <a
                  key={slug}
                  href={`/services/${slug}`}
                  className="group flex flex-col rounded-2xl border border-[color:var(--color-ink-100)] bg-[color:var(--color-ink-50)] p-6 hover:border-[color:var(--color-brand-300)] hover:bg-[color:var(--color-brand-50)] transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{SERVICE_ICONS[slug] ?? '🔩'}</span>
                    {svc.keywordGap && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-brand-600)] bg-[color:var(--color-brand-100)] px-2 py-0.5 rounded-full">
                        {GAP_LABELS[svc.keywordGap]}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-[color:var(--color-ink-900)] mb-2 group-hover:text-[color:var(--color-brand-700)] transition-colors">
                    {svc.title}
                  </h2>
                  <p className="text-sm text-[color:var(--color-ink-500)] leading-relaxed flex-1">
                    {svc.mainBenefit}
                  </p>
                  <div className="mt-5 text-sm font-semibold text-[color:var(--color-brand-600)] group-hover:underline">
                    Learn more →
                  </div>
                </a>
              )
            })}
          </div>
        </Container>
      </section>

      {/* ── Trust strip ── */}
      <section className="bg-[color:var(--color-ink-900)] text-white py-10">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { stat: '150+', label: 'Completed Projects' },
              { stat: '48 hrs', label: 'Typical Build Time' },
              { stat: '1', label: 'Contract for Everything' },
              { stat: 'Temple TX', label: 'Local Family Business' },
            ].map(({ stat, label }) => (
              <div key={label}>
                <div className="text-2xl font-extrabold text-[color:var(--color-brand-400)]">{stat}</div>
                <div className="text-xs text-white/60 mt-1 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Quote form ── */}
      <QuoteForm />
    </>
  )
}
