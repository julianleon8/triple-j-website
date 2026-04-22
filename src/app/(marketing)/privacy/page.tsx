import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.shortName} collects, uses, and protects information when you use this website or request a quote.`,
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <Container size="narrow">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--color-brand-700)]">
          Legal
        </p>
        <h1 className="mt-3 text-[color:var(--color-ink-900)]">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[color:var(--color-ink-500)]">
          Last updated April 22, 2026 · {SITE.name}
        </p>

        <div className="mt-10 space-y-8 text-[color:var(--color-ink-700)] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[color:var(--color-ink-900)]">
              Information we collect
            </h2>
            <p className="mt-3">
              When you submit a quote request or contact us, we collect the details you provide
              (such as name, phone, email, ZIP code, project description, and any optional fields
              on the form). We use this information only to respond to your request and to operate
              our business.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[color:var(--color-ink-900)]">
              How we use information
            </h2>
            <p className="mt-3">
              We use your information to call or email you about your project, send project-related
              communications, and maintain internal records. We do not sell your personal
              information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[color:var(--color-ink-900)]">
              Service providers
            </h2>
            <p className="mt-3">
              We rely on trusted vendors to run this website and our operations (for example:
              hosting, email delivery, and internal tools). Those providers may process data on our
              behalf under agreements that require appropriate safeguards.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[color:var(--color-ink-900)]">
              Cookies and analytics
            </h2>
            <p className="mt-3">
              We may use first-party analytics to understand how visitors use our site (for example,
              page views and performance). You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[color:var(--color-ink-900)]">
              Your choices
            </h2>
            <p className="mt-3">
              You may ask us to update or delete your contact information by emailing{" "}
              <a
                className="font-semibold text-[color:var(--color-brand-700)] underline"
                href={`mailto:${SITE.email}`}
              >
                {SITE.email}
              </a>{" "}
              or calling {SITE.phone}. We will respond within a reasonable time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[color:var(--color-ink-900)]">
              Changes
            </h2>
            <p className="mt-3">
              We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at
              the top will change when we do.
            </p>
          </section>

          <p className="pt-4 text-sm text-[color:var(--color-ink-500)]">
            Questions?{" "}
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
