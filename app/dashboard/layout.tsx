import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { getIsAdmin } from "@/lib/auth/is-admin"
import DashboardNavbar from "@/components/dashboard-navbar"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, role")
      .eq("id", user.id)
      .single()

    isAdmin = getIsAdmin(profile, user.email)
  }

  return (
    <div className="min-h-screen">
      <DashboardNavbar isAdmin={isAdmin} />
      <main>{children}</main>
    </div>
  )
}