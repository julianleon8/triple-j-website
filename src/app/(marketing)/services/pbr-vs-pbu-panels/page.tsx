import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { ButtonLink } from '@/components/ui/Button'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { TrackedPhoneLink } from '@/components/site/TrackedPhone'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'PBR vs PBU Roofing Panels — Which to Pick',
  description:
    'PBR vs PBU metal roofing panels: when to use each. Triple J Metal builds with both across Central Texas — which panel type fits your project?',
  alternates: { canonical: '/services/pbr-vs-pbu-panels' },
  openGraph: {
    title: 'PBR vs PBU Metal Panels | Triple J Metal',
    description: 'PBR vs PBU — which metal roofing panel is right for your carport, garage, or barn in Central Texas?',
    type: 'article',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a PBR panel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PBR (Purlin Bearing Rib) is an exposed-fastener metal roofing panel. It uses screws through the panel face into the purlin below. It is the most common and cost-effective commercial roofing panel used in Texas for carports, barns, and garages.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a PBU panel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PBU (Panel Base Under) is a hidden-fastener variant of the standard R-panel profile. The fastener is concealed under the overlapping rib, giving a cleaner visual profile and improved water resistance at the fastener point.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which panel should I choose for my carport or garage?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For most residential carports, barns, and garages in Central Texas, PBR panels are the practical choice — cost-effective, widely available, and proven in Texas weather. PBU panels are recommended when aesthetics matter more (HOA neighborhoods, high-end residential) or when you want reduced long-term fastener maintenance.',
      },
    },
  ],
}

const COMPARISON_ROWS = [
  {
    attribute: 'Fastener type',
    pbr: 'Exposed screws through panel face',
    pbu: 'Hidden fasteners under the overlapping rib',
  },
  {
    attribute: 'Aesthetics',
    pbr: 'Standard — visible screw heads on roof surface',
    pbu: 'Cleaner — no exposed fasteners visible from below',
  },
  {
    attribute: 'Water resistance',
    pbr: 'Good — industry standard, proper install is weathertight',
    pbu: 'Better — fasteners not exposed to weather at all',
  },
  {
    attribute: 'Cost',
    pbr: 'Lower — most economical commercial panel',
    pbu: 'Higher — labor and materials both cost more',
  },
  {
    attribute: 'Best for',
    pbr: 'Carports, barns, agricultural, commercial',
    pbu: 'HOA neighborhoods, high-end residential, showrooms',
  },
  {
    attribute: 'Long-term maintenance',
    pbr: 'Check and re-torque screws every few years',
    pbu: 'Lower maintenance — no exposed fastener points to monitor',
  },
  {
    attribute: 'Availability',
    pbr: 'Standard — widest color and gauge selection',
    pbu: 'Slightly more limited — check with us on color options',
  },
]

export default function PbrVsPbuPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {/* ── Hero ── */}
      <section className="relative bg-ink-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <Container className="relative">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400">
              Material Guide
            </span>
            <h1 className="mt-3 text-white">PBR vs PBU Metal Roofing Panels — Which One Do You Need?</h1>
            <p className="mt-5 text-lg text-white/75 leading-relaxed max-w-2xl">
              Both PBR and PBU panels are high-quality metal roofing options used in Central Texas metal
              buildings. The right choice depends on your budget, aesthetics, and how much long-term
              maintenance you want to deal with. Here&rsquo;s what the difference actually means for your project.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="#quote" variant="primary" size="lg">
                Get a Free Panel Quote
              </ButtonLink>
              <TrackedPhoneLink
                surface="pbr_pbu_hero"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border-2 border-white/30 text-white font-semibold hover:border-white/60 transition-colors text-sm"
              >
                Ask Us —&nbsp;
              </TrackedPhoneLink>
            </div>
          </div>
        </Container>
      </section>

      {/* ── What each panel is ── */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <h2 className="mb-10 text-center">What Each Panel Actually Is</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* PBR */}
            <div className="rounded-2xl border border-ink-100 bg-ink-50 p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-(--color-brand-600) flex items-center justify-center">
                  <span className="text-white font-extrabold text-sm">PBR</span>
                </div>
                <h2 className="text-xl font-extrabold text-ink-900">PBR Panel</h2>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">
                Purlin Bearing Rib
              </p>
              <p className="text-ink-600 leading-relaxed mb-5">
                PBR is an exposed-fastener R-panel profile — the most widely used commercial roofing panel
                in Texas. Screws go through the face of the panel into the steel purlin below. When installed
                correctly with quality sealant washers, PBR panels are weathertight, durable, and
                cost-effective for the vast majority of metal building projects.
              </p>
              <ul className="space-y-2">
                {[
                  'Most economical panel option',
                  'Standard for carports, barns, and agricultural buildings',
                  'Wide color and gauge availability from regional Texas suppliers',
                  'Proven decades of performance in Central Texas',
                ].map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-sm text-ink-700">
                    <span className="text-(--color-brand-600) shrink-0 font-bold">✓</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>

            {/* PBU */}
            <div className="rounded-2xl border border-ink-100 bg-ink-50 p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-ink-700 flex items-center justify-center">
                  <span className="text-white font-extrabold text-sm">PBU</span>
                </div>
                <h2 className="text-xl font-extrabold text-ink-900">PBU Panel</h2>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">
                Panel Base Under (Hidden Fastener)
              </p>
              <p className="text-ink-600 leading-relaxed mb-5">
                PBU uses the same R-panel profile but with a concealed fastening system — the screw clips
                under the overlapping rib, so nothing penetrates the panel face. The result is a cleaner
                visual profile with no exposed screw heads on the roof surface. Better for HOA-grade builds
                where aesthetics matter, and lower maintenance since fastener points aren&rsquo;t exposed to weather.
              </p>
              <ul className="space-y-2">
                {[
                  'No exposed fasteners on the roof surface',
                  'Cleaner look for HOA neighborhoods and luxury builds',
                  'Reduced long-term maintenance on fastener points',
                  'Higher upfront cost — labor and materials',
                ].map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-sm text-ink-700">
                    <span className="text-ink-500 shrink-0 font-bold">✓</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Comparison table ── */}
      <section className="py-16 md:py-20 bg-ink-50">
        <Container size="narrow">
          <h2 className="mb-8">Side-by-Side Comparison</h2>
          <div className="rounded-xl border border-ink-200 overflow-hidden">
            <div className="grid grid-cols-3 bg-ink-900 text-white text-xs font-bold uppercase tracking-wide">
              <div className="px-4 py-3 text-ink-400">Attribute</div>
              <div className="px-4 py-3 text-brand-400">PBR Panel</div>
              <div className="px-4 py-3 text-white/80">PBU Panel</div>
            </div>
            {COMPARISON_ROWS.map((row, i) => (
              <div
                key={row.attribute}
                className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-ink-50'}`}
              >
                <div className="px-4 py-4 font-semibold text-ink-700 border-r border-ink-100">
                  {row.attribute}
                </div>
                <div className="px-4 py-4 text-ink-600 border-r border-ink-100">
                  {row.pbr}
                </div>
                <div className="px-4 py-4 text-ink-600">
                  {row.pbu}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Our recommendation ── */}
      <section className="py-16 md:py-20 bg-white">
        <Container size="narrow">
          <h2 className="mb-6">What Triple J Recommends — And Why</h2>
          <div className="space-y-5 text-ink-600 text-lg leading-relaxed">
            <p>
              For the majority of carports, barns, and garages we build in Central Texas — <strong className="text-ink-900">PBR is the right call.</strong> It&rsquo;s
              cost-effective, weather-proven, and when we install it correctly with proper sealant-backed screws,
              it performs for decades without issues. The exposed-fastener design is also easier to inspect and
              maintain if you ever need to.
            </p>
            <p>
              <strong className="text-ink-900">PBU makes sense when aesthetics are a priority.</strong> If
              you&rsquo;re in a Heritage Oaks or Bella Charca neighborhood, your HOA may expect cleaner
              finishes — or you simply want a structure that looks more architectural and less industrial.
              In that case, the extra cost of PBU is worth it.
            </p>
            <p>
              When you fill out the quote form below or call us, just mention which look you want — or tell us
              your HOA requirements if you have them. We&rsquo;ll recommend the right panel for your specific project.
            </p>
          </div>
          <div className="mt-8 rounded-xl bg-brand-50 border border-(--color-brand-200) p-6">
            <p className="text-sm font-semibold text-(--color-brand-700) uppercase tracking-wider mb-2">
              Our steel
            </p>
            <p className="text-ink-700 text-sm leading-relaxed">
              Triple J Metal sources PBR and PBU panels from leading regional Texas suppliers — Galvalume®
              substrate with painted finishes backed by a 40-year paint warranty, in 26-gauge and 29-gauge
              depending on your application. Multi-source so we&rsquo;re never bottlenecked when a single supplier
              runs short.
            </p>
          </div>
        </Container>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 md:py-20 bg-ink-50">
        <Container size="narrow">
          <h2 className="mb-10">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {[
              {
                q: 'Can I mix PBR and PBU on the same building?',
                a: "In most cases, no — you'd typically choose one panel system per structure. However, you might use PBR on the roof and a standing seam option on visible wall panels if aesthetics are the driver. Ask us during your quote and we'll walk you through what makes sense.",
              },
              {
                q: 'Does PBU cost significantly more?',
                a: 'PBU panels themselves cost more per square foot, and installation takes longer since the fastener system is different. For a typical 20×20 carport, expect PBU to add $300–$800 to the total project cost depending on pitch and complexity.',
              },
              {
                q: 'Are PBR panels weathertight?',
                a: 'Yes — when installed correctly with sealant-backed screws and proper lapping, PBR panels are fully weathertight. The exposed fastener is not a weakness when the installation is done right. Triple J Metal uses correct torque and sealant on every screw.',
              },
              {
                q: 'Which panel holds up better in Texas hail?',
                a: 'Both PBR and PBU panels in 26-gauge perform similarly in hail events. If hail resistance is a specific concern, the gauge of steel matters more than the fastener style — ask us about upgrading to 26-gauge on your project.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl bg-white border border-ink-100 p-6">
                <h3 className="text-base font-bold text-ink-900 mb-2">{q}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Related links ── */}
      <section className="py-10 bg-white border-t border-ink-100">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-widest text-ink-400 mb-5">
            Related Services
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/services/carports" variant="secondary" size="sm">
              Metal Carports →
            </ButtonLink>
            <ButtonLink href="/services/hoa-compliant-structures" variant="secondary" size="sm">
              HOA-Compliant Structures →
            </ButtonLink>
            <ButtonLink href="/services/turnkey-carports-with-concrete" variant="secondary" size="sm">
              Turnkey + Concrete →
            </ButtonLink>
            <ButtonLink href="/services" variant="secondary" size="sm">
              All Services →
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ── Quote form ── */}
      <QuoteForm />
    </>
  )
}
