"use client"

import { useState } from "react"

type CoverLetterGeneratorProps = {
  cvId: string
  cvText: string
  fullName: string
  email: string
  phone: string
}

export default function CoverLetterGenerator({
  cvId,
  cvText,
  fullName,
  email,
  phone,
}: CoverLetterGeneratorProps) {
  const [jobTitle, setJobTitle] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [hiringManager, setHiringManager] = useState("")
  const [location, setLocation] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [message, setMessage] = useState("")

  async function handleGenerate() {
    setIsGenerating(true)
    setMessage("")
    setCoverLetter("")

    try {
      const res = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvId,
          cvText,
          fullName,
          email,
          phone,
          jobTitle,
          companyName,
          hiringManager,
          location,
          jobDescription,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Failed to generate cover letter.")
      }

      setCoverLetter(data.letter || "")
    } catch (error: any) {
      setMessage(error?.message || "Failed to generate cover letter.")
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(coverLetter)
      setMessage("Cover letter copied.")
    } catch {
      setMessage("Could not copy cover letter.")
    }
  }

  function handlePrint() {
    window.print()
  }

  const previewText =
    coverLetter ||
    `${fullName}
${email}
${phone}

Dear Hiring Manager,

Your cover letter will appear here after you click Generate Cover Letter.`

  return (
    <>
      <style>{`
        @media print {
          .print-hide {
            display: none !important;
          }

          .print-only-letter {
            display: block !important;
          }

          html, body {
            background: white !important;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
          }

          @page {
            size: A4;
            margin: 16mm;
          }
        }
      `}</style>

      <div className="space-y-6">
        <div className="print-hide rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <h2 className="mb-4 text-2xl font-semibold">Cover Letter Details</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-gray-300">Job Title</label>
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Receptionist"
                className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Company Name</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Hilton Hotel"
                className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Hiring Manager</label>
              <input
                value={hiringManager}
                onChange={(e) => setHiringManager(e.target.value)}
                placeholder="e.g. Hiring Manager"
                className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Your Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Milton Keynes"
                className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm text-gray-300">
              Job Description / Key Requirements
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
              placeholder="Paste the job description here..."
              className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-lg transition hover:bg-white/20 disabled:opacity-60"
            >
              {isGenerating ? "Generating..." : "Generate Cover Letter"}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!coverLetter}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-lg transition hover:bg-white/20 disabled:opacity-60"
            >
              Copy
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={!coverLetter}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-lg transition hover:bg-white/20 disabled:opacity-60"
            >
              Print / Save PDF
            </button>
          </div>

          {message ? (
            <p className="mt-3 text-sm text-gray-300">{message}</p>
          ) : null}
        </div>

        <div className="print-only-letter rounded-2xl bg-white p-8 text-black shadow print:rounded-none print:p-0 print:shadow-none">
          <div className="whitespace-pre-wrap text-[17px] leading-8">
            {previewText}
          </div>
        </div>
      </div>
    </>
  )
}