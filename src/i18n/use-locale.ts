"use client";

import { usePathname } from "next/navigation";

import { localeFromPath, type Locale } from "./config";

/** The page's language in a client component: anything under `/es` is Spanish. */
export function useLocale(): Locale {
  return localeFromPath(usePathname());
}
