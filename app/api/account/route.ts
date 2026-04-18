import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const full_name = body.full_name ?? null
    const phone = body.phone ?? null
    const address_line_1 = body.address_line_1 ?? null
    const address_line_2 = body.address_line_2 ?? null
    const city = body.city ?? null
    const postcode = body.postcode ?? null
    const country = body.country ?? null
    const date_of_birth = body.date_of_birth || null

    const can_work_full_time =
      typeof body.can_work_full_time === "boolean"
        ? body.can_work_full_time
        : true

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name,
        phone,
        address_line_1,
        address_line_2,
        city,
        postcode,
        country,
        date_of_birth,
        can_work_full_time,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update profile"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}