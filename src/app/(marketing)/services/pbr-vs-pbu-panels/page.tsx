import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { RuleList } from '@/components/forge/cards'
import { FaqAccordion } from '@/components/forge/FaqAccordion'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { PageHero } from '@/components/forge/PageHero'
import { QuoteSection } from '@/components/forge/QuoteSection'
import { SectionHeading } from '@/components/forge/SectionHeading'
import { buttonClass, type } from '@/components/forge/styles'
import { TrackedPhoneLink } from '@/components/site/TrackedPhone'
import { getSiteUrl } from '@/lib/site-url'

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

// The FAQPage node here was removed 2026-09-06 — Google retired the FAQ rich
// result on 2026-05-07, so it earned nothing. The visible Q&A comparison below
// is unchanged. A WebPage node replaces it so the page still joins the sitewide
// @graph rather than shipping no structured data at all.
const pageUrl = `${getSiteUrl()}/services/pbr-vs-pbu-panels`

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': pageUrl,
  url: pageUrl,
  name: 'PBR vs PBU Roofing Panels — Which to Pick',
  description:
    'PBR vs PBU metal roofing panels: when to use each, and which fits your carport, garage, or barn in Central Texas.',
  isPartOf: { '@id': `${getSiteUrl()}/#website` },
  about: { '@id': `${getSiteUrl()}/#localbusiness` },
  inLanguage: 'en-US',
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

const FAQS = [
  {
    q: 'Can I mix PBR and PBU on the same building?',
    a: "In most cases, no — you'd typically choose one panel system per structure. However, you might use PBR on the roof and a standing seam option on visible wall panels if aesthetics are the driver. Ask us during your quote and we'll walk you through what makes sense.",
  },
  {
    q: 'Does PBU cost significantly more?',
    a: 'PBU panels themselves cost more per square foot, and installation takes longer since the fastener system is different. We quote PBR and PBU side by side, so you see the difference on your build before you choose.',
  },
  {
    q: 'Are PBR panels weathertight?',
    a: 'Yes — when installed correctly with sealant-backed screws and proper lapping, PBR panels are fully weathertight. The exposed fastener is not a weakness when the installation is done right. Triple J Metal uses correct torque and sealant on every screw.',
  },
  {
    q: 'Which panel holds up better in Texas hail?',
    a: 'Both PBR and PBU panels in 26-gauge perform similarly in hail events. If hail resistance is a specific concern, the gauge of steel matters more than the fastener style — ask us about upgrading to 26-gauge on your project.',
  },
]

const section = 'py-[clamp(64px,7vw,104px)]'
const container = 'mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]'
/** Comparison table columns: attribute + PBR + PBU from sm up; attribute stacks above on phones. */
const tableCols = 'grid grid-cols-2 sm:grid-cols-[minmax(0,.8fr)_minmax(0,1fr)_minmax(0,1fr)]'

export default function PbrVsPbuPage() {
  return (
    <div data-forge="">
      <BreadcrumbJsonLd
        items={[
          { name: 'Services', path: '/services' },
          { name: 'PBR vs PBU Panels', path: '/services/pbr-vs-pbu-panels' },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {/* ── Hero ── */}
      <PageHero
        variant="plain"
        breadcrumb={
          <Breadcrumb trail={[{ name: 'Services', href: '/services' }]} current="PBR vs PBU Panels" jsonLd={false} />
        }
        eyebrow="Material Guide"
        h1a="PBR vs PBU Metal Roofing Panels"
        h1b="Which One Do You Need?"
        contentMax="max-w-[860px]"
        lede={
          <>
            Both PBR and PBU panels are high-quality metal roofing options used in Central Texas metal
            buildings. The right choice depends on your budget, aesthetics, and how much long-term
            maintenance you want to deal with. Here&rsquo;s what the difference actually means for your project.
          </>
        }
        ledeMax="max-w-[640px]"
        actions={
          <>
            <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
              Get a Free Panel Quote
            </ForgeButtonLink>
            <TrackedPhoneLink surface="pbr_pbu_hero" className={buttonClass('outlineDark', 'lg')}>
              Ask Us —&nbsp;
            </TrackedPhoneLink>
          </>
        }
      />

      {/* ── What each panel is ── */}
      <section data-forge="" data-tone="light" className={`bg-white text-forge-navy ${section}`}>
        <div className={container}>
          <SectionHeading align="center" line1="What Each Panel Actually Is" />
          <ForgeReveal stagger className="mt-11 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* PBR */}
            <div className="flex flex-col rounded-[12px] border border-forge-silver bg-forge-fog p-[clamp(22px,2.5vw,32px)]">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-11 flex-none items-center justify-center rounded-[6px] bg-forge-navy font-forge-display text-[13px] font-bold text-white">
                  PBR
                </span>
                <h3 className="font-forge-display text-[22px] font-bold leading-[1.2] text-forge-navy">PBR Panel</h3>
              </div>
              <p className={`mt-5 ${type.micro} text-forge-steel`}>
                Purlin Bearing Rib
              </p>
              <p className="mt-3 text-[15px] leading-[1.65] text-forge-slate [text-wrap:pretty]">
                PBR is an exposed-fastener R-panel profile — the most widely used commercial roofing panel
                in Texas. Screws go through the face of the panel into the steel purlin below. When installed
                correctly with quality sealant washers, PBR panels are weathertight, durable, and
                cost-effective for the vast majority of metal building projects.
              </p>
              <RuleList
                className="mt-6 border-t border-forge-mist pt-5"
                itemClassName="text-[15px] leading-[1.45] text-forge-navy"
                items={[
                  'Most economical panel option',
                  'Standard for carports, barns, and agricultural buildings',
                  'Wide color and gauge availability from regional Texas suppliers',
                  'Proven decades of performance in Central Texas',
                ]}
              />
            </div>

            {/* PBU */}
            <div className="flex flex-col rounded-[12px] border border-forge-silver bg-forge-fog p-[clamp(22px,2.5vw,32px)]">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-11 flex-none items-center justify-center rounded-[6px] bg-forge-slate font-forge-display text-[13px] font-bold text-white">
                  PBU
                </span>
                <h3 className="font-forge-display text-[22px] font-bold leading-[1.2] text-forge-navy">PBU Panel</h3>
              </div>
              <p className={`mt-5 ${type.micro} text-forge-steel`}>
                Panel Base Under (Hidden Fastener)
              </p>
              <p className="mt-3 text-[15px] leading-[1.65] text-forge-slate [text-wrap:pretty]">
                PBU uses the same R-panel profile but with a concealed fastening system — the screw clips
                under the overlapping rib, so nothing penetrates the panel face. The result is a cleaner
                visual profile with no exposed screw heads on the roof surface. Better for HOA-grade builds
                where aesthetics matter, and lower maintenance since fastener points aren&rsquo;t exposed to weather.
              </p>
              <RuleList
                className="mt-6 border-t border-forge-mist pt-5"
                itemClassName="text-[15px] leading-[1.45] text-forge-navy"
                items={[
                  'No exposed fasteners on the roof surface',
                  'Cleaner look for HOA neighborhoods and luxury builds',
                  'Reduced long-term maintenance on fastener points',
                  'Higher upfront cost — labor and materials',
                ]}
              />
            </div>
          </ForgeReveal>
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section
        data-forge=""
        data-tone="light"
        className={`border-t border-forge-mist bg-forge-fog text-forge-navy ${section}`}
      >
        <div className={container}>
          <ForgeReveal className="mx-auto max-w-[920px]">
            <SectionHeading line1="Side-by-Side Comparison" />
            <div className="mt-8 overflow-hidden rounded-[12px] border border-forge-silver bg-white">
              <div className={`${tableCols} bg-forge-navy ${type.micro}`}>
                <div className="hidden px-4 py-3.5 text-forge-steel-light sm:block">Attribute</div>
                <div className="px-4 py-3.5 text-white">PBR Panel</div>
                <div className="px-4 py-3.5 text-forge-silver">PBU Panel</div>
              </div>
              {COMPARISON_ROWS.map((row, i) => (
                <div
                  key={row.attribute}
                  className={`${tableCols} border-t border-forge-mist text-[14px] leading-[1.5] ${i % 2 === 0 ? 'bg-white' : 'bg-forge-fog'}`}
                >
                  <div className="col-span-2 px-4 pt-4 font-semibold text-forge-navy sm:col-span-1 sm:border-r sm:border-forge-mist sm:pb-4">
                    {row.attribute}
                  </div>
                  <div className="border-r border-forge-mist px-4 pt-1.5 pb-4 text-forge-slate sm:pt-4">
                    {row.pbr}
                  </div>
                  <div className="px-4 pt-1.5 pb-4 text-forge-slate sm:pt-4">
                    {row.pbu}
                  </div>
                </div>
              ))}
            </div>
          </ForgeReveal>
        </div>
      </section>

      {/* ── Our recommendation ── */}
      <section data-forge="" data-tone="dark" className={`bg-forge-navy text-white ${section}`}>
        <div className={container}>
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading tone="dark" line1="What Triple J Recommends" line2="And Why" />
            <div className={`mt-6 space-y-5 text-white/80 ${type.lede}`}>
              <p>
                For the majority of carports, barns, and garages we build in Central Texas — <strong className="text-white">PBR is the right call.</strong>{' '}It&rsquo;s
                cost-effective, weather-proven, and when we install it correctly with proper sealant-backed screws,
                it performs for decades without issues. The exposed-fastener design is also easier to inspect and
                maintain if you ever need to.
              </p>
              <p>
                <strong className="text-white">PBU makes sense when aesthetics are a priority.</strong>{' '}If
                you&rsquo;re in a Heritage Oaks or Bella Charca neighborhood, your HOA may expect cleaner
                finishes — or you simply want a structure that looks more architectural and less industrial.
                In that case, the extra cost of PBU is worth it.
              </p>
              <p>
                When you fill out the quote form below or call us, just mention which look you want — or tell us
                your HOA requirements if you have them. We&rsquo;ll recommend the right panel for your specific project.
              </p>
            </div>
            <div className="mt-8 rounded-[12px] border border-forge-silver/[.22] bg-forge-navy-raised p-6">
              <p className={`mb-2 ${type.micro} text-forge-silver`}>
                Our steel
              </p>
              <p className="text-[15px] leading-[1.6] text-white/80">
                Triple J Metal sources PBR and PBU panels from leading regional Texas suppliers — Galvalume®
                substrate with painted finishes backed by a 40-year paint warranty, in 26-gauge and 29-gauge
                depending on your application. Multi-source so we&rsquo;re never bottlenecked when a single supplier
                runs short.
              </p>
            </div>
          </ForgeReveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section data-forge="" data-tone="light" className={`bg-white text-forge-navy ${section}`}>
        <div className={container}>
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading line1="Frequently Asked Questions" />
            <div className="mt-8">
              <FaqAccordion faqs={FAQS} />
            </div>
          </ForgeReveal>
        </div>
      </section>

      {/* ── Related links ── */}
      <section data-forge="" data-tone="light" className="border-t border-forge-mist bg-forge-fog py-8 text-forge-navy">
        <div className={`${container} flex flex-wrap items-center gap-x-6 gap-y-3.5`}>
          <p className={`${type.micro} text-forge-slate`}>
            Related Services
          </p>
          <div className="flex flex-wrap gap-2.5">
            <ForgeButtonLink href="/services/carports" variant="linkAccent" size="tap">
              Metal Carports →
            </ForgeButtonLink>
            <ForgeButtonLink href="/services/hoa-compliant-structures" variant="linkAccent" size="tap">
              HOA-Compliant Structures →
            </ForgeButtonLink>
            <ForgeButtonLink href="/services/turnkey-carports-with-concrete" variant="linkAccent" size="tap">
              Turnkey + Concrete →
            </ForgeButtonLink>
            <ForgeButtonLink href="/services" variant="linkAccent" size="tap">
              All Services →
            </ForgeButtonLink>
          </div>
        </div>
      </section>

      {/* ── Quote form ── */}
      <QuoteSection />
    </div>
  )
}
