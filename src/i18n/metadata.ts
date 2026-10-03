import type { Metadata } from "next";

import type { Locale } from "./config";
import { OG_LOCALE } from "./config";
import { spanishPath } from "./routes";

/**
 * Canonical + `hreflang` for a page, given its English path. Every page that
 * exists in both languages names the pair and `x-default` (English), so
 * Google serves each searcher their language. English-only pages (legal)
 * keep a bare canonical. Relative URLs resolve against `metadataBase`.
 */
export function localeAlternates(enPath: string, locale: Locale): NonNullable<Metadata["alternates"]> {
  const esPath = spanishPath(enPath);
  if (esPath === null) return { canonical: enPath };
  return {
    canonical: locale === "es" ? esPath : enPath,
    languages: { en: enPath, es: esPath, "x-default": enPath },
  };
}

/** `og:locale` + `og:locale:alternate` for a page in the given language. */
export function ogLocale(locale: Locale): { locale: string; alternateLocale: string } {
  return locale === "es"
    ? { locale: OG_LOCALE.es, alternateLocale: OG_LOCALE.en }
    : { locale: OG_LOCALE.en, alternateLocale: OG_LOCALE.es };
}
