"use client"

import { useMemo } from "react"

type Job = {
  id: string
  job_title: string
  company: string
  status: string
  created_at: string
}

type Interview = {
  id: string
  created_at: string
  report: { overallScore?: number } | null
}

type Props = {
  jobs: Job[]
  interviews: Interview[]
}

const STATUS_COLORS: Record<string, string> = {
  applied: "#06b6d4",
  interview: "#a78bfa",
  offer: "#34d399",
  rejected: "#f87171",
  saved: "#94a3b8",
  withdrawn: "#64748b",
}

const STATUS_LABELS: Record<string, string> = {
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  saved: "Saved",
  withdrawn: "Withdrawn",
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-2 text-3xl font-bold" style={{ color: color ?? "#fff" }}>{value}</p>
      {sub && <p className="mt-1 text-xs text-white/30">{sub}</p>}
    </div>
  )
}

export default function AnalyticsClient({ jobs, interviews }: Props) {
  const stats = useMemo(() => {
    const total = jobs.length
    const byStatus: Record<string, number> = {}
    for (const j of jobs) {
      const s = (j.status ?? "applied").toLowerCase()
      byStatus[s] = (byStatus[s] ?? 0) + 1
    }

    const interviewed = byStatus["interview"] ?? 0
    const offers = byStatus["offer"] ?? 0
    const responseRate = total > 0 ? Math.round(((interviewed + offers) / total) * 100) : 0
    const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0

    // Applications by month (last 6 months)
    const now = new Date()
    const months: { label: string; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleString("default", { month: "short" })
      const year = d.getFullYear()
      const month = d.getMonth()
      const count = jobs.filter(j => {
        const jd = new Date(j.created_at)
        return jd.getFullYear() === year && jd.getMonth() === month
      }).length
      months.push({ label, count })
    }

    // Top companies (most applications)
    const companyCount: Record<string, number> = {}
    for (const j of jobs) {
      if (j.company) companyCount[j.company] = (companyCount[j.company] ?? 0) + 1
    }
    const topCompanies = Object.entries(companyCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // Interview avg score
    const scores = interviews
      .map(i => i.report?.overallScore)
      .filter((s): s is number => typeof s === "number")
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

    return { total, byStatus, responseRate, offerRate, months, topCompanies, avgScore, offers, interviewed }
  }, [jobs, interviews])

  const maxMonthCount = Math.max(...stats.months.map(m => m.count), 1)

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-5xl mb-4">📊</p>
        <h2 className="text-xl font-semibold text-white">No data yet</h2>
        <p className="mt-2 text-sm text-white/40">Add some job applications to see your analytics</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Applications" value={stats.total} />
        <StatCard label="Response Rate" value={`${stats.responseRate}%`} sub="interviews + offers" color="#06b6d4" />
        <StatCard label="Offer Rate" value={`${stats.offerRate}%`} sub={`${stats.offers} offer${stats.offers !== 1 ? "s" : ""}`} color="#34d399" />
        {stats.avgScore !== null
          ? <StatCard label="Avg Interview Score" value={`${stats.avgScore}/10`} sub={`${interviews.length} practice sessions`} color="#a78bfa" />
          : <StatCard label="Practice Interviews" value={interviews.length} sub="sessions completed" color="#a78bfa" />
        }
      </div>

      {/* Applications over time */}
      <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-white/50">Applications per month</h2>
        <div className="flex items-end gap-3 h-40">
          {stats.months.map((m, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-semibold text-white/70">{m.count > 0 ? m.count : ""}</span>
              <div className="w-full rounded-t-lg transition-all" style={{
                height: `${(m.count / maxMonthCount) * 100}%`,
                minHeight: m.count > 0 ? "4px" : "2px",
                backgroundColor: m.count > 0 ? "#06b6d4" : "rgba(255,255,255,0.06)"
              }} />
              <span className="text-xs text-white/30">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status breakdown */}
        <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/50">By status</h2>
          <div className="space-y-3">
            {Object.entries(stats.byStatus)
              .sort((a, b) => b[1] - a[1])
              .map(([status, count]) => (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-white/70">{STATUS_LABELS[status] ?? status}</span>
                    <span className="text-sm font-semibold text-white">{count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/6">
                    <div className="h-1.5 rounded-full transition-all" style={{
                      width: `${(count / stats.total) * 100}%`,
                      backgroundColor: STATUS_COLORS[status] ?? "#94a3b8"
                    }} />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Top companies */}
        <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/50">Most applied to</h2>
          {stats.topCompanies.length === 0 ? (
            <p className="text-sm text-white/30">No company data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topCompanies.map(([company, count], i) => (
                <div key={company} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/6 text-xs font-bold text-white/40">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-sm text-white/80">{company}</span>
                  <span className="rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
                    {count} app{count !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interview history */}
      {interviews.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/50">Practice interview history</h2>
          <div className="space-y-2">
            {interviews.slice(0, 8).map((iv, i) => {
              const score = iv.report?.overallScore
              const date = new Date(iv.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
              return (
                <div key={iv.id} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/3 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🤖</span>
                    <span className="text-sm text-white/60">Session {interviews.length - i}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-white/30">{date}</span>
                    {score !== undefined && score !== null ? (
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{
                        backgroundColor: score >= 8 ? "#065f46" : score >= 5 ? "#1e3a5f" : "#3b1e1e",
                        color: score >= 8 ? "#34d399" : score >= 5 ? "#60a5fa" : "#f87171"
                      }}>
                        {score}/10
                      </span>
                    ) : (
                      <span className="text-xs text-white/20">Free tier</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
