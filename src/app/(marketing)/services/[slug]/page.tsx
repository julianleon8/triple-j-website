import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { BuildGrid } from '@/components/forge/BuildGrid'
import { Chip } from '@/components/forge/Chip'
import { FaqAccordion } from '@/components/forge/FaqAccordion'
import { FeatureCard, RuleList, SpecSheet } from '@/components/forge/cards'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { OptionTabs } from '@/components/forge/OptionTabs'
import { PageHero } from '@/components/forge/PageHero'
import { QuoteSection } from '@/components/forge/QuoteSection'
import { RelatedGuides } from '@/components/forge/RelatedGuides'
import { SectionHeading } from '@/components/forge/SectionHeading'
import { buttonClass } from '@/components/forge/styles'
import { TrackedPhoneLink, TrackedPhoneNumber } from '@/components/site/TrackedPhone'
import { ALL_CITY_SLUGS } from '@/lib/city-links'
import { filterByTypes, getBuilds } from '@/lib/forge-builds'
import { LOCATIONS } from '@/lib/locations'
import { SERVICE_PHOTOS, SERVICES, SERVICE_SLUGS, type ServiceData } from '@/lib/services'
import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

export async function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata(
  { params }: PageProps<'/services/[slug]'>
): Promise<Metadata> {
  const { slug } = await params
  const svc = SERVICES[slug]
  if (!svc) return {}
  return {
    title: svc.metaTitle,
    description: svc.metaDescription,
    alternates: { canonical: `/services/${slug}` },
    openGraph: { title: svc.metaTitle, description: svc.metaDescription, type: 'website' },
    twitter: {
      card: 'summary_large_image',
      title: svc.metaTitle,
      description: svc.metaDescription,
    },
  }
}

// Recent builds read live gallery_items; refresh hourly.
export const revalidate = 3600

/** Existing keyword-gap labels, reused as the eyebrow on pages without Forge copy. */
const GAP_EYEBROWS: Record<number, string> = {
  1: 'Turnkey + Concrete',
  2: 'Welded Steel Quality',
  3: 'Same-Week Speed',
  4: 'HOA Luxury Builds',
}

const menuName = (svc: ServiceData) => svc.forge?.menu ?? svc.shortTitle

/** Panel and finish pages apply to every building, not to fencing or gates. */
const PANEL_LINKS = [
  { href: '/services/colors', label: 'Panel colors' },
  { href: '/services/pbr-vs-pbu-panels', label: 'PBR vs PBU panels' },
]
/** Stalls, decks and one-offs sit next to barns and garages. */
const HYBRID_LINK = { href: '/services/hybrid-projects', label: 'Hybrid projects' }
const HYBRID_FROM = new Set(['barns', 'metal-garages'])

function panelLinks(svc: ServiceData): { href: string; label: string }[] {
  if (svc.slug === 'metal-fencing' || svc.slug === 'gates') return []
  return [...PANEL_LINKS, ...(HYBRID_FROM.has(svc.slug) ? [HYBRID_LINK] : [])]
}

/** Order is the design's: two related services, then the fixed links. */
function relatedLinks(svc: ServiceData): { href: string; label: string }[] {
  const related = (svc.forge?.related ?? svc.relatedSlugs).slice(0, 2)
  return [
    ...related
      .map((s) => SERVICES[s])
      .filter((s): s is ServiceData => Boolean(s))
      .map((s) => ({ href: `/services/${s.slug}`, label: menuName(s) })),
    { href: '/gallery', label: 'Project gallery' },
    { href: '/locations/temple', label: 'Temple, TX' },
    { href: '/locations/belton', label: 'Belton, TX' },
    { href: '/about', label: 'About our crew' },
    { href: '/military', label: 'Fort Cavazos military discount' },
  ]
}

export default async function ServicePage(
  { params }: PageProps<'/services/[slug]'>
) {
  const { slug } = await params
  const svc = SERVICES[slug]
  if (!svc) notFound()

  const f = svc.forge
  const menu = menuName(svc)

  const baseUrl = getSiteUrl()
  const pageUrl = `${baseUrl}/services/${slug}`

  // Per-service @graph: a Service node referencing the canonical
  // LocalBusiness via @id, plus a WebPage node. See docs/SCHEMA-AUDIT.md.
  // No FAQPage node: Google retired the FAQ rich result 2026-05-07 (locked).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: svc.title,
        description: svc.metaDescription,
        serviceType: svc.title,
        provider: { '@id': `${baseUrl}/#localbusiness` },
        areaServed: { '@type': 'State', name: 'Texas' },
        url: pageUrl,
      },
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: svc.metaTitle ?? `${svc.title} | ${SITE.name}`,
        description: svc.metaDescription,
        isPartOf: { '@id': `${baseUrl}/#website` },
        about: { '@id': `${pageUrl}#service` },
        inLanguage: 'en-US',
      },
    ],
  }

  // Recent builds: live items of this service's type, shown only with 3+.
  const typed = svc.galleryTypes ? filterByTypes(await getBuilds({ order: 'featured' }), svc.galleryTypes) : []
  const builds = (svc.galleryTag ? typed.filter((b) => b.tag === svc.galleryTag) : typed).slice(0, 8)

  const heroImage = f
    ? { src: f.img, alt: f.imgAlt, position: f.pos }
    : SERVICE_PHOTOS[slug]
      ? { src: SERVICE_PHOTOS[slug], alt: `${svc.title} built by ${SITE.name}`, position: '50% 50%' }
      : null

  const heroActions = (
    <>
      <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
        Get a Free Quote
      </ForgeButtonLink>
      <TrackedPhoneLink
        surface="services_slug_hero"
        mode="children-only"
        className={buttonClass('outlineDark', 'lg')}
      >
        Call <TrackedPhoneNumber className="tabular-nums" />
      </TrackedPhoneLink>
    </>
  )
  const breadcrumb = (
    <Breadcrumb
      trail={[{ name: 'Services', href: '/services' }]}
      current={menu}
      currentPath={`/services/${slug}`}
    />
  )
  const heroCopy = {
    breadcrumb,
    eyebrow: f?.eyebrow ?? (svc.keywordGap ? GAP_EYEBROWS[svc.keywordGap] : undefined),
    h1a: f?.h1a ?? svc.heroHeadline,
    h1b: f?.h1b,
    lede: f?.lede ?? svc.heroCopy,
    actions: heroActions,
  }

  return (
    <div data-forge="">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {/* 1 · Hero */}
      {heroImage ? (
        <PageHero {...heroCopy} image={heroImage} facts={f?.facts} />
      ) : (
        <PageHero {...heroCopy} variant="plain" />
      )}

      {/* 2 · Options */}
      {f && f.options.length ? (
        <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
          <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
            <OptionTabs
              heading={
                <SectionHeading eyebrow={f.optEyebrow} line1={f.optHeading} lede={f.optLede} ledeMax="max-w-[560px]" />
              }
              options={f.options.map((o) => ({
                ...o,
                imgAlt: o.title,
                quote: {
                  service: svc.quoteService,
                  structure: o.structure,
                  concrete: o.concrete,
                },
              }))}
            />
          </div>
        </section>
      ) : null}

      {/* 3 · What's included */}
      {svc.features.length ? (
        <section data-forge="" data-tone="light" className="bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy">
          <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
            <ForgeReveal className="max-w-[760px]">
              <SectionHeading eyebrow="What’s included" line1={svc.featuresHeading ?? 'What’s included'} balance />
            </ForgeReveal>
            <ForgeReveal stagger className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
              {svc.features.map((feat, i) => (
                <FeatureCard key={feat.title} index={i} title={feat.title}>
                  {feat.description}
                </FeatureCard>
              ))}
            </ForgeReveal>
          </div>
        </section>
      ) : null}

      {/* 4 · Recent builds (3+ live matches only) */}
      {builds.length >= 3 ? (
        <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
          <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
              <SectionHeading eyebrow="Recent builds" line1="Real jobs, real addresses." className="max-w-[720px]" />
              <Link href="/gallery" className="border-b border-forge-silver pb-0.5 text-[15px] font-semibold transition-colors hover:border-forge-navy">
                See the full gallery →
              </Link>
            </div>
            <BuildGrid items={builds} />
          </div>
        </section>
      ) : null}

      {/* 5 · Specs (navy) */}
      {svc.technicalAuthority ? (
        <section data-forge="" data-tone="dark" className="bg-forge-navy py-[clamp(64px,7vw,104px)] text-white">
          <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(32px,4vw,72px)] px-[clamp(20px,3vw,40px)]">
            <ForgeReveal>
              {f?.techHeading ? (
                <SectionHeading tone="dark" eyebrow="Built for Central Texas" line1={f.techHeading} balance />
              ) : (
                <SectionHeading tone="dark" line1="Built for Central Texas" />
              )}
              <p className="mt-[18px] max-w-[600px] text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.6] text-white/80 [text-wrap:pretty]">
                {svc.technicalAuthority}
              </p>
              {svc.trustPoints?.length ? <RuleList className="mt-7" items={svc.trustPoints} /> : null}
            </ForgeReveal>
            {f?.specs.length ? (
              <ForgeReveal>
                <SpecSheet
                  title={`Spec sheet · ${menu}`}
                  rows={f.specs}
                  footnote="Final gauge, anchoring and engineering are confirmed for your design and site."
                />
              </ForgeReveal>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* 6 · FAQ */}
      {svc.faqs.length ? (
        <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
          <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] items-start gap-[clamp(32px,4vw,72px)] px-[clamp(20px,3vw,40px)]">
            <ForgeReveal>
              <SectionHeading eyebrow="Questions" line1="What people" line2="ask us." />
              <p className="mt-4 max-w-[420px] text-[16px] leading-[1.6] text-forge-slate">
                Still unsure? Call{' '}
                <TrackedPhoneLink
                  surface="services_slug_faq"
                  className="border-b border-forge-silver font-semibold text-forge-navy tabular-nums transition-colors hover:border-forge-navy"
                />
                . A real person from our Temple crew picks up.
              </p>
            </ForgeReveal>
            <ForgeReveal>
              <FaqAccordion faqs={svc.faqs} />
            </ForgeReveal>
          </div>
        </section>
      ) : null}

      {/* 7 · Guides (only when relatedPosts is populated) */}
      {svc.relatedPosts?.length ? <RelatedGuides postSlugs={svc.relatedPosts} /> : null}

      {/* 8 · Related, panels, and the cities we serve */}
      <section data-forge="" data-tone="light" className="border-t border-forge-mist bg-forge-fog py-8 text-forge-navy">
        <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-[clamp(20px,3vw,40px)]">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-slate min-[900px]:w-[150px]">Related</p>
            <div className="flex flex-wrap gap-2.5">
              {relatedLinks(svc).map((r) => (
                <ForgeButtonLink key={r.href} href={r.href} variant="linkAccent" size="tap">
                  {r.label} →
                </ForgeButtonLink>
              ))}
            </div>
          </div>
          {panelLinks(svc).length ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3.5">
              <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-slate min-[900px]:w-[150px]">Panels &amp; specialty</p>
              <div className="flex flex-wrap gap-2.5">
                {panelLinks(svc).map((r) => (
                  <ForgeButtonLink key={r.href} href={r.href} variant="linkAccent" size="tap">
                    {r.label} →
                  </ForgeButtonLink>
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-slate min-[900px]:w-[150px]">Cities we serve</p>
            <div className="flex flex-wrap gap-2">
              {ALL_CITY_SLUGS.map((slug) => (
                <Chip key={slug} href={`/locations/${slug}`} size="sm">
                  {LOCATIONS[slug].name}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9 · Quote */}
      <QuoteSection initialService={svc.quoteService} serviceName={svc.quoteService ? menu : undefined} />
    </div>
  )
}
