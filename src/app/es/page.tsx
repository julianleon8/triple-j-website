import type { Metadata } from "next";

import { HomePage } from "@/components/pages/HomePage";
import { localeAlternates, ogLocale } from "@/i18n/metadata";
import { HOME } from "@/i18n/pages/home";
import { getBuilds } from "@/lib/forge-builds";
import { fullTitle } from "@/lib/root-metadata";

const t = HOME.es.meta;

export const metadata: Metadata = {
  title: fullTitle(t.title),
  description: t.description,
  alternates: localeAlternates("/", "es"),
  openGraph: {
    title: t.ogTitle,
    description: t.ogDescription,
    url: "/es",
    type: "website",
    ...ogLocale("es"),
  },
};

// The builds strip and ticker read live gallery_items; refresh hourly so a
// job published in HQ shows up without a deploy.
export const revalidate = 3600;

export default async function Page() {
  const builds = await getBuilds({ order: "newest" });
  return <HomePage locale="es" builds={builds} />;
}
