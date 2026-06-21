import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }

    const { email } = await req.json()
    if (!email?.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/dashboard`,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true, email: data.user?.email })
  } catch (err) {
    console.error("invite error:", err)
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 })
  }
}
