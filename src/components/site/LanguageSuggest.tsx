"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { localeFromPath } from "@/i18n/config";
import { counterpartPath } from "@/i18n/routes";

const DISMISS_KEY = "tj_lang_suggest_dismissed";

/**
 * A one-line offer of the Spanish page, shown on an English page only when
 * the browser's own language is Spanish. Never a redirect: Google advises
 * against redirecting by language, and a bilingual reader may want English.
 * Dismissal is remembered in this browser; storage can be unavailable
 * (private mode), in which case the bar simply shows again next visit.
 */
export function LanguageSuggest() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localeFromPath(pathname) !== "en") return;
    const prefersSpanish = (navigator.languages?.length ? navigator.languages : [navigator.language]).some((l) =>
      l?.toLowerCase().startsWith("es"),
    );
    if (!prefersSpanish) return;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      // Storage blocked: show the bar.
    }
    // Reads browser-only state, so it can only be decided after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!dismissed) setShow(true);
  }, [pathname]);

  if (!show || localeFromPath(pathname) !== "en") return null;

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Private mode: it only stays hidden for this page view.
    }
  };

  return (
    <div lang="es" data-forge="" data-tone="dark" className="bg-forge-navy-raised text-white">
      <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4 px-[clamp(20px,3vw,40px)] py-2.5 text-[14px]">
        <a href={counterpartPath(pathname)} hrefLang="es" className="font-semibold underline underline-offset-4">
          ¿Prefieres español? Ver esta página en español →
        </a>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar"
          className="inline-flex size-9 flex-none cursor-pointer items-center justify-center rounded-[6px] text-white/70 hover:text-white"
        >
          ×
        </button>
      </div>
    </div>
  );
}
