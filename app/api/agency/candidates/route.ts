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

  // Get all candidates in this agency
  const { data: candidates } = await supabaseAdmin
    .from("agency_users")
    .select("user_id, joined_at")
    .eq("agency_id", agencyId)
    .neq("role", "owner")

  if (!candidates?.length) return NextResponse.json({ candidates: [] })

  // Get their job application counts
  const userIds = candidates.map(c => c.user_id)
  const { data: apps } = await supabaseAdmin
    .from("job_applications")
    .select("user_id")
    .in("user_id", userIds)

  const appCounts = apps?.reduce((acc: Record<string, number>, app) => {
    acc[app.user_id] = (acc[app.user_id] || 0) + 1
    return acc
  }, {}) || {}

  const result = candidates.map(c => ({
    user_id: c.user_id,
    joined_at: c.joined_at,
    applications: appCounts[c.user_id] || 0,
  }))

  return NextResponse.json({ candidates: result })
}
