import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim()
  if (!token) return NextResponse.json({ error: "No token" }, { status: 401 })

  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("extension_token", token)
    .single()

  if (!data) return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  return NextResponse.json({ ok: true })
}
