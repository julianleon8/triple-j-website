import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/ui/icons";

/**
 * Services grid — 4 primary offerings.
 * Uses real Triple J photos. Each card links to /services/[slug].
 */

const SERVICE_CARDS = [
  {
    slug: "carports",
    title: "Carports",
    blurb:
      "Welded red-iron carports — single, double, triple, or custom. Built and secured in under 48 hours.",
    image: "/images/carport-gable-residential.jpg",
  },
  {
    slug: "garages",
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
    image: "/images/double-carport-install.jpg",
  },
  {
    slug: "rv-covers",
    title: "RV & Boat Covers",
    blurb:
      "Extra-tall clearance structures for RVs, boats, trailers, and oversize equipment storage.",
    image: "/images/porch-cover-lean-to.jpg",
  },
] as const;

export function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="py-20 md:py-28"
    >
      <Container size="wide">
        {/* Section header */}
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--color-brand-700)]">
            What We Build
          </span>
          <h2
            id="services-heading"
            className="mt-3 text-[color:var(--color-ink-900)]"
          >
            Built on-site in under 48 hours.
          </h2>
          <p className="mt-4 text-lg text-[color:var(--color-ink-500)]">
            Every structure is custom-welded from red-iron steel and delivered
            turnkey — site prep, concrete pad, and installation all under one
            contract.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICE_CARDS.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-[color:var(--color-ink-100)] bg-white hover:border-[color:var(--color-brand-400)]/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--color-ink-100)]">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
              <div className="flex flex-col gap-2 p-5">
                <h3 className="text-xl font-bold text-[color:var(--color-ink-900)] group-hover:text-[color:var(--color-brand-700)] transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm leading-relaxed text-[color:var(--color-ink-500)]">
                  {service.blurb}
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--color-brand-600)] group-hover:gap-2 transition-all">
                  Learn more
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
