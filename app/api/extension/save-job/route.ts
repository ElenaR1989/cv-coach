import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim()
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS })

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("extension_token", token)
    .single()

  if (!profile) return NextResponse.json({ error: "Invalid token" }, { status: 401, headers: CORS })

  const { job_title, company, location, status, job_description, url, source } = await req.json()
  if (!job_title?.trim()) return NextResponse.json({ error: "Job title required" }, { status: 400, headers: CORS })

  const { error } = await supabaseAdmin
    .from("job_applications")
    .insert({
      user_id: profile.id,
      job_title: job_title.trim(),
      company: company?.trim() || null,
      location: location?.trim() || null,
      status: status || "saved",
      job_description: job_description?.trim() || null,
      url: url || null,
      source: source || "Extension",
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS })
  return NextResponse.json({ success: true }, { headers: CORS })
}
