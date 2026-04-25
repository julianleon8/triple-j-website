import Link from "next/link";

import { PhoneIcon, ArrowRightIcon } from "@/components/ui/icons";
import { TrackedPhoneLink } from "@/components/site/TrackedPhone";

/**
 * Sticky bottom call-to-action bar — mobile only.
 * Left: tap-to-call phone button.
 * Right: Get Quote anchor to homepage form.
 * Always visible on small screens so the phone is never more than one tap away.
 */
export function MobileCallBar() {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[color:var(--color-ink-900)]/95 backdrop-blur border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-2 gap-2 p-2">
        <TrackedPhoneLink
          surface="mobile_call_bar"
          mode="children-only"
          className="flex flex-col items-center justify-center h-12 rounded-md bg-[color:var(--color-brand-600)] hover:bg-[color:var(--color-brand-700)] text-white font-bold tracking-tight transition-colors"
        >
          <span className="flex items-center gap-2 leading-none">
            <PhoneIcon className="h-5 w-5" />
            <span>Call Now</span>
          </span>
          <span className="text-[10px] font-medium text-white/75 mt-0.5 tracking-wide">
            English · Español
          </span>
        </TrackedPhoneLink>
        <Link
          href="/#quote"
          className="flex items-center justify-center gap-2 h-12 rounded-md bg-white/10 hover:bg-white/20 text-white font-semibold tracking-tight transition-colors"
        >
          <span>Free Quote</span>
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
