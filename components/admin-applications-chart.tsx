"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,

} from "recharts"

type ChartPoint = {
  date: string
  applications: number
}

type Props = {
  data: ChartPoint[]
}

export default function AdminApplicationsChart({ data }: Props) {
  const hasData = data.some((item) => item.applications > 0)

  if (!hasData) {
    return (
      <div className="flex h-[320px] w-full items-center justify-center rounded-xl border border-white/10 bg-background/30 text-sm text-muted-foreground">
        No applications in the last 7 days yet.
      </div>
    )
  }

  return (
    <div className="h-[320px] w-full rounded-xl border border-white/10 bg-background/20 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="applicationsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.35} />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            stroke="#9CA3AF"
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <Tooltip
            cursor={{ stroke: "#6B7280", strokeWidth: 1 }}
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "12px",
              color: "#ffffff",
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            }}
            labelStyle={{ color: "#E5E7EB", fontWeight: 600 }}
          />

          <Area
            type="monotone"
            dataKey="applications"
            stroke="none"
            fill="url(#applicationsFill)"
          />

          <Line
            type="monotone"
            dataKey="applications"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ r: 4, fill: "#10B981", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#34D399", stroke: "#ffffff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}