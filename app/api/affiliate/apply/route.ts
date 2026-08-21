import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { name, email, how } = await req.json()
  if (!name || !email || !how) return NextResponse.json({ error: "All fields required" }, { status: 400 })

  // Notify Elena
  try {
    await resend.emails.send({
      from: "HireFlow <hello@hire-flow.app>",
      to: "hello@hire-flow.app",
      subject: `💸 New affiliate application: ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#050816;color:#fff;border-radius:16px;">
          <div style="margin-bottom:24px;">
            <img src="https://hire-flow.app/logo.png" width="32" height="32" style="border-radius:8px;" alt="HireFlow"/>
            <span style="margin-left:10px;font-weight:600;font-size:16px;">HireFlow</span>
          </div>
          <h2 style="color:#8b5cf6;margin-bottom:8px;">New affiliate application 💸</h2>
          <table style="margin:20px 0;border-collapse:collapse;width:100%;">
            <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:13px;">Name</td><td style="padding:6px 0;color:#fff;font-size:13px;">${name}</td></tr>
            <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:13px;">Email</td><td style="padding:6px 0;color:#fff;font-size:13px;"><a href="mailto:${email}" style="color:#8b5cf6;">${email}</a></td></tr>
            <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:13px;">How they'll promote</td><td style="padding:6px 0;color:#fff;font-size:13px;">${how}</td></tr>
          </table>
          <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.7;">
            Reply to approve them and send their unique referral link.<br/>
            Their referral link will be: <strong style="color:#8b5cf6;">hire-flow.app/premium?ref=${name.toLowerCase().replace(/\s+/g, "-")}</strong>
          </p>
        </div>
      `,
    })
  } catch (e) {
    console.error("Failed to notify Elena:", e)
  }

  // Confirm to applicant
  try {
    await resend.emails.send({
      from: "Elena at HireFlow <hello@hire-flow.app>",
      to: email,
      subject: "Your HireFlow affiliate application — received!",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#050816;color:#fff;border-radius:16px;">
          <div style="margin-bottom:24px;">
            <img src="https://hire-flow.app/logo.png" width="32" height="32" style="border-radius:8px;" alt="HireFlow"/>
            <span style="margin-left:10px;font-weight:600;font-size:16px;">HireFlow</span>
          </div>
          <h2 style="color:#fff;margin-bottom:4px;">Hi ${name}, thanks for applying! 🎉</h2>
          <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin-top:16px;">
            I've received your affiliate application and will review it within 24 hours.
          </p>
          <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;">
            Once approved, I'll send you your unique referral link and everything you need to get started — including a short guide on how to promote the Premium package effectively.
          </p>
          <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:12px;padding:20px;margin:24px 0;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#c4b5fd;">How you earn:</p>
            <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.7);">Every time someone buys HireFlow Premium (£500) via your unique link, you earn <strong style="color:#fff;">£100</strong> — paid within 7 days of the sale.</p>
          </div>
          <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.7;">
            Any questions? Just reply to this email.<br/>
            <strong style="color:#fff;">— Elena, HireFlow</strong>
          </p>
          <div style="margin-top:32px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);font-size:12px;color:rgba(255,255,255,0.3);">
            <a href="https://hire-flow.app" style="color:#8b5cf6;">hire-flow.app</a>
          </div>
        </div>
      `,
    })
  } catch (e) {
    console.error("Failed to send confirmation:", e)
  }

  return NextResponse.json({ success: true })
}
