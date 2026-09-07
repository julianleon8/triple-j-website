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
      className="scroll-mt-20 py-14 md:py-20 bg-paper-2 border-t border-ink-100"
    >
      <Container size="wide">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">
              Built by Triple J
            </span>
            <h2
              id="gallery-heading"
              className="mt-3 max-w-2xl text-4xl sm:text-5xl uppercase leading-none text-ink-900"
            >
              A few places we’ve left our mark.
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

        <div className="mt-9 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {(photos ?? []).map((p) => {
            const cover = pickCover(p.gallery_photos as GalleryPhoto[] | null);
            if (!cover) return null;
            return (
              <Link key={p.id} href={`/gallery/${p.id}`} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-ink-200">
                  <Image src={cover.url} alt={cover.alt || p.title} fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                    unoptimized={cover.url.startsWith("/")}
                  />
                </div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-ink-500">{p.city}</p>
                    <h3 className="mt-1 text-xl font-bold leading-tight text-ink-900">{p.title}</h3>
                  </div>
                  <ArrowRightIcon className="mt-1 h-5 w-5 shrink-0 text-brand-700" />
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
