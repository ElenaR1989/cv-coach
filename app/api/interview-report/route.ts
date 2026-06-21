import OpenAI from "openai"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getIsPro } from "@/lib/billing/is-pro"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_pro, plan")
      .eq("id", user.id)
      .single()

    if (!getIsPro(profile)) {
      return NextResponse.json({ error: "Pro feature" }, { status: 403 })
    }

    const { sessionId, qa, role, company } = await req.json()

    const qaText = qa.map((item: { question: string; answer: string; score: number }, i: number) =>
      `Q${i + 1} [Score: ${item.score}/10]: ${item.question}\nAnswer: ${item.answer}`
    ).join("\n\n")

    const prompt = `You are an expert interview coach reviewing a full mock interview.

Role: ${role}
Company: ${company}

Interview Q&A with scores:
${qaText}

Generate a comprehensive report as JSON with:
- "overallScore": average score rounded to 1 decimal
- "summary": 2-3 sentence overall performance summary
- "topStrengths": array of 3 specific strengths demonstrated (complete sentences)
- "areasToImprove": array of 3 specific improvement areas with actionable advice (complete sentences)
- "readyToInterview": boolean — true if average score >= 6
- "encouragement": one motivating closing sentence`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.6,
    })

    const report = JSON.parse(response.choices[0].message.content ?? "{}")

    // Save report to the session
    if (sessionId) {
      await supabase
        .from("practice_interviews")
        .update({ answers: qa, report })
        .eq("id", sessionId)
        .eq("user_id", user.id)
    }

    return NextResponse.json(report)
  } catch (err) {
    console.error("interview-report error:", err)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
