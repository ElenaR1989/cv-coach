import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Get agencies where user is owner
  const { data: memberships } = await supabaseAdmin
    .from("agency_users")
    .select("agency_id")
    .eq("user_id", user.id)
    .eq("role", "owner")

  if (!memberships?.length) return NextResponse.json({ agencies: [] })

  const agencyIds = memberships.map(m => m.agency_id)

  const { data: agencies } = await supabaseAdmin
    .from("agencies")
    .select("*")
    .in("id", agencyIds)

  return NextResponse.json({ agencies: agencies || [] })
}
