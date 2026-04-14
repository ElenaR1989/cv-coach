import OpenAI from "openai"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type RequestBody = {
  applicationId: string
  currentText: string
  missingKeywords: string[]
  jobDescription: string
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await req.json()) as Partial<RequestBody>

    const applicationId = String(body.applicationId ?? "").trim()
    const currentText = String(body.currentText ?? "").trim()
    const jobDescription = String(body.jobDescription ?? "").trim()
    const missingKeywords = Array.isArray(body.missingKeywords)
      ? body.missingKeywords
          .map((item) => String(item).trim())
          .filter(Boolean)
          .slice(0, 8)
      : []

    if (!applicationId || !currentText || !jobDescription) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      )
    }

    const { data: application, error: appError } = await supabase
      .from("job_applications")
      .select("id, user_id, original_tailored_cv")
      .eq("id", applicationId)
      .eq("user_id", user.id)
      .single()

    if (appError || !application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      )
    }

    const prompt = `
You are an expert UK CV writer.

Rewrite the CV summary below so it matches the job better.

Rules:
- Keep it truthful.
- Do NOT invent fake jobs, fake qualifications, fake care experience, or fake achievements.
- Improve wording so it sounds natural, human, and professional.
- Weave in the missing keywords only where they fit naturally.
- Prioritise transferable skills if direct experience is missing.
- Return plain text only.
- Keep it to one strong professional profile paragraph.

Missing keywords to consider:
${missingKeywords.join(", ") || "None"}

Current CV summary:
${currentText}

Job description:
${jobDescription}
`.trim()

    const response = await openai.responses.create({
      model: "gpt-5.4",
      input: prompt,
    })

    const improvedText = response.output_text?.trim()

    if (!improvedText) {
      return NextResponse.json(
        { error: "AI did not return any text." },
        { status: 500 }
      )
    }

    const updatePayload: {
      tailored_cv: string
      original_tailored_cv?: string
    } = {
      tailored_cv: improvedText,
    }

    if (!application.original_tailored_cv?.trim()) {
      updatePayload.original_tailored_cv = currentText
    }

    const { error: updateError } = await supabase
      .from("job_applications")
      .update(updatePayload)
      .eq("id", applicationId)
      .eq("user_id", user.id)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tailored_cv: improvedText,
      original_tailored_cv:
        updatePayload.original_tailored_cv ?? application.original_tailored_cv ?? null,
    })
  } catch (error) {
    console.error("AI improve CV error:", error)
    return NextResponse.json(
      { error: "Something went wrong while improving the CV." },
      { status: 500 }
    )
  }
}