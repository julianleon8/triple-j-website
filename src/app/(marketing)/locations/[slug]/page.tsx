import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/Button";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { LOCATIONS, LOCATION_SLUGS } from "@/lib/locations";
import { SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";
import { getSiteUrl } from "@/lib/site-url";
import { getAdminClient } from "@/lib/supabase/admin";

/* ─── Per-service photo map (kept in sync with /services list page) ──────
   When swapping or adding service photos, update both this file and
   src/app/(marketing)/services/page.tsx. */
const SERVICE_PHOTOS: Record<string, string> = {
  carports: "/images/carport-gable-residential.jpg",
  "turnkey-carports-with-concrete": "/images/carport-truck-concrete-hero.jpg",
  "metal-garages": "/images/metal-garage-green.jpg",
  barns: "/images/double-carport-install.jpg",
  "rv-covers": "/images/porch-cover-lean-to.jpg",
  "hoa-compliant-structures": "/images/carport-gable-residential.jpg",
};

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
    alternates: { canonical: `/locations/${slug}` },
  };
}

type GalleryRow = {
  id: string;
  title: string;
  city: string | null;
  gallery_photos: { image_url: string; alt_text: string | null; is_cover: boolean }[];
};

export default async function LocationPage(
  { params }: PageProps<"/locations/[slug]">,
) {
  const { slug } = await params;
  const loc = LOCATIONS[slug];
  if (!loc) notFound();

  // Pull a small batch of recent gallery photos (generic, not city-filtered
  // per design decision 2026-04-23 — same set on every city page).
  const { data: galleryRows } = await getAdminClient()
    .from("gallery_items")
    .select("id, title, city, gallery_photos ( image_url, alt_text, is_cover )")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(6);

  const galleryPhotos = (galleryRows as GalleryRow[] | null ?? [])
    .map((row) => {
      const cover = row.gallery_photos.find((p) => p.is_cover) ?? row.gallery_photos[0];
      if (!cover) return null;
      return { id: row.id, title: row.title, city: row.city, src: cover.image_url, alt: cover.alt_text };
    })
    .filter(Boolean) as { id: string; title: string; city: string | null; src: string; alt: string | null }[];

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

  // Resolve fields with new-field-wins-over-legacy fallbacks
  const headlineLine1 = loc.customHeadline?.line1 ?? loc.heroHeadline;
  const headlineLine2 = loc.customHeadline?.line2 ?? null;
  const subhead = loc.heroSubhead ?? loc.heroCopy;
  const intro = loc.localIntro ?? loc.areaContext;
  const heroImg = loc.heroImage ?? FALLBACK_HERO;

  // Pick top services for the mini-grid (top 3 if topServices is set,
  // else fall back to first 3 from the SERVICES catalog).
  const topServiceSlugs = loc.topServices ?? ["carports", "metal-garages", "rv-covers"];
  const topServices = topServiceSlugs
    .map((s) => SERVICES[s])
    .filter(Boolean)
    .slice(0, 3);

  return (
    <>
      {/* JSON-LD */}
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

      {/* ─── Hero — city landmark photo + dark gradient ───────────────── */}
      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <Image
            src={heroImg}
            alt={loc.heroImageAlt ?? ""}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-55"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-tr from-black/95 via-black/80 to-[color:var(--color-brand-700)]/40"
        />

        <Container size="wide" className="relative">
          <div className="py-24 sm:py-32 lg:py-40 max-w-3xl">
            {/* Eyebrow row: red county pill + optional Spanish chip */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
                {loc.county}
              </span>
              {loc.habla ? (
                <span className="inline-flex items-center rounded-full bg-[color:var(--color-brand-600)]/25 border border-[color:var(--color-brand-400)]/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-brand-300)]">
                  Hablamos Español
                </span>
              ) : null}
            </div>

            {/* Headline (custom two-line if available, else legacy single-line) */}
            <h1 className="mt-6 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-white text-5xl sm:text-6xl md:text-7xl">
              {headlineLine1}
              {headlineLine2 ? (
                <>
                  <br />
                  <span className="text-[color:var(--color-brand-400)]">
                    {headlineLine2}
                  </span>
                </>
              ) : null}
            </h1>

            {/* Distance stat */}
            {loc.distanceFromTemple ? (
              <div className="mt-5 inline-flex items-center gap-2 text-sm text-white/65">
                <PinIcon className="h-4 w-4 text-[color:var(--color-brand-400)]" />
                <span className="font-semibold uppercase tracking-wider text-[11px]">
                  {loc.distanceFromTemple}
                </span>
              </div>
            ) : null}

            <p className="mt-6 text-lg sm:text-xl leading-relaxed text-white/75 max-w-2xl">
              {subhead}
            </p>

            <div className="mt-9 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <ButtonLink
                href="/#quote"
                variant="primary"
                size="lg"
                icon={<ArrowRightIcon className="h-5 w-5" />}
                iconPosition="right"
              >
                Get a Free Quote
              </ButtonLink>
              <a
                href={SITE.phoneHref}
                className="inline-flex items-center gap-2 text-base font-semibold text-white/85 hover:text-white transition-colors"
              >
                <PhoneIcon className="h-5 w-5" />
                Call {SITE.phone}
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── Local intro + landmarks ──────────────────────────────────── */}
      <section
        aria-labelledby="local-heading"
        className="relative py-20 md:py-24 bg-gradient-to-b from-white to-[color:var(--color-ink-50)] overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04] bg-grid-decoration"
        />
        <Container size="wide" className="relative">
          <Reveal className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
              {loc.name}, TX
            </span>
            <h2
              id="local-heading"
              className="mt-5 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[color:var(--color-ink-900)] text-4xl sm:text-5xl md:text-6xl"
            >
              Built local.
              <br />
              <span className="text-[color:var(--color-brand-600)]">
                Built whole, by us.
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[color:var(--color-ink-600)] max-w-2xl">
              {intro}
            </p>
          </Reveal>

          {/* Landmark grid (only when populated) */}
          {loc.landmarks && loc.landmarks.length > 0 ? (
            <div
              className={`mt-12 grid grid-cols-1 sm:grid-cols-2 gap-5 ${
                loc.landmarks.length >= 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
              }`}
            >
              {loc.landmarks.map((landmark, i) => (
                <Reveal key={landmark.name} delay={i * 80}>
                  <article className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-[color:var(--color-ink-100)] bg-white shadow-sm hover:shadow-xl transition-shadow">
                    {landmark.imageSrc ? (
                      <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--color-ink-100)]">
                        <Image
                          src={landmark.imageSrc}
                          alt={landmark.imageAlt ?? landmark.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                    ) : (
                      // Typography-only card when no photo is sourced yet.
                      // Reads as intentional magazine card via a brand-blue
                      // numbered accent + dot-grid texture.
                      <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--color-ink-900)] text-white p-6 flex items-end">
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 opacity-[0.08] bg-dot-grid"
                        />
                        <div className="relative">
                          <div className="text-7xl font-display font-extrabold leading-none text-[color:var(--color-brand-400)]/60 tabular-nums">
                            {String(i + 1).padStart(2, "0")}
                          </div>
                          <div className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-white/55">
                            Landmark
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex-1 p-6">
                      <h3 className="font-display font-extrabold uppercase tracking-tight text-2xl text-[color:var(--color-ink-900)] leading-none">
                        {landmark.name}
                      </h3>
                      <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--color-ink-600)]">
                        {landmark.blurb}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          ) : null}
        </Container>
      </section>

      {/* ─── Where We Build (neighborhoods chips) ─────────────────────── */}
      {loc.neighborhoods && loc.neighborhoods.length > 0 ? (
        <section
          aria-labelledby="neighborhoods-heading"
          className="relative py-16 md:py-20 bg-white border-t border-[color:var(--color-ink-100)]"
        >
          <Container size="wide">
            <Reveal className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)]">
                Where We Build
              </span>
              <h2
                id="neighborhoods-heading"
                className="mt-3 font-display font-extrabold uppercase tracking-tight leading-none text-[color:var(--color-ink-900)] text-3xl sm:text-4xl"
              >
                {loc.name} neighborhoods we serve
              </h2>
            </Reveal>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {loc.neighborhoods.map((n, i) => (
                <Reveal key={n} delay={i * 40}>
                  <span className="inline-flex items-center rounded-lg border border-[color:var(--color-ink-100)] bg-[color:var(--color-ink-50)] px-3.5 py-2 text-sm font-semibold text-[color:var(--color-ink-700)]">
                    {n}
                  </span>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* ─── Services (3-up photo cards for top services) ─────────────── */}
      <section
        aria-labelledby="services-heading"
        className="relative py-20 md:py-24 bg-[color:var(--color-ink-50)]"
      >
        <Container size="wide">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 max-w-5xl">
            <Reveal>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)]">
                What We Build in {loc.name}
              </span>
              <h2
                id="services-heading"
                className="mt-3 font-display font-extrabold uppercase tracking-tight leading-none text-[color:var(--color-ink-900)] text-3xl sm:text-4xl md:text-5xl"
              >
                Three things we&rsquo;re known for here.
              </h2>
            </Reveal>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[color:var(--color-brand-700)] hover:text-[color:var(--color-brand-800)] transition-colors"
            >
              See all services
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topServices.map((svc, i) => (
              <Reveal key={svc.slug} delay={i * 80}>
                <Link
                  href={`/services/${svc.slug}`}
                  className="group relative flex flex-col h-full overflow-hidden rounded-2xl bg-[color:var(--color-ink-900)] shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-out"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={SERVICE_PHOTOS[svc.slug] ?? FALLBACK_HERO}
                      alt={svc.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <h3 className="font-display font-extrabold uppercase tracking-tight leading-none text-white text-2xl md:text-3xl">
                        {svc.shortTitle}
                      </h3>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 p-5 bg-white flex-1">
                    <p className="text-[15px] leading-relaxed text-[color:var(--color-ink-600)]">
                      {svc.mainBenefit}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-[color:var(--color-brand-600)] group-hover:gap-2.5 transition-all">
                      See details
                      <ArrowRightIcon className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── Per-city callout sections (stacked, in array order) ─────── */}
      {loc.callouts && loc.callouts.length > 0 ? (
        <section
          aria-label={`${loc.name} secondary markets`}
          className="relative py-16 md:py-20 bg-white"
        >
          <Container size="wide">
            <div className="space-y-5">
              {loc.callouts.map((callout, idx) => (
                <Reveal key={callout.eyebrow} delay={idx * 100}>
                  <Link
                    href={callout.ctaHref}
                    className="group block relative overflow-hidden rounded-2xl border border-[color:var(--color-brand-400)]/30 bg-gradient-to-br from-[color:var(--color-brand-600)]/8 via-white to-white shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-out"
                  >
                    {/* Soft brand-blue radial wash in the upper-right */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[color:var(--color-brand-400)]/15 blur-3xl"
                    />
                    <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-10 p-8 md:p-10 lg:p-12 items-center">
                      <div className="md:col-span-3">
                        <span className="inline-flex items-center rounded-full bg-[color:var(--color-brand-600)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
                          {callout.eyebrow}
                        </span>
                        <h2 className="mt-5 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[color:var(--color-ink-900)] text-3xl sm:text-4xl md:text-5xl">
                          {callout.headline}
                        </h2>
                        <p className="mt-5 text-base sm:text-lg leading-relaxed text-[color:var(--color-ink-600)]">
                          {callout.blurb}
                        </p>
                      </div>
                      <div className="md:col-span-2 flex md:justify-end">
                        <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[color:var(--color-brand-700)] group-hover:gap-3 transition-all">
                          {callout.ctaLabel}
                          <ArrowRightIcon className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* ─── Why Triple J in {city} (dark editorial spread) ───────────── */}
      <section
        aria-labelledby="why-local-heading"
        className="relative py-20 md:py-24 bg-[color:var(--color-ink-900)] text-white overflow-hidden"
      >
        <div aria-hidden="true" className="absolute inset-0 quote-glow pointer-events-none" />
        <Container size="wide" className="relative">
          <Reveal className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
              Why Triple J
            </span>
            <h2
              id="why-local-heading"
              className="mt-6 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-white text-4xl sm:text-5xl md:text-6xl"
            >
              Local crew.
              <br />
              <span className="text-[color:var(--color-brand-400)]">
                {loc.name} timelines.
              </span>
            </h2>
          </Reveal>

          {loc.whyLocalBullets && loc.whyLocalBullets.length > 0 ? (
            <ul className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
              {loc.whyLocalBullets.map((bullet, i) => (
                <Reveal key={i} delay={i * 80}>
                  <li className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                    <span
                      aria-hidden="true"
                      className="shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-[color:var(--color-brand-600)]/25 text-[color:var(--color-brand-300)] text-sm font-bold"
                    >
                      ✓
                    </span>
                    <span className="text-base leading-relaxed text-white/85">
                      {bullet}
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          ) : (
            <Reveal className="mt-10 max-w-3xl">
              <p className="text-lg leading-relaxed text-white/80">
                {loc.whyLocal}
              </p>
            </Reveal>
          )}
        </Container>
      </section>

      {/* ─── Recent work gallery (generic, not city-filtered) ─────────── */}
      {galleryPhotos.length > 0 ? (
        <section
          aria-labelledby="gallery-heading"
          className="relative py-16 md:py-20 bg-white"
        >
          <Container size="wide">
            <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 max-w-5xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)]">
                  Recent Builds
                </span>
                <h2
                  id="gallery-heading"
                  className="mt-3 font-display font-extrabold uppercase tracking-tight leading-none text-[color:var(--color-ink-900)] text-3xl sm:text-4xl"
                >
                  Real Central Texas jobs.
                </h2>
              </div>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[color:var(--color-brand-700)] hover:text-[color:var(--color-brand-800)] transition-colors"
              >
                See full portfolio
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Reveal>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {galleryPhotos.map((p, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <Link
                    href={`/gallery/${p.id}`}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-[color:var(--color-ink-200)] block"
                  >
                    <Image
                      src={p.src}
                      alt={p.alt ?? p.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 16vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized={p.src.startsWith("/")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-2 left-2 right-2 text-white">
                      <div className="text-[10px] uppercase tracking-wider text-white/70 font-semibold truncate">
                        {p.city}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* ─── Military section (Killeen + Harker Heights only) ─────────── */}
      {loc.military ? (
        <section
          aria-labelledby="military-heading"
          className="relative py-20 md:py-24 bg-[color:var(--color-ink-950)] text-white overflow-hidden"
        >
          <div aria-hidden="true" className="absolute inset-0 quote-glow pointer-events-none" />
          <Container size="wide" className="relative">
            <Reveal className="max-w-3xl">
              <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
                <span aria-hidden="true" className="mr-1.5">★</span>
                Military &amp; First Responder
              </span>
              <h2
                id="military-heading"
                className="mt-6 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-white text-4xl sm:text-5xl md:text-6xl"
              >
                {loc.military.headline}
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-white/80 max-w-2xl">
                {loc.military.copy}
              </p>
            </Reveal>
          </Container>
        </section>
      ) : null}
    </>
  );
}
