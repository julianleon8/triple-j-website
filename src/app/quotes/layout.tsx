import type { ReactNode } from 'react'

import { RootDocument } from '@/components/site/RootDocument'
import { rootMetadata, rootViewport } from '@/lib/root-metadata'

export const metadata = {
  ...rootMetadata('en'),
  // A customer's private quote link: never indexed (robots.ts also disallows /quotes).
  robots: { index: false, follow: false },
}
export const viewport = rootViewport

/** Root layout for the customer quote-accept page. */
export default function QuotesLayout({ children }: { children: ReactNode }) {
  return <RootDocument locale="en">{children}</RootDocument>
}
