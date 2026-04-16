import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { getAdminClient } from "@/lib/supabase/admin";

export async function Gallery() {
  const { data: photos } = await getAdminClient()
    .from("gallery_items")
    .select("id, image_url, alt_text, title, city")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(6)
  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="py-20 md:py-28 bg-paper-2 border-t border-ink-100"
    >
      <Container size="wide">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 max-w-4xl">
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
        </div>

        {/* Asymmetric grid — first cell spans 2 columns on desktop */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[220px]">
          {(photos ?? []).map((p, idx) => (
            <figure
              key={p.id}
              className={`group relative overflow-hidden rounded-xl bg-ink-200 ${
                idx === 0 ? "col-span-2 row-span-2" : ""
              }`}
            >
              <Image
                src={p.image_url}
                alt={p.alt_text || p.title}
                fill
                sizes={
                  idx === 0
                    ? "(max-width: 768px) 100vw, 50vw"
                    : "(max-width: 768px) 50vw, 25vw"
                }
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized={p.image_url.startsWith("/")}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              <figcaption className="absolute bottom-3 left-3 right-3 text-white">
                <div className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">
                  {p.city}
                </div>
                <div className="font-bold text-sm md:text-base leading-tight">
                  {p.title}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
