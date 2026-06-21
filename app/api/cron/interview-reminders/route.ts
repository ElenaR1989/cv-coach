import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Find all applications with interview_date tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateStr = tomorrow.toISOString().split("T")[0] // YYYY-MM-DD

  const { data: jobs } = await supabaseAdmin
    .from("job_applications")
    .select("id, job_title, company, interview_date, user_id")
    .eq("status", "interview")
    .gte("interview_date", `${dateStr}T00:00:00`)
    .lt("interview_date", `${dateStr}T23:59:59`)

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  let sent = 0
  for (const job of jobs) {
    // Get user email
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(job.user_id)
    const email = userData?.user?.email
    if (!email) continue

    const interviewTime = job.interview_date
      ? new Date(job.interview_date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      : "tomorrow"

    try {
      await resend.emails.send({
        from: "HireFlow <hello@hire-flow.app>",
        to: email,
        subject: `Interview reminder: ${job.job_title} at ${job.company} tomorrow`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#050816;color:#fff;border-radius:16px;">
            <div style="margin-bottom:24px;font-size:32px;">🤖</div>
            <h2 style="font-size:22px;font-weight:700;margin-bottom:8px;">Interview tomorrow!</h2>
            <p style="font-size:15px;color:rgba(255,255,255,0.6);margin-bottom:24px;">
              You have an interview for <strong style="color:#fff;">${job.job_title}</strong> at <strong style="color:#fff;">${job.company}</strong> at ${interviewTime}.
            </p>
            <div style="padding:16px;border-radius:12px;background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.2);margin-bottom:24px;">
              <p style="font-size:14px;color:rgba(255,255,255,0.7);margin:0;">
                💡 Tip: Use HireFlow's AI Practice Interview to warm up — get instant feedback on your answers.
              </p>
            </div>
            <a href="https://hire-flow.app/dashboard" style="display:inline-block;padding:12px 24px;border-radius:12px;background:#06b6d4;color:#000;font-weight:600;font-size:14px;text-decoration:none;">
              Open HireFlow →
            </a>
            <div style="margin-top:32px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);font-size:12px;color:rgba(255,255,255,0.2);">
              Good luck! — The HireFlow team
            </div>
          </div>
        `,
      })
      sent++
    } catch {
      // continue
    }
  }

  return NextResponse.json({ sent, total: jobs.length })
}
