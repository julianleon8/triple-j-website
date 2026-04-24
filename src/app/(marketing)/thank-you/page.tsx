import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon, PhoneIcon } from "@/components/ui/icons";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Thanks — we'll call you back within 24 hours",
  description:
    "Your quote request is in. A real person from Triple J Metal will call you back within 24 hours.",
  // Don't index conversion-confirmation pages — they're not useful organic
  // landings and they pollute analytics.
  robots: { index: false, follow: false },
  alternates: { canonical: "/thank-you" },
};

const NEXT_STEPS = [
  {
    n: "01",
    title: "We call you back",
    blurb:
      "Usually within 24 hours — often the same day. A real person (Julian or Juan) on the other end, no offshore call center.",
  },
  {
    n: "02",
    title: "On-site walk-through",
    blurb:
      "We come measure, look at the site, and answer questions. No charge, no high-pressure pitch — just a real number on the spot.",
  },
  {
    n: "03",
    title: "Build starts the same week",
    blurb:
      "If you say go, materials arrive fast and our crew starts. Site prep, concrete, install — all under one contract, one number.",
  },
] as const;

export default function ThankYouPage() {
  return (
    <>
      {/* Hero with the same atmospheric language as the homepage hero,
          minus the ken-burns animation (this page is a closer, not an
          opener). */}
      <section className="relative -mt-20 bg-black text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/red-iron-frame-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-50"
          />
        </div>
        <div aria-hidden="true" className="absolute inset-0 hero-gradient" />

        <Container size="wide" className="relative">
          <div className="py-32 sm:py-40 lg:py-48 max-w-3xl">
            {/* Brand-blue check badge — replaces the red eyebrow pill */}
            <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[color:var(--color-brand-600)] text-white text-2xl font-bold shadow-lg">
              ✓
            </span>

            <h1 className="mt-6 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-white text-5xl sm:text-6xl md:text-7xl">
              Got it.
              <br />
              <span className="text-[color:var(--color-brand-400)]">
                We&rsquo;ll be in touch.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl leading-relaxed text-white/80 max-w-2xl">
              Your request landed. A real person from Triple J Metal will call
              you back within 24 hours — usually the same day.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <ButtonLink
                href="/gallery"
                variant="primary"
                size="lg"
                icon={<ArrowRightIcon className="h-5 w-5" />}
                iconPosition="right"
              >
                Browse our work
              </ButtonLink>
              <a
                href={SITE.phoneHref}
                className="inline-flex items-center gap-2 text-base font-semibold text-white/85 hover:text-white transition-colors"
              >
                <PhoneIcon className="h-5 w-5" />
                Need it sooner? {SITE.phone}
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* What happens next — 3 steps, light section, magazine treatment */}
      <section
        aria-labelledby="next-heading"
        className="relative py-20 md:py-28 bg-gradient-to-b from-white to-[color:var(--color-ink-50)]"
      >
        <Container size="wide">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
              What Happens Next
            </span>
            <h2
              id="next-heading"
              className="mt-5 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[color:var(--color-ink-900)] text-4xl sm:text-5xl md:text-6xl"
            >
              Three things,
              <br />
              <span className="text-[color:var(--color-brand-600)]">in order.</span>
            </h2>
          </div>

          <ol className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {NEXT_STEPS.map((step) => (
              <li
                key={step.n}
                className="rounded-2xl bg-white border border-[color:var(--color-ink-100)] p-7 shadow-sm"
              >
                <div className="text-5xl font-extrabold tracking-tight text-[color:var(--color-brand-600)]/90 tabular-nums leading-none">
                  {step.n}
                </div>
                <h3 className="mt-4 text-xl font-bold text-[color:var(--color-ink-900)] tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-ink-600)]">
                  {step.blurb}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-ink-700)] hover:text-[color:var(--color-brand-600)] transition-colors"
            >
              ← Back to homepage
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
