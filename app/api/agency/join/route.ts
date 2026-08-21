import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { slug } = await req.json()
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 })

  // Find agency by slug
  const { data: agency } = await supabaseAdmin
    .from("agencies")
    .select("id, name")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!agency) return NextResponse.json({ error: "Agency not found" }, { status: 404 })

  // Link user as candidate (ignore if already linked)
  const { error } = await supabaseAdmin
    .from("agency_users")
    .upsert(
      { agency_id: agency.id, user_id: user.id, role: "candidate" },
      { onConflict: "agency_id,user_id", ignoreDuplicates: true }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, agency_name: agency.name })
}
