/**
 * Live gallery builds for Forge pages: the homepage strip and ticker, service
 * and location "Recent builds", Partners' featured builds and the gallery grid.
 *
 * Always real active `gallery_items` (Locked Decisions: the ticker and builds
 * are never invented). A failed or unconfigured query yields an empty list, and
 * every caller hides its section rather than rendering a placeholder.
 */

import { getAdminClient } from "@/lib/supabase/admin";

export type BuildItem = {
  id: string;
  title: string;
  city: string;
  type: string;
  img: string;
  alt: string;
  featured: boolean;
  createdAt: string | null;
  /** Welded | Bolted | Turnkey */
  tag: string | null;
};

type PhotoRow = { image_url: string; alt_text: string | null; sort_order: number | null; is_cover: boolean | null };

type ItemRow = {
  id: string;
  title: string;
  city: string | null;
  type: string | null;
  alt_text: string | null;
  is_featured: boolean | null;
  created_at: string | null;
  tag?: string | null;
  gallery_photos: PhotoRow[] | null;
};

export function pickCoverPhoto(photos: PhotoRow[] | null | undefined): PhotoRow | null {
  const list = [...(photos ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  return list.find((p) => p.is_cover) ?? list[0] ?? null;
}

export function toBuildItem(row: ItemRow): BuildItem | null {
  const cover = pickCoverPhoto(row.gallery_photos);
  if (!cover) return null;
  return {
    id: row.id,
    title: row.title,
    city: (row.city ?? "").trim() || "Central Texas",
    type: (row.type ?? "").trim() || "Build",
    img: cover.image_url,
    alt: cover.alt_text || row.alt_text || row.title,
    featured: Boolean(row.is_featured),
    createdAt: row.created_at,
    tag: row.tag ?? null,
  };
}

/**
 * Active builds with a photo. `newest` orders by created_at (homepage strip,
 * ticker); `featured` keeps the gallery's featured-then-sort_order order.
 */
export async function getBuilds({
  order = "newest",
  limit,
}: {
  order?: "newest" | "featured";
  limit?: number;
} = {}): Promise<BuildItem[]> {
  try {
    let q = getAdminClient()
      .from("gallery_items")
      .select("id, title, city, type, tag, alt_text, is_featured, created_at, gallery_photos ( image_url, alt_text, sort_order, is_cover )")
      .eq("is_active", true);
    q =
      order === "newest"
        ? q.order("created_at", { ascending: false })
        : q.order("is_featured", { ascending: false }).order("sort_order", { ascending: true });
    const { data, error } = await q;
    if (error || !data) return [];
    const items = (data as unknown as ItemRow[]).map(toBuildItem).filter((b): b is BuildItem => b !== null);
    return typeof limit === "number" ? items.slice(0, limit) : items;
  } catch {
    return [];
  }
}

/** Builds whose `type` is one of `types` (case-insensitive). */
export function filterByTypes(items: BuildItem[], types: readonly string[]): BuildItem[] {
  const want = new Set(types.map((t) => t.toLowerCase()));
  return items.filter((b) => want.has(b.type.toLowerCase()));
}

/** Builds whose city matches one of `cities` (case-insensitive, ignores ", TX"). */
export function filterByCities(items: BuildItem[], cities: readonly string[]): BuildItem[] {
  const norm = (c: string) => c.toLowerCase().replace(/,\s*tx$/, "").trim();
  const want = new Set(cities.map(norm));
  return items.filter((b) => want.has(norm(b.city)));
}
