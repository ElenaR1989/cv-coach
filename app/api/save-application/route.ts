import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const company =
      body.company ??
      body.company_name ??
      body.companyName ??
      ""

    const role =
      body.role ??
      body.job_title ??
      body.jobTitle ??
      ""

    const status = body.status ?? "Saved"
    const notes = body.notes ?? null
    const interview_date =
      body.interview_date ?? body.interviewDate ?? null
    const cv_id = body.cv_id ?? body.cvId ?? null
    const cover_letter =
      body.cover_letter ?? body.coverLetter ?? null
    const job_description =
      body.job_description ?? body.jobDescription ?? null

    if (!company || !role) {
      return NextResponse.json(
        { error: "Company and role are required." },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("job_applications")
      .insert({
        user_id: user.id,
        company,
        role,
        status,
        notes,
        interview_date,
        cv_id,
        cover_letter,
        job_description,
      })
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Failed to save application." },
        { status: 500 }
      )
    }

    const { error: eventError } = await supabase
      .from("job_application_events")
      .insert({
        job_application_id: data.id,
        user_id: user.id,
        event_type: "created",
        title: "Application created",
        description: "Application added to your tracker.",
      })

    if (eventError) {
      return NextResponse.json(
        { error: eventError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      application: data,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Something went wrong." },
      { status: 500 }
    )
  }
}