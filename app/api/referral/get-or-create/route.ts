import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

function makeCode(userId: string) {
  // 8-char code: first 4 of userId + 4 random chars
  const part = userId.replace(/-/g, "").slice(0, 4).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `HF-${part}-${rand}`
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Check if user already has a code
  const { data: existing } = await supabaseAdmin
    .from("referrals")
    .select("code")
    .eq("referrer_id", user.id)
    .is("used_by", null)
    .limit(1)
    .single()

  if (existing) return NextResponse.json({ code: existing.code })

  // Create new code
  const code = makeCode(user.id)
  const { error } = await supabaseAdmin
    .from("referrals")
    .insert({ referrer_id: user.id, code })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ code })
}
