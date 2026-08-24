import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  const { ref } = await req.json()
  if (!ref) return NextResponse.json({ ok: false })

  try {
    await supabaseAdmin
      .from("referral_clicks")
      .insert({ ref, clicked_at: new Date().toISOString() })
  } catch {}

  return NextResponse.json({ ok: true })
}
