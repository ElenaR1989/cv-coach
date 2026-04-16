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

type CvRow = {
  user_id: string
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

  // ✅ USE ADMIN CLIENT
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, email, created_at, plan, is_admin")

  const { data: applications } = await supabaseAdmin
    .from("job_applications")
    .select("id, user_id, company, role, status, created_at")

  const { data: cvs } = await supabaseAdmin
    .from("cv_profiles")
    .select("user_id")

  const totalUsers = profiles?.length ?? 0
  const totalApplications = applications?.length ?? 0
  const totalCvs = cvs?.length ?? 0

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-4xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="p-6 border rounded-xl">
          <p>Total Users</p>
          <p className="text-3xl">{totalUsers}</p>
        </div>

        <div className="p-6 border rounded-xl">
          <p>Total Applications</p>
          <p className="text-3xl">{totalApplications}</p>
        </div>

        <div className="p-6 border rounded-xl">
          <p>Total CVs</p>
          <p className="text-3xl">{totalCvs}</p>
        </div>
      </div>

      <Link href="/dashboard">← Back</Link>
    </div>
  )
}