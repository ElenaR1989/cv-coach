import OpenAI from "openai"
import { NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const currentSummary = String(body.currentSummary || "").trim()
    const jobDescription = String(body.jobDescription || "").trim()
    const impactMode = Boolean(body.impactMode)

    if (!currentSummary) {
      return NextResponse.json(
        { error: "Current CV summary is required." },
        { status: 400 }
      )
    }

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required." },
        { status: 400 }
      )
    }

    const prompt = `
You are an expert UK CV writer and recruiter.

Rewrite the candidate's professional summary so it feels stronger, more natural, and more tailored to the job description.

Rules:
- Use British English.
- Keep it truthful.
- Do not invent qualifications, fake achievements, fake numbers, or fake experience.
- Keep the tone professional, clear, and confident.
- Make it sound like a strong real CV summary written by a human.
- Focus on relevance to the job description.
- Avoid repetitive sentences.
- Avoid robotic phrases like "brings strengths in..."
- Keep it to around 90 to 160 words.
- Output plain text only, no markdown, no bullet points, no JSON.

Extra style instruction:
${impactMode ? "Make it slightly more results-focused and impactful." : "Keep it straightforward and natural."}

Current CV summary:
${currentSummary}

Job description:
${jobDescription}
`

    const response = await openai.responses.create({
      model: "gpt-5.4",
      input: prompt,
    })

    const rewrittenSummary = response.output_text?.trim()

    if (!rewrittenSummary) {
      return NextResponse.json(
        { error: "No rewritten summary was returned." },
        { status: 500 }
      )
    }

    return NextResponse.json({ summary: rewrittenSummary })
  } catch (error: any) {
    console.error("Rewrite CV summary error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to rewrite CV summary." },
      { status: 500 }
    )
  }
}