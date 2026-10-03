import type { Viewport } from 'next'
import { RootDocument } from '@/components/site/RootDocument'
import { rootMetadata, rootViewport } from '@/lib/root-metadata'
import HqChrome from './components/HqChrome'

/**
 * HQ is a forced-dark surface — `hq-ui` remaps the semantic tokens for this
 * whole subtree (see the .hq-ui block in globals.css). It must stay on the
 * outermost wrapper: the header and bottom tab bar are siblings of <main>
 * inside HqChrome, so scoping any deeper would leave the chrome light.
 *
 * `font-(family-name:--font-ios)` — the `family-name:` prefix is load-bearing.
 * Tailwind v4's `font-*` namespace covers both family and weight, and the bare
 * `font-(…)` shorthand resolves to font-WEIGHT: it compiled to
 * `font-weight: -apple-system, …`, which is invalid and dropped, so HQ silently
 * inherited Inter from body for the life of that class.
 */
export const viewport: Viewport = {
  ...rootViewport,
  // Overrides the public site's navy — HQ is dark on both schemes.
  themeColor: '#0b0d0f',
}

// HQ is a root layout of its own (2026-10-03, when the public site split
// into English and Spanish roots), so it restates the document metadata the
// shared root used to give it: metadataBase, the title template, appleWebApp.
export const metadata = rootMetadata('en')

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootDocument locale="en">
      <div className="hq-ui font-(family-name:--font-ios)">
        <HqChrome>{children}</HqChrome>
      </div>
    </RootDocument>
  )
}
