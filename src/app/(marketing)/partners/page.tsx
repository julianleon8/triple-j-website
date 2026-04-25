import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { ButtonLink } from '@/components/ui/Button'
import { PartnerInquiryForm } from '@/components/sections/PartnerInquiryForm'
import { TrackedPhoneLink } from '@/components/site/TrackedPhone'
import { SITE } from '@/lib/site'
import { getAdminClient } from '@/lib/supabase/admin'

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
  title: 'For GCs, Manufacturers & Suppliers | Install Partner',
  description:
    'Triple J is the Central Texas install crew for manufacturers, dealers, and GCs. Welded + bolted, named in-house crew, no subcontractors.',
  alternates: { canonical: '/partners' },
  openGraph: {
    title: 'Become a Triple J Install Partner | Triple J Metal',
    description:
      'B2B install partnership in Central Texas — welded + bolted, no subs, photo-documented. Suppliers, manufacturers, GCs welcome.',
    type: 'website',
  },
}

export default async function PartnersPage() {
  const { data: featured } = await getAdminClient()
    .from('gallery_items')
    .select(
      `
      id, title, city, type,
      gallery_photos ( id, image_url, alt_text, sort_order, is_cover )
      `,
    )
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('sort_order', { ascending: true })
    .limit(6)

  const featuredList = featured ?? []

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-ink-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <Container className="relative">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400">
              For Suppliers, Manufacturers & GCs
            </span>
            <h1 className="mt-3 text-white">
              Looking for a Central Texas installation partner?
            </h1>
            <p className="mt-5 text-lg text-white/75 leading-relaxed max-w-2xl">
              Suppliers, manufacturers, dealers, GCs — when your customer's in Bell, McLennan,
              Coryell, or Williamson County, we're the named in-house crew that welds, bolts, and
              hands the building over complete. No kits left in driveways. No subcontractor
              roulette. Your reputation rides on the install — we treat it that way.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="#inquire" variant="primary" size="lg">
                Send a Partner Inquiry
              </ButtonLink>
              <TrackedPhoneLink
                surface="partners_hero"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border-2 border-white/30 text-white font-semibold hover:border-white/60 transition-colors text-sm"
              >
                Call&nbsp;
              </TrackedPhoneLink>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Capability snapshot ── */}
      <section className="py-12 md:py-16 bg-white border-b border-ink-100">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { stat: '2',          label: 'In-house welders (Julian + Freddy)' },
              { stat: '150+',       label: 'Completed projects' },
              { stat: 'Same-Week',  label: 'Mobilization on approval' },
              { stat: 'Temple, TX', label: 'HQ — full Central TX coverage' },
            ].map(({ stat, label }) => (
              <div key={label}>
                <div className="text-2xl md:text-3xl font-extrabold text-ink-900">{stat}</div>
                <div className="mt-1 text-[11px] md:text-xs text-ink-500 uppercase tracking-wide leading-snug">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── What we offer partners ── */}
      <section className="py-14 md:py-20 bg-ink-50 border-b border-ink-100">
        <Container>
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600">
              What we offer partners
            </span>
            <h2 className="mt-3 text-ink-900">
              The install crew you'd build if you could.
            </h2>
            <p className="mt-4 text-ink-700 leading-relaxed">
              We've built Triple J around the things suppliers and GCs ask for and rarely get from
              install subs. No black-box scheduling. No phantom subcontractors. No phone calls
              dodged when something goes sideways.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card
              title="Photo-documented installs"
              body="Every job photographed front-to-back. You get the full gallery to show your customer, post on social, or use in your own marketing — unbranded if you prefer. Most install subs hand you nothing."
            />
            <Card
              title="Welded + bolted construction"
              body="Our 'welded' builds are welded AND bolted: the crew bolts everything in place to hold the geometry, then welds. The bolts stay (rubber gaskets seal them). Result: redundant structural anchoring, no leaks, fewer warranty claims downstream."
            />
            <Card
              title="No subcontractors"
              body="Every weld, every bolt, every panel goes up under one of three named owners — Juan, Julian, or Freddy. Your reputation isn't riding on a stranger's day. When something needs answering on-site, the person who can answer is on-site."
            />
            <Card
              title="Bilingual on every job"
              body="English and Spanish, every job site. Julian on the English side, Juan and Freddy on Spanish. Critical when your customer base includes Hispanic landowners, ranchers, or commercial buyers — a market most competitors leave on the table."
            />
          </div>
        </Container>
      </section>

      {/* ── Recent work strip (auto-pulled featured photos) ── */}
      {featuredList.length > 0 && (
        <section className="py-14 md:py-20 bg-white border-b border-ink-100">
          <Container size="wide">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-ink-900">Featured Builds</h2>
              <Link
                href="/gallery"
                className="text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                Full gallery →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {featuredList.map((project) => {
                const cover = pickCover(project.gallery_photos as GalleryPhoto[] | null)
                if (!cover) return null
                return (
                  <Link
                    key={project.id}
                    href={`/gallery/${project.id}`}
                    className="group block rounded-xl overflow-hidden border border-ink-100 bg-ink-50 hover:shadow-md transition-all"
                  >
                    <div className="relative aspect-4/3 overflow-hidden bg-ink-200">
                      <Image
                        src={cover.url}
                        alt={cover.alt || project.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized={cover.url.startsWith('/')}
                      />
                    </div>
                    <div className="p-3">
                      <div className="text-[11px] font-semibold text-ink-400 uppercase tracking-wide">
                        {project.type} · {project.city}
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-ink-900 leading-snug line-clamp-1">
                        {project.title}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </Container>
        </section>
      )}

      {/* ── Inquiry form ── */}
      <section id="inquire" className="py-16 md:py-24 bg-ink-50">
        <Container size="narrow">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600">
              Inquire
            </span>
            <h2 className="mt-3 text-ink-900">Tell us about your business.</h2>
            <p className="mt-3 text-ink-700 text-base max-w-xl mx-auto">
              A few quick fields. Julian reads every one personally and reaches back within one
              business day. Direct line:{' '}
              <TrackedPhoneLink
                surface="partners_inquiry_inline"
                className="font-semibold text-brand-600 hover:underline"
              />.
            </p>
          </div>
          <PartnerInquiryForm />
        </Container>
      </section>

      {/* ── Footer-of-page CTA for partners who'd rather skip the form ── */}
      <section className="py-12 bg-ink-900 text-white">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-white text-lg font-bold">Rather skip the form?</h3>
              <p className="mt-1 text-sm text-white/70">
                Call or email Julian directly — same person who reads the form responses.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <TrackedPhoneLink
                surface="partners_footer_cta"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
              />
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-lg border-2 border-white/30 text-white text-sm font-semibold hover:border-white/60 transition-colors"
              >
                {SITE.email}
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5 sm:p-6">
      <h3 className="text-base font-bold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm text-ink-700 leading-relaxed">{body}</p>
    </div>
  )
}
