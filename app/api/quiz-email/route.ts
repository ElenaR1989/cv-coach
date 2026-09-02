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
      subject: `🎯 New quiz lead: ${email}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#050816;color:#fff;border-radius:16px;">
          <h2 style="color:#06b6d4;">New quiz lead 🎯</h2>
          <p style="color:rgba(255,255,255,0.7);">Someone completed the career quiz and unlocked their results with their email:</p>
          <p style="font-size:18px;font-weight:bold;color:#fff;">${email}</p>
          ${answers?.dream_job ? `<p style="color:rgba(255,255,255,0.6);font-size:14px;">💭 Dream job: <strong style="color:#fff;">${answers.dream_job}</strong></p>` : ""}
          ${answers?.blocker ? `<p style="color:rgba(255,255,255,0.6);font-size:14px;">🚧 Main blocker: <strong style="color:#fff;">${answers.blocker}</strong></p>` : ""}
          ${answers?.field ? `<p style="color:rgba(255,255,255,0.6);font-size:14px;">📚 Field: <strong style="color:#fff;">${answers.field}</strong></p>` : ""}
          ${answers?.priority ? `<p style="color:rgba(255,255,255,0.6);font-size:14px;">⭐ Priority: <strong style="color:#fff;">${answers.priority}</strong></p>` : ""}
          <p style="color:rgba(255,255,255,0.4);font-size:13px;margin-top:16px;">They haven't created a full account yet — consider sending them a personal follow-up!</p>
        </div>
      `,
    })
  } catch {}

  // Send follow-up to the lead
  try {
    await resend.emails.send({
      from: "Elena at HireFlow <hello@hire-flow.app>",
      to: email,
      subject: "Your career match results from HireFlow 🎯",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#050816;color:#fff;border-radius:16px;">
          <div style="margin-bottom:24px;">
            <img src="https://hire-flow.app/logo.png" width="32" height="32" style="border-radius:8px;" alt="HireFlow"/>
            <span style="margin-left:10px;font-weight:600;font-size:16px;">HireFlow</span>
          </div>
          <h2 style="color:#fff;margin-bottom:8px;">Your results are unlocked! 🎉</h2>
          <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;">
            Thanks for taking the HireFlow career quiz. Your top career matches are waiting for you — go back to the quiz to see your full results.
          </p>
          <div style="margin:24px 0;text-align:center;">
            <a href="https://hire-flow.app/career-quiz"
               style="background:#06b6d4;color:#000;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:15px;">
              View my results →
            </a>
          </div>
          <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.7;">
            Want to go further? Create a free HireFlow account to track your job applications, practise interviews with AI, and build a professional CV.
          </p>
          <div style="margin:20px 0;text-align:center;">
            <a href="https://hire-flow.app/signup"
               style="background:rgba(255,255,255,0.1);color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-size:14px;border:1px solid rgba(255,255,255,0.2);">
              Create free account
            </a>
          </div>
          <p style="color:rgba(255,255,255,0.3);font-size:12px;margin-top:32px;">
            — Elena, Founder of HireFlow<br/>
            <a href="https://hire-flow.app" style="color:#06b6d4;">hire-flow.app</a>
          </p>
        </div>
      `,
    })
  } catch {}

  return NextResponse.json({ ok: true })
}
