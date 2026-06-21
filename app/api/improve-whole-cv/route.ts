import OpenAI from "openai"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { summary, experience } = await req.json()

  const prompt = `You are an expert CV writer. Improve the following CV content to be more professional, impactful, and achievement-focused. Use strong action verbs. Do not invent fake metrics or achievements.

Current summary:
${summary || "None"}

Work experience (array of jobs with title, company, dates, description):
${JSON.stringify(experience, null, 2)}

Return ONLY valid JSON in this exact format:
{
  "summary": "improved summary text here",
  "experience": [
    { "title": "...", "company": "...", "dates": "...", "description": "improved description with one achievement per line" }
  ]
}

Rules:
- Keep descriptions as bullet-point lines (one per line, no hyphens or asterisks)
- Do not invent companies, titles, or dates
- Keep the same number of experience entries
- Make the summary 2-4 sentences, professional and confident`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    })

    const text = completion.choices[0]?.message?.content?.trim() ?? ""
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON returned")
    const result = JSON.parse(jsonMatch[0])

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to improve CV" }, { status: 500 })
  }
}
