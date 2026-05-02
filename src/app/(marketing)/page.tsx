import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { Gallery } from "@/components/sections/Gallery";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { QuoteForm } from "@/components/sections/QuoteForm";
import { ServiceAreas } from "@/components/sections/ServiceAreas";
import { Services } from "@/components/sections/Services";
import { Testimonials } from "@/components/sections/Testimonials";
import { WhyTripleJ } from "@/components/sections/WhyTripleJ";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Metal Carports, Garages & Barns in Temple, Central Texas",
  description:
    "Turnkey metal buildings welded or bolted on-site by Triple J Metal — Temple, TX. Carports, garages, barns, RV covers with concrete pads. Same-week scheduling across Bell, Coryell, and McLennan counties. Call 254-346-7764.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Metal Carports, Garages & Barns in Central Texas — Triple J Metal",
    description:
      "Welded or bolted metal buildings built by our Temple TX crew — turnkey with concrete, same-week scheduling.",
    url: "/",
    type: "website",
  },
};

/**
 * Homepage hero — Claude Design handoff T3xTdERm9wlM8SFyWYpaJw, "loud
 * sales-mode" version C. Layers, top to bottom: photo + ken-burns,
 * left-to-right scrim, bottom fade, verified chip top-right, content
 * column (red eyebrow → headline w/ blue Friday accent → sub →
 * form-chip ribbon → meta row), scroll cue, then a 4-up proof strip
 * sharing the same dark ground.
 *
 * The proof strip absorbs what TrustBar used to render on the homepage
 * (TrustBar component itself is still used on service-detail pages).
 */
const HERO_CHIPS = [
  { label: "Carport", image: "/images/carport-gable-residential.jpg" },
  { label: "Garage", image: "/images/metal-garage-green.jpg" },
  { label: "Barn", image: "/images/carport-concrete-rural.jpg" },
  { label: "Lean-to", image: "/images/porch-cover-lean-to.jpg" },
] as const;

type ProofStat = {
  big: string;
  label: string;
  amber?: boolean;
  small?: boolean;
};

const PROOF_STATS: ProofStat[] = [
  { big: SITE.stats.projects, label: "Central TX\nbuilds" },
  { big: "24h", label: "Quote\nreply" },
  { big: "★★★★★", label: "Local on\nGoogle", amber: true },
  { big: "In-house", label: "Welders &\ninstallers", small: true },
];

export default function HomePage() {
  return (
    <>
      <section className="relative -mt-20 bg-[color:var(--color-ink-900)] text-white overflow-hidden">
        {/* Hero photo block */}
        <div className="relative">
          <div className="absolute inset-0 bg-kenburns">
            <Image
              src="/images/red-iron-frame-hero.jpg"
              alt="Welded red iron frame going up on a Central Texas metal building site"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
          {/* Left-to-right scrim — protects the text column across the photo */}
          <div aria-hidden="true" className="absolute inset-0 hero-scrim" />
          {/* Bottom fade — keeps the chip row legible against bright photo bottoms */}
          <div aria-hidden="true" className="absolute inset-0 hero-bottom-fade" />

          {/* Verified chip — generic (no fabricated build metadata) */}
          <span className="absolute top-24 right-4 sm:right-8 inline-flex items-center gap-1.5 rounded-md bg-white/95 backdrop-blur-md px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-ink-900)] shadow-sm">
            <span aria-hidden="true" className="w-1.5 h-1.5 bg-[#15803d] rounded-full" />
            Welded · Central Texas
          </span>

          <Container size="wide" className="relative pt-28 pb-20 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-28">
            <div className="max-w-3xl flex flex-col">
              {/* Red eyebrow pill — the one sanctioned pop of red on the page */}
              <span
                data-hero-step="1"
                className="hero-anim self-start inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm"
              >
                Family-Owned · Temple, TX
              </span>

              {/* Two-line headline — blue accent on the promise word */}
              <h1 className="mt-5 font-display font-extrabold uppercase tracking-tight leading-[0.92] text-white text-6xl sm:text-7xl md:text-8xl lg:text-[88px]">
                <span data-hero-step="2" className="hero-anim block">
                  Welded right.
                </span>
                <span data-hero-step="3" className="hero-anim block">
                  Up by{" "}
                  <span className="text-[color:var(--color-brand-400)]">Friday.</span>
                </span>
              </h1>

              <p
                data-hero-step="4"
                className="hero-anim mt-5 text-[17px] sm:text-lg leading-relaxed font-medium text-white/95 max-w-xl"
              >
                Carports, garages, and barns built and installed by our Central Texas
                crew. Free quote in 24 hours — most jobs up by the end of the week.
              </p>

              {/* Form chip ribbon — chips link to QuoteForm anchor */}
              <div data-hero-step="5" className="hero-anim mt-10 sm:mt-12">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/65 font-bold mb-3.5">
                  <span aria-hidden="true" className="text-[color:var(--color-brand-400)]">·&nbsp;</span>
                  Start your quote — what are you building?
                  <span aria-hidden="true" className="text-[color:var(--color-brand-400)]">&nbsp;·</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl">
                  {HERO_CHIPS.map((chip) => (
                    <Link
                      key={chip.label}
                      href="/#quote"
                      className="group relative rounded-[10px] overflow-hidden border-[1.5px] border-white/20 hover:border-white/40 bg-white/5 transition-colors"
                    >
                      <div className="relative aspect-[5/4] overflow-hidden">
                        <Image
                          src={chip.image}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 50vw, 144px"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                        <div aria-hidden="true" className="absolute inset-0 hero-chip-overlay" />
                        <span className="absolute left-2.5 bottom-2 font-display font-extrabold uppercase text-sm leading-none text-white">
                          {chip.label}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-2.5 flex items-center gap-2.5 max-w-xl">
                  <span className="text-xs text-white/70">Tap a build to start →</span>
                  <span className="ml-auto text-xs text-white/50">
                    2 quick steps · 24 h reply
                  </span>
                </div>
              </div>
            </div>
          </Container>

          {/* Scroll cue — centered bottom edge */}
          <div
            aria-hidden="true"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-1.5 pointer-events-none"
          >
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-semibold">
              Scroll for the full quote
            </span>
            <span className="inline-flex w-6 h-6 rounded-full border border-white/45 items-center justify-center text-white/75 text-[13px]">
              ↓
            </span>
          </div>
        </div>

        {/* Proof strip — same dark continuous ground; replaces homepage TrustBar */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-white/10">
          {PROOF_STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex items-center gap-3 px-5 py-4 sm:px-6 sm:py-5 ${
                i < PROOF_STATS.length - 1 ? "md:border-r border-white/10" : ""
              } ${i % 2 === 0 ? "border-r md:border-r border-white/10" : ""} ${
                i < 2 ? "border-b md:border-b-0 border-white/10" : ""
              }`}
            >
              <div
                className={`font-display font-extrabold leading-none tabular-nums ${
                  stat.amber ? "text-[color:var(--color-accent-amber)]" : "text-white"
                } ${stat.small ? "text-xl sm:text-[22px]" : "text-2xl sm:text-[28px]"}`}
              >
                {stat.big}
              </div>
              <div className="text-[10.5px] uppercase tracking-[0.14em] text-white/60 font-semibold leading-snug whitespace-pre-line">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Services />
      <WhyTripleJ />
      <HowItWorks />
      <Gallery />
      <Testimonials />
      <ServiceAreas />
      <QuoteForm />
    </>
  );
}
