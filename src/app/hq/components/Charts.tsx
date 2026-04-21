'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { DayBucket } from '../lib/metrics'

const BRAND = '#1e6bd6'
const BRAND_LIGHT = '#8aaeff'

// ── Sparkline ─────────────────────────────────────────────────────────────────

type SparklineProps = {
  data: DayBucket[]
  color?: string
  height?: number
}

export function Sparkline({ data, color = BRAND, height = 40 }: SparklineProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#spark-${color})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Funnel (horizontal bar) ───────────────────────────────────────────────────

export type FunnelStep = { name: string; value: number }

export function FunnelChart({ data }: { data: FunnelStep[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex flex-col gap-2">
      {data.map((step, i) => {
        const pct = (step.value / max) * 100
        const tone = 900 - i * 100
        return (
          <div key={step.name} className="flex items-center gap-3">
            <div className="w-28 shrink-0 text-[13px] font-medium text-[color:var(--color-ink-700)]">
              {step.name}
            </div>
            <div className="flex-1 relative h-9 bg-[color:var(--color-ink-50)] rounded">
              <div
                className="h-full rounded transition-all"
                style={{
                  width: `${Math.max(pct, 4)}%`,
                  background: `var(--color-brand-${Math.max(tone, 400)}, ${BRAND})`,
                }}
              />
              <div className="absolute inset-0 flex items-center px-3 text-[13px] font-bold text-white mix-blend-difference">
                {step.value.toLocaleString()}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Stacked bar — permit pipeline ─────────────────────────────────────────────

export type PipelineRow = {
  jurisdiction: string
  new: number
  called: number
  qualified: number
  won: number
  lost: number
}

const STATUS_COLORS: Record<string, string> = {
  new: BRAND,
  called: '#5c85f2',
  qualified: '#15803d',
  won: '#0d2f5c',
  lost: '#9a9a9a',
}

export function PermitPipelineChart({ data }: { data: PipelineRow[] }) {
  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-[color:var(--color-ink-400)]">
        No permit leads yet — run the scraper to populate.
      </div>
    )
  }
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
          <XAxis
            dataKey="jurisdiction"
            tick={{ fontSize: 12, fill: '#4a4a4a' }}
            axisLine={{ stroke: '#d4d4d4' }}
          />
          <YAxis tick={{ fontSize: 12, fill: '#4a4a4a' }} axisLine={{ stroke: '#d4d4d4' }} />
          <Tooltip
            cursor={{ fill: 'rgba(30,107,214,0.05)' }}
            contentStyle={{
              background: '#0a0a0a',
              border: '1px solid #2a2a2a',
              borderRadius: 6,
              color: '#fff',
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {(['new', 'called', 'qualified', 'won', 'lost'] as const).map(key => (
            <Bar key={key} dataKey={key} stackId="status" fill={STATUS_COLORS[key]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Trend area chart — activity over 30 days ──────────────────────────────────

export type TrendSeries = { label: string; color: string; data: DayBucket[] }

export function TrendChart({ series }: { series: TrendSeries[] }) {
  if (series.length === 0 || series[0].data.length === 0) return null
  const merged = series[0].data.map((point, i) => {
    const row: Record<string, string | number> = { date: point.date }
    for (const s of series) row[s.label] = s.data[i]?.value ?? 0
    return row
  })
  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={merged} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {series.map(s => (
              <linearGradient key={s.label} id={`trend-${s.label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#6b6b6b' }}
            axisLine={{ stroke: '#d4d4d4' }}
            tickFormatter={d => d.slice(5)}
          />
          <YAxis tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={{ stroke: '#d4d4d4' }} />
          <Tooltip
            contentStyle={{
              background: '#0a0a0a',
              border: '1px solid #2a2a2a',
              borderRadius: 6,
              color: '#fff',
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {series.map(s => (
            <Area
              key={s.label}
              type="monotone"
              dataKey={s.label}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#trend-${s.label})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── KPI card with sparkline ───────────────────────────────────────────────────

type KpiCardProps = {
  label: string
  value: string
  sub?: string
  trend?: DayBucket[]
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral'
}

const TONE_STYLES: Record<NonNullable<KpiCardProps['tone']>, { value: string; spark: string }> = {
  brand: { value: 'text-[color:var(--color-brand-700)]', spark: BRAND },
  success: { value: 'text-[color:var(--color-success)]', spark: '#15803d' },
  warning: { value: 'text-[color:var(--color-accent-amber)]', spark: '#f5a524' },
  danger: { value: 'text-[color:var(--color-danger)]', spark: '#dc2626' },
  neutral: { value: 'text-[color:var(--color-ink-800)]', spark: BRAND_LIGHT },
}

export function KpiCard({ label, value, sub, trend, tone = 'brand' }: KpiCardProps) {
  const styles = TONE_STYLES[tone]
  return (
    <div className="rounded-xl border border-[color:var(--color-ink-100)] bg-white p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div>
        <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-[color:var(--color-ink-400)]">
          {label}
        </div>
        <div className={`font-display text-4xl font-extrabold mt-1 leading-none ${styles.value}`}>
          {value}
        </div>
        {sub && (
          <div className="text-[12px] text-[color:var(--color-ink-500)] mt-1">{sub}</div>
        )}
      </div>
      {trend && trend.length > 0 && (
        <div className="mt-auto">
          <Sparkline data={trend} color={styles.spark} height={36} />
        </div>
      )}
    </div>
  )
}

// ── Status pill ───────────────────────────────────────────────────────────────

type PillProps = { label: string; count: number; tone: 'new' | 'contacted' | 'quoted' | 'won' }

const PILL_STYLES: Record<PillProps['tone'], string> = {
  new: 'bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-800)] border-[color:var(--color-brand-100)]',
  contacted: 'bg-amber-50 text-amber-800 border-amber-100',
  quoted: 'bg-indigo-50 text-indigo-800 border-indigo-100',
  won: 'bg-emerald-50 text-emerald-800 border-emerald-100',
}

export function StatusPill({ label, count, tone }: PillProps) {
  return (
    <div className={`rounded-lg border px-4 py-3 ${PILL_STYLES[tone]}`}>
      <div className="font-display text-3xl font-extrabold leading-none">{count}</div>
      <div className="text-[12px] font-semibold mt-1.5 uppercase tracking-wider">{label}</div>
    </div>
  )
}

export { BRAND as BRAND_COLOR }
