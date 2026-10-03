import type { ReactNode } from 'react'

import { RootDocument } from '@/components/site/RootDocument'
import { quoteLanguage } from '@/lib/quote-language'
import { rootMetadata, rootViewport } from '@/lib/root-metadata'

export const metadata = {
  ...rootMetadata('en'),
  // A customer's private quote link: never indexed (robots.ts also disallows /quotes).
  robots: { index: false, follow: false },
}
export const viewport = rootViewport

/**
 * Root layout for the customer quote-accept page. It lives under [token] so
 * the document's language can follow the customer's (a Spanish customer's
 * quote page is `<html lang="es">`).
 */
export default async function QuoteLayout({ children, params }: { children: ReactNode; params: Promise<{ token: string }> }) {
  const { token } = await params
  return <RootDocument locale={await quoteLanguage(token)}>{children}</RootDocument>
}
