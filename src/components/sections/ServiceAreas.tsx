import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { ArrowRightIcon, PinIcon } from "@/components/ui/icons";
import { SERVICE_CITIES } from "@/lib/site";

/**
 * Service areas — city card grid.
 * Each card links to /locations/[slug] (pages already built in Phase 1 of
 * the backend). Great local-SEO real estate on the homepage.
 */
export function ServiceAreas() {
  return (
    <section
      id="service-areas"
      aria-labelledby="areas-heading"
      className="py-20 md:py-28"
    >
      <Container size="wide">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--color-brand-700)]">
            Where We Build
          </span>
          <h2
            id="areas-heading"
            className="mt-3 text-[color:var(--color-ink-900)]"
          >
            Proudly serving Central Texas.
          </h2>
          <p className="mt-4 text-lg text-[color:var(--color-ink-500)]">
            Based in Temple, we build across the Killeen–Temple–Belton corridor
            and the surrounding rural counties. If you&rsquo;re within 90
            minutes of Temple, we&rsquo;ll come measure.
          </p>
          <div className="mt-5">
            <Link
              href="/locations"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-brand-700)] hover:text-[color:var(--color-brand-800)]"
            >
              View all service locations
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {SERVICE_CITIES.map((c) => (
            <Link
              key={c.slug}
              href={`/locations/${c.slug}`}
              className="group flex flex-col rounded-xl border border-[color:var(--color-ink-100)] bg-white p-5 hover:border-[color:var(--color-brand-400)] hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between">
                <PinIcon className="h-5 w-5 text-[color:var(--color-brand-600)]" />
                <ArrowRightIcon className="h-4 w-4 text-[color:var(--color-ink-300)] group-hover:text-[color:var(--color-brand-600)] group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="mt-6 text-base font-bold text-[color:var(--color-ink-900)] leading-tight">
                {c.name}
              </div>
              <div className="mt-1 text-xs text-[color:var(--color-ink-400)] font-medium">
                Metal buildings + installation
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
