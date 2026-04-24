'use client'

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Testimonials — auto-scrolling marquee on a dark editorial spread.
 * Pause-on-hover is preserved (locked behavior — see Decisions.md
 * 2026-04-15 marquee decision).
 *
 * Placeholder-mode policy: while we're waiting on real Google reviews,
 * cards present as anonymous-by-attribution (project + city) rather
 * than "Placeholder Customer" — keeps the section credible. Swap the
 * REVIEWS array (and add a `name` field per row) once real reviews
 * land. See testimonials.md in the project root for the template.
 */

type Review = {
  quote: string;
  /** Short attribution shown on the card. e.g. "Carport install · Temple, TX". */
  attribution: string;
  rating: number;
};

const REVIEWS: readonly Review[] = [
  {
    quote:
      "Welded perfect, looks great two years in, hasn't budged in any storm. Concrete was set the same week. The crew kept us updated start to finish.",
    attribution: "Welded carport · Temple, TX",
    rating: 5,
  },
  {
    quote:
      "Juan and his son showed up when they said they would, built exactly what I asked for, and the price was a third of what the national guys quoted me.",
    attribution: "Double carport · Harker Heights, TX",
    rating: 5,
  },
  {
    quote:
      "PCSed to Fort Cavazos in July. Needed cover for my truck before the heat destroyed the paint. Juan came out himself for the walk-through and had us scheduled the same week.",
    attribution: "PCS truck cover · Killeen, TX",
    rating: 5,
  },
  {
    quote:
      "Every other company wanted to ship me a kit and let me figure it out. Triple J sent a real crew. They poured the slab, built the structure, and cleaned up after themselves.",
    attribution: "Turnkey garage · Belton, TX",
    rating: 5,
  },
  {
    quote:
      "Our HOA has strict rules on finishes. Triple J walked us through the standing seam options, matched our roof color exactly, and passed inspection first try.",
    attribution: "HOA-compliant cover · Round Rock, TX",
    rating: 5,
  },
  {
    quote:
      "Best investment on my ranch property in years. Welded red iron barn — no rattle, no flex, nothing. That thing will outlast the house.",
    attribution: "Welded ranch barn · Salado, TX",
    rating: 5,
  },
] as const;

function Stars({ n }: { n: number }) {
  return (
    <div
      aria-label={`${n} out of 5 stars`}
      className="flex gap-0.5 text-[color:var(--color-accent-amber)]"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i < n ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

// Duplicate the array for a seamless infinite loop
const LOOPED = [...REVIEWS, ...REVIEWS];

export function Testimonials() {
  return (
    <section
      aria-labelledby="reviews-heading"
      className="relative overflow-hidden bg-[color:var(--color-ink-950)] text-white py-24 md:py-32"
    >
      {/* Oversized outlined quote mark — magazine-style background ornament,
          sits behind the header at very low opacity. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -right-8 sm:right-12 text-[18rem] sm:text-[22rem] md:text-[28rem] font-display font-extrabold leading-none text-white/[0.03] select-none"
      >
        &ldquo;
      </div>

      <Container size="wide" className="relative">
        {/* Magazine header — red eyebrow pill + Barlow Condensed huge.
            Two-line headline with a brand-blue accent on the punch line,
            same rhythm as Services and WhyTripleJ. */}
        <Reveal className="max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
            What Customers Say
          </span>
          <h2
            id="reviews-heading"
            className="mt-6 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-white text-5xl sm:text-6xl md:text-7xl"
          >
            Built for Central Texas,
            <br />
            <span className="text-[color:var(--color-brand-400)]">by Central Texans.</span>
          </h2>
          <p className="mt-6 text-lg sm:text-xl leading-relaxed text-white/70 max-w-2xl">
            Six years on the road, hundreds of welds, one number to call.
            What follows is what people tell us when the job&rsquo;s done.
          </p>
        </Reveal>
      </Container>

      {/* Scroll track — full-bleed outside Container.
          Pause-on-hover preserved. Marquee track keeps the soft fade-mask
          on left/right edges via .marquee-track in globals.css. */}
      <Reveal className="mt-14" delay={120}>
        <div className="relative marquee-track">
          <div
            className="flex gap-5 w-max animate-[scroll-x_40s_linear_infinite] hover:[animation-play-state:paused]"
            aria-hidden="true"
          >
            {LOOPED.map((r, idx) => (
              <figure
                key={idx}
                className="relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-7 shadow-xl w-[340px] shrink-0"
              >
                {/* Decorative brand-blue quote mark in the corner */}
                <span
                  aria-hidden="true"
                  className="absolute top-4 right-5 text-5xl font-display font-extrabold leading-none text-[color:var(--color-brand-400)]/30 select-none"
                >
                  &ldquo;
                </span>

                <Stars n={r.rating} />
                <blockquote className="mt-4 text-[15px] sm:text-base leading-relaxed text-white/90 flex-1">
                  &ldquo;{r.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 pt-5 border-t border-white/10">
                  <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[color:var(--color-brand-400)]">
                    Verified Project
                  </div>
                  <div className="mt-1 text-sm text-white/70 font-medium">
                    {r.attribution}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Accessible static list for screen readers */}
      <ul className="sr-only">
        {REVIEWS.map((r, i) => (
          <li key={i}>
            {r.rating} stars. &ldquo;{r.quote}&rdquo; — {r.attribution}
          </li>
        ))}
      </ul>
    </section>
  );
}
