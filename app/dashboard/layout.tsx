import type { ReactNode } from "react"
import DashboardNavbar from "@/components/dashboard-navbar"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const isAdmin = true

  return (
    <div className="min-h-screen">
      <DashboardNavbar isAdmin={isAdmin} />
      <main>{children}</main>
    </div>
  )
}