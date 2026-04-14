import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
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
      .select("is_admin")
      .eq("id", user.id)
      .single()

    isAdmin = profile?.is_admin === true
  }

  return (
    <div className="min-h-screen">
      <DashboardNavbar isAdmin={isAdmin} />
      <main>{children}</main>
    </div>
  )
}