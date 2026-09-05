import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const agencySlug = searchParams.get("agency")
  // Allowlist redirect targets to avoid an open redirect via a crafted `next` param
  const next = searchParams.get("next") === "/career-quiz" ? "/career-quiz" : "/dashboard"

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    // If they came from an agency invite, link them
    if (agencySlug) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: agency } = await supabaseAdmin
          .from("agencies")
          .select("id")
          .eq("slug", agencySlug)
          .eq("is_active", true)
          .single()

        if (agency) {
          await supabaseAdmin
            .from("agency_users")
            .upsert(
              { agency_id: agency.id, user_id: user.id, role: "candidate" },
              { onConflict: "agency_id,user_id", ignoreDuplicates: true }
            )
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
