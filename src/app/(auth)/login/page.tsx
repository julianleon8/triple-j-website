import { LoginForm } from './LoginForm'

/**
 * `force-dynamic` only takes effect in a server module. This page used to be
 * `'use client'`, and Next silently ignored the config — /login built as a
 * static route, so the deployed HTML was an empty shell and the form appeared
 * only once the JS had loaded and run.
 *
 * Reading searchParams here opts the route into dynamic rendering on its own;
 * the explicit config stays as the statement of intent it was always meant to
 * be. A login page should never be served from a static file.
 */
export const dynamic = 'force-dynamic'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  // The proxy (and the QBO callback) bounces signed-in accounts that aren't in
  // OWNER_EMAIL back here. Without this the redirect looks like a silent failure.
  const { error } = await searchParams

  return <LoginForm notAuthorized={error === 'not_authorized'} />
}
