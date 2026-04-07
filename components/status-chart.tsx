"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

type StatusChartItem = {
  name: string
  value: number
}

type StatusChartProps = {
  data: StatusChartItem[]
}

export default function StatusChart({ data }: StatusChartProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-white/10 to-white/5 p-4 backdrop-blur-xl">
      <div className="mb-3">
        <h3 className="text-2xl font-semibold tracking-tight">
          Applications by Status
        </h3>
        <p className="text-sm text-gray-300">
          Overview of your application pipeline
        </p>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={28}>
            <defs>
              <linearGradient id="statusBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.75} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="rgba(255,255,255,0.08)"
              vertical={false}
            />

            <XAxis
              dataKey="name"
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
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "rgba(15, 23, 42, 0.92)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "14px",
                color: "white",
                backdropFilter: "blur(10px)",
              }}
              labelStyle={{ color: "#ffffff", fontWeight: 600 }}
            />

            <Bar
              dataKey="value"
              radius={[12, 12, 0, 0]}
              fill="url(#statusBarGradient)"
              style={{
                filter: "drop-shadow(0px 4px 12px rgba(96,165,250,0.35))",
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}