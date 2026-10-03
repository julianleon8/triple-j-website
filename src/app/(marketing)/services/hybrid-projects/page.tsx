import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { FeatureCard } from '@/components/forge/cards'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { PageHero } from '@/components/forge/PageHero'
import { QuoteSection } from '@/components/forge/QuoteSection'
import { SectionHeading } from '@/components/forge/SectionHeading'
import { buttonClass, type } from '@/components/forge/styles'
import { TrackedPhoneLink } from '@/components/site/TrackedPhone'
import { getAdminClient } from '@/lib/supabase/admin'
import { describeGalleryColors } from '@/lib/gallery-colors'

export const dynamic = 'force-dynamic'

type GalleryPhoto = {
  id: string
  image_url: string
  alt_text: string | null
  sort_order: number
  is_cover: boolean
}

function pickCover(
  photos: GalleryPhoto[] | null | undefined,
): { url: string; alt: string | null } | null {
  const list = photos ?? []
  const cover = list.find((p) => p.is_cover) ?? list[0]
  if (!cover) return null
  return { url: cover.image_url, alt: cover.alt_text }
}

export const metadata: Metadata = {
  title: 'Hybrid Projects — Stalls, Warehouses, Decks',
  description:
    'Triple J builds projects that don\'t fit a catalog — horse stalls, warehouses, decks, custom commercial. Welded + bolted, Central Texas crew.',
  alternates: { canonical: '/services/hybrid-projects' },
  openGraph: {
    title: 'Hybrid Projects | Triple J Metal',
    description:
      'Custom horse stalls, warehouses, decks, and one-off metal builds across Central Texas. Welded + bolted, on-site, no kits.',
    type: 'website',
  },
}

const section = 'py-[clamp(64px,7vw,104px)]'
const container = 'mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]'

const HYBRID_TYPES = [
  { title: 'Horse Stalls', desc: 'Custom stall layouts, hybrid stables, run-in shelters with tack rooms.' },
  { title: 'Commercial Warehouses', desc: 'All-black exteriors, roll-ups, lean-tos for shop/storage hybrids.' },
  { title: 'Decks & Patios', desc: 'Metal-framed decks, patio covers tied into existing roofs, custom porches.' },
  { title: 'One-Off Custom', desc: 'Whatever you sketched. We engineer it, weld it, bolt it, hand it over.' },
]

export default async function HybridProjectsPage() {
  const { data: projects } = await getAdminClient()
    .from('gallery_items')
    .select(
      `
      *,
      gallery_photos ( id, image_url, alt_text, sort_order, is_cover )
      `,
    )
    .eq('is_active', true)
    .eq('type', 'Hybrid')
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true })

  const projectList = projects ?? []

  return (
    <div data-forge="">
      <BreadcrumbJsonLd
        items={[
          { name: 'Services', path: '/services' },
          { name: 'Hybrid Projects', path: '/services/hybrid-projects' },
        ]}
      />
      {/* ── Hero ── */}
      <PageHero
        variant="plain"
        breadcrumb={
          <Breadcrumb trail={[{ name: 'Services', href: '/services' }]} current="Hybrid Projects" jsonLd={false} />
        }
        eyebrow="Custom & Commercial"
        h1a="Hybrid Projects"
        h1b="Beyond the Standard Catalog"
        lede={
          <>
            Horse stalls, all-black warehouses, decks, hybrid stables, custom commercial. The builds
            that don&apos;t fit a clean carport or garage spec — but that we engineer, weld, bolt, and
            hand over complete just the same. Same Temple crew. Same on-site construction.
          </>
        }
        ledeMax="max-w-[640px]"
        actions={
          <>
            <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
              Get a Custom Quote
            </ForgeButtonLink>
            <TrackedPhoneLink surface="hybrid_projects_hero" className={buttonClass('outlineDark', 'lg')}>
              Call&nbsp;
            </TrackedPhoneLink>
          </>
        }
      />

      {/* ── Project grid (auto-pulled from /hq/gallery type=Hybrid) ── */}
      <section data-forge="" data-tone="light" className={`bg-white text-forge-navy ${section}`}>
        <div className={container}>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
            <SectionHeading line1="Recent Hybrid Builds" />
            <Link
              href="/gallery"
              className="border-b border-forge-silver pb-0.5 text-[15px] font-semibold text-forge-navy transition-colors hover:border-forge-navy"
            >
              See all projects →
            </Link>
          </div>

          {projectList.length === 0 ? (
            <div className="mt-10 rounded-[12px] border border-dashed border-forge-silver bg-forge-fog px-6 py-16 text-center">
              <p className="text-[16px] font-semibold text-forge-navy">
                Hybrid project photos coming soon.
              </p>
              <p className="mx-auto mt-2 max-w-md text-[14px] leading-[1.6] text-forge-slate">
                We&apos;re prepping a fresh set of horse stalls, warehouses, and custom builds for this
                page. Call us in the meantime — we can walk you through past hybrid jobs over the
                phone or show photos from a recent build.
              </p>
              <div className="mt-6">
                <ForgeButtonLink href="#quote" variant="navy" size="md">
                  Talk About Your Project
                </ForgeButtonLink>
              </div>
            </div>
          ) : (
            <ForgeReveal stagger className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projectList.map((project) => {
                const cover = pickCover(project.gallery_photos as GalleryPhoto[] | null)
                if (!cover) return null
                const colorLine = describeGalleryColors({
                  panelColor: project.panel_color,
                  panelColorLine: project.panel_color_line,
                  trimColor: project.trim_color,
                  trimColorLine: project.trim_color_line,
                }).label
                return (
                  <Link
                    key={project.id}
                    href={`/gallery/${project.id}`}
                    className="group flex flex-col overflow-hidden rounded-[12px] border border-forge-silver bg-white text-forge-navy transition-[border-color,box-shadow] duration-300 ease-forge hover:border-forge-steel hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <article className="flex flex-1 flex-col">
                      <div className="relative aspect-[4/3] overflow-hidden bg-forge-slate">
                        <Image
                          src={cover.url}
                          alt={cover.alt || project.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                          unoptimized={cover.url.startsWith('/')}
                        />
                        {project.is_featured && (
                          <span className="absolute top-3 left-3 rounded-[4px] bg-forge-navy px-2 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-white">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="px-[18px] pt-4 pb-[18px]">
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <span className="text-[11px] font-semibold uppercase tracking-[.2em] text-forge-slate">
                            Hybrid · {project.city}
                          </span>
                          {project.tag && (
                            <span className="rounded-[4px] border border-forge-mist bg-forge-fog px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.12em] text-forge-slate">
                              {project.tag}
                            </span>
                          )}
                        </div>
                        <h3 className="font-forge-display text-[19px] font-bold leading-[1.25] text-forge-navy">
                          {project.title}
                        </h3>
                        {colorLine && (
                          <p className="mt-1.5 text-[13px] text-forge-slate">{colorLine}</p>
                        )}
                      </div>
                    </article>
                  </Link>
                )
              })}
            </ForgeReveal>
          )}
        </div>
      </section>

      {/* ── What counts as a hybrid project ── */}
      <section
        data-forge=""
        data-tone="light"
        className={`border-t border-forge-mist bg-forge-fog text-forge-navy ${section}`}
      >
        <div className={container}>
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading eyebrow={'What we mean by "Hybrid"'} line1={"Anything that isn't a standard kit."} />
            <p className={`mt-4 text-forge-slate ${type.lede}`}>
              Most of what we build fits a clean category — a 30×40 carport, a barn, an RV cover,
              a metal garage. But a real chunk of our work is custom: a horse stall layout the owner
              sketched on a napkin, an all-black warehouse for a body shop, a deck-and-cover combo
              behind a ranch house, a workshop that needs both a slab and a loft.
            </p>
            <p className={`mt-3 text-forge-slate ${type.lede}`}>
              We don&apos;t subcontract these. The same welder-owners who build the standard projects
              are the ones engineering and erecting the hybrids — Freddy on the iron, Julian as the
              second welder, Juan on the supply chain.
            </p>
          </ForgeReveal>

          <ForgeReveal stagger className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
            {HYBRID_TYPES.map((item, i) => (
              <FeatureCard key={item.title} index={i} title={item.title}>
                {item.desc}
              </FeatureCard>
            ))}
          </ForgeReveal>
        </div>
      </section>

      {/* ── Why Triple J — the engineering reality ── */}
      <section data-forge="" data-tone="light" className={`bg-white text-forge-navy ${section}`}>
        <div className={container}>
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading
              eyebrow="How we actually build"
              line1="Every welded structure is reinforced with permanent bolts."
              balance
            />
            <p className={`mt-4 text-forge-slate ${type.lede}`}>
              Most contractors will tell you it&apos;s welded <em>or</em> bolted. The reality at Triple J
              is more honest: every welded build is welded <em>and</em>{' '}bolted. To weld red iron
              on-site, the crew first bolts everything together so it&apos;s sturdy and held in the
              correct position — then the welds happen. The bolts stay in (rubber gaskets keep
              the connections sealed) so what you get is a structure with both the rigid permanence
              of welded connections and the redundancy of mechanical fasteners.
            </p>
            <p className={`mt-3 text-forge-slate ${type.lede}`}>
              That matters most on hybrid projects, because the geometry is rarely off-the-shelf.
              Custom horse stalls have non-standard spans. Commercial warehouses might combine
              clear-span trusses with offset purlin patterns. A deck-and-cover combo ties a new
              metal frame into an existing structure. The bolt-then-weld sequence lets us hold
              the geometry exactly while the welds set, and leaves you with both anchoring methods
              when we&apos;re done.
            </p>
          </ForgeReveal>
        </div>
      </section>

      {/* ── CTA / Quote form ── */}
      <section
        data-forge=""
        data-tone="dark"
        className="bg-forge-navy py-[clamp(48px,5vw,80px)] text-white"
      >
        <div className={container}>
          <SectionHeading
            tone="dark"
            align="center"
            line1="Got something unusual?"
            line2={"Let's talk."}
            ledeMax="max-w-xl"
            lede={
              <>
                Tell us what you&apos;re picturing. We&apos;ll come out, take measurements, and send you a fixed
                quote — no kit upcharges, no subcontractor markups.
              </>
            }
          />
        </div>
      </section>
      <QuoteSection />
    </div>
  )
}
