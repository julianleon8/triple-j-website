import Image from "next/image";
import Link from "next/link";

import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { Breadcrumb } from "@/components/forge/Breadcrumb";
import { PhotoCard, RuleList } from "@/components/forge/cards";
import { ForgeReveal } from "@/components/forge/ForgeReveal";
import { PageHero } from "@/components/forge/PageHero";
import { PreFooterCta } from "@/components/site/PreFooterCta";
import type { Locale } from "@/i18n/config";
import { SERVICES_INDEX } from "@/i18n/pages/services-index";
import { localizeHref } from "@/i18n/routes";
import { SERVICE_PHOTOS, SERVICE_SLUGS } from "@/lib/services";
import { getService } from "@/lib/services.es";

/**
 * /services list page — Forge treatment. Rendered by `/services` and
 * `/es/servicios`.
 *
 * Layout: navy photo hero → featured flagship card (Carports) → auto-fill
 * grid of Forge photo cards for the other services + 1 Resources callout.
 * PreFooterCta + Footer in the marketing layout handle the closer (no
 * QuoteForm here).
 *
 * Photo notes (some are placeholders — flag for swap when better shots
 * land in /public/images/services/):
 *   barns, rv-covers, hoa-compliant-structures use the closest available
 *   photo. The card scrim and Cinzel title do enough semantic work to read
 *   as intentional, not missing.
 *
 * Hero photo per service lives in SERVICE_PHOTOS (src/lib/services.ts) —
 * sourced from real Triple J builds in /hq/gallery (Supabase Storage). Swap
 * by replacing the URL with the corresponding gallery_photos.image_url for
 * the new project.
 */

const FLAGSHIP_SLUG = "carports";

export function ServicesIndexPage({ locale }: { locale: Locale }) {
  const t = SERVICES_INDEX[locale];
  const flagship = getService(FLAGSHIP_SLUG, locale)!;
  const otherSlugs = SERVICE_SLUGS.filter((s) => s !== FLAGSHIP_SLUG);

  return (
    <div data-forge="">
      <BreadcrumbJsonLd items={[{ name: t.breadcrumb, path: "/services" }]} locale={locale} />

      {/* ── Hero — full-bleed photo under the navy scrim ───────────── */}
      <PageHero
        breadcrumb={<Breadcrumb trail={[]} current={t.breadcrumb} jsonLd={false} locale={locale} />}
        image={{
          src: "/images/red-iron-frame-hero.jpg",
          alt: t.hero.imgAlt,
          position: "50% 40%",
        }}
        eyebrow={t.hero.eyebrow}
        h1a={t.hero.h1a}
        h1b={t.hero.h1b}
        lede={t.hero.lede}
        ledeMax="max-w-[640px]"
      />

      {/* ── Featured flagship + grid ─────────────────────────────── */}
      <section
        data-forge=""
        data-tone="light"
        aria-labelledby="services-grid-heading"
        className="bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy"
      >
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <h2 id="services-grid-heading" className="sr-only">
            {t.lineup}
          </h2>

          {/* ── Flagship feature card — Carports ── */}
          <ForgeReveal>
            <Link
              href={localizeHref(`/services/${flagship.slug}`, locale)}
              className="group grid grid-cols-1 overflow-hidden rounded-[12px] border border-forge-navy bg-forge-navy text-white transition-colors duration-300 hover:border-forge-steel lg:grid-cols-5"
            >
              {/* Photo column (3/5 on lg) */}
              <div className="relative aspect-[16/10] overflow-hidden bg-forge-slate lg:col-span-3 lg:aspect-auto lg:min-h-[440px]">
                <Image
                  src={SERVICE_PHOTOS[flagship.slug]}
                  alt={flagship.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>

              {/* Content column (2/5 on lg) */}
              <div className="flex flex-col justify-center px-[clamp(22px,3vw,40px)] py-[clamp(26px,3vw,44px)] lg:col-span-2">
                <span className="text-[11px] font-semibold uppercase tracking-[.2em] text-forge-silver">
                  {t.flagship}
                </span>
                <h3 className="mt-3 font-forge-display text-[clamp(32px,2.4vw_+_14px,52px)] font-black leading-[1.05] tracking-[.01em] text-white">
                  {flagship.shortTitle}
                </h3>
                <p className="mt-4 text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.55] text-white/80 [text-wrap:pretty]">
                  {flagship.mainBenefit}
                </p>

                {/* 3 feature bullets */}
                <RuleList
                  className="mt-6"
                  itemClassName="text-[15px] leading-[1.45] text-white/85"
                  items={flagship.features.slice(0, 3).map((f) => f.title)}
                />

                <span className="mt-7 border-t border-forge-silver/[.18] pt-4 text-[14px] font-semibold text-forge-silver transition-colors group-hover:text-white">
                  {t.seeDetailsOf(flagship.shortTitle)} <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          </ForgeReveal>

          {/* ── Photo cards for the other services + Resources card ── */}
          <ForgeReveal
            stagger
            className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))] gap-4"
          >
            {otherSlugs.map((slug) => {
              const svc = getService(slug, locale)!;
              const photo = SERVICE_PHOTOS[slug];
              const href = localizeHref(`/services/${slug}`, locale);
              return photo ? (
                <PhotoCard
                  key={slug}
                  href={href}
                  img={photo}
                  title={svc.shortTitle}
                  sub={svc.mainBenefit}
                  cta={t.seeDetails}
                />
              ) : (
                <Link
                  key={slug}
                  href={href}
                  className="group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-[12px] border border-forge-silver bg-forge-navy-raised p-[22px] text-white"
                >
                  <span className="font-forge-display text-[24px] font-black leading-[1.1]">{svc.shortTitle}</span>
                  <span className="mt-1.5 text-[14px] text-white/82">{svc.mainBenefit}</span>
                  <span className="mt-3.5 text-[14px] font-semibold text-forge-silver group-hover:text-white">
                    {t.seeDetails} <span aria-hidden="true">→</span>
                  </span>
                </Link>
              );
            })}

            {/* ── Resources card — replaces the SEO helper links strip ── */}
            <div
              data-tone="dark"
              className="flex min-h-[280px] flex-col rounded-[12px] border border-forge-navy bg-forge-navy p-[22px] text-white"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[.2em] text-forge-silver">
                {t.resources.eyebrow}
              </span>
              <h3 className="mt-2.5 font-forge-display text-[24px] font-black leading-[1.1] text-white">
                {t.resources.heading}
              </h3>
              <p className="mt-2 mb-5 text-[14px] leading-[1.55] text-white/72">
                {t.resources.body}
              </p>

              <ul className="m-0 mt-auto flex list-none flex-col border-t border-forge-silver/[.18] p-0 pt-2">
                {t.resources.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={localizeHref(link.href, locale)}
                      className="flex items-center justify-between gap-3 border-b border-forge-silver/[.12] py-2.5 text-[15px] font-semibold text-white transition-colors hover:text-forge-silver"
                    >
                      {link.label}
                      <span aria-hidden="true" className="text-forge-silver">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </ForgeReveal>
        </div>
      </section>
      <PreFooterCta locale={locale} />
    </div>
  );
}
