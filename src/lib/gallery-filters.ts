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
];

export function resolveGalleryFilter(value: string | string[] | undefined): GalleryFilter {
  return GALLERY_FILTERS.find((filter) => filter.slug === value) ?? GALLERY_FILTERS[0];
}
