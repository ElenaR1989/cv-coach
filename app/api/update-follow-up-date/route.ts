import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { applicationId, followUpDate } = body

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
      .select("id, company, role, follow_up_date")
      .eq("id", applicationId)
      .eq("user_id", user.id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      )
    }

    const normalizedDate =
      followUpDate && String(followUpDate).trim() !== ""
        ? String(followUpDate)
        : null

    const { error: updateError } = await supabase
      .from("job_applications")
      .update({ follow_up_date: normalizedDate })
      .eq("id", applicationId)
      .eq("user_id", user.id)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    let title = "Follow-up date updated"
    let description = `${existing.company} — ${existing.role} follow-up date was updated.`

    if (!existing.follow_up_date && normalizedDate) {
      title = "Follow-up date added"
      description = `${existing.company} — ${existing.role} follow-up date was set for ${normalizedDate}.`
    } else if (existing.follow_up_date && !normalizedDate) {
      title = "Follow-up date cleared"
      description = `${existing.company} — ${existing.role} follow-up date was cleared.`
    }

    await supabase.from("job_application_events").insert({
      job_application_id: applicationId,
      user_id: user.id,
      event_type: "follow_up_updated",
      title,
      description,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Something went wrong." },
      { status: 500 }
    )
  }
}