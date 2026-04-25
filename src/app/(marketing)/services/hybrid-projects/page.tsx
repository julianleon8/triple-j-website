import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { ButtonLink } from '@/components/ui/Button'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { SITE } from '@/lib/site'
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
  title: 'Hybrid Projects | Horse Stalls, Warehouses, Decks',
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
    <>
      {/* ── Hero ── */}
      <section className="relative bg-ink-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <Container className="relative">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400">
              Custom & Commercial
            </span>
            <h1 className="mt-3 text-white">Hybrid Projects — Beyond the Standard Catalog</h1>
            <p className="mt-5 text-lg text-white/75 leading-relaxed max-w-2xl">
              Horse stalls, all-black warehouses, decks, hybrid stables, custom commercial. The builds
              that don't fit a clean carport or garage spec — but that we engineer, weld, bolt, and
              hand over complete just the same. Same Temple crew. Same on-site construction.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="#quote" variant="primary" size="lg">
                Get a Custom Quote
              </ButtonLink>
              <a
                href={SITE.phoneHref}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border-2 border-white/30 text-white font-semibold hover:border-white/60 transition-colors text-sm"
              >
                Call {SITE.phone}
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ── What counts as a hybrid project ── */}
      <section className="py-14 md:py-20 bg-white">
        <Container>
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600">
              What we mean by "Hybrid"
            </span>
            <h2 className="mt-3 text-ink-900">Anything that isn't a standard kit.</h2>
            <p className="mt-4 text-ink-700 leading-relaxed">
              Most of what we build fits a clean category — a 30×40 carport, a barn, an RV cover,
              a metal garage. But a real chunk of our work is custom: a horse stall layout the owner
              sketched on a napkin, an all-black warehouse for a body shop, a deck-and-cover combo
              behind a ranch house, a workshop that needs both a slab and a loft.
            </p>
            <p className="mt-3 text-ink-700 leading-relaxed">
              We don't subcontract these. The same welder-owners who build the standard projects
              are the ones engineering and erecting the hybrids — Freddy on the iron, Julian as the
              second welder, Juan on the supply chain.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Horse Stalls', desc: 'Custom stall layouts, hybrid stables, run-in shelters with tack rooms.' },
              { title: 'Commercial Warehouses', desc: 'All-black exteriors, roll-ups, lean-tos for shop/storage hybrids.' },
              { title: 'Decks & Patios', desc: 'Metal-framed decks, patio covers tied into existing roofs, custom porches.' },
              { title: 'One-Off Custom', desc: 'Whatever you sketched. We engineer it, weld it, bolt it, hand it over.' },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-ink-100 bg-ink-50 p-5"
              >
                <h3 className="text-base font-bold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Why Triple J — the engineering reality ── */}
      <section className="py-14 md:py-20 bg-ink-50 border-y border-ink-100">
        <Container>
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600">
              How we actually build
            </span>
            <h2 className="mt-3 text-ink-900">
              Every welded structure is reinforced with permanent bolts.
            </h2>
            <p className="mt-4 text-ink-700 leading-relaxed">
              Most contractors will tell you it's welded <em>or</em> bolted. The reality at Triple J
              is more honest: every welded build is welded <em>and</em> bolted. To weld red iron
              on-site, the crew first bolts everything together so it's sturdy and held in the
              correct position — then the welds happen. The bolts stay in (rubber gaskets keep
              the connections sealed) so what you get is a structure with both the rigid permanence
              of welded connections and the redundancy of mechanical fasteners.
            </p>
            <p className="mt-3 text-ink-700 leading-relaxed">
              That matters most on hybrid projects, because the geometry is rarely off-the-shelf.
              Custom horse stalls have non-standard spans. Commercial warehouses might combine
              clear-span trusses with offset purlin patterns. A deck-and-cover combo ties a new
              metal frame into an existing structure. The bolt-then-weld sequence lets us hold
              the geometry exactly while the welds set, and leaves you with both anchoring methods
              when we're done.
            </p>
          </div>
        </Container>
      </section>

      {/* ── Project grid (auto-pulled from /hq/gallery type=Hybrid) ── */}
      <section className="py-14 md:py-20 bg-white">
        <Container size="wide">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-ink-900">Recent Hybrid Builds</h2>
            <Link
              href="/gallery"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              See all projects →
            </Link>
          </div>

          {projectList.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-ink-200 bg-ink-50 px-6 py-16 text-center">
              <p className="text-base font-semibold text-ink-700">
                Hybrid project photos coming soon.
              </p>
              <p className="mt-2 text-sm text-ink-500 max-w-md mx-auto">
                We're prepping a fresh set of horse stalls, warehouses, and custom builds for this
                page. Call us in the meantime — we can walk you through past hybrid jobs over the
                phone or show photos from a recent build.
              </p>
              <div className="mt-6">
                <ButtonLink href="#quote" variant="primary" size="md">
                  Talk About Your Project
                </ButtonLink>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className="group block rounded-2xl overflow-hidden border border-ink-100 bg-ink-50 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    <article>
                      <div className="relative aspect-4/3 overflow-hidden bg-ink-200">
                        <Image
                          src={cover.url}
                          alt={cover.alt || project.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized={cover.url.startsWith('/')}
                        />
                        {project.is_featured && (
                          <span className="absolute top-3 left-3 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-ink-400 uppercase tracking-wide">
                            Hybrid · {project.city}
                          </span>
                          {project.tag && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-ink-100 text-ink-600">
                              {project.tag}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-ink-900 leading-snug">
                          {project.title}
                        </h3>
                        {colorLine && (
                          <p className="mt-1.5 text-xs text-ink-500">{colorLine}</p>
                        )}
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          )}
        </Container>
      </section>

      {/* ── CTA / Quote form ── */}
      <section id="quote" className="py-16 md:py-24 bg-ink-900 text-white">
        <Container size="narrow">
          <div className="text-center mb-8">
            <h2 className="text-white">Got something unusual? Let's talk.</h2>
            <p className="mt-3 text-white/75 text-base max-w-xl mx-auto">
              Tell us what you're picturing. We'll come out, take measurements, and send you a fixed
              quote — no kit upcharges, no subcontractor markups.
            </p>
          </div>
          <QuoteForm />
        </Container>
      </section>
    </>
  )
}
