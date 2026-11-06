import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: employer } = await supabaseAdmin
    .from("employers")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!employer) return NextResponse.json({ jobs: [] })

  const { data: jobs } = await supabaseAdmin
    .from("job_postings")
    .select("*")
    .eq("employer_id", employer.id)
    .order("created_at", { ascending: false })

  return NextResponse.json({ jobs: jobs ?? [] })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: employer } = await supabaseAdmin
    .from("employers")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!employer) return NextResponse.json({ error: "No employer profile found" }, { status: 404 })

  const body = await req.json()
  const { title, description, location, job_type, salary_min, salary_max, apply_url } = body

  if (!title || !description || !location) {
    return NextResponse.json({ error: "Title, description and location are required" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("job_postings")
    .insert({ employer_id: employer.id, title, description, location, job_type, salary_min, salary_max, apply_url })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ job: data })
}
