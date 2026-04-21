export function fmtUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n.toLocaleString()}`
}

export function fmtUSDFull(n: number): string {
  return `$${Math.round(n).toLocaleString()}`
}
