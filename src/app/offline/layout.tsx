import type { ReactNode } from 'react'

import { RootDocument } from '@/components/site/RootDocument'
import { rootMetadata, rootViewport } from '@/lib/root-metadata'

export const metadata = rootMetadata('en')
export const viewport = rootViewport

/** Root layout for the service-worker offline shell (HQ PWA). */
export default function OfflineLayout({ children }: { children: ReactNode }) {
  return <RootDocument locale="en">{children}</RootDocument>
}
