import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Why Triple J — the welded-vs-bolted explainer.
 * Single biggest differentiator from the research: every competitor
 * sells bolted kits; Triple J welds (and bolts) on-site.
 *
 * Treatment: dark editorial spread with a brand-blue radial glow.
 * Layout is header → full-width photo strip → two side-by-side
 * comparison panels (Triple J brand-tinted, Others muted) instead of
 * a cramped 3-column table — bigger text, more breathing room.
 */

const COMPARISON = [
  {
    attr: "Construction",
    tripleJ: "Welded OR bolted red-iron — your choice",
    others: "Bolted tubular kit only — no weld option",
  },
  {
    attr: "Build Time",
    tripleJ: "Same-week scheduling",
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
      className="relative overflow-hidden bg-[color:var(--color-ink-900)] text-white py-24 md:py-32"
    >
      {/* Brand-blue radial glow — same atmospheric pattern as the
          quote section. Provides depth without competing with content. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 quote-glow" />

      <Container size="wide" className="relative">
        {/* Header — mirrors hero + Services treatment: red eyebrow pill,
            Barlow Condensed huge headline, brand-blue accent on the punch line. */}
        <Reveal className="max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
            Why Triple J
          </span>
          <h2
            id="why-heading"
            className="mt-6 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-white text-5xl sm:text-6xl md:text-7xl"
          >
            Welded or bolted —
            <br />
            <span className="text-[color:var(--color-brand-400)]">your call.</span>
          </h2>
          <p className="mt-6 text-lg sm:text-xl leading-relaxed text-white/75 max-w-2xl">
            Most &ldquo;carport companies&rdquo; in Texas ship you a bolt-together
            kit and leave you to hire someone else for the concrete, the permit,
            and the labor. Triple J is the whole job — one number, one crew, one
            contract.
          </p>
        </Reveal>

        {/* Featured photo strip — full-width hero shot with caption overlay.
            Replaces the previous cramped portrait callout. */}
        <Reveal delay={120}>
          <div className="relative mt-14 overflow-hidden rounded-2xl bg-black aspect-[16/9] sm:aspect-[16/7] lg:aspect-[16/6]">
            <Image
              src="/images/carport-truck-concrete-hero.jpg"
              alt="Finished Triple J carport with concrete pad — Central Texas install"
              fill
              sizes="100vw"
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
            <div className="absolute inset-y-0 left-0 flex items-end sm:items-center p-6 sm:p-10 md:p-12 max-w-xl">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-600)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
                  Welded On-Site
                </span>
                <p className="mt-3 text-white text-base sm:text-lg leading-relaxed">
                  Texas-sourced red-iron steel. 14-gauge standard, 12-gauge
                  storm upgrade. Every weld inspected before concrete cures.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Two-panel comparison — Triple J vs Other Co.
            Side-by-side cards with breathing room replace the cramped
            3-column table. Each row pairs the same attribute across both
            panels via shared row order. */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
          {/* Triple J panel — brand-blue tinted, hero treatment */}
          <Reveal>
            <div className="relative h-full overflow-hidden rounded-2xl border border-[color:var(--color-brand-400)]/30 bg-gradient-to-br from-[color:var(--color-brand-600)]/15 via-white/[0.03] to-transparent p-7 md:p-8 shadow-2xl">
              {/* Panel header */}
              <div className="flex items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--color-brand-400)]">
                    Triple J Metal
                  </div>
                  <div className="mt-1 text-2xl md:text-3xl font-display font-extrabold uppercase tracking-tight text-white">
                    Built whole, by us.
                  </div>
                </div>
                <span className="shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-full bg-[color:var(--color-brand-600)] text-white text-lg font-bold shadow-lg">
                  ✓
                </span>
              </div>
              {/* Rows */}
              <ul className="mt-5 space-y-4">
                {COMPARISON.map((row) => (
                  <li key={row.attr} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-[color:var(--color-brand-600)]/25 text-[color:var(--color-brand-300)] text-sm font-bold"
                    >
                      ✓
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/55">
                        {row.attr}
                      </div>
                      <div className="mt-0.5 text-base md:text-lg leading-snug text-white font-medium">
                        {row.tripleJ}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Others panel — muted, translucent */}
          <Reveal delay={120}>
            <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-7 md:p-8">
              <div className="flex items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                    Other Texas Carport Co.
                  </div>
                  <div className="mt-1 text-2xl md:text-3xl font-display font-extrabold uppercase tracking-tight text-white/65">
                    Kit + handoff.
                  </div>
                </div>
                <span className="shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/5 text-white/35 text-lg font-bold">
                  ×
                </span>
              </div>
              <ul className="mt-5 space-y-4">
                {COMPARISON.map((row) => (
                  <li key={row.attr} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-white/5 text-white/35 text-sm font-bold"
                    >
                      ×
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40">
                        {row.attr}
                      </div>
                      <div className="mt-0.5 text-base md:text-lg leading-snug text-white/55">
                        {row.others}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
