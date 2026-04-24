import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon, PinIcon } from "@/components/ui/icons";

/**
 * Service areas — magazine-style city card grid on a light section.
 * White bg with a subtle dot-grid texture (different from Services'
 * line grid for visual variety). Each card carries county + distance
 * + a service tag chip — more detail than the previous bare cards.
 *
 * Data lives here intentionally (decoupled from src/lib/site.ts
 * SERVICE_CITIES) so this section can carry richer per-card metadata
 * without bloating the site-wide constants. When the homepage city
 * lineup changes, edit AREAS below.
 */

type Area = {
  slug: string;
  name: string;
  county: string;
  /** Driving distance from Temple HQ. Use "HQ" for Temple itself. */
  distance: string;
  /** 2 short service tags for the card. */
  tags: readonly [string, string];
  /** Mark the HQ card for the featured treatment. */
  hq?: boolean;
};

const AREAS: readonly Area[] = [
  {
    slug: "temple",
    name: "Temple",
    county: "Bell County",
    distance: "HQ",
    tags: ["Carports", "Garages"],
    hq: true,
  },
  {
    slug: "belton",
    name: "Belton",
    county: "Bell County",
    distance: "10 mi south",
    tags: ["Carports", "Barns"],
  },
  {
    slug: "killeen",
    name: "Killeen",
    county: "Bell County",
    distance: "25 mi southwest",
    tags: ["Military", "Carports"],
  },
  {
    slug: "harker-heights",
    name: "Harker Heights",
    county: "Bell County",
    distance: "22 mi southwest",
    tags: ["HOA", "Garages"],
  },
  {
    slug: "copperas-cove",
    name: "Copperas Cove",
    county: "Coryell County",
    distance: "32 mi southwest",
    tags: ["RV Covers", "Carports"],
  },
] as const;

export function ServiceAreas() {
  return (
    <section
      id="service-areas"
      aria-labelledby="areas-heading"
      className="relative overflow-hidden bg-white py-24 md:py-32"
    >
      {/* Subtle dot-grid ornament — magazine "city plan" feel without
          competing with cards. .bg-dot-grid in globals.css. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] bg-dot-grid"
      />
      {/* Soft brand-blue radial wash in the upper-right — adds depth
          without changing the white background read. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[color:var(--color-brand-200)]/30 blur-3xl"
      />

      <Container size="wide" className="relative">
        {/* Magazine header — red eyebrow pill + Barlow huge headline,
            same rhythm as hero/Services/WhyTripleJ/Testimonials. */}
        <Reveal className="max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
            Where We Build
          </span>
          <h2
            id="areas-heading"
            className="mt-6 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[color:var(--color-ink-900)] text-5xl sm:text-6xl md:text-7xl"
          >
            Proudly serving
            <br />
            <span className="text-[color:var(--color-brand-600)]">Central Texas.</span>
          </h2>
          <p className="mt-6 text-lg sm:text-xl leading-relaxed text-[color:var(--color-ink-600)] max-w-2xl">
            Based in Temple, we build across the Killeen–Temple–Belton
            corridor and the surrounding rural counties. If you&rsquo;re
            within 90 minutes of Temple, we&rsquo;ll come measure.
          </p>
          <div className="mt-6">
            <Link
              href="/locations"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[color:var(--color-brand-700)] hover:text-[color:var(--color-brand-800)] transition-colors"
            >
              View all service locations
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        {/* Detailed card grid. Featured HQ card spans 2 columns on
            larger viewports; the rest fill the remaining slots. */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {AREAS.map((area, i) => (
            <Reveal key={area.slug} delay={i * 80}
              className={area.hq ? "lg:col-span-2 lg:row-span-2" : ""}
            >
              <Link
                href={`/locations/${area.slug}`}
                className={`group relative flex flex-col h-full overflow-hidden rounded-2xl border transition-all duration-300 ease-out ${
                  area.hq
                    ? "border-[color:var(--color-brand-600)]/25 bg-gradient-to-br from-[color:var(--color-brand-600)]/8 via-white to-white shadow-lg hover:shadow-2xl hover:-translate-y-1"
                    : "border-[color:var(--color-ink-100)] bg-white shadow-sm hover:border-[color:var(--color-brand-400)] hover:shadow-xl hover:-translate-y-1"
                } p-6 md:p-7`}
              >
                {/* Top row: county eyebrow + corner pin/HQ badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-ink-400)]">
                    {area.county}
                  </div>
                  {area.hq ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                      HQ
                    </span>
                  ) : (
                    <PinIcon className="h-5 w-5 text-[color:var(--color-brand-600)] shrink-0" />
                  )}
                </div>

                {/* City name — Barlow Condensed, larger on the HQ card */}
                <div
                  className={`mt-4 font-display font-extrabold uppercase tracking-tight leading-none text-[color:var(--color-ink-900)] ${
                    area.hq
                      ? "text-5xl md:text-6xl lg:text-7xl"
                      : "text-3xl md:text-4xl"
                  }`}
                >
                  {area.name}
                </div>

                {/* Distance line */}
                <div
                  className={`mt-2 text-sm font-semibold ${
                    area.hq
                      ? "text-[color:var(--color-brand-700)]"
                      : "text-[color:var(--color-ink-500)]"
                  }`}
                >
                  {area.distance === "HQ"
                    ? "Triple J Metal Buildings · 3319 Tem-Bel Ln"
                    : area.distance + " of Temple"}
                </div>

                {/* HQ card carries an extra blurb to fill the larger panel */}
                {area.hq ? (
                  <p className="mt-5 text-base leading-relaxed text-[color:var(--color-ink-600)] max-w-md">
                    Our shop, yard, and crew live here. Most jobs in Bell County
                    are scheduled the same week you call.
                  </p>
                ) : null}

                {/* Service tag chips — sit at the bottom on every card */}
                <div className="mt-auto pt-5 flex flex-wrap gap-2">
                  {area.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md border border-[color:var(--color-ink-100)] bg-[color:var(--color-ink-50)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-ink-600)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer arrow that slides on hover */}
                <div className="mt-4 pt-4 border-t border-[color:var(--color-ink-100)] flex items-center justify-between">
                  <span className="text-sm font-bold text-[color:var(--color-brand-700)]">
                    See {area.name}
                  </span>
                  <ArrowRightIcon className="h-4 w-4 text-[color:var(--color-ink-300)] group-hover:text-[color:var(--color-brand-600)] group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
