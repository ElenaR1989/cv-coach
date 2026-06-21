"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

function navLinkClass(pathname: string, href: string, exact = false) {
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`)

  return [
    "px-3 py-2 text-sm font-medium rounded-xl transition",
    isActive
      ? "bg-white/12 text-white"
      : "text-white/65 hover:text-white hover:bg-white/8",
  ].join(" ")
}

type DashboardNavbarProps = {
  isAdmin?: boolean
}

export default function DashboardNavbar({ isAdmin = false }: DashboardNavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <nav className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-xl">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="mr-4 flex flex-shrink-0 items-center gap-2.5 opacity-95 transition hover:opacity-100"
      >
        <Image src="/logo.png" alt="Hireflow" width={32} height={32} priority className="rounded-md" />
        <div className="leading-tight hidden sm:block">
          <span className="block text-sm font-semibold text-white">Hireflow</span>
          <span className="text-[10px] text-white/40">Where talent meets opportunity</span>
        </div>
      </Link>

      {/* Main nav links */}
      <div className="flex flex-wrap items-center gap-0.5">
        <Link href="/dashboard" className={navLinkClass(pathname, "/dashboard", true)}>
          Dashboard
        </Link>
        <Link href="/dashboard/cvs" className={navLinkClass(pathname, "/dashboard/cvs")}>
          CVs
        </Link>
        <Link href="/dashboard/applications" className={navLinkClass(pathname, "/dashboard/applications")}>
          Applications
        </Link>
        <Link href="/dashboard/cover-letters" className={navLinkClass(pathname, "/dashboard/cover-letters")}>
          Cover Letters
        </Link>
        <Link href="/dashboard/search" className={navLinkClass(pathname, "/dashboard/search")}>
          Search Jobs
        </Link>
        <Link href="/dashboard/analytics" className={navLinkClass(pathname, "/dashboard/analytics")}>
          Analytics
        </Link>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {/* + New Job CTA */}
        <Link
          href="/dashboard/jobs/new"
          className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
        >
          <span className="text-base leading-none">+</span>
          <span className="hidden sm:inline">New Job</span>
        </Link>

        {/* Profile dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Account menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-7 8a7 7 0 0 1 14 0H5z" clipRule="evenodd" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-50 w-48 rounded-2xl border border-white/10 bg-[#0d1117] py-1.5 shadow-2xl backdrop-blur-xl">
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                <span>⚙️</span> Account
              </Link>

              {isAdmin && (
                <Link
                  href="/dashboard/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
                >
                  <span>📊</span> Admin
                </Link>
              )}

              <div className="my-1.5 border-t border-white/8" />

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400/80 transition hover:bg-white/5 hover:text-red-400"
              >
                <span>→</span> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
