type GalleryFilter = { slug: string; label: string; types: string[] | null };

// These map to the existing gallery type values; no project data is reclassified.
export const GALLERY_FILTERS: GalleryFilter[] = [
  { slug: "all", label: "All builds", types: null },
  { slug: "carports", label: "Carports", types: ["Carport"] },
  { slug: "garages", label: "Garages", types: ["Garage"] },
  { slug: "barns", label: "Barns", types: ["Barn"] },
  { slug: "rv-covers", label: "RV covers", types: ["RV Cover"] },
  { slug: "patios", label: "Patios & porches", types: ["Lean-To", "Porch Cover"] },
  { slug: "custom", label: "Custom builds", types: ["Hybrid", "Other"] },
  // Shown only once the gallery has fencing projects (empty filters are hidden).
  { slug: "fencing", label: "Fencing", types: ["Fencing"] },
];

export function resolveGalleryFilter(value: string | string[] | undefined): GalleryFilter {
  return GALLERY_FILTERS.find((filter) => filter.slug === value) ?? GALLERY_FILTERS[0];
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
