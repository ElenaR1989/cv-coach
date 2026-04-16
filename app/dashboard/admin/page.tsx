import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { updateUserRole } from "./actions"

type ProfileRow = {
  id: string
  email: string | null
  created_at: string
  plan: string | null
  is_admin: boolean
}

type ApplicationRow = {
  id: string
  user_id: string
  company: string | null
  role: string | null
  status: string | null
  created_at: string
}

type CvRow = {
  user_id: string
}

function normalizeStatus(status: string | null) {
  return (status ?? "").trim().toLowerCase()
}

function getStatusIcon(status: string | null) {
  const s = normalizeStatus(status)

  switch (s) {
    case "applied":
      return "📨"
    case "interview":
    case "interviewing":
      return "🎤"
    case "offer":
      return "✅"
    case "rejected":
      return "❌"
    default:
      return "📄"
  }
}

function getStatusClasses(status: string | null) {
  const s = normalizeStatus(status)

  switch (s) {
    case "applied":
      return "border border-blue-500/30 bg-blue-500/10 text-blue-300"
    case "interview":
    case "interviewing":
      return "border border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
    case "offer":
      return "border border-green-500/30 bg-green-500/10 text-green-300"
    case "rejected":
      return "border border-red-500/30 bg-red-500/10 text-red-300"
    default:
      return "border border-white/20 bg-white/5 text-white/80"
  }
}

function formatStatusLabel(status: string | null) {
  const s = normalizeStatus(status)

  switch (s) {
    case "applied":
      return "Applied"
    case "interview":
    case "interviewing":
      return "Interviewing"
    case "offer":
      return "Offer"
    case "rejected":
      return "Rejected"
    default:
      return status ?? "Unknown"
  }
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: adminProfile } = await supabase
  .from("profiles")
  .select("is_admin, role")
  .eq("id", user.id)
  .single()

const isAdmin =
  adminProfile?.is_admin === true ||
  adminProfile?.role === "admin" ||
  user.email === "elena.zmau@icloud.com"

if (!isAdmin) {
  redirect("/dashboard")
}

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, email, created_at, plan, is_admin")
    .order("created_at", { ascending: false })

  const { data: applications, error: applicationsError } = await supabase
    .from("job_applications")
    .select("id, user_id, company, role, status, created_at")
    .order("created_at", { ascending: false })

  const { data: cvs, error: cvsError } = await supabase
    .from("cv_profiles")
    .select("user_id")

  if (profilesError) {
    console.error("Error loading profiles:", profilesError.message)
  }

  if (applicationsError) {
    console.error("Error loading applications:", applicationsError.message)
  }

  if (cvsError) {
    console.error("Error loading CVs:", cvsError.message)
  }

  const safeProfiles: ProfileRow[] = profiles ?? []
  const safeApplications: ApplicationRow[] = applications ?? []
  const safeCvs: CvRow[] = cvs ?? []

  const appCountByUser = new Map<string, number>()
  for (const row of safeApplications) {
    appCountByUser.set(row.user_id, (appCountByUser.get(row.user_id) ?? 0) + 1)
  }

  const cvCountByUser = new Map<string, number>()
  for (const row of safeCvs) {
    cvCountByUser.set(row.user_id, (cvCountByUser.get(row.user_id) ?? 0) + 1)
  }

  const totalUsers = safeProfiles.length
  const totalApplications = safeApplications.length
  const totalCvs = safeCvs.length

  const recentSignups = safeProfiles.slice(0, 5)
  const recentActivity = safeApplications.slice(0, 5)

  const profileById = new Map(
    safeProfiles.map((profile) => [profile.id, profile] as const)
  )

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Track users, signups, and product usage
          </p>
        </div>

        <Link
          href="/dashboard"
          className="rounded-xl border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="mt-2 text-4xl font-bold">{totalUsers}</p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
          <p className="text-sm text-muted-foreground">Total Applications</p>
          <p className="mt-2 text-4xl font-bold">{totalApplications}</p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
          <p className="text-sm text-muted-foreground">Total CVs</p>
          <p className="mt-2 text-4xl font-bold">{totalCvs}</p>
        </div>
      </div>

      <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Recent Signups</h2>
            <p className="mt-1 text-muted-foreground">
              The newest users who joined your app
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {recentSignups.length === 0 ? (
            <p className="text-sm text-white/60">No signups yet.</p>
          ) : (
            recentSignups.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:bg-white/[0.08]"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {profile.email ?? "No email"}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-white/60">
                    Joined {new Date(profile.created_at).toLocaleString()}
                    {new Date(profile.created_at).toDateString() ===
                      new Date().toDateString() && (
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-300">
                        New
                      </span>
                    )}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    profile.is_admin
                      ? "border border-green-500/30 bg-green-500/10 text-green-300"
                      : "border border-white/20 bg-white/5 text-white/70"
                  }`}
                >
                  {profile.is_admin ? "Admin" : "User"}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">Recent Activity</h2>
        <p className="mt-1 text-muted-foreground">
          The latest job applications added to your app
        </p>

        <div className="mt-6 space-y-3">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-white/60">No recent activity yet.</p>
          ) : (
            recentActivity.map((item) => {
              const profile = profileById.get(item.user_id)

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:bg-white/[0.08]"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {profile?.email ?? "Unknown user"}
                    </p>
                    <p className="text-xs text-white/70">
                      Added{" "}
                      <span className="font-medium">
                        {item.role ?? "Unknown role"}
                      </span>{" "}
                      at{" "}
                      <span className="font-medium">
                        {item.company ?? "Unknown company"}
                      </span>
                    </p>
                    <p className="text-xs text-white/50">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>

                  <span
                    className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                      item.status
                    )}`}
                  >
                    <span>{getStatusIcon(item.status)}</span>
                    <span>{formatStatusLabel(item.status)}</span>
                  </span>
                </div>
              )
            })
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">Users</h2>
        <p className="mt-1 text-muted-foreground">
          Everyone registered in your app
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-sm text-muted-foreground">
                <th className="px-4">Email</th>
                <th className="px-4">Joined</th>
                <th className="px-4">Applications</th>
                <th className="px-4">CVs</th>
                <th className="px-4">Plan</th>
                <th className="px-4">Role</th>
                <th className="px-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {safeProfiles.map((profile) => {
                const applicationCount = appCountByUser.get(profile.id) ?? 0
                const cvCount = cvCountByUser.get(profile.id) ?? 0
                const isAdmin = profile.is_admin

                return (
                  <tr
                    key={profile.id}
                    className="bg-white/5 text-sm transition hover:bg-white/[0.08]"
                  >
                    <td className="rounded-l-xl px-4 py-4">
                      {profile.email ?? "No email"}
                    </td>

                    <td className="px-4 py-4">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-4">{applicationCount}</td>

                    <td className="px-4 py-4">{cvCount}</td>

                    <td className="px-4 py-4">
                      <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                        {(profile.plan ?? "free").charAt(0).toUpperCase() +
                          (profile.plan ?? "free").slice(1)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          isAdmin
                            ? "border border-green-500/30 bg-green-500/10 text-green-300"
                            : "border border-white/20 bg-white/5 text-white/70"
                        }`}
                      >
                        {isAdmin ? "Admin" : "User"}
                      </span>
                    </td>

                    <td className="rounded-r-xl px-4 py-4">
                      {profile.id === user.id ? (
                        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                          You
                        </span>
                      ) : (
                        <form action={updateUserRole}>
                          <input type="hidden" name="userId" value={profile.id} />
                          <input
                            type="hidden"
                            name="nextRole"
                            value={isAdmin ? "user" : "admin"}
                          />
                          <button
                            type="submit"
                            className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                              isAdmin
                                ? "border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                                : "border border-green-500/30 bg-green-500/10 text-green-300 hover:bg-green-500/20"
                            }`}
                          >
                            {isAdmin ? "Remove admin" : "Make admin"}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}