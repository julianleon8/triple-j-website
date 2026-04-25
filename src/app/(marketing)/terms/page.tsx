import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms and conditions for using the ${SITE.shortName} website and requesting quotes.`,
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <Container size="narrow">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--color-brand-700)]">
          Legal
        </p>
        <h1 className="mt-3 text-[color:var(--color-ink-900)]">Terms of Use</h1>
        <p className="mt-2 text-sm text-[color:var(--color-ink-500)]">
          Last updated April 22, 2026 · {SITE.legalName}
        </p>

        <div className="mt-10 space-y-8 text-[color:var(--color-ink-700)] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[color:var(--color-ink-900)]">
              Agreement
            </h2>
            <p className="mt-3">
              By accessing this website or submitting a quote request, you agree to these terms. If
              you do not agree, please do not use the site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[color:var(--color-ink-900)]">
              Website content
            </h2>
            <p className="mt-3">
              Information on this site (including photos, descriptions, and timelines) is for
              general marketing purposes. Project details, pricing, permits, and schedules are
              confirmed in writing as part of a separate contract between you and {SITE.legalName}.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[color:var(--color-ink-900)]">
              Quote requests
            </h2>
            <p className="mt-3">
              Submitting the quote form does not obligate you to purchase services, and it does not
              guarantee availability or a specific price until we confirm scope and site conditions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[color:var(--color-ink-900)]">
              Limitation of liability
            </h2>
            <p className="mt-3">
              To the fullest extent permitted by law, {SITE.legalName} is not liable for any indirect or
              consequential damages arising from your use of this website. Our liability for any
              claim related to the site itself is limited to the amount you paid us for services in
              the twelve months preceding the claim (if any).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[color:var(--color-ink-900)]">
              Governing law
            </h2>
            <p className="mt-3">
              These terms are governed by the laws of the State of Texas, without regard to
              conflict-of-law rules. Disputes will be brought in the courts located in Bell County,
              Texas, unless otherwise required by law.
            </p>
          </section>

          <p className="pt-4 text-sm text-[color:var(--color-ink-500)]">
            See also our{" "}
            <Link href="/privacy" className="font-semibold text-[color:var(--color-brand-700)]">
              Privacy Policy
            </Link>
            . Questions?{" "}
            <Link href="/contact" className="font-semibold text-[color:var(--color-brand-700)]">
              Contact us
            </Link>
            .
          </p>
        </div>
      </Container>
    </section>
  );
}
