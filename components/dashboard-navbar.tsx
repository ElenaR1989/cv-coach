"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import LogoutButton from "@/components/logout-button"

function getLinkClass(pathname: string, href: string, exact = false) {
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`)

  return [
    "rounded-xl border px-4 py-2 text-sm transition",
    isActive
      ? "border-white/30 bg-white/15 text-white"
      : "border-white/20 bg-white/5 text-white hover:bg-white/10",
  ].join(" ")
}

type DashboardNavbarProps = {
  isAdmin?: boolean
}

export default function DashboardNavbar({ isAdmin = false }: DashboardNavbarProps) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap items-center gap-3">
      <Link
        href="/dashboard"
        className={getLinkClass(pathname, "/dashboard", true)}
      >
        Dashboard
      </Link>

      <Link
        href="/dashboard/cvs"
        className={getLinkClass(pathname, "/dashboard/cvs")}
      >
        CVs
      </Link>

      <Link
        href="/dashboard/cover-letters"
        className={getLinkClass(pathname, "/dashboard/cover-letters")}
      >
        Cover Letters
      </Link>

      <Link
        href="/dashboard/applications"
        className={getLinkClass(pathname, "/dashboard/applications")}
      >
        Applications
      </Link>

      <Link
        href="/dashboard/admin"
        className={getLinkClass(pathname, "/dashboard/admin")}
      >
        Admin
      </Link>

      <Link
        href="/dashboard/jobs/new"
        className={[
          "rounded-xl px-4 py-2 text-sm font-medium transition",
          pathname === "/dashboard/jobs/new"
            ? "bg-white text-black"
            : "bg-white text-black hover:opacity-90",
        ].join(" ")}
      >
        Add Job
      </Link>

      <LogoutButton />
    </nav>
  )
}