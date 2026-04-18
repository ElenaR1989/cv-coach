"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import LogoutButton from "@/components/logout-button"

function getLinkClass(pathname: string, href: string, exact = false) {
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`)

  return [
    "rounded-xl border px-4 py-2 text-sm font-medium transition",
    isActive
      ? "border-white/30 bg-white/15 text-white shadow-sm"
      : "border-white/15 bg-white/[0.04] text-white/90 hover:border-white/25 hover:bg-white/[0.08]",
  ].join(" ")
}

type DashboardNavbarProps = {
  isAdmin?: boolean
}

export default function DashboardNavbar({
  isAdmin = false,
}: DashboardNavbarProps) {
  const pathname = usePathname()

  return (
    <nav className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 backdrop-blur-xl">
      <Link
        href="/dashboard"
        className="mr-3 flex items-center gap-3 opacity-95 transition hover:opacity-100"
      >
        <Image
          src="/logo.png"
          alt="Hireflow"
          width={36}
          height={36}
          priority
        />
        <div className="leading-tight">
          <span className="block text-base font-semibold text-white">
            Hireflow
          </span>
          <span className="hidden text-[11px] text-white/50 sm:block">
            Where talent meets opportunity
          </span>
        </div>
      </Link>

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
  href="/account"
  className={getLinkClass(pathname, "/account")}
>
  Account
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

      {isAdmin && (
        <Link
  href="/dashboard/admin"
  className={getLinkClass(pathname, "/dashboard/admin")}
>
  Admin
</Link>
      )}

      <Link
        href="/dashboard/jobs/new"
        className={getLinkClass(pathname, "/dashboard/jobs/new")}
      >
        Add Job
      </Link>

      <div className="ml-auto">
        <LogoutButton />
      </div>
    </nav>
  )
}