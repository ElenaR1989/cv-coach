import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 })
    }

    const { cvId, theme } = await req.json()

    const allowedThemes = ["default", "blue", "emerald", "burgundy"]

    if (!allowedThemes.includes(theme)) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 })
    }

    const { error } = await supabase
      .from("cv_profiles")
      .update({ theme })
      .eq("id", cvId)
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Server error while saving theme" },
      { status: 500 }
    )
  }
}