import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";

/**
 * Services grid — 4 primary offerings.
 * Visual language matches the hero (red eyebrow pill, Barlow huge headline,
 * brand-blue accents). Card treatment: photo-dominant with dark gradient
 * overlay + title overlaid on photo, body blurb in white panel below.
 *
 * Card images sourced from real Triple J jobs in the Supabase gallery so
 * each card matches the offering it represents (no carport-as-barn stand-ins).
 */

const SERVICE_CARDS = [
  {
    slug: "carports",
    title: "Carports",
    blurb:
      "Welded or bolted red iron carports — single, double, triple, or custom. Built and installed by our crew.",
    image: "/images/carport-gable-residential.jpg",
  },
  {
    slug: "metal-garages",
    title: "Metal Garages",
    blurb:
      "Fully-enclosed steel garages with roll-up doors, walk-through access, and insulation options.",
    image: "/images/metal-garage-green.jpg",
  },
  {
    slug: "barns",
    title: "Metal Barns",
    blurb:
      "Agricultural and ranch barns engineered for Texas wind loads and hailstorm resistance.",
    // Custom Ranch Build (in progress) — Temple TX hybrid red-iron build,
    // closest thing in the gallery to a true ranch barn.
    image:
      "https://idrbgxlvvnqduvbqtaei.supabase.co/storage/v1/object/public/gallery/items/e83d6a82-6138-40e1-a60b-c4fe4b7d8a30/1777195267509.jpg",
  },
  {
    slug: "rv-covers",
    title: "RV & Boat Covers",
    blurb:
      "Extra-tall clearance structures for RVs, boats, trailers, and oversize equipment storage.",
    // RV Cover 20×35 (Double-Wide) — Copperas Cove TX bolted build.
    image:
      "https://idrbgxlvvnqduvbqtaei.supabase.co/storage/v1/object/public/gallery/1777251893180.jpg",
  },
] as const;

export function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="relative py-20 md:py-24 bg-gradient-to-b from-white to-[color:var(--color-ink-50)] overflow-hidden"
    >
      {/* Subtle decorative grid lines — magazine-style structure
          without competing with the cards. .bg-grid-decoration in globals.css. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04] bg-grid-decoration"
      />

      <Container size="wide" className="relative">
        {/* Section header — mirrors the hero's red pill + Barlow huge */}
        <Reveal className="max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
            What We Build
          </span>
          <h2
            id="services-heading"
            className="mt-5 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[color:var(--color-ink-900)] text-4xl sm:text-5xl md:text-6xl"
          >
            Welded or bolted.
            <br />
            <span className="text-[color:var(--color-brand-600)]">Built whole, by us.</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[color:var(--color-ink-600)] max-w-2xl">
            Every structure is welded or bolted from red-iron steel and delivered
            turnkey — site prep, concrete pad, and installation all under one
            contract. No kits, no subcontractors.
          </p>
        </Reveal>

        {/* Grid — 2x2 at lg for breathing room, 1-up on mobile.
            Each card is its own Reveal with a stagger so they cascade
            in (~80ms apart) as the grid enters the viewport. */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {SERVICE_CARDS.map((service, i) => (
            <Reveal key={service.slug} delay={i * 80}>
            <Link
              href={`/services/${service.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-[color:var(--color-ink-900)] shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-out"
            >
              {/* Photo with dark gradient overlay + title overlaid */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                {/* Layered gradient: dark bottom for title legibility +
                    brand-blue tint top-right on hover for accent */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
                <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-transparent to-[color:var(--color-brand-600)]/0 group-hover:to-[color:var(--color-brand-600)]/30 transition-colors duration-500" />

                {/* Title overlaid on bottom of photo */}
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  <h3 className="font-display font-extrabold uppercase tracking-tight leading-none text-white text-2xl md:text-3xl">
                    {service.title}
                  </h3>
                </div>

                {/* Hover-only Learn-more pill — slides up from bottom */}
                <div className="absolute top-4 right-4 translate-y-[-4px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-brand-600)] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                    View
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>

              {/* Body panel below photo */}
              <div className="flex flex-col gap-3 p-5 md:p-6 bg-white">
                <p className="text-[15px] leading-relaxed text-[color:var(--color-ink-600)]">
                  {service.blurb}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[color:var(--color-brand-600)] group-hover:gap-2.5 transition-all">
                  Learn more
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </div>
            </Link>
            </Reveal>
          ))}
        </div>

        {/* Footer link to all services — magazine "see more" */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-ink-700)] hover:text-[color:var(--color-brand-600)] transition-colors"
          >
            See every service we offer
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
