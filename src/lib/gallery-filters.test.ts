import { describe, expect, it } from "vitest";
import { resolveGalleryFilter } from "./gallery-filters";

describe("gallery URL filters", () => {
  it("groups both existing patio types without excluding porch covers", () => {
    expect(resolveGalleryFilter("patios").types).toEqual(["Lean-To", "Porch Cover"]);
  });
  it("falls back to all builds for absent, unknown, or repeated parameters", () => {
    for (const value of [undefined, "unknown", ["barns", "garages"]]) {
      expect(resolveGalleryFilter(value).types).toBeNull();
    }
  });
});

describe("filter counts", () => {
  it("counts each filter and hides the empty ones", async () => {
    const { filtersWithCounts } = await import("./gallery-filters");
    const counts = filtersWithCounts(["Carport", "Carport", "Barn", "Porch Cover"]);
    expect(counts.map((f) => [f.slug, f.count])).toEqual([
      ["all", 4],
      ["carports", 2],
      ["barns", 1],
      ["patios", 1],
    ]);
  });
});
