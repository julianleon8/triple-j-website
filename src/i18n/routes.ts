import type { Locale } from "./config";

/**
 * The one owner of every English ↔ Spanish URL pair (Locked Decisions →
 * Spanish site, 2026-10-03). English URLs never change; Spanish lives under
 * `/es` with Spanish words in the path. Links, metadata (`hreflang`), the
 * sitemap, the language switch and scripts/check-links.mjs all read this
 * file, so a Spanish URL is spelled in exactly one place.
 *
 * Code keeps writing English hrefs (`/services/carports`); a Spanish page
 * passes them through `localizeHref(href, "es")`.
 */

/** Fixed pages. `null` = English-only (legal pages, owner 2026-10-03). */
export const STATIC_ROUTES: Record<string, string | null> = {
  "/": "/es",
  "/about": "/es/nosotros",
  "/contact": "/es/contacto",
  "/quote": "/es/cotizacion",
  "/thank-you": "/es/gracias",
  "/services": "/es/servicios",
  "/services/colors": "/es/servicios/colores",
  "/services/pbr-vs-pbu-panels": "/es/servicios/paneles-pbr-vs-pbu",
  "/services/hybrid-projects": "/es/servicios/proyectos-hibridos",
  "/locations": "/es/ciudades",
  "/military": "/es/militares",
  "/blog": "/es/blog",
  "/gallery": "/es/galeria",
  "/partners": "/es/socios",
  "/best-metal-carport-builders-temple-tx": "/es/mejores-constructores-de-cocheras-temple-tx",
  "/privacy": null,
  "/terms": null,
};

/** `/services/[slug]` → `/es/servicios/[slug]`. Every service needs one. */
export const SERVICE_SLUG_ES: Record<string, string> = {
  "metal-fencing": "cercas-metalicas",
  gates: "portones",
  carports: "cocheras",
  "turnkey-carports-with-concrete": "cocheras-llave-en-mano-con-concreto",
  "metal-garages": "garajes-metalicos",
  barns: "graneros-metalicos",
  "rv-covers": "cubiertas-para-rv",
  "hoa-compliant-structures": "estructuras-para-hoa",
};

/** `/blog/[slug]` → `/es/blog/[slug]`. Every post needs one. */
export const POST_SLUG_ES: Record<string, string> = {
  "welded-vs-bolted-metal-buildings-central-texas": "soldado-vs-atornillado-edificios-metalicos-centro-de-texas",
  "bell-county-metal-building-permit-guide": "guia-de-permisos-edificios-metalicos-condado-de-bell",
  "fort-cavazos-pcs-metal-carport": "fort-cavazos-pcs-cochera-metalica",
  "blackland-prairie-soil-metal-building-foundation": "suelo-blackland-prairie-cimientos-edificios-metalicos",
  "hoa-compliant-metal-buildings-heritage-oaks-bella-charca": "edificios-metalicos-hoa-heritage-oaks-bella-charca",
};

/**
 * Dynamic families whose slug is the same in both languages (city names,
 * competitor brand names, gallery ids) or mapped through a table above.
 */
const FAMILIES: { en: string; es: string; slugs?: Record<string, string> }[] = [
  { en: "/services/", es: "/es/servicios/", slugs: SERVICE_SLUG_ES },
  { en: "/locations/", es: "/es/ciudades/" },
  { en: "/alternatives/", es: "/es/alternativas/" },
  { en: "/blog/", es: "/es/blog/", slugs: POST_SLUG_ES },
  { en: "/gallery/", es: "/es/galeria/" },
];

const STATIC_ES_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(STATIC_ROUTES)
    .filter((entry): entry is [string, string] => entry[1] !== null)
    .map(([en, es]) => [es, en]),
);

function invert(map: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));
}
const INVERTED = new Map(FAMILIES.map((f) => [f, f.slugs ? invert(f.slugs) : undefined]));

/** Split "/a/b?x=1#y" into ["/a/b", "?x=1#y"]. */
function splitHref(href: string): [string, string] {
  const i = href.search(/[?#]/);
  if (i === -1) return [href, ""];
  return [href.slice(0, i), href.slice(i)];
}

function trimSlash(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

/** The Spanish path for an English one, or null when there is no Spanish page. */
export function spanishPath(enPath: string): string | null {
  const path = trimSlash(enPath);
  if (path in STATIC_ROUTES) return STATIC_ROUTES[path];
  for (const f of FAMILIES) {
    if (!path.startsWith(f.en)) continue;
    const slug = path.slice(f.en.length);
    if (!slug || slug.includes("/")) return null;
    if (f.slugs) return f.slugs[slug] ? f.es + f.slugs[slug] : null;
    return f.es + slug;
  }
  return null;
}

/** The English path for a Spanish one, or null when it is not a known Spanish page. */
export function englishPath(esPath: string): string | null {
  const path = trimSlash(esPath);
  if (path in STATIC_ES_TO_EN) return STATIC_ES_TO_EN[path];
  for (const f of FAMILIES) {
    if (!path.startsWith(f.es)) continue;
    const slug = path.slice(f.es.length);
    if (!slug || slug.includes("/")) return null;
    const inverted = INVERTED.get(f);
    if (inverted) return inverted[slug] ? f.en + inverted[slug] : null;
    return f.en + slug;
  }
  return null;
}

/**
 * An internal English href in the given language. Query and hash are kept
 * (`/quote?service=carport` → `/es/cotizacion?service=carport`). External
 * links, hashes, `tel:`/`mailto:` and English-only pages pass through.
 */
export function localizeHref(href: string, locale: Locale): string {
  if (locale === "en" || !href.startsWith("/")) return href;
  const [path, rest] = splitHref(href);
  const es = spanishPath(path);
  return es === null ? href : es + rest;
}

/**
 * The same page in the other language, for the language switch. Falls back
 * to the other language's homepage when the page has no counterpart.
 */
export function counterpartPath(pathname: string): string {
  const [path] = splitHref(pathname);
  const isSpanish = path === "/es" || path.startsWith("/es/");
  if (isSpanish) return englishPath(path) ?? "/";
  return spanishPath(path) ?? "/es";
}
