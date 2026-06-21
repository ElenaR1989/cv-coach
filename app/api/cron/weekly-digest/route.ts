import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: Request) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch all users
  const { data } = await supabaseAdmin.auth.admin.listUsers()
  const users = data?.users ?? []

  let sent = 0

  for (const user of users) {
    if (!user.email) continue

    // Get their last 7 days of applications
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: apps } = await supabaseAdmin
      .from("job_applications")
      .select("job_title, company, status")
      .eq("user_id", user.id)
      .gte("created_at", since)
      .order("created_at", { ascending: false })

    const safeApps = apps ?? []

    // Count upcoming interviews
    const { data: interviews } = await supabaseAdmin
      .from("job_applications")
      .select("job_title, company, interview_date")
      .eq("user_id", user.id)
      .eq("status", "interview")
      .not("interview_date", "is", null)

    const upcoming = (interviews ?? []).filter(j => {
      if (!j.interview_date) return false
      const d = new Date(j.interview_date)
      return d > new Date()
    })

    const totalApps = (await supabaseAdmin
      .from("job_applications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)).count ?? 0

    const appRows = safeApps.length > 0
      ? safeApps.map(a => `<tr><td style="padding:8px 0;color:rgba(255,255,255,0.7);font-size:14px;">${a.job_title}</td><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:14px;">${a.company ?? ""}</td><td style="padding:8px 0;font-size:12px;"><span style="padding:2px 8px;border-radius:20px;background:rgba(6,182,212,0.15);color:#06b6d4;">${a.status}</span></td></tr>`).join("")
      : `<tr><td colspan="3" style="padding:12px 0;color:rgba(255,255,255,0.3);font-size:13px;">No new applications this week</td></tr>`

    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#050816;color:#fff;border-radius:16px;">
        <div style="margin-bottom:24px;">
          <span style="font-weight:700;font-size:18px;color:#fff;">HireFlow</span>
          <span style="margin-left:8px;font-size:13px;color:rgba(255,255,255,0.3);">Weekly digest</span>
        </div>

        <h2 style="font-size:20px;font-weight:600;margin-bottom:4px;">Your week in review</h2>
        <p style="font-size:14px;color:rgba(255,255,255,0.4);margin-bottom:24px;">Here's what happened with your job search this week.</p>

        <div style="display:flex;gap:16px;margin-bottom:24px;">
          <div style="flex:1;padding:16px;border-radius:12px;background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.2);">
            <div style="font-size:24px;font-weight:700;color:#06b6d4;">${safeApps.length}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:4px;">new this week</div>
          </div>
          <div style="flex:1;padding:16px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:24px;font-weight:700;color:#fff;">${totalApps}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:4px;">total applications</div>
          </div>
          <div style="flex:1;padding:16px;border-radius:12px;background:rgba(167,139,250,0.1);border:1px solid rgba(167,139,250,0.2);">
            <div style="font-size:24px;font-weight:700;color:#a78bfa;">${upcoming.length}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:4px;">upcoming interviews</div>
          </div>
        </div>

        ${safeApps.length > 0 ? `
        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:rgba(255,255,255,0.3);margin-bottom:12px;">This week's applications</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          ${appRows}
        </table>` : ""}

        <a href="https://hire-flow.app/dashboard" style="display:inline-block;padding:12px 24px;border-radius:12px;background:#06b6d4;color:#000;font-weight:600;font-size:14px;text-decoration:none;">
          Open HireFlow →
        </a>

        <div style="margin-top:32px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);font-size:12px;color:rgba(255,255,255,0.2);">
          You're receiving this weekly digest because you have a HireFlow account.
          <a href="https://hire-flow.app" style="color:#06b6d4;">hire-flow.app</a>
        </div>
      </div>
    `

    try {
      await resend.emails.send({
        from: "HireFlow <hello@hire-flow.app>",
        to: user.email,
        subject: `Your HireFlow weekly digest — ${safeApps.length} new application${safeApps.length !== 1 ? "s" : ""}`,
        html,
      })
      sent++
    } catch {
      // continue on individual failure
    }
  }

  return NextResponse.json({ sent, total: users.length })
}
