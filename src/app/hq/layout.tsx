import type { Viewport } from 'next'
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
  // Overrides the root layout's light/dark pair — HQ is dark on both.
  themeColor: '#0b0d0f',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hq-ui font-(family-name:--font-ios)">
      <HqChrome>{children}</HqChrome>
    </div>
  )
}
