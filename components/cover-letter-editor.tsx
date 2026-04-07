"use client"

import { useMemo, useState } from "react"

type CoverLetterEditorProps = {
  fullName: string
  email: string
  phone: string
  location: string
  skills: string
  summary: string
  experienceText: string
  educationText: string
}

export default function CoverLetterEditor({
  fullName,
  email,
  phone,
  location,
  skills,
  summary,
  experienceText,
  educationText,
}: CoverLetterEditorProps) {
  const [jobTitle, setJobTitle] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [hiringManager, setHiringManager] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [letterBody, setLetterBody] = useState("")

  const generatedTemplate = useMemo(() => {
    const name = fullName || "Your Name"
    const manager = hiringManager || "Hiring Manager"
    const company = companyName || "the company"
    const role = jobTitle || "the position"

    const summaryLine = summary?.trim()
      ? summary.trim()
      : "I am a motivated and reliable candidate with relevant skills and experience that make me a strong fit for this opportunity."

    const skillsLine = skills?.trim()
      ? `My skills include ${skills.trim()}.`
      : ""

    const experienceLine = experienceText?.trim()
      ? `My previous experience includes ${experienceText.trim()}.`
      : ""

    const educationLine = educationText?.trim()
      ? `My education includes ${educationText.trim()}.`
      : ""

    const jobLine = jobDescription?.trim()
      ? `I am particularly interested in this role because it matches my background and the key requirements of the position, including ${jobDescription.trim()}.`
      : "I am particularly interested in this role because it matches my background, skills, and professional goals."

    return `Dear ${manager},

I am writing to apply for the ${role} position at ${company}.

${summaryLine}

${skillsLine} ${experienceLine} ${educationLine}

${jobLine}

I would welcome the opportunity to discuss how my experience and approach could benefit your team. Thank you for taking the time to consider my application.

Yours sincerely,
${name}`
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  }, [
    companyName,
    educationText,
    experienceText,
    fullName,
    hiringManager,
    jobDescription,
    jobTitle,
    skills,
    summary,
  ])

  const finalLetter = letterBody || generatedTemplate

  const handleGenerateTemplate = () => {
    setLetterBody(generatedTemplate)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(finalLetter)
      alert("Cover letter copied")
    } catch {
      alert("Could not copy cover letter")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          .print-hide {
            display: none !important;
          }

          .print-only-letter {
            display: block !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          .print-letter-text {
            display: block !important;
            white-space: pre-wrap !important;
            line-height: 1.8 !important;
            font-size: 16px !important;
            color: black !important;
          }

          .screen-letter-editor {
            display: none !important;
          }

          @page {
            size: A4;
            margin: 18mm;
          }
        }
      `}</style>

      <div className="space-y-6">
        <div className="print-hide rounded-2xl border p-6 space-y-4">
          <h2 className="text-xl font-semibold">Cover Letter Details</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Receptionist"
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Hilton Hotel"
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Hiring Manager</label>
              <input
                type="text"
                value={hiringManager}
                onChange={(e) => setHiringManager(e.target.value)}
                placeholder="e.g. Hiring Manager"
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Your Location</label>
              <input
                type="text"
                value={location}
                readOnly
                className="w-full rounded-lg border px-4 py-3 opacity-80"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Job Description / Key Requirements
            </label>
            <textarea
              rows={5}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description or key requirements here..."
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerateTemplate}
              className="rounded-lg bg-black px-5 py-3 text-white hover:opacity-90"
            >
              Generate Cover Letter
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg border px-5 py-3 hover:bg-muted"
            >
              Copy
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="rounded-lg border px-5 py-3 hover:bg-muted"
            >
              Print / Save PDF
            </button>
          </div>
        </div>

        <div className="print-only-letter rounded-2xl border bg-white p-8 text-black">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{fullName || "Your Name"}</h1>

            <div className="text-sm text-gray-700 space-y-1">
              {email ? <p>{email}</p> : null}
              {phone ? <p>{phone}</p> : null}
              {location ? <p>{location}</p> : null}
            </div>
          </div>

          <div className="mt-8">
            <textarea
              value={finalLetter}
              onChange={(e) => setLetterBody(e.target.value)}
              placeholder="Your cover letter will appear here after you click Generate Cover Letter..."
              className="screen-letter-editor min-h-[520px] w-full resize-none border-0 bg-transparent p-0 text-[16px] leading-8 outline-none"
            />

            <div className="print-letter-text hidden">
              {finalLetter}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
