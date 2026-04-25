import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SERVICES, SERVICE_SLUGS } from "@/lib/services";

export const metadata: Metadata = {
  title: "Metal Building Services — Carports, Garages, Barns & More",
  description:
    "Triple J Metal builds custom metal carports, garages, barns, RV covers, and HOA-compliant structures across Central Texas. Welded or bolted, concrete included. Call 254-346-7764.",
  alternates: { canonical: "/services" },
};

/**
 * /services list page — magazine treatment.
 *
 * Layout: full-bleed photo hero → featured flagship card (Carports) →
 * 3-up grid of the other 5 services + 1 Resources callout. PreFooterCta
 * + Footer in the marketing layout handle the closer (no QuoteForm here).
 *
 * Photo notes (some are placeholders — flag for swap when better shots
 * land in /public/images/services/):
 *   barns, rv-covers, hoa-compliant-structures use the closest available
 *   photo with heavier gradient. The 'V'-overlaid title text does enough
 *   semantic work to read as intentional, not missing.
 */

const FLAGSHIP_SLUG = "carports";

const SERVICE_PHOTOS: Record<string, string> = {
  carports: "/images/carport-gable-residential.jpg",
  "turnkey-carports-with-concrete": "/images/carport-truck-concrete-hero.jpg",
  "metal-garages": "/images/metal-garage-green.jpg",
  barns: "/images/double-carport-install.jpg",
  "rv-covers": "/images/porch-cover-lean-to.jpg",
  "hoa-compliant-structures": "/images/carport-gable-residential.jpg",
};

export default function ServicesPage() {
  const flagship = SERVICES[FLAGSHIP_SLUG];
  const otherSlugs = SERVICE_SLUGS.filter((s) => s !== FLAGSHIP_SLUG);

  return (
    <>
      {/* ── Hero — full-bleed photo + dark gradient ────────────────── */}
      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/red-iron-frame-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-50"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-tr from-black/95 via-black/80 to-[color:var(--color-brand-700)]/40"
        />

        <Container size="wide" className="relative">
          <div className="py-24 sm:py-32 lg:py-40 max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
              What We Build
            </span>
            <h1 className="mt-6 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-white text-5xl sm:text-6xl md:text-7xl">
              Six things we build.
              <br />
              <span className="text-[color:var(--color-brand-400)]">
                Built whole, by us.
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl leading-relaxed text-white/75 max-w-2xl">
              Welded or bolted red-iron steel — delivered turnkey with site
              prep, concrete, and install all under one contract. Same-week
              scheduling across Bell, Coryell, and McLennan counties.
            </p>
          </div>
        </Container>
      </section>

      {/* ── Featured flagship + grid ─────────────────────────────── */}
      <section
        aria-labelledby="services-grid-heading"
        className="relative py-20 md:py-24 bg-gradient-to-b from-white to-[color:var(--color-ink-50)] overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04] bg-grid-decoration"
        />

        <Container size="wide" className="relative">
          <h2 id="services-grid-heading" className="sr-only">
            Service lineup
          </h2>

          {/* ── Flagship feature card — Carports ── */}
          <Reveal>
            <Link
              href={`/services/${flagship.slug}`}
              className="group relative grid grid-cols-1 lg:grid-cols-5 overflow-hidden rounded-2xl bg-[color:var(--color-ink-900)] text-white shadow-md hover:shadow-2xl transition-all duration-300 ease-out"
            >
              {/* Photo column (3/5 on lg) */}
              <div className="relative aspect-[16/10] lg:aspect-auto lg:col-span-3 overflow-hidden">
                <Image
                  src={SERVICE_PHOTOS[flagship.slug]}
                  alt={flagship.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent lg:from-transparent lg:via-transparent lg:to-[color:var(--color-ink-900)]/85" />
              </div>

              {/* Content column (2/5 on lg) */}
              <div className="relative lg:col-span-2 flex flex-col justify-center p-7 md:p-9 lg:p-10">
                <span className="inline-flex w-fit items-center rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
                  Flagship
                </span>
                <h3 className="mt-5 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-white text-4xl sm:text-5xl md:text-6xl">
                  {flagship.shortTitle}
                </h3>
                <p className="mt-4 text-base sm:text-lg leading-relaxed text-white/75">
                  {flagship.mainBenefit}
                </p>

                {/* 3 feature bullets */}
                <ul className="mt-6 space-y-2.5">
                  {flagship.features.slice(0, 3).map((f) => (
                    <li
                      key={f.title}
                      className="flex items-start gap-2.5 text-sm text-white/80"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-[color:var(--color-brand-600)]/25 text-[color:var(--color-brand-300)] text-xs font-bold"
                      >
                        ✓
                      </span>
                      <span>{f.title}</span>
                    </li>
                  ))}
                </ul>

                <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-[color:var(--color-brand-400)] group-hover:gap-2.5 transition-all">
                  See {flagship.shortTitle} details
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </Reveal>

          {/* ── 3-up grid of the other 5 services + Resources card ── */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {otherSlugs.map((slug, i) => {
              const svc = SERVICES[slug];
              return (
                <Reveal key={slug} delay={i * 80}>
                  <Link
                    href={`/services/${slug}`}
                    className="group relative flex flex-col h-full overflow-hidden rounded-2xl bg-[color:var(--color-ink-900)] shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-out"
                  >
                    {/* Photo with title overlay */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={SERVICE_PHOTOS[slug]}
                        alt={svc.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
                      <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-transparent to-[color:var(--color-brand-600)]/0 group-hover:to-[color:var(--color-brand-600)]/30 transition-colors duration-500" />

                      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                        <h3 className="font-display font-extrabold uppercase tracking-tight leading-none text-white text-2xl md:text-3xl">
                          {svc.shortTitle}
                        </h3>
                      </div>

                      <div className="absolute top-4 right-4 translate-y-[-4px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-brand-600)] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                          View
                          <ArrowRightIcon className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>

                    {/* Body panel */}
                    <div className="flex flex-col gap-3 p-5 md:p-6 bg-white flex-1">
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
              );
            })}

            {/* ── Resources card — replaces the SEO helper links strip ── */}
            <Reveal delay={otherSlugs.length * 80}>
              <div className="relative flex flex-col h-full overflow-hidden rounded-2xl bg-[color:var(--color-ink-900)] text-white p-7 md:p-8 shadow-md border border-white/5">
                {/* Subtle brand-blue radial */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[color:var(--color-brand-600)]/20 blur-3xl"
                />
                <div className="relative">
                  <span className="inline-flex w-fit items-center rounded-full bg-[color:var(--color-brand-600)]/20 border border-[color:var(--color-brand-400)]/30 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-brand-300)]">
                    Resources
                  </span>
                  <h3 className="mt-4 font-display font-extrabold uppercase tracking-tight leading-none text-white text-2xl md:text-3xl">
                    Specs &amp; guides
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">
                    Pick a finish, compare panel systems, or see where we build.
                  </p>

                  <ul className="mt-6 space-y-3">
                    {[
                      { href: "/services/colors", label: "39 Color Options" },
                      { href: "/services/pbr-vs-pbu-panels", label: "PBR vs PBU Panel Guide" },
                      { href: "/locations", label: "Service Locations" },
                    ].map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="group inline-flex items-center gap-2 text-base font-semibold text-white hover:text-[color:var(--color-brand-300)] transition-colors"
                        >
                          {link.label}
                          <ArrowRightIcon className="h-4 w-4 text-[color:var(--color-brand-400)] group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
