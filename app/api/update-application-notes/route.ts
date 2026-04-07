import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { applicationId, notes } = body

    if (!applicationId) {
      return NextResponse.json(
        { error: "Missing applicationId." },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const { data: existing, error: existingError } = await supabase
      .from("job_applications")
      .select("id, notes, company, role")
      .eq("id", applicationId)
      .eq("user_id", user.id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      )
    }

    const { error: updateError } = await supabase
      .from("job_applications")
      .update({ notes })
      .eq("id", applicationId)
      .eq("user_id", user.id)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    const oldNotes = existing.notes?.trim() || ""
    const newNotes = String(notes ?? "").trim()

    let title = "Notes updated"
    let description = `${existing.company} — ${existing.role} notes were updated.`

    if (!oldNotes && newNotes) {
      title = "Notes added"
      description = `${existing.company} — ${existing.role} notes were added.`
    } else if (oldNotes && !newNotes) {
      title = "Notes cleared"
      description = `${existing.company} — ${existing.role} notes were cleared.`
    }

    const { error: eventError } = await supabase
      .from("job_application_events")
      .insert({
        job_application_id: applicationId,
        user_id: user.id,
        event_type: "notes_updated",
        title,
        description,
      })

    if (eventError) {
      return NextResponse.json(
        { error: eventError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Something went wrong." },
      { status: 500 }
    )
  }
}