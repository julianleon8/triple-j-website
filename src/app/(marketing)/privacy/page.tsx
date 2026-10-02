import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/forge/LegalPage";
import { TrackedPhoneNumber } from "@/components/site/TrackedPhone";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.shortName} collects, uses, and protects information when you use this website or request a quote.`,
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      path="/privacy"
      meta={
        <>
          Last updated April 22, 2026 · {SITE.legalName} · See also our{" "}
          <Link href="/terms" className="text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white">
            Terms of Use
          </Link>
        </>
      }
    >
      <section>
        <h2>Information we collect</h2>
        <p className="mt-3">
          When you submit a quote request or contact us, we collect the details you provide
          (such as name, phone, email, ZIP code, project description, and any optional fields
          on the form). We use this information only to respond to your request and to operate
          our business.
        </p>
      </section>

      <section>
        <h2>How we use information</h2>
        <p className="mt-3">
          We use your information to call or email you about your project, send project-related
          communications, and maintain internal records. We do not sell your personal
          information.
        </p>
      </section>

      <section>
        <h2>Service providers</h2>
        <p className="mt-3">
          We rely on trusted vendors to run this website and our operations (for example:
          hosting, email delivery, and internal tools). Those providers may process data on our
          behalf under agreements that require appropriate safeguards.
        </p>
      </section>

      <section>
        <h2>Cookies and analytics</h2>
        <p className="mt-3">
          We may use first-party analytics to understand how visitors use our site (for example,
          page views and performance). You can control cookies through your browser settings.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p className="mt-3">
          You may ask us to update or delete your contact information by emailing{" "}
          <a
            className="font-semibold text-forge-navy underline decoration-forge-silver underline-offset-4 transition-colors hover:decoration-forge-navy"
            href={`mailto:${SITE.email}`}
          >
            {SITE.email}
          </a>{" "}
          or calling <TrackedPhoneNumber />. We will respond within a reasonable time.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p className="mt-3">
          We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at
          the top will change when we do.
        </p>
      </section>

      <p className="border-t border-forge-mist pt-6 text-[14px]">
        Questions?{" "}
        <Link href="/contact" className="font-semibold text-forge-navy underline decoration-forge-silver underline-offset-4 transition-colors hover:decoration-forge-navy">
          Contact us
        </Link>
        .
      </p>
    </LegalPage>
  );
}
