import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

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

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("is_admin, role")
    .eq("id", user.id)
    .single()

  const isAdmin =
    adminProfile?.is_admin === true ||
    adminProfile?.role === "admin" ||
    user.email === "elena.zmau@icloud.com"

  if (!isAdmin) redirect("/dashboard")

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  const { data: applications } = await supabaseAdmin
    .from("job_applications")
    .select("*")
    .order("created_at", { ascending: false })

  const totalUsers = profiles?.length ?? 0
  const totalApplications = applications?.length ?? 0

  const recentSignups = profiles?.slice(0, 5) ?? []
  const recentActivity = applications?.slice(0, 5) ?? []

  const profileMap = new Map(
    (profiles ?? []).map((p: ProfileRow) => [p.id, p])
  )

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-4xl font-bold">Admin Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="p-6 border rounded-xl">
          <p>Total Users</p>
          <p className="text-3xl">{totalUsers}</p>
        </div>

        <div className="p-6 border rounded-xl">
          <p>Total Applications</p>
          <p className="text-3xl">{totalApplications}</p>
        </div>
      </div>

      {/* SIGNUPS */}
      <section className="p-6 border rounded-xl">
        <h2 className="text-2xl font-semibold">Recent Signups</h2>

        {recentSignups.length === 0 ? (
          <p>No users yet</p>
        ) : (
          <div className="mt-4 space-y-2">
            {recentSignups.map((p: ProfileRow) => (
              <div key={p.id} className="border p-3 rounded">
                <p>{p.email}</p>
                <p className="text-sm text-gray-400">
                  {new Date(p.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ACTIVITY */}
      <section className="p-6 border rounded-xl">
        <h2 className="text-2xl font-semibold">Recent Activity</h2>

        {recentActivity.length === 0 ? (
          <p>No activity yet</p>
        ) : (
          <div className="mt-4 space-y-2">
            {recentActivity.map((a: ApplicationRow) => {
              const user = profileMap.get(a.user_id)

              return (
                <div key={a.id} className="border p-3 rounded">
                  <p>{user?.email ?? "Unknown user"}</p>
                  <p className="text-sm">
                    {a.role} @ {a.company}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <Link href="/dashboard">← Back</Link>
    </div>
  )
}