import Link from "next/link";
import { Fragment } from "react";

import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import type { Locale } from "@/i18n/config";
import { SHARED } from "@/i18n/copy/shared";
import { localizeHref } from "@/i18n/routes";

export type Crumb = {
  name: string;
  /** Omit for a non-linked trail step (e.g. "Company"). */
  href?: string;
};

/**
 * Hero breadcrumb: 13px silver, steel `/`, current page white. Emits the
 * BreadcrumbList JSON-LD for the linked trail plus the current page, unless
 * `jsonLd={false}` (the page already renders its own).
 *
 * Hrefs and `currentPath` are English paths; on a Spanish page (`locale="es"`)
 * they are mapped to the Spanish ones.
 */
export function Breadcrumb({
  trail,
  current,
  currentPath,
  jsonLd = true,
  className = "",
  locale = "en",
}: {
  /** Steps between Home and the current page. Home is implied. */
  trail: Crumb[];
  current: string;
  /** Path of the current page, for the JSON-LD item. */
  currentPath?: string;
  jsonLd?: boolean;
  className?: string;
  locale?: Locale;
}) {
  const ld = [
    ...trail.filter((c): c is Required<Crumb> => Boolean(c.href)).map((c) => ({ name: c.name, path: c.href })),
    ...(currentPath ? [{ name: current, path: currentPath }] : []),
  ];
  const t = SHARED[locale];
  return (
    <>
      <nav aria-label={t.breadcrumbAria} className={`flex flex-wrap items-center gap-2 text-[13px] text-forge-silver ${className}`}>
        <Link href={localizeHref("/", locale)} className="hover:text-white">
          {t.home}
        </Link>
        {trail.map((c) => (
          <Fragment key={c.name}>
            <span aria-hidden="true" className="text-forge-steel">
              /
            </span>
            {c.href ? (
              <Link href={localizeHref(c.href, locale)} className="hover:text-white">
                {c.name}
              </Link>
            ) : (
              <span>{c.name}</span>
            )}
          </Fragment>
        ))}
        <span aria-hidden="true" className="text-forge-steel">
          /
        </span>
        <span aria-current="page" className="text-white">
          {current}
        </span>
      </nav>
      {jsonLd && ld.length ? <BreadcrumbJsonLd items={ld} locale={locale} /> : null}
    </>
  );
}
