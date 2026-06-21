import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 })

  // Look up the referral
  const { data: referral, error: lookupErr } = await supabaseAdmin
    .from("referrals")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .single()

  if (lookupErr || !referral) return NextResponse.json({ error: "Invalid referral code" }, { status: 404 })
  if (referral.used_by) return NextResponse.json({ error: "Code already used" }, { status: 409 })
  if (referral.referrer_id === user.id) return NextResponse.json({ error: "You cannot use your own code" }, { status: 400 })

  // Mark as used
  const { error: updateErr } = await supabaseAdmin
    .from("referrals")
    .update({ used_by: user.id, used_at: new Date().toISOString() })
    .eq("id", referral.id)

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  // Grant 1 month Pro to referrer (store in profiles or a subscriptions table)
  // For now: mark reward_granted flag so admin can process
  await supabaseAdmin
    .from("referrals")
    .update({ reward_granted: true })
    .eq("id", referral.id)

  return NextResponse.json({ success: true, referrerId: referral.referrer_id })
}
