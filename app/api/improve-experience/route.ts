import { NextResponse } from "next/server"
import OpenAI from "openai"

const aiEnabled = process.env.AI_ENABLED === "true"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function mockImproveText(input: string) {
  const lines = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    return [
      "Supported day-to-day operations in a fast-paced work environment.",
      "Worked effectively with team members to deliver reliable service.",
      "Helped maintain standards, organisation, and customer satisfaction.",
    ].join("\n")
  }

  return lines
    .map((line) => {
      const cleaned = line.replace(/^[-•*]\s*/, "").trim()
      if (!cleaned) return ""
      const capitalized =
        cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
      return capitalized.endsWith(".")
        ? capitalized
        : `${capitalized}.`
    })
    .filter(Boolean)
    .join("\n")
}

export async function POST(req: Request) {
  try {
    const { description } = await req.json()

    const input = String(description || "").trim()

    if (!input) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      )
    }

    if (!aiEnabled) {
      return NextResponse.json({
        improved: mockImproveText(input),
        mode: "mock",
      })
    }

    const response = await openai.responses.create({
      model: "gpt-5",
      input: `Rewrite the following job experience into strong CV bullet points.

Rules:
- Return 3 to 5 bullet-style lines
- One achievement per line
- Professional and concise
- Do not invent facts
- Keep the meaning of the original text
- No intro sentence
- No numbering

Text:
${input}`,
    })

    return NextResponse.json({
      improved: response.output_text?.trim() || "",
      mode: "ai",
    })
  } catch (error: any) {
    console.error("Improve experience error:", error)

    return NextResponse.json(
      { error: "Failed to improve experience" },
      { status: 500 }
    )
  }
}