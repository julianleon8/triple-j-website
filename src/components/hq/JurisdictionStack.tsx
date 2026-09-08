'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CHART_GRID_STROKE, CHART_TOOLTIP, chartTick } from './chart-theme'

type JurisdictionRow = {
  jurisdiction: string
  new: number
  called: number
  qualified: number
}

type JurisdictionStackProps = {
  data: JurisdictionRow[]
}

export function JurisdictionStack({ data }: JurisdictionStackProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid vertical={false} stroke={CHART_GRID_STROKE} />
        <XAxis
          dataKey="jurisdiction"
          tick={chartTick(11)}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={56}
        />
        <YAxis
          tick={chartTick(11)}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip {...CHART_TOOLTIP} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: '#a8b0b6' }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="new"       stackId="s" fill="#1e6bd6" name="New" />
        <Bar dataKey="called"    stackId="s" fill="#5c85f2" name="Called" />
        <Bar dataKey="qualified" stackId="s" fill="#8aaeff" name="Qualified" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
