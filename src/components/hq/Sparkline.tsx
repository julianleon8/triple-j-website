'use client'

import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts'

type SparklinePoint = { value: number }

type SparklineProps = {
  data: SparklinePoint[]
  color?: string
  height?: number
}

export function Sparkline({ data, color = '#1e6bd6', height = 40 }: SparklineProps) {
  if (!data.length) return null
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
