import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SITE } from "@/lib/site";
import { getAdminClient } from "@/lib/supabase/admin";

export async function Gallery() {
  const { data: photos } = await getAdminClient()
    .from("gallery_items")
    .select("id, image_url, alt_text, title, city")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(6)
  const hasPhotos = (photos?.length ?? 0) > 0
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
          {hasPhotos && (
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:gap-2 transition-all"
            >
              See full portfolio
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          )}
        </div>

        {hasPhotos ? (
          /* Asymmetric grid — first cell spans 2 columns on desktop */
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[220px]">
            {(photos ?? []).map((p, idx) => {
              const altText =
                (p.alt_text && p.alt_text.trim().length > 0)
                  ? p.alt_text
                  : `${p.title} — ${SITE.shortName}${p.city ? `, ${p.city}` : ""}`
              return (
                <figure
                  key={p.id}
                  className={`group relative overflow-hidden rounded-xl bg-ink-200 ${
                    idx === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                >
                  <Image
                    src={p.image_url}
                    alt={altText}
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
              )
            })}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-ink-200 bg-white/60 px-6 py-16 text-center">
            <div className="mx-auto max-w-md">
              <div className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">
                Gallery
              </div>
              <h3 className="mt-3 text-xl md:text-2xl font-bold text-ink-900">
                Photos coming soon
              </h3>
              <p className="mt-3 text-ink-500 leading-relaxed">
                We&rsquo;re staging new project shots from recent Central Texas
                builds. In the meantime, call us and we&rsquo;ll share references
                and past jobs directly.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center h-11 px-5 rounded-lg bg-(--color-brand-600) hover:bg-(--color-brand-700) text-white font-semibold text-sm transition-colors"
                >
                  Request a quote
                </Link>
                <a
                  href={SITE.phoneHref}
                  className="inline-flex items-center justify-center h-11 px-5 rounded-lg border-2 border-ink-300 text-ink-800 font-semibold text-sm hover:border-ink-500 transition-colors"
                >
                  Call {SITE.phone}
                </a>
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
