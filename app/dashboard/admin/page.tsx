import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import AdminApplicationsChart from "@/components/admin-applications-chart"

function getLast7Days() {
  const days: { key: string; label: string }[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)

    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })

    days.push({ key, label })
  }

  return days
}
function formatDate(value?: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleString()
}

function startOfLast7Days() {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString()
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

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const sevenDaysAgo = startOfLast7Days()

const [
  authUsersResult,
  applicationsResult,
  cvsResult,
  coverLettersResult,
  recentApplicationsResult,
  applicationsThisWeekResult,
  recentApplicationsForChartResult,
] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers(),
    supabase.from("job_applications").select("*", { count: "exact", head: true }),
    supabase.from("cv_profiles").select("*", { count: "exact", head: true }),
    supabase.from("cover_letters").select("*", { count: "exact", head: true }),
    supabase
      .from("job_applications")
      .select("id, company, role, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("job_applications")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo),
      supabase
  .from("job_applications")
  .select("id, created_at")
  .gte("created_at", startOfLast7Days()),
  ])

  const authUsers = authUsersResult.data?.users ?? []

  const totalUsers = authUsers.length
  const totalApplications = applicationsResult.count ?? 0
  const totalCVs = cvsResult.count ?? 0
  const totalCoverLetters = coverLettersResult.count ?? 0
  const applicationsThisWeek = applicationsThisWeekResult.count ?? 0

  const usersThisWeek = authUsers.filter((u) => {
    if (!u.created_at) return false
    return new Date(u.created_at).getTime() >= new Date(sevenDaysAgo).getTime()
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

  const recentApplications = recentApplicationsResult.data ?? []
  const recentApplicationsForChart = recentApplicationsForChartResult.data ?? []

const last7Days = getLast7Days()

const applicationsChartData = last7Days.map((day) => {
  const count = recentApplicationsForChart.filter((item) => {
    if (!item.created_at) return false
    return item.created_at.slice(0, 10) === day.key
  }).length

  return {
    date: day.label,
    applications: count,
  }
})

  const emailByUserId = new Map(authUsers.map((u) => [u.id, u.email ?? "Unknown email"]))

  const recentActivity = [
    ...recentUsers.map((item) => ({
      id: `user-${item.id}`,
      type: "New signup",
      label: item.email,
      created_at: item.created_at,
    })),
    ...recentApplications.map((item) => ({
      id: `application-${item.id}`,
      type: "New application",
      label: `${emailByUserId.get(item.user_id) ?? "Unknown user"} — ${item.company || "Unknown company"} / ${item.role || "Unknown role"}`,
      created_at: item.created_at,
    })),
  ]
    .sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
      return bTime - aTime
    })
    .slice(0, 8)

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Monitor platform usage, users, CV activity, and applications.
          </p>
        </div>

        <div className="rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
          Signed in as <span className="font-medium text-foreground">{user.email}</span>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={totalUsers}
          subtext={`${usersThisWeek} new in the last 7 days`}
          icon="👥"
          tone="bg-blue-500/10 border-blue-500/20"
        />
        <StatCard
          title="Applications"
          value={totalApplications}
          subtext={`${applicationsThisWeek} submitted in the last 7 days`}
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
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
  <div className="mb-5">
    <h2 className="text-xl font-semibold">Applications in the Last 7 Days</h2>
    <p className="text-sm text-muted-foreground">
      Daily application activity across the platform
    </p>
  </div>

 <AdminApplicationsChart data={applicationsChartData} />
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
                  className="rounded-xl border bg-background/50 p-4 transition hover:bg-background"
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
                No recent activity found.
              </div>
            ) : (
              recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 rounded-xl border bg-background/50 p-4 transition hover:bg-background"
                >
                  <div>
                    <div className="font-medium">{item.type}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {item.label}
                    </div>
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(item.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Latest Applications</h2>
            <p className="text-sm text-muted-foreground">
              Most recent applications submitted on the platform
            </p>
          </div>

          <div className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
            {recentApplications.length} latest records
          </div>
        </div>

        {recentApplications.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
            No applications found.
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
                {recentApplications.map((item) => (
                  <tr key={item.id}>
                    <td className="rounded-l-xl border-y border-l bg-background/50 px-4 py-4 font-medium">
                      {item.company || "Unknown company"}
                    </td>
                    <td className="border-y bg-background/50 px-4 py-4">
                      {item.role || "Unknown role"}
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