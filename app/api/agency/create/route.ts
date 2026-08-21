import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, slug, tagline, brand_color, logo_url } = await req.json()
  if (!name || !slug) return NextResponse.json({ error: "Name and slug required" }, { status: 400 })

  // Check slug is unique
  const { data: existing } = await supabaseAdmin
    .from("agencies")
    .select("id")
    .eq("slug", slug)
    .single()

  if (existing) return NextResponse.json({ error: "This slug is already taken" }, { status: 409 })

  const { data: agency, error } = await supabaseAdmin
    .from("agencies")
    .insert({ name, slug, tagline, brand_color: brand_color || "#06b6d4", logo_url, contact_email: user.email })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Link creator as agency owner
  await supabaseAdmin.from("agency_users").insert({
    agency_id: agency.id,
    user_id: user.id,
    role: "owner",
  })

  const inviteLink = `https://hire-flow.app/agency/${slug}`
  const dashboardLink = `https://hire-flow.app/agency/dashboard?id=${agency.id}`

  // Email to Elena (you) — new agency notification
  try {
    await resend.emails.send({
      from: "HireFlow <hello@hire-flow.app>",
      to: "hello@hire-flow.app",
      subject: `🏢 New agency signed up: ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#050816;color:#fff;border-radius:16px;">
          <div style="margin-bottom:24px;">
            <img src="https://hire-flow.app/logo.png" width="32" height="32" style="border-radius:8px;" alt="HireFlow"/>
            <span style="margin-left:10px;font-weight:600;font-size:16px;color:#fff;">HireFlow</span>
          </div>
          <h2 style="color:#f59e0b;margin-bottom:8px;">New agency signed up! 🎉</h2>
          <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.7;">
            <strong style="color:#fff;">${name}</strong> just set up their branded platform.
          </p>
          <table style="margin:20px 0;border-collapse:collapse;width:100%;">
            <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:13px;">Agency name</td><td style="padding:6px 0;color:#fff;font-size:13px;">${name}</td></tr>
            <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:13px;">Slug</td><td style="padding:6px 0;color:#fff;font-size:13px;">${slug}</td></tr>
            <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:13px;">Tagline</td><td style="padding:6px 0;color:#fff;font-size:13px;">${tagline || "—"}</td></tr>
            <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:13px;">Contact</td><td style="padding:6px 0;color:#fff;font-size:13px;">${user.email}</td></tr>
            <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:13px;">Invite link</td><td style="padding:6px 0;font-size:13px;"><a href="${inviteLink}" style="color:#06b6d4;">${inviteLink}</a></td></tr>
          </table>
          <p style="color:rgba(255,255,255,0.5);font-size:13px;">Follow up with them within 24 hours to offer onboarding support and discuss pricing.</p>
          <div style="margin-top:32px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);font-size:12px;color:rgba(255,255,255,0.3);">
            <a href="https://hire-flow.app" style="color:#06b6d4;">hire-flow.app</a>
          </div>
        </div>
      `,
    })
  } catch (e) {
    console.error("Failed to send admin notification:", e)
  }

  // Welcome email to the agency owner
  if (user.email) {
    try {
      await resend.emails.send({
        from: "Elena at HireFlow <hello@hire-flow.app>",
        to: user.email,
        subject: `🎉 Your branded platform is live — ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#050816;color:#fff;border-radius:16px;">
            <div style="margin-bottom:24px;">
              <img src="https://hire-flow.app/logo.png" width="32" height="32" style="border-radius:8px;" alt="HireFlow"/>
              <span style="margin-left:10px;font-weight:600;font-size:16px;color:#fff;">HireFlow</span>
            </div>
            <h2 style="color:#fff;margin-bottom:4px;">Welcome to HireFlow, ${name}! 🎉</h2>
            <p style="color:rgba(255,255,255,0.6);font-size:14px;margin-top:4px;">Your branded candidate platform is live.</p>

            <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:12px;padding:20px;margin:24px 0;">
              <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.5);">Your candidate invite link:</p>
              <a href="${inviteLink}" style="color:#f59e0b;font-size:16px;font-weight:600;word-break:break-all;">${inviteLink}</a>
            </div>

            <h3 style="color:#fff;font-size:15px;margin-bottom:12px;">What to do next:</h3>
            <ol style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.8;padding-left:20px;">
              <li><strong style="color:#fff;">Share your invite link</strong> with your candidates — via email, WhatsApp, or your website</li>
              <li><strong style="color:#fff;">Candidates sign up</strong> and are automatically linked to your agency</li>
              <li><strong style="color:#fff;">Track their progress</strong> from your dashboard — applications sent, activity, and more</li>
            </ol>

            <div style="margin:24px 0;display:flex;gap:12px;">
              <a href="${dashboardLink}" style="display:inline-block;background:#06b6d4;color:#000;font-weight:600;font-size:14px;padding:12px 20px;border-radius:10px;text-decoration:none;">
                Go to your dashboard →
              </a>
            </div>

            <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.7;">
              Any questions? Just reply to this email — I'm here to help you get set up.<br/>
              <strong style="color:#fff;">— Elena, HireFlow</strong>
            </p>

            <div style="margin-top:32px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);font-size:12px;color:rgba(255,255,255,0.3);">
              <a href="https://hire-flow.app" style="color:#06b6d4;">hire-flow.app</a>
            </div>
          </div>
        `,
      })
    } catch (e) {
      console.error("Failed to send welcome email:", e)
    }
  }

  return NextResponse.json({ agency })
}
