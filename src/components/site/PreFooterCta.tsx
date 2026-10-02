import { Eyebrow } from "@/components/forge/Eyebrow";
import { ForgeButtonLink } from "@/components/forge/ForgeButton";
import { PhoneIcon } from "@/components/ui/icons";
import { TrackedPhoneLink, TrackedPhoneNumber } from "@/components/site/TrackedPhone";

/**
 * Closing call-to-action band for routes that have no Forge quote section of
 * their own (blog, comparison pages, services index, legal pages…). Forge
 * pages end with <QuoteSection> instead, so this is no longer in the
 * marketing layout; each route that needs it renders it (2026-10-02, D12).
 */
export function PreFooterCta() {
  return (
    <section
      data-forge=""
      data-tone="dark"
      aria-labelledby="prefooter-cta-heading"
      className="border-t border-forge-silver/15 bg-forge-navy py-[clamp(64px,7vw,104px)] text-white"
    >
      <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
        <div className="max-w-[760px]">
          <Eyebrow tone="dark">Built for this</Eyebrow>
          <h2
            id="prefooter-cta-heading"
            className="mt-4 font-forge-display text-[clamp(30px,3vw_+_12px,56px)] font-black leading-[1.05] tracking-[.01em] text-white"
          >
            Ready to build?
            <br />
            <span className="forge-steel-text">We&rsquo;re ready to start.</span>
          </h2>
          <p className="mt-4 max-w-[600px] text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.55] text-white/80">
            Free on-site quote, usually within 24 hours. One call, one crew, one contract — site prep,
            concrete, and install all under one roof.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <ForgeButtonLink href="/quote" variant="white" size="lg" arrow>
              Get a Free Quote
            </ForgeButtonLink>
            <TrackedPhoneLink
              surface="prefooter"
              mode="children-only"
              className="inline-flex items-center gap-2 text-[16px] font-semibold text-white/86 transition-colors hover:text-white"
            >
              <PhoneIcon width={18} height={18} aria-hidden="true" />
              <span>
                Call <TrackedPhoneNumber className="tabular-nums" />
              </span>
            </TrackedPhoneLink>
          </div>
        </div>
      </div>
    </section>
  );
}
