import Image from "next/image";
import Link from "next/link";

import { ForgeButtonLink } from "@/components/forge/ForgeButton";
import { Eyebrow } from "@/components/forge/Eyebrow";
import { buttonClass, type } from "@/components/forge/styles";
import { ArrowRightIcon } from "@/components/ui/icons";
import { CHROME } from "@/i18n/copy/chrome";
import type { Locale } from "@/i18n/config";
import { localizeHref } from "@/i18n/routes";
import { SITE } from "@/lib/site";

/**
 * The 404 body, in either language.
 *
 * Rendered three ways:
 *   - `app/global-not-found.tsx` — a URL that matches no route. It bypasses
 *     every layout, so it brings a slim brand bar (`standalone`) and points
 *     Spanish readers at /es.
 *   - `(marketing)/not-found.tsx` and `es/not-found.tsx` — a page's
 *     `notFound()` (unknown slug), inside that site's header and footer.
 *
 * Three explicit recovery links to the highest-converting surfaces: for a
 * contractor running paid ads, every typo'd or stale-indexed URL is
 * otherwise a hard bounce.
 */
export function NotFoundView({ locale, standalone = false }: { locale: Locale; standalone?: boolean }) {
  const c = CHROME[locale].notFound;
  const home = locale === "es" ? "/es" : "/";
  return (
    <div data-forge="" className="flex min-h-screen flex-col bg-forge-fog text-forge-navy" style={{ colorScheme: "light" }}>
      {standalone ? (
        <header data-forge="" data-tone="dark" className="border-b border-forge-silver/15 bg-forge-navy text-white">
          <div className="mx-auto flex h-[72px] w-full max-w-[1360px] items-center justify-between px-[clamp(20px,3vw,40px)]">
            <Link
              href={home}
              aria-label={CHROME[locale].homeLabel}
              className="inline-flex items-center gap-3 font-forge-display text-[22px] font-black text-white"
            >
              <Image src="/images/logo-lion.png" alt="" width={40} height={40} className="size-10 flex-none object-contain" />
              {SITE.name}
            </Link>
            <a href={SITE.phoneHref} className="text-[15px] font-semibold tabular-nums text-white/85 transition-colors hover:text-white">
              {SITE.phone}
            </a>
          </div>
        </header>
      ) : null}

      <div className="flex-1 py-[clamp(64px,8vw,112px)]">
        <div className="mx-auto w-full max-w-[760px] px-[clamp(20px,3vw,40px)]">
          <div className="flex flex-col items-center text-center">
            <Eyebrow align="center">{c.eyebrow}</Eyebrow>
            <h1 className={`mt-[18px] ${type.h2} text-forge-navy`}>{c.heading}</h1>
            <p className={`mx-auto mt-5 max-w-[560px] ${type.lede} text-forge-slate`}>{c.body}</p>
          </div>

          <ul className="mt-12 flex flex-col gap-3">
            {c.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={localizeHref(link.href, locale)}
                  className="group flex items-start justify-between gap-4 rounded-[12px] border border-forge-silver bg-white px-6 py-5 transition-colors duration-200 hover:border-forge-steel"
                >
                  <div>
                    <p className="font-forge-display text-[19px] font-bold text-forge-navy">{link.label}</p>
                    <p className="mt-1 text-[14px] text-forge-slate">{link.description}</p>
                  </div>
                  <ArrowRightIcon className="mt-1 h-5 w-5 shrink-0 text-forge-steel transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-forge-navy" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <ForgeButtonLink href={home} variant="navy" size="lg">
              {c.home}
            </ForgeButtonLink>
            <a href={SITE.phoneHref} className={buttonClass("outlineLight", "lg")}>
              {c.call} <span className="tabular-nums">{SITE.phone}</span>
            </a>
          </div>

          {standalone ? (
            <p lang={locale === "es" ? "en" : "es"} className="mt-10 text-center text-[15px] text-forge-slate">
              {c.otherLanguage}{" "}
              <a href={locale === "es" ? "/" : "/es"} className="font-semibold text-forge-navy underline underline-offset-4">
                {c.otherLanguageLink}
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
