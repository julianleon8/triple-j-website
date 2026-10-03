import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CityPage } from "@/components/pages/CityPage";
import { localeAlternates, ogLocale } from "@/i18n/metadata";
import { CITY_PAGE } from "@/i18n/pages/locations";
import { filterByCities, getBuilds } from "@/lib/forge-builds";
import { LOCATION_SLUGS } from "@/lib/locations";
import { getLocation } from "@/lib/locations.es";

// City slugs are the same in both languages: /es/ciudades/temple.
export async function generateStaticParams() {
  return LOCATION_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: PageProps<"/es/ciudades/[slug]">,
): Promise<Metadata> {
  const { slug } = await params;
  const loc = getLocation(slug, "es");
  if (!loc) return {};
  return {
    title: loc.metaTitle,
    description: loc.metaDescription,
    keywords: [...CITY_PAGE.es.keywords(loc.name), ...(loc.military?.keywords ?? [])],
    openGraph: {
      title: loc.metaTitle,
      description: loc.metaDescription,
      type: "website",
      ...ogLocale("es"),
    },
    twitter: {
      card: "summary_large_image",
      title: loc.metaTitle,
      description: loc.metaDescription,
    },
    alternates: localeAlternates(`/locations/${slug}`, "es"),
  };
}

// "Obras cerca de" reads live gallery_items; refresh hourly.
export const revalidate = 3600;

export default async function Page(
  { params }: PageProps<"/es/ciudades/[slug]">,
) {
  const { slug } = await params;
  const loc = getLocation(slug, "es");
  if (!loc) notFound();

  // Only active projects recorded in the city (or its designed neighbours).
  const builds = filterByCities(await getBuilds({ order: "featured" }), loc.galleryCities ?? [loc.name]).slice(0, 8);

  return <CityPage locale="es" loc={loc} builds={builds} />;
}
