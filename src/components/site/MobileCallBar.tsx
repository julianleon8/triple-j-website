"use client";

import { usePathname } from "next/navigation";

import { PhoneIcon } from "@/components/ui/icons";
import { TrackedPhoneLink } from "@/components/site/TrackedPhone";
import { headerCta, onCtaClick } from "@/components/site/Header";

/**
 * Sticky bottom call bar under 900px: white "Call Now" (with the
 * English · Español subline) and an outline button that follows the page's
 * CTA — "Free Quote", "Message" on /contact, "Inquire" on /partners.
 */
export function MobileCallBar() {
  const cta = headerCta(usePathname());
  return (
    <div
      data-forge=""
      data-tone="dark"
      data-cta-location="mobile_call_bar"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-forge-silver/20 bg-[rgba(0,24,42,.95)] pb-[env(safe-area-inset-bottom)] backdrop-blur-[8px] min-[900px]:hidden"
    >
      <div className="grid grid-cols-2 gap-2 p-2">
        <TrackedPhoneLink
          surface="mobile_call_bar"
          mode="children-only"
          className="flex h-12 flex-col items-center justify-center rounded-[6px] bg-white font-bold text-forge-navy"
        >
          <span className="flex items-center gap-2 leading-none">
            <PhoneIcon width={18} height={18} aria-hidden="true" />
            <span>Call Now</span>
          </span>
          <span className="mt-0.5 text-[10px] font-medium tracking-[.03em] text-forge-slate">English · Español</span>
        </TrackedPhoneLink>
        <a
          href={cta.href}
          onClick={onCtaClick(cta.target)}
          className="flex h-12 items-center justify-center gap-2 rounded-[6px] border border-white/30 font-semibold text-white"
        >
          {cta.short} <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  );
}
