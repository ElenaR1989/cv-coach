import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { code } = await req.json()
  if (!code?.trim()) return NextResponse.json({ error: "No code provided" }, { status: 400 })

  const upperCode = code.trim().toUpperCase()

  // Look up promo code
  const { data: promo } = await supabaseAdmin
    .from("promo_codes")
    .select("*")
    .eq("code", upperCode)
    .single()

  if (!promo) return NextResponse.json({ error: "Invalid promo code" }, { status: 404 })

  // Check expiry
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return NextResponse.json({ error: "This promo code has expired" }, { status: 410 })
  }

  // Check max uses
  if (promo.max_uses !== null && promo.uses >= promo.max_uses) {
    return NextResponse.json({ error: "This promo code has reached its limit" }, { status: 410 })
  }

  // Check already redeemed
  const { data: existing } = await supabaseAdmin
    .from("promo_redemptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("code", upperCode)
    .single()

  if (existing) return NextResponse.json({ error: "You have already used this code" }, { status: 409 })

  // Calculate pro_until
  const proUntil = new Date()
  proUntil.setMonth(proUntil.getMonth() + (promo.months_free ?? 1))

  // Record redemption
  await supabaseAdmin.from("promo_redemptions").insert({
    user_id: user.id,
    code: upperCode,
    pro_until: proUntil.toISOString(),
  })

  // Grant Pro
  await supabaseAdmin.from("profiles").upsert({
    id: user.id,
    is_pro: true,
    pro_until: proUntil.toISOString(),
  }, { onConflict: "id" })

  // Increment uses
  await supabaseAdmin.from("promo_codes").update({ uses: promo.uses + 1 }).eq("id", promo.id)

  return NextResponse.json({ success: true, proUntil: proUntil.toISOString() })
}
