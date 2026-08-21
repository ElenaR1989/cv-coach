import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const agencyId = searchParams.get("agency_id")
  if (!agencyId) return NextResponse.json({ error: "agency_id required" }, { status: 400 })

  // Verify user owns this agency
  const { data: ownership } = await supabaseAdmin
    .from("agency_users")
    .select("id")
    .eq("agency_id", agencyId)
    .eq("user_id", user.id)
    .eq("role", "owner")
    .single()

  if (!ownership) return NextResponse.json({ error: "Not authorized" }, { status: 403 })

  // Get all users who opted in to be visible to agencies
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("user_id, full_name, career_goal, location, created_at, open_to_agencies")
    .eq("open_to_agencies", true)
    .order("created_at", { ascending: false })
    .limit(100)

  // Exclude candidates already in this agency
  const { data: existing } = await supabaseAdmin
    .from("agency_users")
    .select("user_id")
    .eq("agency_id", agencyId)

  const existingIds = new Set(existing?.map(e => e.user_id) || [])
  const leads = (profiles || []).filter(p => !existingIds.has(p.user_id))

  // Get application counts for context
  if (leads.length) {
    const userIds = leads.map(l => l.user_id)
    const { data: apps } = await supabaseAdmin
      .from("job_applications")
      .select("user_id")
      .in("user_id", userIds)

    const appCounts = apps?.reduce((acc: Record<string, number>, a) => {
      acc[a.user_id] = (acc[a.user_id] || 0) + 1
      return acc
    }, {}) || {}

    const result = leads.map(l => ({
      ...l,
      applications: appCounts[l.user_id] || 0,
    }))

    return NextResponse.json({ leads: result })
  }

  return NextResponse.json({ leads: [] })
}
