/**
 * Shared Recharts theming for HQ charts.
 *
 * Every chart in HQ renders inside `ChartContainer`, which is `bg-(--surface-2)`
 * — `#14181c` under `.hq-ui`. Recharts takes colours as raw strings on SVG
 * attributes, not as classes, so it never saw the forced-dark flip: the charts
 * kept their light-mode axis slate and, worse, `Tooltip` with no `contentStyle`
 * background falls back to Recharts' own white box while its text inherits
 * `--text-primary` (#f2f4f5) — white on white.
 *
 * These are literal hex rather than `var(--hq-*)` on purpose. Recharts spreads
 * `tick`/`cursor` onto SVG presentation attributes, where `var()` support is not
 * something to bet a production screen on. They mirror the `--hq-*` constants in
 * globals.css; if those change, change these with them.
 */

/** --hq-ink-3 · mono meta / axis labels. 5.0:1 on card — do not go dimmer. */
export const CHART_TICK_FILL = '#8c979f'

/** --hq-ink · value labels that must read as content, not chrome. */
export const CHART_LABEL_FILL = '#f2f4f5'

/** White at 8% — the same hairline the card dividers use. */
export const CHART_GRID_STROKE = 'rgba(255, 255, 255, 0.08)'

/** Hover wash. Light enough to see, dim enough not to fight the bars. */
export const CHART_CURSOR = { fill: 'rgba(255, 255, 255, 0.06)' } as const

export const chartTick = (fontSize: number) =>
  ({ fontSize, fill: CHART_TICK_FILL }) as const

/**
 * Spread onto <Tooltip>. `contentStyle` MUST set a background — that is the
 * white-on-white bug. `itemStyle`/`labelStyle` are separate because Recharts
 * does not inherit `contentStyle`'s colour down to them.
 */
export const CHART_TOOLTIP = {
  cursor: CHART_CURSOR,
  contentStyle: {
    fontSize: 12,
    borderRadius: 6,
    backgroundColor: '#1b2126',
    border: '1px solid rgba(255, 255, 255, 0.20)',
    color: CHART_LABEL_FILL,
  },
  itemStyle: { color: CHART_LABEL_FILL },
  labelStyle: { color: CHART_TICK_FILL },
} as const
