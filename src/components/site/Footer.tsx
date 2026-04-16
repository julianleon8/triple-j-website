import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { PhoneIcon, PinIcon } from "@/components/ui/icons";
import { NAV_LINKS, SERVICES, SERVICE_CITIES, SITE } from "@/lib/site";

/**
 * Footer — four columns with NAP (Name / Address / Phone).
 * Serves double-duty as local-SEO real estate:
 *   - Structured address
 *   - City links pointing to /locations/[slug]
 *   - Service links
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[color:var(--color-ink-900)] text-white/80 mt-24">
      <Container size="wide">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-16">
          {/* Col 1 — Brand + NAP */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-3"
              aria-label={SITE.name}
            >
              <Image
                src="/images/logo-lion.png"
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
              />
              <span className="font-extrabold text-white text-lg tracking-tight">
                Triple J Metal
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Family-owned, Temple-based metal building company. Welded red-iron
              carports, garages, and barns — welded or bolted, same-week installs.
            </p>
            <address className="mt-5 not-italic text-sm text-white/70 space-y-2">
              <div className="flex items-start gap-2">
                <PinIcon className="h-4 w-4 mt-0.5 shrink-0 text-white/40" />
                <span>
                  {SITE.address.street}
                  <br />
                  {SITE.address.city}, {SITE.address.state} {SITE.address.zip}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 shrink-0 text-white/40" />
                <a
                  href={SITE.phoneHref}
                  className="font-semibold text-white hover:text-[color:var(--color-brand-300)]"
                >
                  {SITE.phone}
                </a>
              </div>
            </address>
          </div>

          {/* Col 2 — Services */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase">
              Services
            </h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="text-white/70 hover:text-white"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/services"
                  className="text-white/50 hover:text-white"
                >
                  View all →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 — Service Cities */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase">
              Service Areas
            </h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              {SERVICE_CITIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/locations/${c.slug}`}
                    className="text-white/70 hover:text-white"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact / Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase">
              Company
            </h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/#quote"
                  className="text-[color:var(--color-brand-300)] font-semibold hover:text-white"
                >
                  Get a Free Quote →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal / bottom strip */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-white/40">
          <div>
            © {year} {SITE.name}. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white/70">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white/70">
              Terms
            </Link>
            <Link href="/login" className="hover:text-white/70">
              Owner Login
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
