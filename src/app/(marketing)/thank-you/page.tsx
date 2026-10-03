import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Thanks — we'll call you back within 24 hours",
  description:
    "Your quote request is in. A real person from Triple J Metal will call you back within 24 hours.",
  // Don't index conversion-confirmation pages — they're not useful organic
  // landings and they pollute analytics.
  robots: { index: false, follow: false },
  alternates: { canonical: "/thank-you" },
};

/**
 * Step 1 follows the response-promise lock: the /quote funnel (?from=quote)
 * reads "Same day, guaranteed within 24 hours."; every other form "within 24
 * hours". The pre-Forge "Usually within 24 hours" undercut the guarantee and
 * step 3 put concrete on every job — both corrected to the locks.
 */
function nextSteps(fromQuotePage: boolean) {
  return [
    {
      title: "We call you back",
      blurb: `${
        fromQuotePage ? "Same day, guaranteed within 24 hours." : "Within 24 hours."
      } A real person from our Temple crew on the other end, no offshore call center.`,
    },
    {
      title: "On-site walk-through",
      blurb:
        "We come measure, look at the site, and answer questions. No charge, no high-pressure pitch — just a real number on the spot.",
    },
    {
      title: "Build starts the same week",
      blurb:
        "If you say go, materials arrive fast and our crew starts. Site prep, the install, and concrete if you want it — one contract, one number.",
    },
  ];
}

export default async function ThankYouPage({ searchParams }: PageProps<'/thank-you'>) {
  // ?from=quote is set by the /quote landing page, which promises "same day,
  // guaranteed within 24 hours". This paragraph is the next thing that visitor
  // reads, so it has to say the same thing. Deliberately the only param — no
  // name, phone or ZIP ever goes in a URL.
  const fromQuotePage = (await searchParams).from === 'quote'

  return (
    <div data-forge="">
      {/* Fires the Google Ads "lead submitted" conversion exactly once,
          on every /thank-you mount. Server-side QuoteForm always lands here
          on success, so this is the canonical conversion point. No-ops when
          NEXT_PUBLIC_GOOGLE_ADS_ID + _CONVERSION_LABEL aren't set. */}
      <GoogleAdsConversion />

      <PageHero
        breadcrumb={null}
        image={{
          src: "/images/red-iron-frame-hero.jpg",
          alt: "Welded red iron frame going up on a Central Texas metal building site",
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
        h1a="Got it."
        h1b="We’ll be in touch."
        lede={
          fromQuotePage
            ? "Your request landed. A real person from Triple J Metal will call you back today — guaranteed within 24 hours."
            : "Your request landed. A real person from Triple J Metal will call you back within 24 hours."
        }
        actions={
          <>
            <ForgeButtonLink href="/gallery" variant="white" size="lg" arrow>
              Browse our work
            </ForgeButtonLink>
            <TrackedPhoneLink surface="thank_you_hero" mode="children-only" className={buttonClass("outlineDark", "lg")}>
              <PhoneIcon className="h-5 w-5" />
              Need it sooner? <TrackedPhoneNumber className="tabular-nums" />
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
            <SectionHeading headingId="next-heading" eyebrow="What happens next" line1="Three things," line2="in order." />
          </ForgeReveal>
          <ForgeReveal stagger className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
            {nextSteps(fromQuotePage).map((step, i) => (
              <FeatureCard key={step.title} index={i} title={step.title}>
                {step.blurb}
              </FeatureCard>
            ))}
          </ForgeReveal>
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="border-b border-forge-silver pb-0.5 text-[15px] font-semibold text-forge-navy transition-colors hover:border-forge-navy"
            >
              ← Back to homepage
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
