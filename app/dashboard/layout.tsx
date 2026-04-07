import type { ReactNode } from "react"
import DashboardNavbar from "@/components/dashboard-navbar"
import { createClient } from "@/lib/supabase/server"

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
      .select("role")
      .eq("id", user.id)
      .single()

    isAdmin = profile?.role === "admin"
  }

  return (
    <div className="min-h-screen">
      <DashboardNavbar isAdmin={isAdmin} />
      <main>{children}</main>
    </div>
  )
}