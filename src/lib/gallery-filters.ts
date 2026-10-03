import type { Locale } from "@/i18n/config";

/** `label` is the English filter name; `es` is the same filter on the Spanish site. */
type GalleryFilter = { slug: string; label: string; es: string; types: string[] | null };

// These map to the existing gallery type values; no project data is reclassified.
export const GALLERY_FILTERS: GalleryFilter[] = [
  { slug: "all", label: "All builds", es: "Todas las obras", types: null },
  { slug: "carports", label: "Carports", es: "Cocheras", types: ["Carport"] },
  { slug: "garages", label: "Garages", es: "Garajes", types: ["Garage"] },
  { slug: "barns", label: "Barns", es: "Graneros", types: ["Barn"] },
  { slug: "rv-covers", label: "RV covers", es: "Cubiertas para RV", types: ["RV Cover"] },
  { slug: "patios", label: "Patios & porches", es: "Patios y porches", types: ["Lean-To", "Porch Cover"] },
  { slug: "custom", label: "Custom builds", es: "Obras a la medida", types: ["Hybrid", "Other"] },
  // Shown only once the gallery has fencing projects (empty filters are hidden).
  { slug: "fencing", label: "Fencing", es: "Cercas", types: ["Fencing"] },
];

export function resolveGalleryFilter(value: string | string[] | undefined): GalleryFilter {
  return GALLERY_FILTERS.find((filter) => filter.slug === value) ?? GALLERY_FILTERS[0];
}

/** The filter's name in the page's language. */
export function filterLabel(filter: Pick<GalleryFilter, "label" | "es">, locale: Locale): string {
  return locale === "es" ? filter.es : filter.label;
}

export function matchesFilter(filter: GalleryFilter, type: string): boolean {
  return filter.types === null || filter.types.includes(type);
}

/** Filters with their item counts; every filter but "All builds" is dropped at zero. */
export function filtersWithCounts(types: readonly string[]): Array<GalleryFilter & { count: number }> {
  return GALLERY_FILTERS.map((f) => ({ ...f, count: types.filter((t) => matchesFilter(f, t)).length })).filter(
    (f) => f.types === null || f.count > 0,
  );
}
