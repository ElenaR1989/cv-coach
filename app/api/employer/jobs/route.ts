import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

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

  // Notify Elena of new job posting
  try {
    const { data: emp } = await supabaseAdmin.from("employers").select("company_name").eq("id", employer.id).single()
    await resend.emails.send({
      from: "HireFlow <hello@hire-flow.app>",
      to: "hello@hire-flow.app",
      subject: `New job posted: ${title}`,
      html: `<p>A new job has been posted on HireFlow.</p>
<ul>
<li><strong>Company:</strong> ${emp?.company_name ?? "Unknown"}</li>
<li><strong>Role:</strong> ${title}</li>
<li><strong>Location:</strong> ${location}</li>
<li><strong>Type:</strong> ${job_type}</li>
</ul>
<p><a href="https://hire-flow.app/jobs">View on jobs board →</a></p>`,
    })
  } catch {}

  return NextResponse.json({ job: data })
}
