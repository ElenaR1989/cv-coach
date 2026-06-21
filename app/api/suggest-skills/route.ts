import OpenAI from "openai"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { experience, currentSkills } = await req.json()

  const prompt = `You are a professional CV writer. Based on the following work experience, suggest a list of relevant professional skills the candidate likely has but may not have listed.

Work experience:
${experience}

Current skills already listed:
${currentSkills || "None"}

Return a JSON array of up to 10 skill strings. Only include skills that are genuinely suggested by the experience. Do not make things up. Return ONLY valid JSON, no explanation.

Example: ["Project Management", "Stakeholder Communication", "Data Analysis"]`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    })

    const text = completion.choices[0]?.message?.content?.trim() ?? "[]"
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const skills: string[] = jsonMatch ? JSON.parse(jsonMatch[0]) : []

    return NextResponse.json({ skills })
  } catch {
    return NextResponse.json({ error: "Failed to suggest skills" }, { status: 500 })
  }
}
