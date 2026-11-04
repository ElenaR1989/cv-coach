import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { company_name, company_description, website, location } = await req.json()
  if (!company_name) return NextResponse.json({ error: "Company name is required" }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from("employers")
    .upsert({ user_id: user.id, company_name, company_description, website, location }, { onConflict: "user_id" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ employer: data })
}
