"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

type ChartPoint = {
  date: string
  applications: number
}

type Props = {
  data: ChartPoint[]
}

export default function AdminApplicationsChart({ data }: Props) {
  return (
    <div className="h-[320px] w-full rounded-xl border border-white/10 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9CA3AF" />
          <YAxis allowDecimals={false} stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#ffffff",
            }}
          />
          <Line
            type="monotone"
            dataKey="applications"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ r: 4, fill: "#10B981" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}