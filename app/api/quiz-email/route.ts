import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { email, answers } = await req.json()
  if (!email) return NextResponse.json({ ok: false })

  // Save to quiz_leads table
  try {
    await supabaseAdmin.from("quiz_leads").insert({ email, answers })
  } catch {}

  // Notify Elena
  try {
    await resend.emails.send({
      from: "HireFlow <hello@hire-flow.app>",
      to: "hello@hire-flow.app",
      subject: `🧭 New quiz lead: ${email}`,
      html: `<div style="font-family:sans-serif;padding:24px;background:#050816;color:#fff;border-radius:12px;">
        <h2 style="color:#06b6d4;">New quiz lead 🎉</h2>
        <p style="color:rgba(255,255,255,0.7);">Someone completed the career quiz and entered their email:</p>
        <p style="font-size:18px;font-weight:bold;color:#fff;">${email}</p>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;">They unlocked their results without creating an account. Consider following up!</p>
      </div>`,
    })
  } catch {}

  // Send results email to the user
  try {
    await resend.emails.send({
      from: "Elena at HireFlow <hello@hire-flow.app>",
      to: email,
      subject: "Your HireFlow Career Quiz results 🧭",
      html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#050816;color:#fff;border-radius:16px;">
        <h2 style="color:#fff;margin-bottom:8px;">Your career quiz results are unlocked! 🎉</h2>
        <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;">
          Thanks for taking the HireFlow Career Match Quiz. Your full results including all 3 career matches and salary ranges are now visible on the page.
        </p>
        <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;">
          Want to take the next step? Create your free HireFlow account to track applications, practise interviews with AI, and get a personalised career roadmap.
        </p>
        <a href="https://hire-flow.app/signup" style="display:inline-block;margin-top:16px;background:#06b6d4;color:#000;padding:14px 28px;border-radius:12px;font-weight:bold;text-decoration:none;">
          Create your free account →
        </a>
        <p style="margin-top:24px;color:rgba(255,255,255,0.4);font-size:13px;">
          — Elena, HireFlow<br/>
          <a href="https://hire-flow.app" style="color:#06b6d4;">hire-flow.app</a>
        </p>
      </div>`,
    })
  } catch {}

  return NextResponse.json({ ok: true })
}
