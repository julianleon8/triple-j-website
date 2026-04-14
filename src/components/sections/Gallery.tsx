import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/ui/icons";

/**
 * Gallery — showcase grid of completed builds.
 * Uses the real Triple J photos available in /public/images/.
 * Phase-3-minimum: static grid. A future phase can add lightbox,
 * filtering by service type, or per-project detail pages.
 */

const PHOTOS = [
  {
    src: "/images/carport-residential-completed.jpg",
    alt: "Completed residential carport with welded frame",
    label: "Residential carport",
    cityHint: "Central Texas",
  },
  {
    src: "/images/metal-garage-green.jpg",
    alt: "Fully-enclosed metal garage in green finish",
    label: "Enclosed garage",
    cityHint: "Central Texas",
  },
  {
    src: "/images/carport-concrete-rural.jpg",
    alt: "Rural carport with fresh concrete pad",
    label: "Carport + concrete pad",
    cityHint: "Central Texas",
  },
  {
    src: "/images/double-carport-install.jpg",
    alt: "Double-width carport during installation",
    label: "Double-width carport",
    cityHint: "Central Texas",
  },
  {
    src: "/images/carport-gable-residential.jpg",
    alt: "Residential gable-roof carport",
    label: "Gable-roof carport",
    cityHint: "Central Texas",
  },
  {
    src: "/images/porch-cover-lean-to.jpg",
    alt: "Metal lean-to porch cover",
    label: "Porch / lean-to cover",
    cityHint: "Central Texas",
  },
] as const;

export function Gallery() {
  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="py-20 md:py-28 bg-[color:var(--color-paper-2)] border-t border-[color:var(--color-ink-100)]"
    >
      <Container size="wide">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 max-w-4xl">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--color-brand-700)]">
              Recent Builds
            </span>
            <h2
              id="gallery-heading"
              className="mt-3 text-[color:var(--color-ink-900)]"
            >
              Real Central Texas jobs. Real 48-hour builds.
            </h2>
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--color-brand-700)] hover:gap-2 transition-all"
          >
            See full portfolio
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {/* Asymmetric grid — first cell spans 2 columns on desktop */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[220px]">
          {PHOTOS.map((p, idx) => (
            <figure
              key={p.src}
              className={`group relative overflow-hidden rounded-xl bg-[color:var(--color-ink-200)] ${
                idx === 0 ? "col-span-2 row-span-2" : ""
              }`}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes={
                  idx === 0
                    ? "(max-width: 768px) 100vw, 50vw"
                    : "(max-width: 768px) 50vw, 25vw"
                }
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              <figcaption className="absolute bottom-3 left-3 right-3 text-white">
                <div className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">
                  {p.cityHint}
                </div>
                <div className="font-bold text-sm md:text-base leading-tight">
                  {p.label}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
