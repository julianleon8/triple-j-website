import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { FacebookIcon, InstagramIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { TrackedPhoneLink } from "@/components/site/TrackedPhone";
import { FooterCurtain } from "@/components/site/FooterCurtain";
import { COMPANY_LINKS, SERVICES, SERVICE_CITIES, SITE } from "@/lib/site";

const linkCls = "transition-colors duration-200 hover:text-white";
const viewAllCls =
  "text-[12px] font-semibold uppercase tracking-[.08em] text-forge-steel transition-colors duration-200 hover:text-white";

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="m-0 text-[12px] font-semibold uppercase tracking-[.2em] text-forge-silver">{title}</h2>
      <ul className="mt-[18px] flex list-none flex-col gap-2.5 p-0 text-[14px]">{children}</ul>
    </div>
  );
}

/**
 * Forge footer: navy over the brushed-steel texture, brand column (lion,
 * Cinzel wordmark, tagline, NAP, socials) and three link columns driven by
 * site.ts. On the homepage the content slides up as the footer enters
 * (FooterCurtain).
 */
export function Footer() {
  const year = new Date().getFullYear();

  const content = (
    <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[clamp(36px,3vw,48px)] py-[clamp(56px,5vw,80px)]">
        <div className="min-[900px]:col-span-2">
          <Link
            href="/"
            aria-label={`${SITE.name} home`}
            className="inline-flex items-center gap-3.5 font-forge-display text-[clamp(24px,1vw_+_16px,30px)] font-black text-white"
          >
            <Image
              src="/images/logo-lion.png"
              alt="Triple J Metal lion emblem"
              width={56}
              height={56}
              className="size-14 flex-none object-contain"
            />
            {SITE.name}
          </Link>
          <p className="mt-5 max-w-[420px] text-[17px] font-semibold leading-[1.4] text-white">{SITE.tagline}</p>
          <p className="mt-2.5 max-w-[420px] text-[14px] text-forge-steel-light">
            Family-owned · Founded {SITE.established} · {SITE.stats.projects} jobs across Central Texas
          </p>
          <address className="mt-[22px] flex flex-col gap-2 text-[14px] not-italic text-forge-silver">
            <div className="flex items-start gap-2.5">
              <PinIcon width={16} height={16} aria-hidden="true" className="mt-0.5 flex-none text-forge-steel" />
              <span>
                {SITE.address.street}
                <br />
                {SITE.address.city}, {SITE.address.state} {SITE.address.zip}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <PhoneIcon width={16} height={16} aria-hidden="true" className="flex-none text-forge-steel" />
              <TrackedPhoneLink surface="footer" className="text-[16px] font-bold text-white tabular-nums" />
            </div>
          </address>
          <div className="mt-[22px] flex items-center gap-2.5">
            <a
              href={SITE.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Triple J Metal on Instagram"
              className="inline-flex size-9 items-center justify-center rounded-[8px] border border-forge-silver/25 text-forge-silver transition-colors duration-200 hover:border-white hover:text-white"
            >
              <InstagramIcon width={16} height={16} />
            </a>
            <a
              href={SITE.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Triple J Metal on Facebook"
              className="inline-flex size-9 items-center justify-center rounded-[8px] border border-forge-silver/25 text-forge-silver transition-colors duration-200 hover:border-white hover:text-white"
            >
              <FacebookIcon width={16} height={16} />
            </a>
          </div>
        </div>

        <Column title="Services">
          {SERVICES.map((s) => (
            <li key={s.title}>
              <Link href={s.href} className={linkCls}>
                {s.title}
              </Link>
            </li>
          ))}
          <li className="pt-1">
            <Link href="/services" className={viewAllCls}>
              View all →
            </Link>
          </li>
        </Column>

        <Column title="Service Areas">
          {SERVICE_CITIES.map((c) => (
            <li key={c.slug}>
              <Link href={`/locations/${c.slug}`} className={linkCls}>
                {c.name}
              </Link>
            </li>
          ))}
          <li className="pt-1">
            <Link href="/locations" className={viewAllCls}>
              View all →
            </Link>
          </li>
        </Column>

        <Column title="Company">
          {COMPANY_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={linkCls}>
                {l.label}
              </Link>
            </li>
          ))}
          <li className="pt-1">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- deliberate: Android in-app browsers swallow <Link>'s hash scroll (see ForgeButtonLink) */}
            <a
              href="/#quote"
              className="text-[12px] font-bold uppercase tracking-[.08em] text-forge-silver transition-colors duration-200 hover:text-white"
            >
              Get a Free Quote →
            </a>
          </li>
        </Column>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-forge-silver/15 py-[22px] text-[12px] text-forge-steel-light">
        <div>
          © {year} {SITE.legalName}. All rights reserved.
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span>{SITE.hours}</span>
          <span>English · Español</span>
          <Link href="/privacy" className={linkCls}>
            Privacy
          </Link>
          <Link href="/terms" className={linkCls}>
            Terms
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <footer
      data-forge=""
      data-tone="dark"
      className="relative z-0 overflow-hidden border-t border-forge-silver/15 bg-forge-navy text-white/80"
    >
      <Image
        src="/images/textures/footer-brushed-steel.png"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="pointer-events-none object-cover opacity-55"
        style={{ objectPosition: "50% 100%" }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "var(--scrim-footer)" }} />
      <FooterCurtain className="relative">{content}</FooterCurtain>
    </footer>
  );
}
