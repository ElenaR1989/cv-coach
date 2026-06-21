import OpenAI from "openai"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { question, answer, role, company } = await req.json()

    if (!answer?.trim()) {
      return NextResponse.json({ score: 0, feedback: "No answer provided.", strengths: [], improvements: ["Provide a detailed answer"] })
    }

    const prompt = `You are an expert interview coach. Score this interview answer.

Role: ${role}
Company: ${company}
Question: ${question}
Candidate's Answer: ${answer}

Return JSON with:
- "score": integer 1-10
- "feedback": 2-3 sentence overall assessment
- "strengths": array of 1-2 specific things done well (short phrases)
- "improvements": array of 1-2 specific ways to improve (short phrases)`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5,
    })

    const result = JSON.parse(response.choices[0].message.content ?? "{}")
    return NextResponse.json(result)
  } catch (err) {
    console.error("interview-feedback error:", err)
    return NextResponse.json({ error: "Failed to score answer" }, { status: 500 })
  }
}
