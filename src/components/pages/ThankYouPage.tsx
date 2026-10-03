import Link from "next/link";

import { FeatureCard } from "@/components/forge/cards";
import { ForgeButtonLink } from "@/components/forge/ForgeButton";
import { ForgeReveal } from "@/components/forge/ForgeReveal";
import { PageHero } from "@/components/forge/PageHero";
import { SectionHeading } from "@/components/forge/SectionHeading";
import { buttonClass } from "@/components/forge/styles";
import { GoogleAdsConversion } from "@/components/seo/GoogleAdsConversion";
import { TrackedPhoneLink, TrackedPhoneNumber } from "@/components/site/TrackedPhone";
import { PhoneIcon } from "@/components/ui/icons";
import type { Locale } from "@/i18n/config";
import { THANK_YOU } from "@/i18n/pages/thank-you";
import { localizeHref } from "@/i18n/routes";

/**
 * /thank-you (English) and /es/gracias (Spanish). `fromQuotePage` is ?from=quote,
 * set by the /quote landing page, which promises "same day, guaranteed within
 * 24 hours". The lede is the next thing that visitor reads, so it has to say
 * the same thing. Deliberately the only param — no name, phone or ZIP ever
 * goes in a URL.
 */
export function ThankYouPage({ locale, fromQuotePage }: { locale: Locale; fromQuotePage: boolean }) {
  const t = THANK_YOU[locale];

  return (
    <div data-forge="">
      {/* Fires the Google Ads "lead submitted" conversion exactly once,
          on every /thank-you mount. Server-side QuoteForm always lands here
          on success, so this is the canonical conversion point. No-ops when
          NEXT_PUBLIC_GOOGLE_ADS_ID + _CONVERSION_LABEL aren't set. The Spanish
          page (/es/gracias) fires the very same component. */}
      <GoogleAdsConversion />

      <PageHero
        breadcrumb={null}
        image={{
          src: "/images/red-iron-frame-hero.jpg",
          alt: t.hero.imgAlt,
          position: "50% 40%",
        }}
        above={
          <span
            aria-hidden="true"
            className="inline-flex size-12 items-center justify-center rounded-full border border-forge-silver/45 bg-white/10 text-[22px] text-white"
          >
            ✓
          </span>
        }
        h1a={t.hero.h1a}
        h1b={t.hero.h1b}
        lede={fromQuotePage ? t.hero.ledeQuote : t.hero.ledeOther}
        actions={
          <>
            <ForgeButtonLink href={localizeHref("/gallery", locale)} variant="white" size="lg" arrow>
              {t.hero.browse}
            </ForgeButtonLink>
            <TrackedPhoneLink surface="thank_you_hero" mode="children-only" className={buttonClass("outlineDark", "lg")}>
              <PhoneIcon className="h-5 w-5" />
              {t.hero.sooner}<TrackedPhoneNumber className="tabular-nums" />
            </TrackedPhoneLink>
          </>
        }
      />

      <section
        aria-labelledby="next-heading"
        data-forge=""
        data-tone="light"
        className="bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy"
      >
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading headingId="next-heading" eyebrow={t.next.eyebrow} line1={t.next.line1} line2={t.next.line2} />
          </ForgeReveal>
          <ForgeReveal stagger className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
            {t.next.steps(fromQuotePage).map((step, i) => (
              <FeatureCard key={step.title} index={i} title={step.title}>
                {step.blurb}
              </FeatureCard>
            ))}
          </ForgeReveal>
          <div className="mt-12 text-center">
            <Link
              href={localizeHref("/", locale)}
              className="border-b border-forge-silver pb-0.5 text-[15px] font-semibold text-forge-navy transition-colors hover:border-forge-navy"
            >
              {t.next.back}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
