"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { calculateJobMatch } from "@/lib/job-match"

type ImprovedBullet = {
  before: string
  after: string
}

type ImproveResult = {
  title: string
  improvedBullets: ImprovedBullet[]
  suggestions: string[]
}

export default function JobMatchCard({
  cvId,
  cvText,
  fullName,
  email,
  phone,
}: {
  cvId: string
  cvText: string
  fullName: string
  email: string
  phone: string
}) {
  const router = useRouter()

  const [jobTitle, setJobTitle] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [hiringManager, setHiringManager] = useState("")
  const [location, setLocation] = useState("")
  const [jobText, setJobText] = useState("")
  const [submittedText, setSubmittedText] = useState("")

  const [showImprovements, setShowImprovements] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [isSmartApplying, setIsSmartApplying] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [improveError, setImproveError] = useState("")
  const [applyMessage, setApplyMessage] = useState("")
  const [smartApplyMessage, setSmartApplyMessage] = useState("")
  const [copyMessage, setCopyMessage] = useState("")
  const [saveMessage, setSaveMessage] = useState("")

  const [improveResult, setImproveResult] = useState<ImproveResult | null>(null)
  const [generatedLetter, setGeneratedLetter] = useState("")
  const [savedApplicationId, setSavedApplicationId] = useState("")

  const result = useMemo(() => {
    return calculateJobMatch(cvText, submittedText)
  }, [cvText, submittedText])

  async function handleImproveCV() {
    if (!submittedText.trim()) return

    setIsImproving(true)
    setImproveError("")
    setApplyMessage("")
    setSmartApplyMessage("")
    setCopyMessage("")
    setSaveMessage("")
    setShowImprovements(true)

    try {
      const res = await fetch("/api/improve-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvText,
          jobText: submittedText,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Failed to improve CV.")
      }

      setImproveResult(data)
    } catch (error: any) {
      setImproveError(error?.message || "Failed to improve CV.")
      setImproveResult(null)
    } finally {
      setIsImproving(false)
    }
  }

  async function handleApplyImprovements() {
    if (!improveResult?.improvedBullets?.length) return

    setIsApplying(true)
    setApplyMessage("")
    setCopyMessage("")
    setSaveMessage("")

    try {
      const res = await fetch("/api/apply-cv-improvements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvId,
          improvedBullets: improveResult.improvedBullets,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Failed to apply improvements.")
      }

      setApplyMessage("✅ Improvements applied to your CV.")
      router.refresh()
    } catch (error: any) {
      setApplyMessage(error?.message || "Failed to apply improvements.")
    } finally {
      setIsApplying(false)
    }
  }

  async function handleSaveApplication() {
    const finalJobDescription = submittedText.trim() || jobText.trim()

    if (!jobTitle.trim() || !companyName.trim()) {
      setSaveMessage("Please add the job title and company name first.")
      return
    }

    if (!finalJobDescription) {
      setSaveMessage("Please paste the job description first.")
      return
    }

    setIsSaving(true)
    setSaveMessage("")

    try {
      const res = await fetch("/api/save-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: companyName,
          role: jobTitle,
          status: "Saved",
          notes: "Saved from Job Match",
          cv_id: cvId,
          cover_letter: generatedLetter || "",
          job_description: finalJobDescription,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Failed to save application.")
      }

      setSavedApplicationId(data?.application?.id || "")
      setSaveMessage("✅ Application saved successfully.")
      router.refresh()
    } catch (error: any) {
      setSaveMessage(error?.message || "Failed to save application.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSmartApply() {
    if (!submittedText.trim()) {
      setSmartApplyMessage("Please paste a job description first.")
      return
    }

    if (!jobTitle.trim() || !companyName.trim()) {
      setSmartApplyMessage("Please add at least the job title and company name.")
      return
    }

    setIsSmartApplying(true)
    setSmartApplyMessage("")
    setImproveError("")
    setApplyMessage("")
    setCopyMessage("")
    setSaveMessage("")
    setShowImprovements(true)
    setSavedApplicationId("")

    try {
      const improveRes = await fetch("/api/improve-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvText,
          jobText: submittedText,
        }),
      })

      const improveData = await improveRes.json()

      if (!improveRes.ok) {
        throw new Error(improveData?.error || "Failed to improve CV.")
      }

      setImproveResult(improveData)

      const applyRes = await fetch("/api/apply-cv-improvements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvId,
          improvedBullets: improveData.improvedBullets,
        }),
      })

      const applyData = await applyRes.json()

      if (!applyRes.ok) {
        throw new Error(applyData?.error || "Failed to apply improvements.")
      }

      const coverLetterRes = await fetch("/api/generate-cover-letter", {
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
          jobDescription: submittedText,
        }),
      })

      const coverLetterData = await coverLetterRes.json()

      if (!coverLetterRes.ok) {
        throw new Error(
          coverLetterData?.error || "Failed to generate cover letter."
        )
      }

      const finalLetter = coverLetterData.letter || ""
      setGeneratedLetter(finalLetter)

      const saveApplicationRes = await fetch("/api/save-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: companyName,
          role: jobTitle,
          status: "Applied",
          notes: "Created with Smart Apply",
          cv_id: cvId,
          cover_letter: finalLetter,
          job_description: submittedText,
        }),
      })

      const saveApplicationData = await saveApplicationRes.json()

      if (!saveApplicationRes.ok) {
        throw new Error(
          saveApplicationData?.error || "Failed to save application."
        )
      }

      setSavedApplicationId(saveApplicationData?.application?.id || "")
      setApplyMessage("✅ Improvements applied to your CV.")
      setSmartApplyMessage(
        "🎉 Smart Apply completed. CV improved, cover letter generated, and application saved."
      )

      router.refresh()
    } catch (error: any) {
      setSmartApplyMessage(error?.message || "Smart Apply failed.")
    } finally {
      setIsSmartApplying(false)
    }
  }

  async function handleCopyLetter() {
    try {
      await navigator.clipboard.writeText(generatedLetter)
      setCopyMessage("✅ Cover letter copied.")
      setTimeout(() => {
        setCopyMessage("")
      }, 2500)
    } catch {
      setCopyMessage("Could not copy cover letter.")
      setTimeout(() => {
        setCopyMessage("")
      }, 2500)
    }
  }

  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      <h2 className="mb-2 text-xl font-semibold">Job Match</h2>
      <p className="mb-4 text-sm text-gray-300">
        Paste a job description to see how well this CV matches the role.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-200">
            Job title
          </label>
          <input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Assistant General Manager"
            className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-200">
            Company name
          </label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Hickory's Smokehouse"
            className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-200">
            Hiring manager
          </label>
          <input
            value={hiringManager}
            onChange={(e) => setHiringManager(e.target.value)}
            placeholder="e.g. Hiring Manager"
            className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-200">
            Your location
          </label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Milton Keynes"
            className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-gray-200">
          Full job description
        </label>

        <textarea
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          rows={8}
          placeholder="Paste the job description here..."
          className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-gray-400"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setSubmittedText(jobText)
            setShowImprovements(false)
            setImproveError("")
            setImproveResult(null)
            setApplyMessage("")
            setSmartApplyMessage("")
            setCopyMessage("")
            setGeneratedLetter("")
            setSavedApplicationId("")
            setSaveMessage("")
          }}
          className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-lg transition hover:bg-white/20"
        >
          Analyze Match
        </button>

        <button
          type="button"
          onClick={() => {
            setJobTitle("")
            setCompanyName("")
            setHiringManager("")
            setLocation("")
            setJobText("")
            setSubmittedText("")
            setShowImprovements(false)
            setImproveError("")
            setImproveResult(null)
            setApplyMessage("")
            setSmartApplyMessage("")
            setCopyMessage("")
            setGeneratedLetter("")
            setSavedApplicationId("")
            setSaveMessage("")
          }}
          className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-lg transition hover:bg-white/20"
        >
          Clear
        </button>

        {submittedText.trim() ? (
          <button
            type="button"
            onClick={handleImproveCV}
            disabled={isImproving || isSmartApplying}
            className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-emerald-300 backdrop-blur-lg transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isImproving ? "Improving..." : "Improve CV for this job"}
          </button>
        ) : null}

        {submittedText.trim() ? (
          <button
            type="button"
            onClick={handleSaveApplication}
            disabled={isSaving}
            className="rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "💾 Save Application"}
          </button>
        ) : null}

        {submittedText.trim() ? (
          <button
            type="button"
            onClick={handleSmartApply}
            disabled={isSmartApplying}
            className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-blue-300 backdrop-blur-lg transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSmartApplying ? "Smart Applying..." : "🔥 Smart Apply"}
          </button>
        ) : null}
      </div>

      {saveMessage ? (
        <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-200">
          {saveMessage}
          {savedApplicationId ? (
            <div className="mt-1 text-xs text-green-300">
              Saved application ID: {savedApplicationId}
            </div>
          ) : null}
        </div>
      ) : null}

      {submittedText.trim() ? (
        <div className="mt-6 space-y-5">
          <div>
            <p className="text-sm text-gray-300">Match Score</p>
            <p className="text-5xl font-bold">{result.score}%</p>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-300">
              Matched Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.matchedKeywords.length > 0 ? (
                result.matchedKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300"
                  >
                    {keyword}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400">No matched keywords yet.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-300">
              Missing Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.missingKeywords.length > 0 ? (
                result.missingKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-sm text-amber-300"
                  >
                    {keyword}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400">No missing keywords found.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-300">
              Suggestions
            </h3>
            <div className="space-y-2">
              {result.suggestions.map((suggestion, index) => (
                <p key={index} className="text-sm text-gray-300">
                  • {suggestion}
                </p>
              ))}
            </div>
          </div>

          {smartApplyMessage ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              {smartApplyMessage}
              {savedApplicationId ? (
                <div className="mt-2">
                  <span className="text-xs text-emerald-300">
                    Saved application ID: {savedApplicationId}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}

          {showImprovements ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {improveResult?.title || "Tailored CV Improvements"}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Real AI rewrite based on this job description.
                  </p>
                </div>

                {improveResult?.improvedBullets?.length ? (
                  <button
                    type="button"
                    onClick={handleApplyImprovements}
                    disabled={isApplying}
                    className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isApplying ? "Applying..." : "Apply improvements to CV"}
                  </button>
                ) : null}
              </div>

              {applyMessage ? (
                <div className="mb-4 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-sm text-blue-200">
                  {applyMessage}
                </div>
              ) : null}

              {improveError ? (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
                  {improveError}
                </div>
              ) : null}

              {isImproving ? (
                <div className="text-sm text-gray-300">
                  Generating improved bullet points...
                </div>
              ) : null}

              {!isImproving && improveResult ? (
                <>
                  <div className="space-y-4">
                    {improveResult.improvedBullets?.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-white/10 bg-white/5 p-4"
                      >
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Before
                        </p>
                        <p className="text-sm text-gray-300">{item.before}</p>

                        <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                          Improved
                        </p>
                        <p className="text-sm text-white">{item.after}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5">
                    <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-300">
                      Extra tailoring tips
                    </h4>
                    <div className="space-y-2">
                      {improveResult.suggestions?.map((suggestion, index) => (
                        <p key={index} className="text-sm text-gray-300">
                          • {suggestion}
                        </p>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          {generatedLetter ? (
            <div className="rounded-2xl border border-white/10 bg-white p-6 text-black">
              <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Generated Cover Letter</h3>
                  <p className="text-sm text-gray-600">
                    Your tailored cover letter is ready to copy or use.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyLetter}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-100"
                >
                  {copyMessage ? "Copied ✓" : "Copy Cover Letter"}
                </button>
              </div>

              {copyMessage ? (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {copyMessage}
                </div>
              ) : null}

              <div className="whitespace-pre-wrap text-[16px] leading-8">
                {generatedLetter}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
  