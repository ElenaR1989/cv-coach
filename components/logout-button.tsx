"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
    >
      Logout
    </button>
  )
}