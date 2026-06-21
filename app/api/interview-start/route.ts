import OpenAI from "openai"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getIsPro } from "@/lib/billing/is-pro"

type Question = { question: string; type: string; tip: string }

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

    const isPro = getIsPro(profile)

    if (!isPro) {
      // Count interviews this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count } = await supabase
        .from("practice_interviews")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth.toISOString())

      if ((count ?? 0) >= 1) {
        return NextResponse.json(
          { error: "free_limit", message: "Free plan allows 1 practice interview per month. Upgrade to Pro for unlimited." },
          { status: 403 }
        )
      }
    }

    const { applicationId, role, company, jobDescription } = await req.json()

    const prompt = `You are a professional interviewer. Generate 6 interview questions for this role.

Role: ${role}
Company: ${company}
Job Description: ${jobDescription?.slice(0, 2000) || "Not provided"}

Return a JSON array of exactly 6 objects, each with:
- "question": the interview question
- "type": one of "behavioural", "technical", "situational", "motivation"
- "tip": a one-sentence hint on how to approach this question

Focus on questions that are specific to this role. Mix behavioural (STAR method), technical, and motivational questions.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    })

    const raw = JSON.parse(response.choices[0].message.content ?? "{}")
    // OpenAI may wrap in different keys — find the array wherever it lives
    const questions: Question[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw.questions)
      ? raw.questions
      : Array.isArray(raw.interview_questions)
      ? raw.interview_questions
      : Object.values(raw).find(Array.isArray) ?? []

    // Create the interview session record
    const { data: session } = await supabase
      .from("practice_interviews")
      .insert({
        user_id: user.id,
        application_id: applicationId || null,
        questions,
        role,
        company,
      })
      .select("id")
      .single()

    return NextResponse.json({ questions, sessionId: session?.id })
  } catch (err) {
    console.error("interview-start error:", err)
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 })
  }
}
