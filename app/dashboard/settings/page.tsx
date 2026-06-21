import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import Link from "next/link"
import ExtensionTokenPanel from "./extension-token-panel"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("extension_token")
    .eq("id", user.id)
    .single()

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-sm text-white/40">Manage your account and integrations</p>
        </div>
        <Link href="/dashboard" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:text-white">
          ← Dashboard
        </Link>
      </div>

      {/* Account */}
      <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/40">Account</h2>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-lg font-bold text-cyan-300">
            {user.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user.email}</p>
            <p className="text-xs text-white/30">Member since {new Date(user.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
          </div>
        </div>
      </div>

      {/* Chrome Extension */}
      <ExtensionTokenPanel existingToken={profile?.extension_token ?? null} />
    </div>
  )
}
