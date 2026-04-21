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
        <CartesianGrid vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="jurisdiction"
          tick={{ fontSize: 11, fill: '#475569' }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={56}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#475569' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: '1px solid #e2e8f0',
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
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
