import type { Metadata } from 'next'
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { ButtonLink } from '@/components/ui/Button'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { SITE } from '@/lib/site'
import { TURNIUM_COLORS, SHEFFIELD_COLORS, getSwatchUrl, type PanelColor } from '@/lib/colors'

export const metadata: Metadata = {
  title: 'Panel Colors & Options | MetalMax WeatherXL™ | Triple J Metal LLC',
  description:
    'Browse all available metal panel colors for your carport, garage, or barn in Central Texas. Triple J Metal LLC uses MetalMax WeatherXL™ panels in 26 & 29 gauge — Turnium and Sheffield lines.',
  alternates: { canonical: '/services/colors' },
  openGraph: {
    title: 'Panel Colors & Options | Triple J Metal LLC',
    description: 'Choose from 39 MetalMax WeatherXL™ panel colors for your Central Texas metal building.',
    type: 'website',
  },
}

function ColorCard({ color }: { color: PanelColor }) {
  const swatchUrl = getSwatchUrl(color)
  return (
    <div className="group flex flex-col items-center gap-2">
      <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-ink-100 bg-ink-100 shadow-sm group-hover:shadow-md transition-shadow">
        <Image
          src={swatchUrl}
          alt={`${color.name} metal panel swatch`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover"
        />
        {color.hoaFriendly && (
          <span className="absolute top-2 right-2 bg-white/90 text-[9px] font-bold uppercase tracking-wider text-brand-700 px-1.5 py-0.5 rounded-full border border-brand-200">
            HOA
          </span>
        )}
      </div>
      <span className="text-xs font-semibold text-ink-700 text-center leading-tight">
        {color.name}
      </span>
    </div>
  )
}

export default function ColorsPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-ink-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <Container className="relative">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400">
              Panel Options
            </span>
            <h1 className="mt-3 text-white">Metal Panel Colors & Finishes</h1>
            <p className="mt-5 text-lg text-white/75 leading-relaxed max-w-2xl">
              Triple J Metal sources all panels from MetalMax in Waco, TX — Galvalume® steel with
              WeatherXL™ color coating engineered for Central Texas sun, UV, and corrosion resistance.
              Available in 26 and 29 gauge, 39 colors across two product lines.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="#quote" variant="primary" size="lg">
                Get a Free Color Quote
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

      {/* ── Finish overview ── */}
      <section className="bg-brand-600 text-white py-5">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { stat: '39',        label: 'Colors Available' },
              { stat: '26 & 29',   label: 'Gauge Options' },
              { stat: 'WeatherXL™',label: 'Color System' },
              { stat: 'Galvalume®',label: 'Steel Substrate' },
            ].map(({ stat, label }) => (
              <div key={label}>
                <div className="text-xl font-extrabold">{stat}</div>
                <div className="text-xs text-white/75 mt-0.5 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Turnium 26 & 29 gauge ── */}
      <section className="py-16 md:py-24 bg-white">
        <Container size="wide">
          <div className="mb-10">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">
              26 &amp; 29 Gauge
            </span>
            <h2 className="mt-2 text-ink-900">Turnium Line — {TURNIUM_COLORS.length} Colors</h2>
            <p className="mt-3 text-ink-500 max-w-2xl">
              Available in both 26-gauge and 29-gauge. Standard residential and commercial panel for
              carports, barns, garages, and RV covers. PBR and PBU profiles available in this line.
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4">
            {TURNIUM_COLORS.map((color) => (
              <ColorCard key={`turnium-${color.slug}`} color={color} />
            ))}
          </div>
        </Container>
      </section>

      {/* ── Sheffield 26 gauge only ── */}
      <section className="py-16 md:py-24 bg-ink-50 border-t border-ink-100">
        <Container size="wide">
          <div className="mb-10">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">
              26 Gauge Only
            </span>
            <h2 className="mt-2 text-ink-900">Sheffield Line — {SHEFFIELD_COLORS.length} Colors</h2>
            <p className="mt-3 text-ink-500 max-w-2xl">
              Sheffield line is available in 26-gauge only. Includes concealed-fastener options
              (MaxLoc, MaxSeam, MaxSnap) popular for HOA-governed neighborhoods like Heritage Oaks
              and Bella Charca. Higher-end aesthetic with hidden fasteners.
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4">
            {SHEFFIELD_COLORS.map((color) => (
              <ColorCard key={`sheffield-${color.slug}`} color={color} />
            ))}
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-xs text-ink-500">
            <span className="bg-white border border-brand-200 text-brand-700 font-bold px-1.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider">HOA</span>
            badge = commonly used in HOA-governed subdivisions
          </div>
        </Container>
      </section>

      {/* ── About the finish system ── */}
      <section className="py-16 md:py-20 bg-white">
        <Container size="narrow">
          <h2 className="mb-6">WeatherXL™ — Built for Central Texas Sun</h2>
          <div className="space-y-5 text-ink-600 leading-relaxed">
            <p>
              MetalMax&rsquo;s WeatherXL™ finish system is engineered specifically for high-UV, high-heat
              environments. The color coat bonds to Galvalume® substrate — a zinc-aluminum alloy that
              resists rust at cut edges and fastener points, which is where standard painted steel panels
              fail first in the Central Texas climate.
            </p>
            <p>
              Every panel color on this page is available through MetalMax&rsquo;s Waco, TX facility. When
              you fill out the quote form, just mention the color name and line (Turnium or Sheffield) —
              or tell us your project type and we&rsquo;ll recommend colors that match common HOA palettes or
              complement popular Central Texas home exterior colors.
            </p>
          </div>
          <div className="mt-8 rounded-xl bg-amber-50 border border-amber-200 p-5 text-sm text-amber-900">
            <strong>Note:</strong> Actual colors may vary from on-screen swatches due to monitor calibration.
            Physical samples are available — call or visit our Temple, TX office to see panels in person
            before committing to a color.
          </div>
        </Container>
      </section>

      {/* ── Related links ── */}
      <section className="py-10 bg-ink-50 border-t border-ink-100">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-widest text-ink-400 mb-5">
            Related
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/services/pbr-vs-pbu-panels" variant="secondary" size="sm">
              PBR vs PBU Panels →
            </ButtonLink>
            <ButtonLink href="/services" variant="secondary" size="sm">
              All Services →
            </ButtonLink>
            <ButtonLink href="/gallery" variant="secondary" size="sm">
              See Completed Projects →
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ── Quote form ── */}
      <QuoteForm />
    </>
  )
}
