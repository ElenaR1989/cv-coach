import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }

    const { subject, message, recipients } = await req.json()

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 })
    }

    // If no specific recipients, fetch all users
    let emails: string[] = recipients ?? []
    if (emails.length === 0) {
      const { data } = await supabaseAdmin.auth.admin.listUsers()
      emails = (data?.users ?? []).map(u => u.email).filter(Boolean) as string[]
    }

    if (emails.length === 0) {
      return NextResponse.json({ error: "No recipients found" }, { status: 400 })
    }

    // Send in batches of 50 (Resend limit per request)
    const batches = []
    for (let i = 0; i < emails.length; i += 50) {
      batches.push(emails.slice(i, i + 50))
    }

    let sent = 0
    for (const batch of batches) {
      await resend.emails.send({
        from: "HireFlow <hello@hire-flow.app>",
        to: batch,
        subject,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#050816;color:#fff;border-radius:16px;">
            <div style="margin-bottom:24px;">
              <img src="https://hire-flow.app/logo.png" width="32" height="32" style="border-radius:8px;" alt="HireFlow"/>
              <span style="margin-left:10px;font-weight:600;font-size:16px;color:#fff;">HireFlow</span>
            </div>
            <div style="white-space:pre-wrap;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.8);">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
            <div style="margin-top:32px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);font-size:12px;color:rgba(255,255,255,0.3);">
              You received this because you have a HireFlow account.
              <a href="https://hire-flow.app" style="color:#06b6d4;">hire-flow.app</a>
            </div>
          </div>
        `,
      })
      sent += batch.length
    }

    return NextResponse.json({ success: true, sent })
  } catch (err) {
    console.error("send-email error:", err)
    return NextResponse.json({ error: "Failed to send emails" }, { status: 500 })
  }
}
