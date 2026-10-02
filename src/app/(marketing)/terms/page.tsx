import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/forge/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms and conditions for using the ${SITE.shortName} website and requesting quotes.`,
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      path="/terms"
      meta={
        <>
          Last updated April 22, 2026 · {SITE.legalName} · See also our{" "}
          <Link href="/privacy" className="text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white">
            Privacy Policy
          </Link>
        </>
      }
    >
      <section>
        <h2>Agreement</h2>
        <p className="mt-3">
          By accessing this website or submitting a quote request, you agree to these terms. If
          you do not agree, please do not use the site.
        </p>
      </section>

      <section>
        <h2>Website content</h2>
        <p className="mt-3">
          Information on this site (including photos, descriptions, and timelines) is for
          general marketing purposes. Project details, pricing, permits, and schedules are
          confirmed in writing as part of a separate contract between you and {SITE.legalName}.
        </p>
      </section>

      <section>
        <h2>Quote requests</h2>
        <p className="mt-3">
          Submitting the quote form does not obligate you to purchase services, and it does not
          guarantee availability or a specific price until we confirm scope and site conditions.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p className="mt-3">
          To the fullest extent permitted by law, {SITE.legalName} is not liable for any indirect or
          consequential damages arising from your use of this website. Our liability for any
          claim related to the site itself is limited to the amount you paid us for services in
          the twelve months preceding the claim (if any).
        </p>
      </section>

      <section>
        <h2>Governing law</h2>
        <p className="mt-3">
          These terms are governed by the laws of the State of Texas, without regard to
          conflict-of-law rules. Disputes will be brought in the courts located in Bell County,
          Texas, unless otherwise required by law.
        </p>
      </section>

      <p className="border-t border-forge-mist pt-6 text-[14px]">
        See also our{" "}
        <Link href="/privacy" className="font-semibold text-forge-navy underline decoration-forge-silver underline-offset-4 transition-colors hover:decoration-forge-navy">
          Privacy Policy
        </Link>
        . Questions?{" "}
        <Link href="/contact" className="font-semibold text-forge-navy underline decoration-forge-silver underline-offset-4 transition-colors hover:decoration-forge-navy">
          Contact us
        </Link>
        .
      </p>
    </LegalPage>
  );
}
