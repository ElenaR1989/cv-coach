import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { applicationId, status: newStatus } = body

    if (!applicationId || !newStatus) {
      return NextResponse.json(
        { error: "Missing applicationId or status." },
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
      .select("id, status, company, role")
      .eq("id", applicationId)
      .eq("user_id", user.id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      )
    }

    const oldStatus = existing.status

    if (oldStatus === newStatus) {
      return NextResponse.json({ success: true })
    }

    const { error: updateError } = await supabase
      .from("job_applications")
      .update({ status: newStatus })
      .eq("id", applicationId)
      .eq("user_id", user.id)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    const { error: eventError } = await supabase
      .from("job_application_events")
      .insert({
        job_application_id: applicationId,
        user_id: user.id,
        event_type: "status_changed",
        title: `Status changed to ${newStatus}`,
        description: `${existing.company} — ${existing.role} moved from ${oldStatus} to ${newStatus}.`,
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