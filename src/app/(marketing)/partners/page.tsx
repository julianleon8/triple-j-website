import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { BuildGrid } from '@/components/forge/BuildGrid'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { PageHero } from '@/components/forge/PageHero'
import { SectionHeading } from '@/components/forge/SectionHeading'
import { buttonClass } from '@/components/forge/styles'
import { numeral } from '@/components/forge/cards'
import { PartnerInquiryForm } from '@/components/sections/PartnerInquiryForm'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { TrackedPhoneLink, TrackedPhoneNumber } from '@/components/site/TrackedPhone'
import { getBuilds } from '@/lib/forge-builds'
import { SITE } from '@/lib/site'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'B2B Install Partner — GCs & Suppliers',
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

const OFFER = [
  {
    title: 'Photo-documented installs',
    body: 'Every job photographed front-to-back. You get the full gallery to show your customer, post on social, or use in your own marketing — unbranded if you prefer.',
  },
  {
    title: 'Welded + bolted construction',
    body: 'Our welded builds are welded and bolted: the crew bolts everything to hold the geometry, then welds. The bolts stay, sealed with rubber gaskets — redundant anchoring, no leaks, fewer warranty claims downstream.',
  },
  {
    title: 'No subcontractors',
    body: 'Every weld, bolt and panel goes up under one of three named owners — Juan, Julian or Freddy. When something needs answering on-site, the person who can answer is on-site.',
  },
  {
    title: 'Bilingual on every job',
    body: 'English and Spanish on every site — Julian on the English side, Juan and Freddy on Spanish. Critical when your customers include Hispanic landowners, ranchers or commercial buyers.',
  },
]

export default async function PartnersPage() {
  // Featured jobs first (the gallery's curated flag), then by sort order.
  const featured = (await getBuilds({ order: 'featured' })).slice(0, 6)

  return (
    <div data-forge="">
      <BreadcrumbJsonLd items={[{ name: 'Partners', path: '/partners' }]} />

      {/* 1 · Hero */}
      <PageHero
        breadcrumb={<Breadcrumb trail={[{ name: 'Company' }]} current="Partners" jsonLd={false} />}
        image={{ src: '/images/double-carport-install.jpg', alt: 'Triple J Metal crew installing a double carport' }}
        contentMax="max-w-[820px]"
        ledeMax="max-w-[640px]"
        eyebrow="For suppliers, manufacturers & GCs"
        h1a="Your Central Texas"
        h1b="install crew."
        lede="When your customer is in Bell, McLennan, Coryell or Williamson County, we’re the named in-house crew that welds, bolts and hands the building over complete. No kits left in driveways. No subcontractor roulette. Your reputation rides on the install — we treat it that way."
        actions={
          <>
            <ForgeButtonLink href="#inquire" variant="white" size="lg" arrow>
              Send a Partner Inquiry
            </ForgeButtonLink>
            <TrackedPhoneLink surface="partners_hero" mode="children-only" className={buttonClass('outlineDark', 'lg')}>
              Call <TrackedPhoneNumber className="tabular-nums" />
            </TrackedPhoneLink>
          </>
        }
        facts={[
          // The design's "2 in-house welders · Julian + Freddy" is not supported
          // by the vault (D18); the locked zero-subcontractors fact stands in.
          { k: 'Crew', v: 'In-house', s: 'Zero subcontractors' },
          { k: 'Track record', v: `${SITE.stats.projects} projects`, s: 'Across Central Texas' },
          { k: 'Mobilization', v: 'Same-week', s: 'On approval' },
          { k: 'HQ', v: 'Temple, TX', s: 'Full Central TX coverage' },
        ]}
      />

      {/* 2 · What we offer partners */}
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="max-w-[780px]">
            <SectionHeading
              eyebrow="What we offer partners"
              line1="The install crew you’d build if you could."
              balance
              lede="Built around what suppliers and GCs ask for and rarely get from install subs. No black-box scheduling. No phantom subcontractors. No dodged calls when something goes sideways."
              ledeMax="max-w-[640px]"
            />
          </ForgeReveal>
          <ForgeReveal stagger className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-4">
            {OFFER.map((o, i) => (
              <div key={o.title} className="rounded-[12px] border border-forge-silver bg-forge-fog px-[26px] pt-[26px] pb-7">
                <span className="font-forge-display text-[14px] font-bold text-forge-steel">{numeral(i)}</span>
                <h3 className="mt-3 font-forge-display text-[21px] font-bold text-forge-navy">{o.title}</h3>
                <p className="mt-2.5 text-[15px] leading-[1.65] text-forge-slate">{o.body}</p>
              </div>
            ))}
          </ForgeReveal>
        </div>
      </section>

      {/* 3 · Featured builds */}
      {featured.length ? (
        <section data-forge="" data-tone="light" className="bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy">
          <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
              <SectionHeading eyebrow="Featured builds" line1="The work, documented." />
              <Link href="/gallery" className="border-b border-forge-silver pb-0.5 text-[15px] font-semibold transition-colors hover:border-forge-navy">
                Full gallery →
              </Link>
            </div>
            <BuildGrid items={featured} className="mt-9 grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4" />
          </div>
        </section>
      ) : null}

      {/* 4 · Inquiry */}
      <section id="inquire" data-forge="" data-tone="light" className="scroll-mt-20 bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-start gap-[clamp(32px,4vw,80px)] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal>
            <SectionHeading
              eyebrow="Inquire"
              line1="Tell us about"
              line2="your business."
              lede="A few quick fields. Julian reads every one personally and reaches back within one business day."
              ledeMax="max-w-[520px]"
            />
            <div data-tone="dark" className="mt-7 rounded-[12px] bg-forge-navy px-6 py-[22px] text-white">
              <p className="font-forge-display text-[19px] font-bold">Rather skip the form?</p>
              <p className="mt-1.5 text-[14px] text-white/75">Call or email Julian directly — the same person who reads the responses.</p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <TrackedPhoneLink surface="partners_inquiry" className={buttonClass('white', 'tap', false, 'tabular-nums')} />
                <a href={SITE.emailHref} className={buttonClass('outlineDark', 'tap')}>
                  Email Julian
                </a>
              </div>
            </div>
          </ForgeReveal>
          <PartnerInquiryForm />
        </div>
      </section>
    </div>
  )
}
