/**
 * Shell for the auth pages (/login, /setup). A route group, so the URLs are
 * unchanged.
 *
 * This layout owns the background/text pairing, and that is the whole point of
 * it existing. Both pages used to hardcode a `bg-white` card and set no text
 * colour; since `globals.css` opts the document into `color-scheme: light dark`
 * and `body` inherits `--text-primary`, OS dark mode painted the heading, every
 * placeholder and every typed character near-white on white. They were the only
 * two pages with neither the `(marketing)` light-mode guard nor HQ's tokens.
 *
 * Surfaces and text are both tokens here, so they move together and cannot
 * drift apart again. Same container pattern as HqChrome — this is the door to
 * HQ, so it should look like what is behind it.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-(family-name:--font-ios) min-h-dvh flex-1 bg-(--surface-1) text-(--text-primary) flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-8 shadow-xl">
        {children}
      </div>
    </div>
  )
}
