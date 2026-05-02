import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";

/**
 * Services grid — Editorial Split treatment (Claude Design handoff
 * T3xTdERm9wlM8SFyWYpaJw, option C). Photo on top, magazine eyebrow +
 * Barlow display headline + Inter body below, hairline rule capping a
 * "From $X · same-week start" + "See builds →" meta row.
 *
 * `priceFrom` floors come from the locked 2026 anchor sheet. Carport,
 * Barn, and RV/Boat floors are direct entries from the sheet; the Garage
 * floor is extrapolated as 20×20 + 4 walls + 1 roll-up door.
 */

const SERVICE_CARDS = [
  {
    slug: "carports",
    eyebrow: "Carports",
    headline: "Welded or bolted, residential or ranch.",
    blurb:
      "Single, double, triple, custom spans. Built and installed by our crew — usually within the week.",
    image: "/images/carport-gable-residential.jpg",
    priceFrom: "3,000",
  },
  {
    slug: "metal-garages",
    eyebrow: "Garages",
    headline: "Enclosed shop space, ready to lock up.",
    blurb:
      "Fully-enclosed steel garages with roll-up doors, walk-throughs, and insulation options.",
    image: "/images/metal-garage-green.jpg",
    priceFrom: "9,400",
  },
  {
    slug: "barns",
    eyebrow: "Barns",
    headline: "Pole, equipment, hay — built to span.",
    blurb:
      "Long clear-spans for ag and ranch use. Welded red-iron primary, sheet on the skin.",
    // Custom Ranch Build (in progress) — Temple TX hybrid red-iron build,
    // closest thing in the gallery to a true ranch barn.
    image:
      "https://idrbgxlvvnqduvbqtaei.supabase.co/storage/v1/object/public/gallery/items/e83d6a82-6138-40e1-a60b-c4fe4b7d8a30/1777195267509.jpg",
    priceFrom: "6,500",
  },
  {
    slug: "rv-covers",
    eyebrow: "RV & Boat",
    headline: "Tall clearance for trucks, RVs, and boats.",
    blurb:
      "Extra-tall clearance structures for RVs, boats, trailers, and oversize equipment storage.",
    // RV Cover 20×35 (Double-Wide) — Copperas Cove TX bolted build.
    image:
      "https://idrbgxlvvnqduvbqtaei.supabase.co/storage/v1/object/public/gallery/1777251893180.jpg",
    priceFrom: "3,800",
  },
] as const;

export function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="relative py-20 md:py-24 bg-[#fbf9f5] overflow-hidden"
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

        {/* Editorial split grid — 4-up at lg for magazine cadence,
            2-up at sm, 1-up on mobile. Cards stagger ~80ms apart. */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICE_CARDS.map((service, i) => (
            <Reveal key={service.slug} delay={i * 80}>
              <Link
                href={`/services/${service.slug}`}
                className="group flex flex-col hover:-translate-y-1 transition-transform duration-300 ease-out"
              >
                {/* Photo — top, no overlay text. Magazine plate stock. */}
                <div className="relative aspect-[5/4] overflow-hidden rounded-2xl shadow-md group-hover:shadow-xl transition-shadow duration-300">
                  <Image
                    src={service.image}
                    alt={service.headline}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>

                {/* Caption block — eyebrow + Barlow headline + body + meta row. */}
                <div className="flex flex-col gap-1.5 px-1 pt-3.5">
                  <div className="font-display font-bold uppercase text-[11px] tracking-[0.18em] text-[color:var(--color-brand-700)]">
                    · {service.eyebrow} ·
                  </div>
                  <h3 className="font-display font-extrabold uppercase tracking-tight leading-[0.98] text-[color:var(--color-ink-900)] text-2xl m-0">
                    {service.headline}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-[color:var(--color-ink-500)] m-0">
                    {service.blurb}
                  </p>
                  <div className="flex items-center gap-2.5 mt-2.5 pt-2.5 border-t border-[#e6dfcd]">
                    <span className="text-xs text-[color:var(--color-ink-500)]">
                      From{" "}
                      <b className="text-[color:var(--color-ink-900)] tabular-nums">
                        ${service.priceFrom}
                      </b>{" "}
                      · same-week start
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1 text-[13px] font-semibold text-[color:var(--color-brand-600)] group-hover:gap-2 transition-all">
                      See builds
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* Footer link to all services — magazine "see more" */}
        <div className="mt-12 flex justify-center">
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
