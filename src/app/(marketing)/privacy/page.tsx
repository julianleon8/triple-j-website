import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy Policy | Triple J Metal LLC',
  description:
    'How Triple J Metal LLC collects, uses, and protects information submitted through our website, email, and SMS channels.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
}

const LAST_UPDATED = 'April 21, 2026'

export default function PrivacyPage() {
  return (
    <>
      <section className="relative bg-ink-900 text-white py-16 md:py-20 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <Container className="relative">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400">
              Legal
            </span>
            <h1 className="mt-3 text-white">Privacy Policy</h1>
            <p className="mt-4 text-white/70 text-sm">Last updated {LAST_UPDATED}</p>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20 bg-white">
        <Container size="narrow">
          <div className="prose-content space-y-8 text-ink-700 leading-relaxed">
            <p className="text-lg">
              {SITE.name} (&ldquo;Triple J,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) respects
              your privacy. This policy explains what we collect when you use{' '}
              <span className="whitespace-nowrap">triplejjjmetal.com</span>, request a quote,
              or receive email/SMS from us, and how to get your data removed.
            </p>

            <div>
              <h2 className="mb-3">What we collect</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Quote form submissions</strong> — name, phone, email, city/ZIP,
                  service type, project details, and anything you write in the message box.
                </li>
                <li>
                  <strong>Call/text contact</strong> — when you call or text{' '}
                  <a href={SITE.phoneHref} className="text-brand-600 hover:underline">
                    {SITE.phone}
                  </a>
                  , your phone number is stored with our carrier records.
                </li>
                <li>
                  <strong>Email activity</strong> — whether our replies were delivered,
                  opened, or clicked (standard email-service telemetry, no content scraping).
                </li>
                <li>
                  <strong>Site analytics</strong> — anonymous request logs kept by our
                  hosting provider (Vercel) for uptime and abuse prevention.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3">Who we share it with</h2>
              <p>We don&rsquo;t sell your data. We use a short list of vendors to run the business:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>
                  <strong>Supabase</strong> — secure database where your quote request is
                  stored so we can follow up.
                </li>
                <li>
                  <strong>Resend</strong> — email delivery for the confirmation you receive
                  after submitting a quote and for our replies.
                </li>
                <li>
                  <strong>Twilio</strong> — SMS delivery for the automated acknowledgment
                  text and post-job review request.
                </li>
                <li>
                  <strong>Vercel</strong> — site hosting and serverless functions.
                </li>
              </ul>
              <p className="mt-3">
                Each vendor is bound by its own privacy terms and processes data only to
                provide the service we contracted them for.
              </p>
            </div>

            <div>
              <h2 className="mb-3">SMS messaging &amp; TCPA</h2>
              <p>
                When you submit a quote request, you consent to receive transactional SMS
                from Triple J at the number you provided. This includes a one-time
                auto-reply confirming we received your request and, after a completed job,
                a single follow-up asking for a Google review.
              </p>
              <p className="mt-3">
                <strong>Reply STOP at any time to opt out.</strong> Standard message and data
                rates may apply. We do not send marketing blasts, and we do not share your
                phone number with third parties for their own marketing.
              </p>
            </div>

            <div>
              <h2 className="mb-3">Cookies</h2>
              <p>
                We use essential cookies only — enough to keep the owner dashboard login
                session working. No advertising trackers, no cross-site pixels.
              </p>
            </div>

            <div>
              <h2 className="mb-3">Data retention &amp; deletion</h2>
              <p>
                We retain lead and customer records for as long as needed to service your
                project and meet our tax and warranty obligations. To request deletion of
                your data, email{' '}
                <a href={`mailto:${SITE.email}`} className="text-brand-600 hover:underline">
                  {SITE.email}
                </a>
                {' '}or call{' '}
                <a href={SITE.phoneHref} className="text-brand-600 hover:underline">
                  {SITE.phone}
                </a>
                . We&rsquo;ll confirm and remove your record within 30 days.
              </p>
            </div>

            <div>
              <h2 className="mb-3">Children</h2>
              <p>
                Our services are for adult property owners. We do not knowingly collect
                data from anyone under 18.
              </p>
            </div>

            <div>
              <h2 className="mb-3">Changes</h2>
              <p>
                If we materially change this policy, we&rsquo;ll update the &ldquo;Last
                updated&rdquo; date above. Substantial changes affecting existing customers
                will also be sent by email.
              </p>
            </div>

            <div>
              <h2 className="mb-3">Contact</h2>
              <p>
                Questions about privacy? Email{' '}
                <a href={`mailto:${SITE.email}`} className="text-brand-600 hover:underline">
                  {SITE.email}
                </a>
                {' '}or write to {SITE.name}, {SITE.address.street}, {SITE.address.city},{' '}
                {SITE.address.state} {SITE.address.zip}.
              </p>
            </div>

            <div className="pt-4 border-t border-ink-100">
              <Link href="/terms" className="text-sm text-brand-600 hover:underline">
                Read our Terms of Service →
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
