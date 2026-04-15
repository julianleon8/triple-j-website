'use client'

import { Container } from "@/components/ui/Container";

/**
 * Testimonials — auto-scrolling marquee.
 * Swap `REVIEWS` with real Google reviews when they arrive.
 * See testimonials.md in the project root for the fill-in template.
 */

const REVIEWS = [
  {
    quote:
      "Called Triple J on a Thursday, had a welded carport on my property by Saturday night. Concrete was already set. Nobody else in Central Texas does it this fast.",
    name: "Placeholder Customer",
    city: "Temple, TX",
    rating: 5,
  },
  {
    quote:
      "Juan and his son showed up when they said they would, built exactly what I asked for, and the price was a third of what the national guys quoted me.",
    name: "Placeholder Customer",
    city: "Harker Heights, TX",
    rating: 5,
  },
  {
    quote:
      "PCSed to Fort Cavazos in July. Needed cover for my truck before the heat destroyed the paint. Triple J had it up in two days. Will call them again.",
    name: "Placeholder Customer",
    city: "Killeen, TX",
    rating: 5,
  },
  {
    quote:
      "Every other company wanted to ship me a kit and let me figure it out. Triple J sent a real crew. They poured the slab, built the structure, and cleaned up after themselves.",
    name: "Placeholder Customer",
    city: "Belton, TX",
    rating: 5,
  },
  {
    quote:
      "Our HOA has strict rules on finishes. Triple J walked us through the standing seam options, matched our roof color exactly, and passed inspection first try.",
    name: "Placeholder Customer",
    city: "Round Rock, TX",
    rating: 5,
  },
  {
    quote:
      "Best investment on my ranch property in years. Welded red iron barn — no rattle, no flex, nothing. That thing will outlast the house.",
    name: "Placeholder Customer",
    city: "Salado, TX",
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
    <section aria-labelledby="reviews-heading" className="py-20 md:py-28 overflow-hidden">
      <Container size="wide">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--color-brand-700)]">
            What Customers Say
          </span>
          <h2
            id="reviews-heading"
            className="mt-3 text-[color:var(--color-ink-900)]"
          >
            Built for Central Texas, by Central Texans.
          </h2>
          <p className="mt-4 text-[color:var(--color-ink-500)]">
            Real Google reviews will replace these placeholders once our GBP
            launch is complete.
          </p>
        </div>
      </Container>

      {/* Scroll track — full-bleed outside Container */}
      <div className="relative marquee-track">
        <div
          className="flex gap-5 w-max animate-[scroll-x_40s_linear_infinite] hover:[animation-play-state:paused]"
          aria-hidden="true"
        >
          {LOOPED.map((r, idx) => (
            <figure
              key={idx}
              className="flex flex-col rounded-2xl border border-[color:var(--color-ink-100)] bg-white p-7 shadow-sm w-[320px] shrink-0"
            >
              <Stars n={r.rating} />
              <blockquote className="mt-4 text-[15px] leading-relaxed text-[color:var(--color-ink-700)] flex-1">
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 pt-5 border-t border-[color:var(--color-ink-100)]">
                <div className="font-semibold text-[color:var(--color-ink-900)]">
                  {r.name}
                </div>
                <div className="text-sm text-[color:var(--color-ink-500)]">
                  {r.city}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Accessible static list for screen readers */}
      <ul className="sr-only">
        {REVIEWS.map((r, i) => (
          <li key={i}>
            {r.rating} stars. &ldquo;{r.quote}&rdquo; — {r.name}, {r.city}
          </li>
        ))}
      </ul>
    </section>
  );
}
