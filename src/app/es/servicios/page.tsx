import type { Metadata } from "next";

import { ServicesIndexPage } from "@/components/pages/ServicesIndexPage";
import { localeAlternates } from "@/i18n/metadata";
import { SERVICES_INDEX } from "@/i18n/pages/services-index";

const t = SERVICES_INDEX.es.meta;

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: localeAlternates("/services", "es"),
};

export default function ServicesPage() {
  return <ServicesIndexPage locale="es" />;
}
