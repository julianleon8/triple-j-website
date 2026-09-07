/**
 * Who counts as the owner.
 *
 * This is the single definition of that rule. It used to live inline in
 * proxy.ts, which meant the pages enforced "is this Julian?" while all 47 auth
 * checks under src/app/api enforced only "is anyone signed in?" — so a
 * non-owner account was locked out of /hq but could still PATCH leads, create
 * quotes and hard-delete records through the API directly.
 *
 * Deliberately dependency-free: proxy.ts imports this, and Next's own guidance
 * is that the proxy is an *optimistic* check rather than the authorization
 * boundary, so the same predicate has to be callable from the route layer too.
 */

/** OWNER_EMAIL, the comma-separated allowlist. Doubles as the alert recipients. */
export function ownerEmails(): string[] {
  return (
    process.env.OWNER_EMAIL?.split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean) ?? []
  )
}

/**
 * An unset (or empty) OWNER_EMAIL falls back to "any authenticated user"
 * rather than locking the owner out of a live business tool. That trade-off
 * is inherited verbatim from the original proxy check — disabled signups and
 * RLS are the real control. Tightening it is a separate decision.
 */
export function isOwnerEmail(email: string | null | undefined): boolean {
  const allowed = ownerEmails()
  if (!allowed.length) return true
  return allowed.includes(email?.trim().toLowerCase() ?? '')
}
