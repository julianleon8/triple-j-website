import { Container } from "@/components/ui/Container";

/**
 * Testimonials — placeholder.
 * Uses generic review text until real Google Business Profile
 * reviews come in. Swap `REVIEWS` constant when real ones arrive.
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

export function Testimonials() {
  return (
    <section
      aria-labelledby="reviews-heading"
      className="py-20 md:py-28"
    >
      <Container size="wide">
        <div className="max-w-2xl">
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

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((r, idx) => (
            <figure
              key={idx}
              className="flex flex-col rounded-2xl border border-[color:var(--color-ink-100)] bg-white p-7 shadow-sm"
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
      </Container>
    </section>
  );
}
