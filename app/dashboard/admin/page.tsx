import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import AdminApplicationsChart from "@/components/admin-applications-chart"
import AdminSignupsChart from "@/components/admin-signups-chart"
import InviteForm from "./invite-form"
import SendEmailForm from "./send-email-form"

function formatDate(value?: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function getPercentChange(current: number, previous: number) {
  if (previous === 0 && current === 0) return 0
  if (previous === 0) return 100
  return Math.round(((current - previous) / previous) * 100)
}

function startOfDaysAgo(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function getLastNDays(days: number) {
  const items: { key: string; label: string }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    items.push({ key: d.toISOString().slice(0, 10), label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) })
  }
  return items
}

function normalizeRole(role?: string | null) {
  if (!role) return null
  const trimmed = role.trim().replace(/\s+/g, " ")
  if (!trimmed) return null
  return trimmed.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

function buildAdminHref(params: { range: string; company?: string | null; role?: string | null; user?: string | null }) {
  const query = new URLSearchParams()
  query.set("range", params.range)
  if (params.company) query.set("company", params.company)
  if (params.role) query.set("role", params.role)
  if (params.user) query.set("user", params.user)
  return `/dashboard/admin?${query.toString()}`
}

type AuthUser = { id: string; email?: string | null; created_at?: string | null }
type ApplicationRow = { id: string; company?: string | null; role?: string | null; created_at?: string | null; user_id: string }
type AdminSearchParams = Promise<{ range?: string; company?: string; role?: string; user?: string }>

/* ─── Stat cards ─────────────────────────────────────────────── */

function StatCard({ title, value, subtext, icon, accent }: {
  title: string; value: number; subtext: string; icon: string; accent: string
}) {
  return (
    <div className={`rounded-2xl border p-5 ${accent}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-white/40">{title}</p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white">{value}</p>
          <p className="mt-2 text-xs text-white/40">{subtext}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}

function InsightCard({ title, value, subtext, icon, valueClass }: {
  title: string; value: string; subtext: string; icon: string; valueClass?: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-white/40">{title}</p>
          <p className={`mt-2 text-3xl font-bold ${valueClass ?? "text-white"}`}>{value}</p>
          <p className="mt-2 text-xs text-white/40">{subtext}</p>
        </div>
        <span className="text-xl">{icon}</span>
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────── */

export default async function AdminDashboardPage({ searchParams }: { searchParams?: AdminSearchParams }) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const selectedRange = resolvedSearchParams.range === "30d" || resolvedSearchParams.range === "90d" ? resolvedSearchParams.range : "7d"
  const rangeDays = selectedRange === "30d" ? 30 : selectedRange === "90d" ? 90 : 7
  const companyFilter = resolvedSearchParams.company?.trim() || null
  const roleFilter = normalizeRole(resolvedSearchParams.role) || null
  const userFilter = resolvedSearchParams.user?.trim() || null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const currentPeriodStart = startOfDaysAgo(rangeDays)
  const previousPeriodStart = startOfDaysAgo(rangeDays * 2)
  const chartDays = getLastNDays(rangeDays)

  const [
    authUsersResult, applicationsResult, cvsResult, coverLettersResult,
    recentApplicationsResult, applicationsThisPeriodResult,
    applicationsForCurrentPeriodChartResult, allApplicationsForInsightsResult,
    allCvProfilesResult, allCoverLettersResult,
  ] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers(),
    supabase.from("job_applications").select("*", { count: "exact", head: true }),
    supabase.from("cv_profiles").select("*", { count: "exact", head: true }),
    supabase.from("cover_letters").select("*", { count: "exact", head: true }),
    supabase.from("job_applications").select("id, company, role, created_at, user_id").order("created_at", { ascending: false }).limit(100),
    supabase.from("job_applications").select("*", { count: "exact", head: true }).gte("created_at", currentPeriodStart),
    supabase.from("job_applications").select("id, created_at").gte("created_at", currentPeriodStart),
    supabase.from("job_applications").select("id, company, role, created_at, user_id"),
    supabase.from("cv_profiles").select("user_id"),
    supabase.from("cover_letters").select("user_id"),
  ])

  const authUsers: AuthUser[] = authUsersResult.data?.users ?? []
  const totalUsers = authUsers.length
  const totalApplications = applicationsResult.count ?? 0
  const totalCVs = cvsResult.count ?? 0
  const totalCoverLetters = coverLettersResult.count ?? 0
  const applicationsThisPeriod = applicationsThisPeriodResult.count ?? 0

  const usersThisPeriod = authUsers.filter(u => u.created_at && new Date(u.created_at).getTime() >= new Date(currentPeriodStart).getTime()).length

  const recentUsers = [...authUsers]
    .sort((a, b) => (b.created_at ? new Date(b.created_at).getTime() : 0) - (a.created_at ? new Date(a.created_at).getTime() : 0))
    .slice(0, 6)
    .map(u => ({ id: u.id, email: u.email ?? "Unknown", created_at: u.created_at ?? null }))

  const allApplicationsForInsights: ApplicationRow[] = allApplicationsForInsightsResult.data ?? []
  const recentApplicationsSource: ApplicationRow[] = recentApplicationsResult.data ?? []
  const applicationsForCurrentPeriodChart = applicationsForCurrentPeriodChartResult.data ?? []

  const applicationsChartData = chartDays.map(day => ({
    date: day.label,
    applications: applicationsForCurrentPeriodChart.filter(item => item.created_at?.slice(0, 10) === day.key).length,
  }))

  const signupsChartData = chartDays.map(day => ({
    date: day.label,
    signups: authUsers.filter(u => u.created_at?.slice(0, 10) === day.key).length,
  }))

  const emailByUserId = new Map(authUsers.map(u => [u.id, u.email ?? "Unknown"]))

  const currentPeriodStartDate = new Date(currentPeriodStart)
  const previousPeriodStartDate = new Date(previousPeriodStart)

  const applicationsThisPeriodCount = allApplicationsForInsights.filter(i => i.created_at && new Date(i.created_at) >= currentPeriodStartDate).length
  const applicationsPreviousPeriodCount = allApplicationsForInsights.filter(i => {
    if (!i.created_at) return false
    const d = new Date(i.created_at)
    return d >= previousPeriodStartDate && d < currentPeriodStartDate
  }).length

  const signupsThisPeriodCount = authUsers.filter(u => u.created_at && new Date(u.created_at) >= currentPeriodStartDate).length
  const signupsPreviousPeriodCount = authUsers.filter(u => {
    if (!u.created_at) return false
    const d = new Date(u.created_at)
    return d >= previousPeriodStartDate && d < currentPeriodStartDate
  }).length

  const applicationsGrowth = getPercentChange(applicationsThisPeriodCount, applicationsPreviousPeriodCount)
  const signupsGrowth = getPercentChange(signupsThisPeriodCount, signupsPreviousPeriodCount)

  const companyCounts = new Map<string, number>()
  const roleCounts = new Map<string, number>()
  const allActiveUserIds = new Set<string>()
  const userApplicationCounts = new Map<string, number>()

  for (const item of allApplicationsForInsights) {
    const company = item.company?.trim()
    const role = normalizeRole(item.role)
    if (company) companyCounts.set(company, (companyCounts.get(company) ?? 0) + 1)
    if (role) roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1)
    if (item.user_id) {
      allActiveUserIds.add(item.user_id)
      userApplicationCounts.set(item.user_id, (userApplicationCounts.get(item.user_id) ?? 0) + 1)
    }
  }

  const topCompanies = Array.from(companyCounts.entries()).map(([company, count]) => ({ company, count })).sort((a, b) => b.count - a.count).slice(0, 5)
  const topRoles = Array.from(roleCounts.entries()).map(([role, count]) => ({ role, count })).sort((a, b) => b.count - a.count).slice(0, 5)
  const topActiveUsers = Array.from(userApplicationCounts.entries()).map(([userId, count]) => ({ userId, email: emailByUserId.get(userId) ?? userId, count })).sort((a, b) => b.count - a.count).slice(0, 5)

  const cvUserIds = new Set((allCvProfilesResult.data ?? []).map(i => i.user_id).filter(Boolean))
  const coverLetterUserIds = new Set((allCoverLettersResult.data ?? []).map(i => i.user_id).filter(Boolean))
  const applicationUserIds = new Set(allApplicationsForInsights.map(i => i.user_id).filter(Boolean))
  const activeUserShare = totalUsers === 0 ? 0 : Math.round((allActiveUserIds.size / totalUsers) * 100)

  const funnelData = [
    { label: "Users", value: totalUsers, icon: "👥", pct: 100 },
    { label: "Created CV", value: cvUserIds.size, icon: "📄", pct: totalUsers === 0 ? 0 : Math.round((cvUserIds.size / totalUsers) * 100) },
    { label: "Applied", value: applicationUserIds.size, icon: "📨", pct: totalUsers === 0 ? 0 : Math.round((applicationUserIds.size / totalUsers) * 100) },
    { label: "Cover Letters", value: coverLetterUserIds.size, icon: "✍️", pct: totalUsers === 0 ? 0 : Math.round((coverLetterUserIds.size / totalUsers) * 100) },
  ]

  const filteredApplications = recentApplicationsSource
    .map(item => ({ ...item, normalizedRole: normalizeRole(item.role) }))
    .filter(item => {
      const matchesCompany = companyFilter ? item.company === companyFilter : true
      const matchesRole = roleFilter ? item.normalizedRole === roleFilter : true
      const matchesUser = userFilter ? item.user_id === userFilter : true
      return matchesCompany && matchesRole && matchesUser
    })
    .slice(0, 12)

  const hasFilters = Boolean(companyFilter || roleFilter || userFilter)
  const rangeOptions = [{ label: "7d", value: "7d" }, { label: "30d", value: "30d" }, { label: "90d", value: "90d" }]

  const card = "rounded-2xl border border-white/10 bg-white/4 p-6"
  const subCard = "rounded-xl border border-white/8 bg-white/3 p-4 transition hover:bg-white/6"

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-white/40">Monitor platform usage, users, CVs, and applications.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/40">
            {user.email}
          </span>
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            {rangeOptions.map(option => {
              const isActive = selectedRange === option.value
              return (
                <Link key={option.value} href={buildAdminHref({ range: option.value, company: companyFilter, role: roleFilter, user: userFilter })}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${isActive ? "bg-white/12 text-white" : "text-white/40 hover:text-white"}`}>
                  {option.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Invite + Email panels */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className={`${card} border-cyan-500/20 bg-cyan-500/5`}>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-xl">✉️</span>
            <div>
              <h2 className="text-sm font-semibold text-white">Invite New User</h2>
              <p className="text-xs text-white/40">Send a magic-link invite to onboard job seekers, advisors, or beta users.</p>
            </div>
          </div>
          <InviteForm />
        </div>

        <div className={`${card} border-violet-500/20 bg-violet-500/5`}>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-xl">📣</span>
            <div>
              <h2 className="text-sm font-semibold text-white">Send Announcement</h2>
              <p className="text-xs text-white/40">Email all users or a specific person from hello@hire-flow.app.</p>
            </div>
          </div>
          <SendEmailForm allEmails={authUsers.map(u => u.email).filter(Boolean) as string[]} />
        </div>
      </div>

      {/* User funnel */}
      <div className={card}>
        <div className="mb-5">
          <h2 className="text-base font-semibold text-white">User Funnel</h2>
          <p className="text-xs text-white/40">How users move through the platform journey</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {funnelData.map((item, i) => (
            <div key={item.label} className="rounded-xl border border-white/8 bg-white/3 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-white/40">{item.label}</p>
                  <p className="mt-1.5 text-3xl font-bold text-white">{item.value}</p>
                  <p className="mt-1 text-xs text-white/30">{i === 0 ? "Total registered" : `${item.pct}% of users`}</p>
                </div>
                <span className="text-2xl">{item.icon}</span>
              </div>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-cyan-500" style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Users" value={totalUsers} subtext={`${usersThisPeriod} new in ${rangeDays}d`} icon="👥" accent="border-blue-500/20 bg-blue-500/8" />
        <StatCard title="Applications" value={totalApplications} subtext={`${applicationsThisPeriod} in last ${rangeDays}d`} icon="📨" accent="border-emerald-500/20 bg-emerald-500/8" />
        <StatCard title="CV Profiles" value={totalCVs} subtext="Stored in the system" icon="📄" accent="border-violet-500/20 bg-violet-500/8" />
        <StatCard title="Cover Letters" value={totalCoverLetters} subtext="Generated across users" icon="✍️" accent="border-amber-500/20 bg-amber-500/8" />
      </div>

      {/* Growth insights */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InsightCard title="Applications Growth" value={`${applicationsGrowth > 0 ? "+" : ""}${applicationsGrowth}%`} subtext={`${applicationsThisPeriodCount} vs ${applicationsPreviousPeriodCount} prev`} icon="📈" valueClass={applicationsGrowth > 0 ? "text-emerald-400" : applicationsGrowth < 0 ? "text-red-400" : "text-white"} />
        <InsightCard title="Signups Growth" value={`${signupsGrowth > 0 ? "+" : ""}${signupsGrowth}%`} subtext={`${signupsThisPeriodCount} vs ${signupsPreviousPeriodCount} prev`} icon="👤" valueClass={signupsGrowth > 0 ? "text-emerald-400" : signupsGrowth < 0 ? "text-red-400" : "text-white"} />
        <InsightCard title="Engagement Rate" value={`${activeUserShare}%`} subtext="Users with ≥1 application" icon="⚡" />
        <InsightCard title="Active Users" value={`${allActiveUserIds.size}`} subtext={`of ${totalUsers} total users`} icon="🔥" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className={card}>
          <h2 className="mb-1 text-sm font-semibold text-white">Applications — Last {rangeDays} Days</h2>
          <p className="mb-5 text-xs text-white/35">Daily activity across the platform</p>
          <AdminApplicationsChart data={applicationsChartData} />
        </div>
        <div className={card}>
          <h2 className="mb-1 text-sm font-semibold text-white">Signups — Last {rangeDays} Days</h2>
          <p className="mb-5 text-xs text-white/35">Daily new user growth</p>
          <AdminSignupsChart data={signupsChartData} />
        </div>
      </div>

      {/* Top companies / roles / users */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Companies */}
        <div className={card}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Top Companies</h2>
            <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-white/35">{topCompanies.length}</span>
          </div>
          {topCompanies.length === 0 ? (
            <p className="text-xs text-white/30">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {topCompanies.map((item, i) => (
                <Link key={item.company} href={buildAdminHref({ range: selectedRange, company: item.company, role: roleFilter, user: userFilter })}
                  className={subCard + " flex items-center justify-between gap-3"}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-xs font-semibold text-white/40">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{item.company}</p>
                      <p className="text-xs text-white/35">{item.count} application{item.count !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <span className="text-base">🏢</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Roles */}
        <div className={card}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Top Roles</h2>
            <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-white/35">{topRoles.length}</span>
          </div>
          {topRoles.length === 0 ? (
            <p className="text-xs text-white/30">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {topRoles.map((item, i) => (
                <Link key={item.role} href={buildAdminHref({ range: selectedRange, company: companyFilter, role: item.role, user: userFilter })}
                  className={subCard + " flex items-center justify-between gap-3"}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-xs font-semibold text-white/40">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{item.role}</p>
                      <p className="text-xs text-white/35">{item.count} application{item.count !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <span className="text-base">💼</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top users */}
        <div className={card}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Top Active Users</h2>
            <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-white/35">{topActiveUsers.length}</span>
          </div>
          {topActiveUsers.length === 0 ? (
            <p className="text-xs text-white/30">No activity yet.</p>
          ) : (
            <div className="space-y-2">
              {topActiveUsers.map((item, i) => (
                <Link key={item.userId} href={buildAdminHref({ range: selectedRange, company: companyFilter, role: roleFilter, user: item.userId })}
                  className={subCard + " flex items-center justify-between gap-3"}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-xs font-semibold text-white/40">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-white truncate max-w-[140px]">{item.email}</p>
                      <p className="text-xs text-white/35">{item.count} application{item.count !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <span className="text-base">{i === 0 ? "🏆" : "👤"}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent signups + activity */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className={card}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent Signups</h2>
            <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-white/35">{recentUsers.length}</span>
          </div>
          <div className="space-y-2">
            {recentUsers.length === 0 ? (
              <p className="text-xs text-white/30">No signups yet.</p>
            ) : recentUsers.map(item => (
              <div key={item.id} className={subCard + " flex items-center justify-between gap-4"}>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs text-white/40">
                    {(item.email[0] ?? "?").toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.email}</p>
                    <p className="text-xs text-white/35">Joined {formatDate(item.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-300">Live</span>
          </div>
          <div className="space-y-2">
            {recentApplicationsSource.slice(0, 6).length === 0 ? (
              <p className="text-xs text-white/30">No activity yet.</p>
            ) : recentApplicationsSource.slice(0, 6).map(item => (
              <div key={item.id} className={subCard + " flex items-start justify-between gap-4"}>
                <div>
                  <p className="text-xs font-medium text-cyan-400">New application</p>
                  <p className="text-sm text-white/70">{item.company} — {normalizeRole(item.role)}</p>
                  <p className="text-xs text-white/30">{emailByUserId.get(item.user_id)}</p>
                </div>
                <p className="shrink-0 text-xs text-white/25">{formatDate(item.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All registered users */}
      <div className={card}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">All Registered Users</h2>
            <p className="text-xs text-white/35">Click an email to compose a message</p>
          </div>
          <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-white/35">{totalUsers} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-white/30">
                <th className="pb-2 text-left font-medium">User</th>
                <th className="pb-2 text-left font-medium">Joined</th>
                <th className="pb-2 text-left font-medium">Applications</th>
                <th className="pb-2 text-left font-medium">Email</th>
              </tr>
            </thead>
            <tbody>
              {[...authUsers]
                .sort((a, b) => (b.created_at ? new Date(b.created_at).getTime() : 0) - (a.created_at ? new Date(a.created_at).getTime() : 0))
                .map(u => {
                  const appCount = userApplicationCounts.get(u.id) ?? 0
                  return (
                    <tr key={u.id} className="group">
                      <td className="rounded-l-xl border-y border-l border-white/8 bg-white/3 px-4 py-3 group-hover:bg-white/5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-white/40">
                            {(u.email?.[0] ?? "?").toUpperCase()}
                          </div>
                          <span className="font-medium text-white">{u.email ?? "—"}</span>
                        </div>
                      </td>
                      <td className="border-y border-white/8 bg-white/3 px-4 py-3 text-xs text-white/40 group-hover:bg-white/5">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="border-y border-white/8 bg-white/3 px-4 py-3 group-hover:bg-white/5">
                        {appCount > 0 ? (
                          <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2.5 py-0.5 text-xs text-cyan-300">{appCount}</span>
                        ) : (
                          <span className="text-xs text-white/25">—</span>
                        )}
                      </td>
                      <td className="rounded-r-xl border-y border-r border-white/8 bg-white/3 px-4 py-3 group-hover:bg-white/5">
                        {u.email && (
                          <a href={`mailto:${u.email}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1 text-xs text-white/50 transition hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-300">
                            ✉️ Send email
                          </a>
                        )}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latest applications table */}
      <div className={card}>
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Latest Applications</h2>
            <p className="text-xs text-white/35">Most recent applications submitted on the platform</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {hasFilters && (
              <>
                {companyFilter && <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">Company: {companyFilter}</span>}
                {roleFilter && <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">Role: {roleFilter}</span>}
                {userFilter && <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">User: {emailByUserId.get(userFilter) ?? userFilter}</span>}
                <Link href={buildAdminHref({ range: selectedRange })} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50 hover:text-white transition">
                  Clear filters ×
                </Link>
              </>
            )}
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/35">{filteredApplications.length} records</span>
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <p className="rounded-xl border border-white/8 py-6 text-center text-xs text-white/30">No applications found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-white/30">
                  <th className="pb-2 text-left font-medium">Company</th>
                  <th className="pb-2 text-left font-medium">Role</th>
                  <th className="pb-2 text-left font-medium">User</th>
                  <th className="pb-2 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map(item => (
                  <tr key={item.id} className="group">
                    <td className="rounded-l-xl border-y border-l border-white/8 bg-white/3 px-4 py-3 font-medium text-white group-hover:bg-white/5">{item.company || "—"}</td>
                    <td className="border-y border-white/8 bg-white/3 px-4 py-3 text-white/70 group-hover:bg-white/5">{item.normalizedRole || "—"}</td>
                    <td className="border-y border-white/8 bg-white/3 px-4 py-3 text-xs text-white/40 group-hover:bg-white/5">{emailByUserId.get(item.user_id) ?? "—"}</td>
                    <td className="rounded-r-xl border-y border-r border-white/8 bg-white/3 px-4 py-3 text-xs text-white/35 group-hover:bg-white/5">{formatDate(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
