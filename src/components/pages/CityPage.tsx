import Image from "next/image";
import Link from "next/link";

import { Breadcrumb } from "@/components/forge/Breadcrumb";
import { BuildGrid } from "@/components/forge/BuildGrid";
import { Chip } from "@/components/forge/Chip";
import { NumberedRow, PhotoCard } from "@/components/forge/cards";
import { ForgeButtonLink } from "@/components/forge/ForgeButton";
import type { Fact } from "@/components/forge/FactStrip";
import { ForgeReveal } from "@/components/forge/ForgeReveal";
import { PageHero } from "@/components/forge/PageHero";
import { RelatedGuides } from "@/components/forge/RelatedGuides";
import { QuoteRequestButton } from "@/components/forge/QuoteRequestButton";
import { QuoteSection } from "@/components/forge/QuoteSection";
import { SectionHeading } from "@/components/forge/SectionHeading";
import { buttonClass } from "@/components/forge/styles";
import { PinIcon } from "@/components/ui/icons";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { TrackedPhoneLink, TrackedPhoneNumber } from "@/components/site/TrackedPhone";
import { LANG_TAG, type Locale } from "@/i18n/config";
import { CITY_PAGE } from "@/i18n/pages/locations";
import { localizeHref } from "@/i18n/routes";
import { nearbyCities } from "@/lib/city-links";
import type { BuildItem } from "@/lib/forge-builds";
import type { LocationData } from "@/lib/locations";
import { getLocation } from "@/lib/locations.es";
import { getService } from "@/lib/services.es";
import { MEGA_SERVICES, SITE } from "@/lib/site";
import { getSiteUrl } from "@/lib/site-url";

/* Default hero photo when a city doesn't yet have a landmark photo sourced. */
const FALLBACK_HERO = "/images/red-iron-frame-hero.jpg";

/**
 * One city page. Rendered by `/locations/[slug]` and `/es/ciudades/[slug]`;
 * the route files pick the city (already in the page's language through
 * `getLocation(slug, locale)`) and read the live builds, because
 * gallery-revalidate.test.ts wants that read in a page.tsx.
 */
export function CityPage({
  locale,
  loc,
  builds,
}: {
  locale: Locale;
  loc: LocationData;
  /** Live gallery items recorded in this city (or its designed neighbours), capped. */
  builds: readonly BuildItem[];
}) {
  const t = CITY_PAGE[locale];
  const slug = loc.slug;

  /** Fact strip from the city's own data when no designed strip exists. */
  const cityFacts = (): Fact[] => {
    if (loc.facts?.length) return loc.facts;
    return [
      loc.distanceFromTemple ? { k: t.facts.fromHq, v: loc.distanceFromTemple } : null,
      { k: t.facts.county, v: loc.county },
      loc.habla ? { k: t.facts.language, v: t.facts.languageValue, s: t.facts.languageSub } : null,
    ].filter((f): f is Fact => f !== null);
  };

  /** Callouts beside the "why" list: the designed one, else the city's
   *  military section and existing callouts, stacked. */
  const cityCallouts = () => {
    if (loc.quoteCallout) return [{ ...loc.quoteCallout, href: null as string | null }];
    return [
      ...(loc.military
        ? [
            {
              eyebrow: t.military.eyebrow,
              headline: loc.military.headline,
              blurb: loc.military.copy,
              ctaLabel: t.military.cta,
              href: "/military" as string | null,
            },
          ]
        : []),
      ...(loc.callouts ?? []).map((c) => ({
        eyebrow: c.eyebrow,
        headline: c.headline,
        blurb: c.blurb,
        ctaLabel: c.ctaLabel,
        href: c.ctaHref as string | null,
      })),
    ];
  };

  const baseUrl = getSiteUrl();
  const pageUrl = `${baseUrl}${localizeHref(`/locations/${slug}`, locale)}`;
  const offerCatalog = (loc.topServices ?? []).map((sv, i) => ({
    "@type": "Offer",
    position: i + 1,
    itemOffered: {
      "@type": "Service",
      name: getService(sv, locale)?.title ?? sv,
      url: `${baseUrl}${localizeHref(`/services/${sv}`, locale)}`,
    },
  }));

  // Per-location @graph: a Service node scoped to this city, plus the
  // canonical WebPage. Both reference the sitewide LocalBusiness via @id
  // (emitted from the marketing layout's <OrganizationJsonLd />) so we
  // don't duplicate the business entity. See docs/SCHEMA-AUDIT.md.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: t.jsonLd.name(loc.name),
        description: loc.metaDescription,
        serviceType: t.jsonLd.serviceType,
        provider: { "@id": `${baseUrl}/#localbusiness` },
        areaServed: {
          "@type": "City",
          name: loc.name,
          address: {
            "@type": "PostalAddress",
            addressLocality: loc.name,
            addressRegion: "TX",
            postalCode: loc.zip,
            addressCountry: "US",
          },
          geo: { "@type": "GeoCoordinates", latitude: loc.lat, longitude: loc.lng },
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: t.jsonLd.containedIn(loc.county),
          },
        },
        ...(offerCatalog.length > 0 && {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: t.jsonLd.catalog(SITE.name, loc.name),
            itemListElement: offerCatalog,
          },
        }),
      },
      {
        "@type": "WebPage",
        "@id": pageUrl,
        url: pageUrl,
        name: loc.metaTitle,
        description: loc.metaDescription,
        isPartOf: { "@id": `${baseUrl}/#website` },
        about: { "@id": `${baseUrl}/#localbusiness` },
        mainEntity: { "@id": `${pageUrl}#service` },
        inLanguage: LANG_TAG[locale],
      },
    ],
  };

  const callouts = cityCallouts();
  const nearby = nearbyCities(loc.slug).map((c) => getLocation(c.slug, locale) ?? c);
  const intro = loc.localIntro ?? loc.areaContext;
  const whyRows = loc.why?.length
    ? loc.why.map((w) => ({ t: w.t, b: w.b }))
    : (loc.whyLocalBullets ?? []).map((b) => ({ t: undefined, b }));

  return (
    <div data-forge="">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: t.hubJsonLd, path: "/locations" },
          { name: loc.name, path: `/locations/${slug}` },
        ]}
      />

      {/* 1 · Hero */}
      <PageHero
        breadcrumb={
          <Breadcrumb
            trail={[{ name: t.hubCrumb, href: "/locations" }]}
            current={`${loc.name}, TX`}
            jsonLd={false}
            locale={locale}
          />
        }
        image={{
          src: loc.heroImage ?? FALLBACK_HERO,
          alt: loc.heroImageAlt ?? t.heroAlt(loc.name),
          position: loc.heroPosition,
        }}
        eyebrow={loc.heroEyebrow ?? t.eyebrow(loc.county)}
        h1a={loc.customHeadline?.line1 ?? loc.heroHeadline}
        h1b={loc.customHeadline?.line2}
        lede={loc.heroSubhead ?? loc.heroCopy}
        facts={cityFacts()}
        actions={
          <>
            <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
              {t.quote(loc.name)}
            </ForgeButtonLink>
            <TrackedPhoneLink surface="location_hero" mode="children-only" className={buttonClass("outlineDark", "lg")}>
              {t.call} <TrackedPhoneNumber className="tabular-nums" />
            </TrackedPhoneLink>
          </>
        }
      />

      {/* 2 · Coverage */}
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(32px,4vw,72px)] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal>
            {loc.introHeading ? (
              <SectionHeading eyebrow={loc.introEyebrow ?? t.intro.eyebrow} line1={loc.introHeading} balance />
            ) : (
              <SectionHeading eyebrow={loc.introEyebrow ?? t.intro.eyebrow} line1={t.intro.line1} line2={t.intro.line2} />
            )}
            <p className="mt-[18px] max-w-[600px] text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.65] text-forge-slate [text-wrap:pretty]">
              {intro}
            </p>
            {loc.localSource ? (
              <p className="mt-4 text-[14px] text-forge-slate">
                {t.source}{" "}
                <a href={loc.localSource.url} className="border-b border-forge-silver text-forge-navy hover:border-forge-navy">
                  {loc.localSource.label}
                </a>
              </p>
            ) : null}
          </ForgeReveal>
          <ForgeReveal className="rounded-[12px] border border-forge-silver bg-forge-fog p-[clamp(20px,2vw,32px)]">
            {loc.neighborhoods?.length ? (
              <>
                <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-slate">{t.neighborhoods}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {loc.neighborhoods.map((n) => (
                    <Chip key={n}>{n}</Chip>
                  ))}
                </div>
              </>
            ) : null}
            {loc.areaNote ? (
              <p className="mt-[18px] text-[14px] leading-[1.6] text-forge-slate [text-wrap:pretty]">{loc.areaNote}</p>
            ) : null}
            <div
              className={`flex items-start gap-2.5 text-[14px] text-forge-navy ${
                loc.neighborhoods?.length || loc.areaNote ? "mt-5 border-t border-forge-silver pt-[18px]" : ""
              }`}
            >
              <PinIcon width={16} height={16} aria-hidden="true" className="mt-[3px] flex-none text-forge-slate" />
              <span>
                {t.shop} {SITE.addressOneLine}
                {loc.distanceFromTemple ? (
                  <>
                    {" "}· <b className="font-semibold">{loc.distanceFromTemple}</b>
                  </>
                ) : null}
              </span>
            </div>
          </ForgeReveal>
        </div>
      </section>

      {/* 3 · Know the ground */}
      {loc.landmarks?.length ? (
        <section data-forge="" data-tone="light" className="bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy">
          <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
            <ForgeReveal className="max-w-[760px]">
              <SectionHeading eyebrow={t.land.eyebrow} line1={loc.landHeading ?? t.land.heading(loc.name)} />
            </ForgeReveal>
            <ForgeReveal stagger className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-5">
              {loc.landmarks.map((m) => (
                <div key={m.name} className="flex flex-col overflow-hidden rounded-[12px] border border-forge-silver bg-white">
                  {m.imageSrc ? (
                    <div className="relative aspect-[16/10] overflow-hidden bg-forge-slate">
                      <Image src={m.imageSrc} alt={m.imageAlt ?? m.name} fill sizes="(min-width: 1200px) 440px, 100vw" className="object-cover" />
                    </div>
                  ) : null}
                  <div className="px-[22px] pt-5 pb-6">
                    <h3 className="font-forge-display text-[20px] font-bold leading-[1.2] text-forge-navy">{m.name}</h3>
                    <p className="mt-2.5 text-[15px] leading-[1.6] text-forge-slate [text-wrap:pretty]">{m.blurb}</p>
                  </div>
                </div>
              ))}
            </ForgeReveal>
          </div>
        </section>
      ) : null}

      {/* 4 · Why a local crew (navy) */}
      <section data-forge="" data-tone="dark" className="bg-forge-navy py-[clamp(64px,7vw,104px)] text-white">
        <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(32px,4vw,72px)] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal>
            {loc.whyHeading ? (
              <SectionHeading tone="dark" eyebrow={t.why.eyebrow} line1={loc.whyHeading} balance />
            ) : (
              <SectionHeading tone="dark" eyebrow={t.why.eyebrow} line1={t.why.line1} line2={t.why.line2(loc.name)} />
            )}
            {whyRows.length ? (
              <div className="mt-8 flex flex-col border-t border-forge-silver/[.18]">
                {whyRows.map((w, i) => (
                  <NumberedRow key={w.b} index={i} title={w.t} pad="sm">
                    {w.b}
                  </NumberedRow>
                ))}
              </div>
            ) : (
              <p className="mt-6 max-w-[600px] text-[17px] leading-[1.65] text-white/80">{loc.whyLocal}</p>
            )}
          </ForgeReveal>
          {callouts.length ? (
            <div className="flex flex-col gap-4">
              {callouts.map((callout) => (
                <ForgeReveal
                  key={callout.headline}
                  className="rounded-[12px] border border-forge-silver/30 bg-forge-navy-raised p-[clamp(24px,2.4vw,40px)]"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-silver">{callout.eyebrow}</p>
                  <h3 className="mt-2.5 font-forge-display text-[clamp(24px,1vw_+_16px,32px)] font-black leading-[1.15] text-white">
                    {callout.headline}
                  </h3>
                  <p className="mt-3.5 text-[15px] leading-[1.65] text-white/80 [text-wrap:pretty]">{callout.blurb}</p>
                  <div className="mt-6">
                    {callout.href ? (
                      <ForgeButtonLink href={localizeHref(callout.href, locale)} variant="white" size="md" arrow>
                        {callout.ctaLabel}
                      </ForgeButtonLink>
                    ) : (
                      <QuoteRequestButton request={{}} variant="white" size="md" arrow>
                        {callout.ctaLabel}
                      </QuoteRequestButton>
                    )}
                  </div>
                </ForgeReveal>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* 5 · What we build in {name} */}
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="max-w-[720px]">
            <SectionHeading eyebrow={t.build.eyebrow(loc.name)} line1={t.build.line1} line2={t.build.line2} inline />
          </ForgeReveal>
          <ForgeReveal stagger className="mt-9 grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4">
            {MEGA_SERVICES.map((s) => {
              const label = locale === "es" ? s.es.label : s.label;
              return (
                <PhotoCard
                  key={s.href}
                  href={localizeHref(s.href, locale)}
                  img={s.img}
                  imgPosition={s.pos}
                  title={label}
                  sub={locale === "es" ? s.es.sub : s.sub}
                  cta={t.build.explore(label)}
                />
              );
            })}
          </ForgeReveal>
        </div>
      </section>

      {/* 6 · Builds near {name} (3+ only) */}
      {builds.length >= 3 ? (
        <section data-forge="" data-tone="light" className="bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy">
          <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
              <SectionHeading eyebrow={t.near.eyebrow(loc.name)} line1={t.near.line1} className="max-w-[720px]" />
              <Link
                href={localizeHref("/gallery", locale)}
                className="border-b border-forge-silver pb-0.5 text-[15px] font-semibold transition-colors hover:border-forge-navy"
              >
                {t.near.gallery}
              </Link>
            </div>
            <BuildGrid items={builds} />
          </div>
        </section>
      ) : null}

      {/* 7 · Guides (only when relatedPosts is populated) */}
      {loc.relatedPosts?.length ? <RelatedGuides postSlugs={loc.relatedPosts} locale={locale} /> : null}

      {/* 8 · Nearby cities (nearest by lat/lng, src/lib/city-links.ts) */}
      {nearby.length > 0 ? (
        <section
          data-forge=""
          data-tone="light"
          aria-labelledby="nearby-heading"
          className="border-t border-forge-mist bg-forge-fog py-[clamp(48px,5vw,80px)] text-forge-navy"
        >
          <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
            <ForgeReveal className="max-w-[720px]">
              <SectionHeading headingId="nearby-heading" eyebrow={t.nearby.eyebrow} line1={t.nearby.heading(loc.name)} />
            </ForgeReveal>
            <ForgeReveal className="mt-7 flex flex-wrap items-center gap-2.5">
              {nearby.map((city) => (
                <Chip key={city.slug} href={localizeHref(`/locations/${city.slug}`, locale)}>
                  {city.name}, TX
                </Chip>
              ))}
              <Link
                href={localizeHref("/locations", locale)}
                className="ml-1 border-b border-forge-silver pb-0.5 text-[15px] font-semibold transition-colors hover:border-forge-navy"
              >
                {t.nearby.all}
              </Link>
            </ForgeReveal>
          </div>
        </section>
      ) : null}

      {/* 9 · Quote, with this city's ZIP filled in */}
      <QuoteSection initialZip={loc.zip} city={loc.name} locale={locale} />
    </div>
  );
}
