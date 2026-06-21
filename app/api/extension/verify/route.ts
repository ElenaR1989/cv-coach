import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim()
  if (!token) return NextResponse.json({ error: "No token" }, { status: 401, headers: CORS })

  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("extension_token", token)
    .single()

  if (!data) return NextResponse.json({ error: "Invalid token" }, { status: 401, headers: CORS })
  return NextResponse.json({ ok: true }, { headers: CORS })
}
