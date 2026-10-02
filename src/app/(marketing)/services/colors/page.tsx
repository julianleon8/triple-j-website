import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import type { Metadata } from 'next'
import Image from 'next/image'
import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { PageHero } from '@/components/forge/PageHero'
import { QuoteSection } from '@/components/forge/QuoteSection'
import { SectionHeading } from '@/components/forge/SectionHeading'
import { buttonClass, type } from '@/components/forge/styles'
import { TrackedPhoneLink } from '@/components/site/TrackedPhone'
import {
  TURNIUM_COLORS,
  SHEFFIELD_COLORS,
  LINE_LABELS,
  LINE_SUBTITLES,
  getSwatchUrl,
  type PanelColor,
} from '@/lib/colors'

const STANDARD_LABEL = LINE_LABELS.Turnium
const PREMIUM_LABEL  = LINE_LABELS.Sheffield
const STANDARD_SUB   = LINE_SUBTITLES.Turnium
const PREMIUM_SUB    = LINE_SUBTITLES.Sheffield

export const metadata: Metadata = {
  title: 'Metal Panel Colors & Finishes',
  description:
    'Browse 39 metal panel colors for your Central Texas carport, garage, or barn. 26 & 29-gauge Galvalume® steel with a 40-year paint warranty.',
  alternates: { canonical: '/services/colors' },
  openGraph: {
    title: 'Metal Panel Colors & Finishes | Triple J Metal',
    description: 'Choose from 39 painted Galvalume® panel colors for your Central Texas metal building. Standard and Premium lines.',
    type: 'website',
  },
}

const section = 'py-[clamp(64px,7vw,104px)]'
const container = 'mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]'
const swatchGrid = 'mt-10 grid grid-cols-3 gap-x-4 gap-y-5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7'

/** Swatch badges — Forge tags; the swatch image itself carries the real panel colour. */
const bestValueTag =
  'rounded-[4px] bg-forge-navy px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[.12em] text-white'
const hoaTag =
  'rounded-[4px] border border-forge-silver bg-white/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[.12em] text-forge-navy'

function ColorCard({ color }: { color: PanelColor }) {
  const swatchUrl = getSwatchUrl(color)
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-[12px] border border-forge-silver bg-forge-mist">
        <Image
          src={swatchUrl}
          alt={`${color.name} metal panel swatch`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover"
        />
        {color.mostEconomical && (
          <span className={`absolute top-2 left-2 ${bestValueTag}`}>
            Best Value
          </span>
        )}
        {color.hoaFriendly && (
          <span className={`absolute top-2 right-2 ${hoaTag}`}>
            HOA
          </span>
        )}
      </div>
      <div className="text-center leading-tight">
        <div className="text-[13px] font-semibold text-forge-navy">{color.name}</div>
        {color.mostEconomical && (
          <div className="mt-0.5 text-[11px] font-semibold text-forge-slate">
            Cheapest option
          </div>
        )}
      </div>
    </div>
  )
}

export default function ColorsPage() {
  return (
    <div data-forge="">
      <BreadcrumbJsonLd
        items={[
          { name: 'Services', path: '/services' },
          { name: 'Panel Colors', path: '/services/colors' },
        ]}
      />
      {/* ── Hero ── */}
      <PageHero
        variant="plain"
        breadcrumb={
          <Breadcrumb trail={[{ name: 'Services', href: '/services' }]} current="Panel Colors" jsonLd={false} />
        }
        eyebrow="Panel Options"
        h1a="Metal Panel Colors & Finishes"
        lede={
          <>
            Triple J Metal sources painted Galvalume® steel from leading regional Texas suppliers,
            spec&apos;d for high-UV, high-heat Central Texas conditions. Available in 26 and 29 gauge,
            39 colors across two product lines.
          </>
        }
        ledeMax="max-w-[640px]"
        actions={
          <>
            <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
              Get a Free Color Quote
            </ForgeButtonLink>
            <TrackedPhoneLink surface="colors_hero" className={buttonClass('outlineDark', 'lg')}>
              Call&nbsp;
            </TrackedPhoneLink>
          </>
        }
      />

      {/* ── Finish overview ── */}
      <section
        data-forge=""
        data-tone="dark"
        aria-label="Finish overview"
        className="border-t border-forge-silver/15 bg-forge-navy-raised text-white"
      >
        <div className={`${container} grid grid-cols-2 md:grid-cols-4`}>
          {[
            { stat: '39',         label: 'Colors Available' },
            { stat: '26 & 29',    label: 'Gauge Options' },
            { stat: '40-Year',    label: 'Paint Warranty' },
            { stat: 'Galvalume®', label: 'Steel Substrate' },
          ].map(({ stat, label }) => (
            <div key={label} className="border-l border-forge-silver/[.18] px-[18px] pt-[18px] pb-5">
              <div className="font-forge-display text-[clamp(18px,.6vw_+_14px,22px)] font-bold leading-[1.2] text-white">
                {stat}
              </div>
              <div className="mt-1.5 text-[11px] font-semibold uppercase tracking-[.2em] text-forge-steel-light">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Standard Line ── */}
      <section data-forge="" data-tone="light" className={`bg-white text-forge-navy ${section}`}>
        <div className={container}>
          <SectionHeading
            eyebrow="26 & 29 Gauge"
            line1={STANDARD_LABEL}
            line2={`${TURNIUM_COLORS.length} Colors`}
            ledeMax="max-w-[640px]"
            lede={
              <>
                {STANDARD_SUB}. Standard residential and commercial panel for carports, barns, garages,
                and RV covers. PBR and PBU profiles available.
              </>
            }
          />
          <div className={swatchGrid}>
            {TURNIUM_COLORS.map((color) => (
              <ColorCard key={`standard-${color.slug}`} color={color} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Premium Line ── */}
      <section
        data-forge=""
        data-tone="light"
        className={`border-t border-forge-mist bg-forge-fog text-forge-navy ${section}`}
      >
        <div className={container}>
          <SectionHeading
            eyebrow="26 Gauge Only"
            line1={PREMIUM_LABEL}
            line2={`${SHEFFIELD_COLORS.length} Colors`}
            ledeMax="max-w-[640px]"
            lede={
              <>
                {PREMIUM_SUB}. Concealed-fastener standing-seam options popular for HOA-governed
                neighborhoods like Heritage Oaks and Bella Charca. Higher-end aesthetic with hidden
                fasteners.
              </>
            }
          />
          <div className={swatchGrid}>
            {SHEFFIELD_COLORS.map((color) => (
              <ColorCard key={`premium-${color.slug}`} color={color} />
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-2.5 border-t border-forge-mist pt-5 text-[13px] text-forge-slate sm:flex-row sm:items-center sm:gap-6">
            <span className="inline-flex items-center gap-2">
              <span className={hoaTag}>HOA</span>
              = commonly used in HOA-governed subdivisions
            </span>
            <span className="inline-flex items-center gap-2">
              <span className={bestValueTag}>Best Value</span>
              = our most economical panel option
            </span>
          </div>
        </div>
      </section>

      {/* ── About the finish system ── */}
      <section data-forge="" data-tone="dark" className={`bg-forge-navy text-white ${section}`}>
        <div className={container}>
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading tone="dark" line1="Built for Central Texas Sun" />
            <div className={`mt-6 space-y-5 text-white/80 ${type.lede}`}>
              <p>
                The painted finish on every panel is engineered specifically for high-UV, high-heat
                environments. The color coat bonds to a Galvalume® substrate — a zinc-aluminum alloy
                that resists rust at cut edges and fastener points, which is where standard painted
                steel panels fail first in the Central Texas climate. Backed by a 40-year paint
                warranty.
              </p>
              <p>
                When you fill out the quote form, just mention the color name and line ({STANDARD_LABEL.toLowerCase()}{' '}
                or {PREMIUM_LABEL.toLowerCase()}) — or tell us your project type and we&rsquo;ll recommend
                colors that match common HOA palettes or complement popular Central Texas home exterior
                colors.
              </p>
            </div>
            <div className="mt-8 rounded-[12px] border border-forge-silver/[.22] bg-forge-navy-raised p-5 text-[14px] leading-[1.6] text-white/80">
              <strong className="text-white">Note:</strong> Actual colors may vary from on-screen swatches due to monitor calibration.
              Physical samples are available — call or visit our Temple, TX office to see panels in person
              before committing to a color.
            </div>
          </ForgeReveal>
        </div>
      </section>

      {/* ── Related links ── */}
      <section data-forge="" data-tone="light" className="bg-white py-8 text-forge-navy">
        <div className={`${container} flex flex-wrap items-center gap-x-6 gap-y-3.5`}>
          <p className={`${type.micro} text-forge-slate`}>
            Related
          </p>
          <div className="flex flex-wrap gap-2.5">
            <ForgeButtonLink href="/services/pbr-vs-pbu-panels" variant="linkAccent" size="tap">
              PBR vs PBU Panels →
            </ForgeButtonLink>
            <ForgeButtonLink href="/services" variant="linkAccent" size="tap">
              All Services →
            </ForgeButtonLink>
            <ForgeButtonLink href="/gallery" variant="linkAccent" size="tap">
              See Completed Projects →
            </ForgeButtonLink>
          </div>
        </div>
      </section>

      {/* ── Quote form ── */}
      <QuoteSection />
    </div>
  )
}
