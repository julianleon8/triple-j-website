import Image from "next/image";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon, PhoneIcon } from "@/components/ui/icons";
import { SITE } from "@/lib/site";

/**
 * Pre-footer CTA band — full-bleed photo backdrop with dark gradient.
 * Bookends the page: hero opens with this same atmospheric language,
 * the CTA closes with it. Sits between page content and the Footer in
 * the marketing layout, so every public page gets it.
 *
 * To swap the photo, change `src` below — treatment stays.
 */
export function PreFooterCta() {
  return (
    <section
      aria-labelledby="prefooter-cta-heading"
      className="relative overflow-hidden bg-black text-white"
    >
      {/* Background photo with heavy dark gradient on top */}
      <div className="absolute inset-0">
        <Image
          src="/images/carport-gable-residential.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-60"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-tr from-black/95 via-black/75 to-[color:var(--color-brand-700)]/40"
      />

      <Container size="wide" className="relative">
        <div className="py-20 md:py-28 lg:py-32 max-w-3xl">
          {/* Red eyebrow pill — same as hero/Services/WhyTripleJ */}
          <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
            Built for this
          </span>

          {/* Barlow huge headline — two-line with brand-blue accent on
              the punch line, same rhythm as hero. */}
          <h2
            id="prefooter-cta-heading"
            className="mt-6 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Ready to build?
            <br />
            <span className="text-[color:var(--color-brand-400)]">
              We&rsquo;re ready to start.
            </span>
          </h2>

          <p className="mt-6 text-lg sm:text-xl leading-relaxed text-white/75 max-w-2xl">
            Free on-site quote, usually within 24 hours. One call, one crew, one
            contract — site prep, concrete, and install all under one roof.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <ButtonLink
              href="/#quote"
              variant="primary"
              size="lg"
              icon={<ArrowRightIcon className="h-5 w-5" />}
              iconPosition="right"
            >
              Get a Free Quote
            </ButtonLink>
            <a
              href={SITE.phoneHref}
              className="inline-flex items-center gap-2 text-base font-semibold text-white/85 hover:text-white transition-colors"
            >
              <PhoneIcon className="h-5 w-5" />
              Call {SITE.phone}
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
