import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getIsAdmin } from "@/lib/auth/is-admin"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("is_admin, role").eq("id", user.id).single()
  if (!getIsAdmin(profile, user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { action } = await req.json()
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  const newStatus = action === "approve" ? "active" : "rejected"

  const { data: job, error } = await supabaseAdmin
    .from("job_postings")
    .update({ status: newStatus, is_active: action === "approve" })
    .eq("id", id)
    .select("*, employers(company_name, user_id)")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Email the employer
  try {
    const employerUserId = job.employers?.user_id
    if (employerUserId) {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(employerUserId)
      const employerEmail = authUser?.user?.email
      if (employerEmail) {
        if (action === "approve") {
          await resend.emails.send({
            from: "HireFlow <hello@hire-flow.app>",
            to: employerEmail,
            subject: `Your job is live: ${job.title}`,
            html: `<p>Hi ${job.employers?.company_name},</p>
<p>Your job posting has been approved and is now live on HireFlow.</p>
<p><strong>${job.title}</strong> · ${job.location}</p>
<p><a href="https://hire-flow.app/jobs/${job.id}">View your listing →</a></p>
<p>Good luck with your search!</p>
<p>Elena<br>HireFlow</p>`,
          })
        } else {
          await resend.emails.send({
            from: "HireFlow <hello@hire-flow.app>",
            to: employerEmail,
            subject: `Update on your job posting: ${job.title}`,
            html: `<p>Hi ${job.employers?.company_name},</p>
<p>Unfortunately we weren't able to approve your recent job posting for <strong>${job.title}</strong>.</p>
<p>If you think this was a mistake or would like to resubmit with changes, please reply to this email and we'll be happy to help.</p>
<p>Elena<br>HireFlow</p>`,
          })
        }
      }
    }
  } catch {}

  return NextResponse.json({ job })
}
