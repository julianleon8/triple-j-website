import Image from 'next/image'
import { SITE } from '@/lib/site'

/**
 * Shared lockup so both auth pages open identically.
 *
 * Kept out of layout.tsx on purpose: Next 16 validates the exports of route
 * modules, so a layout file may not export anything but the layout itself.
 */
export function AuthHeader({ subtitle }: { subtitle: string }) {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <Image
        src="/images/logo-lion.png"
        alt=""
        width={56}
        height={56}
        priority
        className="h-14 w-14 object-contain"
      />
      <h1 className="mt-3 text-[22px] font-bold tracking-tight text-(--text-primary)">
        {SITE.name}
      </h1>
      <p className="mt-1 text-[13px] text-(--text-secondary)">{subtitle}</p>
    </div>
  )
}
