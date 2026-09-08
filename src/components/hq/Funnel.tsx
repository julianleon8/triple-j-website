'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CHART_GRID_STROKE,
  CHART_LABEL_FILL,
  CHART_TOOLTIP,
  chartTick,
} from './chart-theme'

type FunnelProps = {
  data: { label: string; value: number }[]
}

const COLORS = ['#1e6bd6', '#2f61e0', '#5c85f2', '#8aaeff']

export function Funnel({ data }: FunnelProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 48, bottom: 8, left: 8 }}
      >
        <CartesianGrid horizontal={false} stroke={CHART_GRID_STROKE} />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          tick={chartTick(12)}
          axisLine={false}
          tickLine={false}
          width={96}
        />
        <Tooltip {...CHART_TOOLTIP} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            style={{ fontSize: 12, fontWeight: 600, fill: CHART_LABEL_FILL }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
