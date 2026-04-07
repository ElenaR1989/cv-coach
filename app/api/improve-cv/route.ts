import OpenAI from "openai"
import { NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const cvText = String(body.cvText || "").trim()
    const jobText = String(body.jobText || "").trim()

    if (!cvText || !jobText) {
      return NextResponse.json(
        { error: "Missing CV text or job description." },
        { status: 400 }
      )
    }

    const prompt = `
You are an expert CV and recruitment writer.

Your task:
Rewrite the candidate's CV bullet points so they are stronger and better aligned to the job description.

Rules:
- Return valid JSON only.
- Do not invent fake achievements or fake numbers.
- Improve wording, clarity, professionalism, and relevance.
- Keep the meaning truthful.
- Focus on experience bullet points, not name or contact details.
- If the original bullet is weak, rewrite it into a stronger professional bullet.
- Tailor wording toward the job description.
- Return 3 to 6 improved bullets maximum.
- Also return 3 to 5 short tailoring tips.

Return exactly this JSON shape:
{
  "title": "Tailored CV Improvements",
  "improvedBullets": [
    {
      "before": "original text",
      "after": "improved text"
    }
  ],
  "suggestions": [
    "tip 1",
    "tip 2"
  ]
}

Candidate CV:
${cvText}

Job Description:
${jobText}
`

    const response = await openai.responses.create({
      model: "gpt-5.4",
      input: prompt,
    })

    const text = response.output_text?.trim()

    if (!text) {
      return NextResponse.json(
        { error: "No response text returned from OpenAI." },
        { status: 500 }
      )
    }

    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      return NextResponse.json(
        {
          error: "Could not parse AI response as JSON.",
          raw: text,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(parsed)
  } catch (error: any) {
    console.error("Improve CV API error:", error)
    return NextResponse.json(
      {
        error:
          error?.message || "Something went wrong while improving the CV.",
      },
      { status: 500 }
    )
  }
}