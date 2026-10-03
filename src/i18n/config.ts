/**
 * The site's two languages (Locked Decisions → Spanish site, 2026-10-03).
 *
 * English is the default and keeps every URL it had; Spanish lives under
 * `/es` with Spanish words in its paths (see routes.ts).
 */
export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** `<html lang>` and `hrefLang` on the language switch. */
export const HTML_LANG: Record<Locale, string> = { en: "en", es: "es" };

/** JSON-LD `inLanguage`. */
export const LANG_TAG: Record<Locale, string> = { en: "en-US", es: "es-US" };

/** Open Graph `og:locale`. */
export const OG_LOCALE: Record<Locale, string> = { en: "en_US", es: "es_US" };

/** `toLocaleDateString` / `Intl` locale. */
export const INTL_LOCALE: Record<Locale, string> = { en: "en-US", es: "es-US" };

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "es";
}

/** The language a path is in: anything under `/es` is Spanish. */
export function localeFromPath(pathname: string | null | undefined): Locale {
  if (!pathname) return DEFAULT_LOCALE;
  return pathname === "/es" || pathname.startsWith("/es/") || pathname.startsWith("/es?") || pathname.startsWith("/es#")
    ? "es"
    : "en";
}

/**
 * One piece of copy in both languages. The Spanish side must have exactly the
 * English side's shape — TypeScript rejects a missing or extra key — so the
 * two can sit side by side and never drift structurally.
 */
export function bilingual<T>(en: T, es: NoInfer<T>): Record<Locale, T> {
  return { en, es };
}

/** Format a date in the page's language: "October 3, 2026" / "3 de octubre de 2026". */
export function formatLongDate(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(INTL_LOCALE[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
