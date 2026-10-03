import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

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
import { nearbyCities } from "@/lib/city-links";
import { filterByCities, getBuilds } from "@/lib/forge-builds";
import { LOCATIONS, LOCATION_SLUGS, type LocationData } from "@/lib/locations";
import { SERVICES } from "@/lib/services";
import { MEGA_SERVICES, SITE } from "@/lib/site";
import { getSiteUrl } from "@/lib/site-url";

/* Default hero photo when a city doesn't yet have a landmark photo sourced. */
const FALLBACK_HERO = "/images/red-iron-frame-hero.jpg";

export async function generateStaticParams() {
  return LOCATION_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: PageProps<"/locations/[slug]">,
): Promise<Metadata> {
  const { slug } = await params;
  const loc = LOCATIONS[slug];
  if (!loc) return {};
  return {
    title: loc.metaTitle,
    description: loc.metaDescription,
    keywords: [
      `carport builders ${loc.name} tx`,
      `metal carports ${loc.name} texas`,
      `turnkey carports ${loc.name}`,
      `carports with concrete ${loc.name} tx`,
      `welded carport ${loc.name} tx`,
      ...(loc.military?.keywords ?? []),
    ],
    openGraph: {
      title: loc.metaTitle,
      description: loc.metaDescription,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: loc.metaTitle,
      description: loc.metaDescription,
    },
    alternates: { canonical: `/locations/${slug}` },
  };
}

// "Builds near" reads live gallery_items; refresh hourly.
export const revalidate = 3600;

/** Fact strip from the city's own data when no designed strip exists. */
function cityFacts(loc: LocationData): Fact[] {
  if (loc.facts?.length) return loc.facts;
  return [
    loc.distanceFromTemple ? { k: "From HQ", v: loc.distanceFromTemple } : null,
    { k: "County", v: loc.county },
    loc.habla ? { k: "Language", v: "English & Español", s: "Hablamos español con Juan y Freddy" } : null,
  ].filter((f): f is Fact => f !== null);
}

/** Callouts beside the "why" list: the designed one, else the city's
 *  military section and existing callouts, stacked. */
function cityCallouts(loc: LocationData) {
  if (loc.quoteCallout) return [{ ...loc.quoteCallout, href: null as string | null }];
  return [
    ...(loc.military
      ? [{
          eyebrow: "Military & first responder",
          headline: loc.military.headline,
          blurb: loc.military.copy,
          ctaLabel: "See the military page",
          href: "/military" as string | null,
        }]
      : []),
    ...(loc.callouts ?? []).map((c) => ({
      eyebrow: c.eyebrow,
      headline: c.headline,
      blurb: c.blurb,
      ctaLabel: c.ctaLabel,
      href: c.ctaHref as string | null,
    })),
  ];
}

export default async function LocationPage(
  { params }: PageProps<"/locations/[slug]">,
) {
  const { slug } = await params;
  const loc = LOCATIONS[slug];
  if (!loc) notFound();

  const baseUrl = getSiteUrl();
  const pageUrl = `${baseUrl}/locations/${slug}`;
  const offerCatalog = (loc.topServices ?? []).map((sv, i) => ({
    "@type": "Offer",
    position: i + 1,
    itemOffered: {
      "@type": "Service",
      name: SERVICES[sv]?.title ?? sv,
      url: `${baseUrl}/services/${sv}`,
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
        name: `Metal Building Installation in ${loc.name}, TX`,
        description: loc.metaDescription,
        serviceType: "Metal building installation",
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
            name: `${loc.county}, Texas`,
          },
        },
        ...(offerCatalog.length > 0 && {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: `${SITE.name} services in ${loc.name}, TX`,
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
        inLanguage: "en-US",
      },
    ],
  };

  // Only active projects recorded in the city (or its designed neighbours).
  const builds = filterByCities(await getBuilds({ order: "featured" }), loc.galleryCities ?? [loc.name]).slice(0, 8);

  const callouts = cityCallouts(loc);
  const nearby = nearbyCities(loc.slug);
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
        items={[
          { name: "Service Areas", path: "/locations" },
          { name: loc.name, path: `/locations/${slug}` },
        ]}
      />

      {/* 1 · Hero */}
      <PageHero
        breadcrumb={
          <Breadcrumb trail={[{ name: "Service areas", href: "/locations" }]} current={`${loc.name}, TX`} jsonLd={false} />
        }
        image={{
          src: loc.heroImage ?? FALLBACK_HERO,
          alt: loc.heroImageAlt ?? `${loc.name}, Texas`,
          position: loc.heroPosition,
        }}
        eyebrow={loc.heroEyebrow ?? `Service area · ${loc.county}`}
        h1a={loc.customHeadline?.line1 ?? loc.heroHeadline}
        h1b={loc.customHeadline?.line2}
        lede={loc.heroSubhead ?? loc.heroCopy}
        facts={cityFacts(loc)}
        actions={
          <>
            <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
              Get a {loc.name} Quote
            </ForgeButtonLink>
            <TrackedPhoneLink surface="location_hero" mode="children-only" className={buttonClass("outlineDark", "lg")}>
              Call <TrackedPhoneNumber className="tabular-nums" />
            </TrackedPhoneLink>
          </>
        }
      />

      {/* 2 · Coverage */}
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(32px,4vw,72px)] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal>
            {loc.introHeading ? (
              <SectionHeading eyebrow={loc.introEyebrow ?? "Where we build"} line1={loc.introHeading} balance />
            ) : (
              <SectionHeading eyebrow={loc.introEyebrow ?? "Where we build"} line1="Built local." line2="Built whole, by us." />
            )}
            <p className="mt-[18px] max-w-[600px] text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.65] text-forge-slate [text-wrap:pretty]">
              {intro}
            </p>
            {loc.localSource ? (
              <p className="mt-4 text-[14px] text-forge-slate">
                Source:{" "}
                <a href={loc.localSource.url} className="border-b border-forge-silver text-forge-navy hover:border-forge-navy">
                  {loc.localSource.label}
                </a>
              </p>
            ) : null}
          </ForgeReveal>
          <ForgeReveal className="rounded-[12px] border border-forge-silver bg-forge-fog p-[clamp(20px,2vw,32px)]">
            {loc.neighborhoods?.length ? (
              <>
                <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-slate">Neighborhoods we cover</p>
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
                Shop: {SITE.addressOneLine}
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
              <SectionHeading eyebrow="Know the ground" line1={loc.landHeading ?? `${loc.name}, the way we know it.`} />
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
              <SectionHeading tone="dark" eyebrow="Why a local crew" line1={loc.whyHeading} balance />
            ) : (
              <SectionHeading tone="dark" eyebrow="Why a local crew" line1="Local crew." line2={`${loc.name} timelines.`} />
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
                      <ForgeButtonLink href={callout.href} variant="white" size="md" arrow>
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
            <SectionHeading eyebrow={`What we build in ${loc.name}`} line1="Same crew." line2="Every build." inline />
          </ForgeReveal>
          <ForgeReveal stagger className="mt-9 grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4">
            {MEGA_SERVICES.map((s) => (
              <PhotoCard key={s.href} href={s.href} img={s.img} imgPosition={s.pos} title={s.label} sub={s.sub} cta={`Explore ${s.label}`} />
            ))}
          </ForgeReveal>
        </div>
      </section>

      {/* 6 · Builds near {name} (3+ only) */}
      {builds.length >= 3 ? (
        <section data-forge="" data-tone="light" className="bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy">
          <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
              <SectionHeading eyebrow={`Builds near ${loc.name}`} line1="Built down the road." className="max-w-[720px]" />
              <Link href="/gallery" className="border-b border-forge-silver pb-0.5 text-[15px] font-semibold transition-colors hover:border-forge-navy">
                See the full gallery →
              </Link>
            </div>
            <BuildGrid items={builds} />
          </div>
        </section>
      ) : null}

      {/* 7 · Guides (only when relatedPosts is populated) */}
      {loc.relatedPosts?.length ? <RelatedGuides postSlugs={loc.relatedPosts} /> : null}

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
              <SectionHeading headingId="nearby-heading" eyebrow="Nearby" line1={`Also serving near ${loc.name}.`} />
            </ForgeReveal>
            <ForgeReveal className="mt-7 flex flex-wrap items-center gap-2.5">
              {nearby.map((city) => (
                <Chip key={city.slug} href={`/locations/${city.slug}`}>
                  {city.name}, TX
                </Chip>
              ))}
              <Link
                href="/locations"
                className="ml-1 border-b border-forge-silver pb-0.5 text-[15px] font-semibold transition-colors hover:border-forge-navy"
              >
                All service areas →
              </Link>
            </ForgeReveal>
          </div>
        </section>
      ) : null}

      {/* 9 · Quote, with this city's ZIP filled in */}
      <QuoteSection initialZip={loc.zip} city={loc.name} />
    </div>
  );
}
