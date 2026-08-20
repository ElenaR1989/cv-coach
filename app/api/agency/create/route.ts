import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, slug, tagline, brand_color, logo_url } = await req.json()
  if (!name || !slug) return NextResponse.json({ error: "Name and slug required" }, { status: 400 })

  // Check slug is unique
  const { data: existing } = await supabaseAdmin
    .from("agencies")
    .select("id")
    .eq("slug", slug)
    .single()

  if (existing) return NextResponse.json({ error: "This slug is already taken" }, { status: 409 })

  const { data: agency, error } = await supabaseAdmin
    .from("agencies")
    .insert({ name, slug, tagline, brand_color: brand_color || "#06b6d4", logo_url, contact_email: user.email })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Link creator as agency owner
  await supabaseAdmin.from("agency_users").insert({
    agency_id: agency.id,
    user_id: user.id,
    role: "owner",
  })

  return NextResponse.json({ agency })
}
