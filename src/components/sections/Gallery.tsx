import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import { getAdminClient } from "@/lib/supabase/admin";

type GalleryPhoto = {
  id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
};

function pickCover(
  photos: GalleryPhoto[] | null | undefined,
): { url: string; alt: string | null } | null {
  const list = photos ?? [];
  const cover = list.find((p) => p.is_cover) ?? list[0];
  if (!cover) return null;
  return { url: cover.image_url, alt: cover.alt_text };
}

export async function Gallery() {
  const { data: photos } = await getAdminClient()
    .from("gallery_items")
    .select(
      `
      id, alt_text, title, city, is_featured,
      gallery_photos ( id, image_url, alt_text, sort_order, is_cover )
      `,
    )
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(6);
  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="py-20 md:py-28 bg-paper-2 border-t border-ink-100"
    >
      <Container size="wide">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 max-w-4xl">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">
              Recent Builds
            </span>
            <h2
              id="gallery-heading"
              className="mt-3 text-ink-900"
            >
              Real Central Texas jobs. Same-week builds, not month-long wait lists.
            </h2>
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:gap-2 transition-all"
          >
            See full portfolio
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </Reveal>

        {/* Asymmetric grid — first cell spans 2 columns on desktop.
            is_featured-sorted first from the query so the hero cell
            picks up the featured item naturally. */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[220px]">
          {(photos ?? []).map((p, idx) => {
            const cover = pickCover(p.gallery_photos as GalleryPhoto[] | null);
            if (!cover) return null;
            return (
              <Link
                key={p.id}
                href={`/gallery/${p.id}`}
                className={`group relative overflow-hidden rounded-xl bg-ink-200 ${
                  idx === 0 ? "col-span-2 row-span-2" : ""
                }`}
              >
                <Image
                  src={cover.url}
                  alt={cover.alt || p.title}
                  fill
                  sizes={
                    idx === 0
                      ? "(max-width: 768px) 100vw, 50vw"
                      : "(max-width: 768px) 50vw, 25vw"
                  }
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized={cover.url.startsWith("/")}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">
                    {p.city}
                  </div>
                  <div className="font-bold text-sm md:text-base leading-tight">
                    {p.title}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
