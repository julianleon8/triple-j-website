import Link from "next/link";

import { Breadcrumb } from "@/components/forge/Breadcrumb";
import { Chip } from "@/components/forge/Chip";
import { ForgeButtonLink } from "@/components/forge/ForgeButton";
import { ForgeReveal } from "@/components/forge/ForgeReveal";
import { PageHero } from "@/components/forge/PageHero";
import { QuoteSection } from "@/components/forge/QuoteSection";
import { SectionHeading } from "@/components/forge/SectionHeading";
import { buttonClass } from "@/components/forge/styles";
import { PinIcon } from "@/components/ui/icons";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { TrackedPhoneLink, TrackedPhoneNumber } from "@/components/site/TrackedPhone";
import type { Locale } from "@/i18n/config";
import { CITIES_HUB } from "@/i18n/pages/locations";
import { localizeHref } from "@/i18n/routes";
import { LOCATIONS, LOCATION_SLUGS } from "@/lib/locations";
import { getLocation } from "@/lib/locations.es";

/**
 * /locations and /es/ciudades — single canonical service-areas hub.
 *
 * Replaces the prior unstyled list view AND absorbs the old /service-areas
 * page (now 301'd here in next.config.ts). Pulls every entry from
 * src/lib/locations.ts (Spanish copy from src/lib/locations.es.ts) so cities
 * and counties stay in sync with their individual city pages.
 *
 * Page order: hero → stats strip → cities grid → counties grid →
 * how-far-we-travel → QuoteSection. Forge: navy hero + fact strip, then
 * white / fog / white bands into the fog quote band.
 */
export function CitiesHubPage({ locale }: { locale: Locale }) {
  const t = CITIES_HUB[locale];
  const cities = LOCATION_SLUGS.flatMap((slug) => getLocation(slug, locale) ?? []);
  // Distinct counties, derived from the cities themselves so this can never
  // drift from LOCATIONS the way a hand-kept county list would. Sorted by the
  // English name so both languages list them in the same order.
  const countyLabels = new Map(LOCATION_SLUGS.map((slug) => [LOCATIONS[slug].county, getLocation(slug, locale)?.county ?? LOCATIONS[slug].county]));
  const countiesServed = [...countyLabels.keys()].sort().map((county) => countyLabels.get(county) as string);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t.jsonLd.name,
    description: t.jsonLd.description,
    itemListElement: cities.map((city, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: t.jsonLd.item(city.name),
      url: `https://www.triplejmetaltx.com${localizeHref(`/locations/${city.slug}`, locale)}`,
    })),
  };

  return (
    <div data-forge="">
      <BreadcrumbJsonLd items={[{ name: t.jsonLd.crumb, path: "/locations" }]} locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* ── Hero ── */}
      <PageHero
        variant="plain"
        breadcrumb={<Breadcrumb trail={[]} current={t.hero.crumb} jsonLd={false} locale={locale} />}
        contentMax="w-full max-w-[860px]"
        eyebrow={t.hero.eyebrow}
        h1a={t.hero.h1}
        lede={t.hero.lede}
        ledeMax="max-w-[660px]"
        actions={
          <>
            <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
              {t.hero.quote}
            </ForgeButtonLink>
            <TrackedPhoneLink surface="locations_index_hero" className={buttonClass("outlineDark", "lg")}>
              {t.hero.call}
            </TrackedPhoneLink>
          </>
        }
      />

      {/* ── Stats strip ── (the hero fact-strip look, 2×2 on phones) */}
      <div data-forge="" data-tone="dark" className="border-t border-forge-silver/20 bg-forge-navy text-white">
        <dl className="mx-auto grid w-full max-w-[1360px] grid-cols-2 px-[clamp(20px,3vw,40px)] md:grid-cols-4">
          {[
            { stat: String(cities.length), label: t.stats.cities },
            { stat: String(countiesServed.length), label: t.stats.counties },
            { stat: t.stats.sameWeek, label: t.stats.sameWeekLabel },
            { stat: t.stats.zero, label: t.stats.zeroLabel },
          ].map(({ stat, label }, i) => (
            <div
              key={label}
              className={`border-l border-forge-silver/[.18] px-[clamp(12px,1.4vw,18px)] pt-[18px] pb-5 ${
                i > 1 ? "max-md:border-t" : ""
              }`}
            >
              <dt className="text-[11px] font-semibold uppercase tracking-[.2em] text-forge-steel-light">{label}</dt>
              <dd className="m-0 mt-1.5 font-forge-display text-[19px] font-bold leading-[1.2] text-white">{stat}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ── Cities grid ── */}
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading line1={t.cities.heading} lede={t.cities.lede} ledeMax="max-w-[640px]" />
          </ForgeReveal>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {cities.map((loc) => {
              const isHomeBase = loc.slug === "temple";
              return (
                <Link
                  key={loc.slug}
                  href={localizeHref(`/locations/${loc.slug}`, locale)}
                  data-tone={isHomeBase ? "dark" : undefined}
                  className={`group flex flex-col rounded-[12px] border p-[clamp(16px,1.6vw,22px)] transition-colors duration-200 ${
                    isHomeBase
                      ? "border-forge-navy bg-forge-navy text-white hover:bg-forge-navy-raised"
                      : "border-forge-silver bg-forge-fog hover:border-forge-navy hover:bg-white"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <PinIcon
                      width={16}
                      height={16}
                      aria-hidden="true"
                      className={`mt-0.5 flex-none ${isHomeBase ? "text-forge-silver" : "text-forge-slate"}`}
                    />
                    {isHomeBase && (
                      <span className="rounded-full border border-forge-silver/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.14em] text-forge-silver">
                        {t.cities.homeBase}
                      </span>
                    )}
                  </div>
                  <div
                    className={`font-forge-display text-[clamp(16px,.4vw_+_13px,19px)] font-bold leading-[1.2] ${
                      isHomeBase ? "text-white" : "text-forge-navy"
                    }`}
                  >
                    {loc.name}, TX
                  </div>
                  <div className={`mt-1 text-[12px] ${isHomeBase ? "text-forge-steel-light" : "text-forge-slate"}`}>
                    {loc.county}
                  </div>
                  <div
                    className={`mt-2 line-clamp-2 text-[13px] leading-[1.45] ${
                      isHomeBase ? "text-white/80" : "text-forge-slate"
                    }`}
                  >
                    {loc.distanceFromTemple ?? loc.heroHeadline}
                  </div>
                  <div
                    className={`mt-auto pt-4 text-[13px] font-semibold ${
                      isHomeBase ? "text-forge-silver group-hover:text-white" : "text-forge-navy"
                    }`}
                  >
                    {t.cities.view}{" "}
                    <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Counties served ──
          Was a grid of eight linked county pages. Those pages were 28-36 lines
          of data each with no landmarks, callouts or city-filtered photos, and
          they cannibalised the city pages that sit inside them (/locations/
          lampasas vs /locations/lampasas-county). They 301 to their strongest
          member city as of 2026-09-06 — see next.config.ts. The coverage claim
          is still worth stating, so it is derived from the cities we do have
          rather than from eight thin pages. */}
      <section data-forge="" data-tone="light" className="bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading line1={t.counties.heading} lede={t.counties.lede} ledeMax="max-w-[640px]" />
          </ForgeReveal>
          <ul className="mt-8 flex list-none flex-wrap gap-2 p-0">
            {countiesServed.map((county) => (
              <li key={county}>
                <Chip>{county}</Chip>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── How far we travel ── */}
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading line1={t.travel.heading} size="compact" />
            <p className="mt-5 text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.65] text-forge-slate [text-wrap:pretty]">
              {t.travel.p1}
            </p>
            <p className="mt-4 text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.65] text-forge-slate [text-wrap:pretty]">
              {t.travel.p2Before}{" "}
              <TrackedPhoneNumber className="whitespace-nowrap font-semibold text-forge-navy tabular-nums" /> {t.travel.p2After}
            </p>
            <div className="mt-8">
              <TrackedPhoneLink
                surface="locations_index_inline"
                className={buttonClass("navy", "lg", false, "max-w-full flex-wrap justify-start")}
              >
                {t.travel.cta}
              </TrackedPhoneLink>
            </div>
          </ForgeReveal>
        </div>
      </section>

      {/* ── Quote form ── */}
      <QuoteSection locale={locale} />
    </div>
  );
}
