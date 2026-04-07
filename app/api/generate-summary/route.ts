import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type ExperienceItem = {
  title?: string
  company?: string
  dates?: string
  description?: string
}

type EducationItem = {
  school?: string
  qualification?: string
  dates?: string
  description?: string
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      full_name,
      skills,
      experience,
      education_entries,
    }: {
      full_name?: string
      skills?: string
      experience?: ExperienceItem[]
      education_entries?: EducationItem[]
    } = body

    const skillsText = skills?.trim() || "No skills provided"

    const experienceText =
      Array.isArray(experience) && experience.length > 0
        ? experience
            .map((job, index) => {
              return `Job ${index + 1}:
Title: ${job.title || ""}
Company: ${job.company || ""}
Dates: ${job.dates || ""}
Description: ${job.description || ""}`
            })
            .join("\n\n")
        : "No experience provided"

    const educationText =
      Array.isArray(education_entries) && education_entries.length > 0
        ? education_entries
            .map((item, index) => {
              return `Education ${index + 1}:
School: ${item.school || ""}
Qualification: ${item.qualification || ""}
Dates: ${item.dates || ""}
Description: ${item.description || ""}`
            })
            .join("\n\n")
        : "No education provided"

    const prompt = `
Write a professional CV summary for this person.

Rules:
- 3 to 5 sentences
- Professional and clear
- Use simple strong English
- Do not invent facts
- Use only the information provided
- Good for a CV personal profile
- Do not use bullet points

Full name: ${full_name || "Not provided"}

Skills:
${skillsText}

Experience:
${experienceText}

Education:
${educationText}
`

    const response = await openai.responses.create({
      model: "gpt-5",
      input: prompt,
    })

    return NextResponse.json({
      summary: response.output_text?.trim() || "",
    })
  } catch (error) {
    console.error("Generate summary error:", error)
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    )
  }
}