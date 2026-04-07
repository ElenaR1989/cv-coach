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

type ApplicationsOverTimeItem = {
  month: string
  applications: number
}

type ApplicationsOverTimeChartProps = {
  data: ApplicationsOverTimeItem[]
}

export default function ApplicationsOverTimeChart({
  data,
}: ApplicationsOverTimeChartProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-white/10 to-white/5 p-4 backdrop-blur-xl">
      <div className="mb-3">
        <h3 className="text-2xl font-semibold tracking-tight">
          Applications Over Time
        </h3>
        <p className="text-sm text-gray-300">
          Track how your applications are growing each month
        </p>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              stroke="rgba(255,255,255,0.08)"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              stroke="rgba(255,255,255,0.45)"
              tick={{ fill: "#d1d5db", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              allowDecimals={false}
              stroke="rgba(255,255,255,0.45)"
              tick={{ fill: "#d1d5db", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                background: "rgba(15, 23, 42, 0.92)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "14px",
                color: "white",
                backdropFilter: "blur(10px)",
              }}
              labelStyle={{ color: "#ffffff", fontWeight: 600 }}
            />

            <Line
              type="monotone"
              dataKey="applications"
              stroke="#60a5fa"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "#93c5fd",
                stroke: "#60a5fa",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: "#dbeafe",
                stroke: "#60a5fa",
                strokeWidth: 2,
              }}
              style={{
                filter: "drop-shadow(0px 0px 8px rgba(96,165,250,0.55))",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}