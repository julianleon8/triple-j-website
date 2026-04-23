import Image from "next/image";

import { Container } from "@/components/ui/Container";

/**
 * Why Triple J — the welded-vs-bolted explainer section.
 * This is the single biggest differentiator from the research:
 * every competitor sells bolted kits; Triple J welds on-site.
 *
 * Layout: two-column comparison table with a photo callout
 * above it showing an in-progress weld.
 */

const COMPARISON = [
  {
    attr: "Construction",
    tripleJ: "Welded OR bolted red-iron — your choice",
    others: "Bolted tubular kit only — no weld option",
  },
  {
    attr: "Build Time",
    tripleJ: "Days, not months",
    others: "4–16 weeks from order",
  },
  {
    attr: "Concrete Pad",
    tripleJ: "Poured turnkey — single contract",
    others: "Customer hires separate contractor",
  },
  {
    attr: "Permits",
    tripleJ: "We handle research + filing",
    others: "Customer pulls their own",
  },
  {
    attr: "Storm Performance",
    tripleJ: "Permanent — won't rattle or loosen",
    others: "Bolts loosen in Texas wind/hail",
  },
  {
    attr: "Who Builds It",
    tripleJ: "Our crew — we show up",
    others: "Subcontractor network, varies by region",
  },
] as const;

export function WhyTripleJ() {
  return (
    <section
      aria-labelledby="why-heading"
      className="bg-[color:var(--color-paper-2)] py-20 md:py-28 border-y border-[color:var(--color-ink-100)]"
    >
      <Container size="wide">
        {/* Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--color-brand-700)]">
            Why Triple J
          </span>
          <h2 id="why-heading" className="mt-3 text-[color:var(--color-ink-900)]">
            Welded or bolted — your call.
            <br className="hidden sm:block" />
            Installed in days, not months.
          </h2>
          <p className="mt-4 text-lg text-[color:var(--color-ink-500)]">
            Most &ldquo;carport companies&rdquo; in Texas ship you a bolt-together
            kit and leave you to hire someone else for the concrete, the permit,
            and the labor. Triple J is the whole job — one number, one crew, one
            contract.
          </p>
        </div>

        {/* Photo callout + comparison */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Photo column */}
          <div className="lg:col-span-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[color:var(--color-ink-900)]">
              <Image
                src="/images/carport-truck-concrete-hero.jpg"
                alt="Triple J crew welding a red-iron frame on-site"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-600)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  Welded On-Site
                </div>
                <p className="mt-3 text-white text-sm max-w-xs">
                  Texas-sourced red-iron steel. 14-gauge standard,
                  12-gauge storm upgrade. Every weld inspected before concrete
                  cures.
                </p>
              </div>
            </div>
          </div>

          {/* Comparison table */}
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-[color:var(--color-ink-100)] bg-white shadow-sm">
              <div className="grid grid-cols-3 bg-[color:var(--color-ink-50)] text-xs font-bold uppercase tracking-wider text-[color:var(--color-ink-500)]">
                <div className="p-4">What you&rsquo;re paying for</div>
                <div className="p-4 border-l border-[color:var(--color-ink-100)] text-[color:var(--color-brand-700)]">
                  Triple J
                </div>
                <div className="p-4 border-l border-[color:var(--color-ink-100)]">
                  Other Texas Carport Co.
                </div>
              </div>
              {COMPARISON.map((row, idx) => (
                <div
                  key={row.attr}
                  className={`grid grid-cols-3 text-sm ${
                    idx !== COMPARISON.length - 1
                      ? "border-b border-[color:var(--color-ink-100)]"
                      : ""
                  }`}
                >
                  <div className="p-4 font-semibold text-[color:var(--color-ink-900)]">
                    {row.attr}
                  </div>
                  <div className="p-4 border-l border-[color:var(--color-ink-100)] bg-[color:var(--color-brand-50)]/40">
                    <div className="flex items-start gap-2">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 text-[color:var(--color-brand-600)]"
                      >
                        ✓
                      </span>
                      <span className="text-[color:var(--color-ink-800)] font-medium">
                        {row.tripleJ}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 border-l border-[color:var(--color-ink-100)]">
                    <div className="flex items-start gap-2">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 text-[color:var(--color-ink-300)]"
                      >
                        —
                      </span>
                      <span className="text-[color:var(--color-ink-500)]">
                        {row.others}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
