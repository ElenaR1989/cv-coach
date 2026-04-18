import OpenAI from "openai"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getIsPro } from "@/lib/billing/is-pro"

const FREE_COVER_LETTER_LIMIT = 3

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_pro, plan")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error loading profile:", profileError.message)
    }

    const isPro = getIsPro(profile)

    if (!isPro) {
      const { count, error: countError } = await supabase
        .from("cover_letters")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      if (countError) {
        console.error("Error counting cover letters:", countError.message)
        return NextResponse.json(
          { error: "Failed to check usage." },
          { status: 500 }
        )
      }

      if ((count ?? 0) >= FREE_COVER_LETTER_LIMIT) {
        return NextResponse.json(
          { error: "Free limit reached. Upgrade to Pro." },
          { status: 403 }
        )
      }
    }

    const body = await req.json()

    const cvId = String(body.cvId || "").trim()
    const cvText = String(body.cvText || "").trim()
    const fullName = String(body.fullName || "").trim()
    const email = String(body.email || "").trim()
    const phone = String(body.phone || "").trim()
    const jobTitle = String(body.jobTitle || "").trim()
    const companyName = String(body.companyName || "").trim()
    const hiringManager = String(body.hiringManager || "").trim()
    const location = String(body.location || "").trim()
    const jobDescription = String(body.jobDescription || "").trim()

    if (!cvText || !jobTitle || !companyName || !jobDescription) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      )
    }

    const prompt = `
You are an expert UK cover letter writer.

Write a professional, realistic, tailored cover letter.

Rules:
- Use British English.
- Keep it natural, specific, and professional.
- Do not invent fake qualifications, fake years, or fake results.
- Use only the information supported by the CV and the job description.
- Make it sound strong but believable.
- Keep it around 300 to 450 words.
- Output plain text only, no markdown, no JSON.
- Start with the candidate's name and contact details at the top.
- Then write the salutation.
- Then write the cover letter body.
- End with a polite sign-off.

Candidate details:
Name: ${fullName || "Candidate"}
Email: ${email || ""}
Phone: ${phone || ""}
Location: ${location || ""}

Job details:
Job title: ${jobTitle}
Company: ${companyName}
Hiring manager: ${hiringManager || "Hiring Manager"}

Candidate CV:
${cvText}

Job description:
${jobDescription}
`

    const response = await openai.responses.create({
      model: "gpt-5.4",
      input: prompt,
    })

    const letter = response.output_text?.trim()

    if (!letter) {
      return NextResponse.json(
        { error: "No cover letter returned from OpenAI." },
        { status: 500 }
      )
    }

    const { error: saveError } = await supabase
      .from("cover_letters")
      .insert({
        user_id: user.id,
        cv_id: cvId || null,
        job_title: jobTitle,
        company_name: companyName,
        content: letter,
      })

    if (saveError) {
      console.error("Error saving cover letter:", saveError.message)
      return NextResponse.json(
        { error: saveError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ letter })
  } catch (error: unknown) {
    console.error("Generate cover letter error:", error)

    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate cover letter."

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}