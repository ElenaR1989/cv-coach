import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import AdminApplicationsChart from "@/components/admin-applications-chart"
import AdminSignupsChart from "@/components/admin-signups-chart"

function formatDate(value?: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleString()
}

function getPercentChange(current: number, previous: number) {
  if (previous === 0 && current === 0) return 0
  if (previous === 0) return 100
  return Math.round(((current - previous) / previous) * 100)
}

function getTrendColor(value: number) {
  if (value > 0) return "text-emerald-400"
  if (value < 0) return "text-red-400"
  return "text-foreground"
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

    items.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
    })
  }

  return items
}

function normalizeRole(role?: string | null) {
  if (!role) return null

  const trimmed = role.trim().replace(/\s+/g, " ")
  if (!trimmed) return null

  const lower = trimmed.toLowerCase()

  const dictionary: Record<string, string> = {
    "night porter": "Night Porter",
    "night porters": "Night Porter",
    "night receptionist": "Night Receptionist",
    "night receptionists": "Night Receptionist",
    reception: "Reception",
    receptionist: "Receptionist",
    "general practitioner": "General Practitioner",
    motorist: "Motorist",
    "customer service": "Customer Service",
    recruiter: "Recruiter",
    developer: "Developer",
    doctor: "Doctor",
  }

  if (dictionary[lower]) {
    return dictionary[lower]
  }

  return trimmed
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function buildAdminHref(params: {
  range: string
  company?: string | null
  role?: string | null
  user?: string | null
}) {
  const query = new URLSearchParams()

  query.set("range", params.range)

  if (params.company) query.set("company", params.company)
  if (params.role) query.set("role", params.role)
  if (params.user) query.set("user", params.user)

  return `/dashboard/admin?${query.toString()}`
}

type StatCardProps = {
  title: string
  value: number
  subtext: string
  icon: string
  tone: string
}

function StatCard({ title, value, subtext, icon, tone }: StatCardProps) {
  return (
    <div className={`rounded-2xl border p-6 shadow-sm ${tone}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-3 text-4xl font-bold tracking-tight">{value}</div>
          <p className="mt-2 text-xs text-muted-foreground">{subtext}</p>
        </div>

        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  )
}

type InsightCardProps = {
  title: string
  value: string
  subtext: string
  icon: string
  valueClassName?: string
}

function InsightCard({
  title,
  value,
  subtext,
  icon,
  valueClassName,
}: InsightCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className={`mt-2 text-3xl font-bold ${valueClassName ?? ""}`}>
            {value}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{subtext}</p>
        </div>

        <div className="text-xl">{icon}</div>
      </div>
    </div>
  )
}

type AuthUser = {
  id: string
  email?: string | null
  created_at?: string | null
}

type ApplicationRow = {
  id: string
  company?: string | null
  role?: string | null
  created_at?: string | null
  user_id: string
}

type AdminSearchParams = Promise<{
  range?: string
  company?: string
  role?: string
  user?: string
}>

type AdminPageProps = {
  searchParams?: AdminSearchParams
}

export default async function AdminDashboardPage({
  searchParams,
}: AdminPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}

  const selectedRange =
    resolvedSearchParams.range === "30d" || resolvedSearchParams.range === "90d"
      ? resolvedSearchParams.range
      : "7d"

  const rangeDays = selectedRange === "30d" ? 30 : selectedRange === "90d" ? 90 : 7

  const companyFilter = resolvedSearchParams.company?.trim() || null
  const roleFilter = normalizeRole(resolvedSearchParams.role) || null
  const userFilter = resolvedSearchParams.user?.trim() || null

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const currentPeriodStart = startOfDaysAgo(rangeDays)
  const previousPeriodStart = startOfDaysAgo(rangeDays * 2)
  const chartDays = getLastNDays(rangeDays)

  const [
    authUsersResult,
    applicationsResult,
    cvsResult,
    coverLettersResult,
    recentApplicationsResult,
    applicationsThisPeriodResult,
    applicationsForCurrentPeriodChartResult,
    allApplicationsForInsightsResult,
    allCvProfilesResult,
    allCoverLettersResult,
  ] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers(),
    supabase.from("job_applications").select("*", { count: "exact", head: true }),
    supabase.from("cv_profiles").select("*", { count: "exact", head: true }),
    supabase.from("cover_letters").select("*", { count: "exact", head: true }),
    supabase
      .from("job_applications")
      .select("id, company, role, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("job_applications")
      .select("*", { count: "exact", head: true })
      .gte("created_at", currentPeriodStart),
    supabase
      .from("job_applications")
      .select("id, created_at")
      .gte("created_at", currentPeriodStart),
    supabase
      .from("job_applications")
      .select("id, company, role, created_at, user_id"),
    supabase.from("cv_profiles").select("user_id"),
    supabase.from("cover_letters").select("user_id"),
  ])

  const authUsers: AuthUser[] = authUsersResult.data?.users ?? []

  const totalUsers = authUsers.length
  const totalApplications = applicationsResult.count ?? 0
  const totalCVs = cvsResult.count ?? 0
  const totalCoverLetters = coverLettersResult.count ?? 0
  const applicationsThisPeriod = applicationsThisPeriodResult.count ?? 0

  const usersThisPeriod = authUsers.filter((u) => {
    if (!u.created_at) return false
    return new Date(u.created_at).getTime() >= new Date(currentPeriodStart).getTime()
  }).length

  const recentUsers = [...authUsers]
    .sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
      return bTime - aTime
    })
    .slice(0, 6)
    .map((u) => ({
      id: u.id,
      email: u.email ?? "Unknown email",
      created_at: u.created_at ?? null,
    }))

  const allApplicationsForInsights: ApplicationRow[] =
    allApplicationsForInsightsResult.data ?? []

  const recentApplicationsSource: ApplicationRow[] = recentApplicationsResult.data ?? []
  const applicationsForCurrentPeriodChart =
    applicationsForCurrentPeriodChartResult.data ?? []

  const applicationsChartData = chartDays.map((day) => {
    const count = applicationsForCurrentPeriodChart.filter((item) => {
      if (!item.created_at) return false
      return item.created_at.slice(0, 10) === day.key
    }).length

    return {
      date: day.label,
      applications: count,
    }
  })

  const signupsChartData = chartDays.map((day) => {
    const count = authUsers.filter((u) => {
      if (!u.created_at) return false
      return u.created_at.slice(0, 10) === day.key
    }).length

    return {
      date: day.label,
      signups: count,
    }
  })

  const emailByUserId = new Map(
    authUsers.map((u) => [u.id, u.email ?? "Unknown email"])
  )

  const recentActivity = [
    ...recentUsers.map((item) => ({
      id: `user-${item.id}`,
      type: "New signup",
      label: item.email,
      created_at: item.created_at,
    })),
    ...recentApplicationsSource.slice(0, 12).map((item) => ({
      id: `application-${item.id}`,
      type: "New application",
      label: `${emailByUserId.get(item.user_id) ?? "Unknown user"} — ${item.company ?? "Unknown company"} / ${normalizeRole(item.role) ?? "Unknown role"}`,
      created_at: item.created_at,
    })),
  ]
    .sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
      return bTime - aTime
    })
    .slice(0, 8)

  const currentPeriodStartDate = new Date()
  currentPeriodStartDate.setDate(currentPeriodStartDate.getDate() - rangeDays)

  const previousPeriodStartDate = new Date()
  previousPeriodStartDate.setDate(previousPeriodStartDate.getDate() - rangeDays * 2)

  const applicationsThisPeriodCount = allApplicationsForInsights.filter((item) => {
    if (!item.created_at) return false
    return new Date(item.created_at) >= currentPeriodStartDate
  }).length

  const applicationsPreviousPeriodCount = allApplicationsForInsights.filter((item) => {
    if (!item.created_at) return false
    const created = new Date(item.created_at)
    return created >= previousPeriodStartDate && created < currentPeriodStartDate
  }).length

  const signupsThisPeriodCount = authUsers.filter((u) => {
    if (!u.created_at) return false
    return new Date(u.created_at) >= currentPeriodStartDate
  }).length

  const signupsPreviousPeriodCount = authUsers.filter((u) => {
    if (!u.created_at) return false
    const created = new Date(u.created_at)
    return created >= previousPeriodStartDate && created < currentPeriodStartDate
  }).length

  const applicationsGrowth = getPercentChange(
    applicationsThisPeriodCount,
    applicationsPreviousPeriodCount
  )

  const signupsGrowth = getPercentChange(
    signupsThisPeriodCount,
    signupsPreviousPeriodCount
  )

  const companyCounts = new Map<string, number>()
  const roleCounts = new Map<string, number>()
  const allActiveUserIds = new Set<string>()
  const userApplicationCounts = new Map<string, number>()

  for (const item of allApplicationsForInsights) {
    const company = item.company?.trim()
    const role = normalizeRole(item.role)

    if (company) {
      companyCounts.set(company, (companyCounts.get(company) ?? 0) + 1)
    }

    if (role) {
      roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1)
    }

    if (item.user_id) {
      allActiveUserIds.add(item.user_id)
      userApplicationCounts.set(
        item.user_id,
        (userApplicationCounts.get(item.user_id) ?? 0) + 1
      )
    }
  }

  const topCompanies = Array.from(companyCounts.entries())
    .map(([company, count]) => ({
      company,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const topRoles = Array.from(roleCounts.entries())
    .map(([role, count]) => ({
      role,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const topActiveUsers = Array.from(userApplicationCounts.entries())
    .map(([userId, count]) => ({
      userId,
      email: emailByUserId.get(userId) ?? userId,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const cvUserIds = new Set(
    (allCvProfilesResult.data ?? [])
      .map((item) => item.user_id)
      .filter(Boolean)
  )

  const coverLetterUserIds = new Set(
    (allCoverLettersResult.data ?? [])
      .map((item) => item.user_id)
      .filter(Boolean)
  )

  const applicationUserIds = new Set(
    allApplicationsForInsights.map((item) => item.user_id).filter(Boolean)
  )

  const funnelData = [
    { label: "Users", value: totalUsers, icon: "👥" },
    { label: "With CV", value: cvUserIds.size, icon: "📄" },
    { label: "Applied", value: applicationUserIds.size, icon: "📨" },
    { label: "Cover Letters", value: coverLetterUserIds.size, icon: "✍️" },
  ]

  const activeUserShare =
    totalUsers === 0 ? 0 : Math.round((allActiveUserIds.size / totalUsers) * 100)

  const engagementRate = activeUserShare

  const filteredApplications = recentApplicationsSource
    .map((item) => ({
      ...item,
      normalizedRole: normalizeRole(item.role),
    }))
    .filter((item) => {
      const matchesCompany = companyFilter ? item.company === companyFilter : true
      const matchesRole = roleFilter ? item.normalizedRole === roleFilter : true
      const matchesUser = userFilter ? item.user_id === userFilter : true
      return matchesCompany && matchesRole && matchesUser
    })
    .slice(0, 12)

  const hasFilters = Boolean(companyFilter || roleFilter || userFilter)

  const rangeOptions = [
    { label: "7d", value: "7d" },
    { label: "30d", value: "30d" },
    { label: "90d", value: "90d" },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Monitor platform usage, users, CV activity, and applications.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <div className="rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">{user.email}</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border bg-card p-1">
            {rangeOptions.map((option) => {
              const href = buildAdminHref({
                range: option.value,
                company: companyFilter,
                role: roleFilter,
                user: userFilter,
              })

              const isActive = selectedRange === option.value

              return (
                <Link
                  key={option.value}
                  href={href}
                  className={`rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                  }`}
                >
                  {option.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-semibold">User Funnel</h2>
          <p className="text-sm text-muted-foreground">
            Track how users move through the platform journey
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {funnelData.map((item, index) => (
            <div
              key={item.label}
              className="rounded-xl border bg-background/50 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <div className="mt-2 text-3xl font-bold">{item.value}</div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {index === 0
                      ? "Total registered users"
                      : `${totalUsers === 0 ? 0 : Math.round((item.value / totalUsers) * 100)}% of total users`}
                  </p>
                </div>

                <div className="text-2xl">{item.icon}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={totalUsers}
          subtext={`${usersThisPeriod} new in the last ${rangeDays} days`}
          icon="👥"
          tone="bg-blue-500/10 border-blue-500/20"
        />
        <StatCard
          title="Applications"
          value={totalApplications}
          subtext={`${applicationsThisPeriod} submitted in the last ${rangeDays} days`}
          icon="📨"
          tone="bg-emerald-500/10 border-emerald-500/20"
        />
        <StatCard
          title="CV Profiles"
          value={totalCVs}
          subtext="CVs currently stored in the system"
          icon="📄"
          tone="bg-violet-500/10 border-violet-500/20"
        />
        <StatCard
          title="Cover Letters"
          value={totalCoverLetters}
          subtext="Generated cover letters across users"
          icon="✍️"
          tone="bg-amber-500/10 border-amber-500/20"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          title="Applications Growth"
          value={`${applicationsGrowth > 0 ? "+" : ""}${applicationsGrowth}%`}
          subtext={`${applicationsThisPeriodCount} this period vs ${applicationsPreviousPeriodCount} previous period`}
          icon="📉"
          valueClassName={getTrendColor(applicationsGrowth)}
        />
        <InsightCard
          title="Signups Growth"
          value={`${signupsGrowth > 0 ? "+" : ""}${signupsGrowth}%`}
          subtext={`${signupsThisPeriodCount} this period vs ${signupsPreviousPeriodCount} previous period`}
          icon="👤"
          valueClassName={getTrendColor(signupsGrowth)}
        />
        <InsightCard
          title="Engagement Rate"
          value={`${engagementRate}%`}
          subtext="Users with at least one application"
          icon="⚡"
        />
        <InsightCard
          title="Active User Share"
          value={`${activeUserShare}%`}
          subtext={`${allActiveUserIds.size} active users across ${totalUsers} total users`}
          icon="🔥"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              Applications in the Last {rangeDays} Days
            </h2>
            <p className="text-sm text-muted-foreground">
              Daily application activity across the platform
            </p>
          </div>

          <AdminApplicationsChart data={applicationsChartData} />
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              Signups in the Last {rangeDays} Days
            </h2>
            <p className="text-sm text-muted-foreground">
              Daily user growth across the platform
            </p>
          </div>

          <AdminSignupsChart data={signupsChartData} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Top Companies</h2>
              <p className="text-sm text-muted-foreground">
                Most applied-to companies across the platform
              </p>
            </div>

            <div className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
              {topCompanies.length} shown
            </div>
          </div>

          {topCompanies.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              No company data yet.
            </div>
          ) : (
            <div className="space-y-3">
              {topCompanies.map((item, index) => (
                <Link
                  key={item.company}
                  href={buildAdminHref({
                    range: selectedRange,
                    company: item.company,
                    role: roleFilter,
                    user: userFilter,
                  })}
                  className="block rounded-xl border bg-background/50 p-4 transition hover:bg-background/80"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold text-muted-foreground">
                        #{index + 1}
                      </div>

                      <div>
                        <div className="font-medium">{item.company}</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {item.count} application{item.count === 1 ? "" : "s"}
                        </div>
                      </div>
                    </div>

                    <div className="text-lg">🏢</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Top Roles</h2>
              <p className="text-sm text-muted-foreground">
                Most applied-to roles across the platform
              </p>
            </div>

            <div className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
              {topRoles.length} shown
            </div>
          </div>

          {topRoles.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              No role data yet.
            </div>
          ) : (
            <div className="space-y-3">
              {topRoles.map((item, index) => (
                <Link
                  key={item.role}
                  href={buildAdminHref({
                    range: selectedRange,
                    company: companyFilter,
                    role: item.role,
                    user: userFilter,
                  })}
                  className="block rounded-xl border bg-background/50 p-4 transition hover:bg-background/80"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold text-muted-foreground">
                        #{index + 1}
                      </div>

                      <div>
                        <div className="font-medium">{item.role}</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {item.count} application{item.count === 1 ? "" : "s"}
                        </div>
                      </div>
                    </div>

                    <div className="text-lg">💼</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Top Active Users</h2>
              <p className="text-sm text-muted-foreground">
                Users with the most applications
              </p>
            </div>

            <div className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
              {topActiveUsers.length} shown
            </div>
          </div>

          {topActiveUsers.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              No user activity yet.
            </div>
          ) : (
            <div className="space-y-3">
              {topActiveUsers.map((item, index) => (
                <Link
                  key={item.userId}
                  href={buildAdminHref({
                    range: selectedRange,
                    company: companyFilter,
                    role: roleFilter,
                    user: item.userId,
                  })}
                  className="block rounded-xl border bg-background/50 p-4 transition hover:bg-background/80"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold text-muted-foreground">
                        #{index + 1}
                      </div>

                      <div>
                        <div className="font-medium">{item.email}</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {item.count} application{item.count === 1 ? "" : "s"}
                        </div>
                      </div>
                    </div>

                    <div className="text-lg">🏆</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent Signups</h2>
              <p className="text-sm text-muted-foreground">
                Latest users who created accounts
              </p>
            </div>

            <div className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
              {recentUsers.length} shown
            </div>
          </div>

          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                No recent signups found.
              </div>
            ) : (
              recentUsers.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border bg-background/50 p-4 transition hover:bg-background/80"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">{item.email}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Joined {formatDate(item.created_at)}
                      </div>
                    </div>

                    <div className="text-lg">👤</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <p className="text-sm text-muted-foreground">
                Latest signups and applications
              </p>
            </div>

            <div className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
              Live snapshot
            </div>
          </div>

          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                No activity yet.
              </div>
            ) : (
              recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border bg-background/50 p-4 transition hover:bg-background/80"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">{item.type}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {item.label}
                      </div>
                    </div>

                    <div className="text-right text-xs text-muted-foreground">
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Latest Applications</h2>
            <p className="text-sm text-muted-foreground">
              Most recent applications submitted on the platform
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasFilters && (
              <>
                {companyFilter && (
                  <div className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                    Company: {companyFilter}
                  </div>
                )}
                {roleFilter && (
                  <div className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                    Role: {roleFilter}
                  </div>
                )}
                {userFilter && (
                  <div className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                    User: {emailByUserId.get(userFilter) ?? userFilter}
                  </div>
                )}
                <Link
                  href={buildAdminHref({ range: selectedRange })}
                  className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition hover:bg-background/80 hover:text-foreground"
                >
                  Clear filters
                </Link>
              </>
            )}

            <div className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
              {filteredApplications.length} latest records
            </div>
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
            No applications found for the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="pb-2 font-medium">Company</th>
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium">User</th>
                  <th className="pb-2 font-medium">Created</th>
                </tr>
              </thead>

              <tbody>
                {filteredApplications.map((item) => (
                  <tr key={item.id}>
                    <td className="rounded-l-xl border-y border-l bg-background/50 px-4 py-4">
                      {item.company || "Unknown company"}
                    </td>
                    <td className="border-y bg-background/50 px-4 py-4">
                      {item.normalizedRole || "Unknown role"}
                    </td>
                    <td className="border-y bg-background/50 px-4 py-4 text-sm text-muted-foreground">
                      {emailByUserId.get(item.user_id) ?? item.user_id}
                    </td>
                    <td className="rounded-r-xl border-y border-r bg-background/50 px-4 py-4 text-sm text-muted-foreground">
                      {formatDate(item.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}