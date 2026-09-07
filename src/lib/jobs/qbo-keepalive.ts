/**
 * Pure decision logic for the QuickBooks token keepalive.
 */

/** Warn once the refresh token has fewer than this many days left. */
export const REFRESH_WARN_DAYS = 14

export type KeepaliveVerdict = {
  /** Days until the refresh token dies. Negative when already dead. */
  daysLeft: number
  shouldWarn: boolean
  severity: 'ok' | 'warn' | 'expired'
}

/**
 * How close the QuickBooks connection is to dying.
 *
 * The refresh token lives ~101 days and rotates ONLY when it is used. An
 * integration nobody touches for a quarter therefore expires silently, and
 * recovery is a manual OAuth round-trip through /hq/settings/quickbooks —
 * which nobody thinks to do until a receipt push fails.
 */
export function assessRefreshToken(expiresAt: string, now: Date): KeepaliveVerdict {
  const daysLeft = Math.floor((new Date(expiresAt).getTime() - now.getTime()) / 86_400_000)
  if (daysLeft < 0) return { daysLeft, shouldWarn: true, severity: 'expired' }
  if (daysLeft < REFRESH_WARN_DAYS) return { daysLeft, shouldWarn: true, severity: 'warn' }
  return { daysLeft, shouldWarn: false, severity: 'ok' }
}
