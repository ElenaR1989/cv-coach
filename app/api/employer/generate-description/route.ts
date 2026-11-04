import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import OpenAI from "openai"

const openai = new OpenAI()

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, company_name, location, job_type, requirements } = await req.json()
  if (!title) return NextResponse.json({ error: "Job title is required" }, { status: 400 })

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 800,
    messages: [{
      role: "user",
      content: `Write a professional job description for a UK employer. Keep it clear, friendly and encouraging. Include sections for: About the Role, What You'll Do, What We're Looking For, and What We Offer.

Job title: ${title}
Company: ${company_name || "our company"}
Location: ${location || "UK"}
Job type: ${job_type || "full-time"}
Key requirements: ${requirements || "not specified"}

Write in plain English, no jargon. Keep it under 300 words. Do not include salary details.`,
    }],
  })

  const description = completion.choices[0].message.content ?? ""
  return NextResponse.json({ description })
}
