"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type JobApplication = {
  id: string
  company: string
  role: string
  job_description: string | null
  cover_letter: string | null
}

type CoverLetterToolProps = {
  cvId: string
  cvTitle: string
  cvSummary: string
  applications: JobApplication[]
  initialApplicationId?: string
}

const FREE_COVER_LETTER_LIMIT = 3

function normaliseText(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim()
}

function cleanSummaryText(summary: string) {
  return summary.replace(/\s+/g, " ").replace(/\bapis\b/gi, "APIs").trim()
}

function buildOpening(company: string, role: string) {
  return `Dear Hiring Manager,

I am writing to express my interest in the ${role} position at ${company}.`
}

function buildBody(cvSummary: string, jobDescription: string) {
  const summary = cleanSummaryText(cvSummary)
  const jobText = normaliseText(jobDescription)
  const lines: string[] = []

  if (summary) {
    lines.push(
      `With a background as a ${summary}, I have developed strong experience that aligns well with this opportunity.`
    )
  } else {
    lines.push(
      "I bring a strong and adaptable professional background with a focus on delivering reliable, high-quality work."
    )
  }

  if (
    jobText.includes("react") ||
    jobText.includes("frontend") ||
    jobText.includes("next.js") ||
    jobText.includes("nextjs") ||
    jobText.includes("typescript")
  ) {
    lines.push(
      "I have hands-on experience building modern web applications, focusing on clean user interfaces, reusable components, and practical technical solutions."
    )
  }

  if (jobText.includes("api") || jobText.includes("apis")) {
    lines.push(
      "I am also confident working with APIs and supporting reliable, data-driven user experiences."
    )
  }

  if (
    jobText.includes("team") ||
    jobText.includes("stakeholder") ||
    jobText.includes("stakeholders") ||
    jobText.includes("communication") ||
    jobText.includes("collaboration")
  ) {
    lines.push(
      "I work effectively with teams and stakeholders, and I value clear communication and collaborative delivery."
    )
  }

  if (
    jobText.includes("fast-paced") ||
    jobText.includes("operations") ||
    jobText.includes("remote")
  ) {
    lines.push(
      "I am comfortable working in fast-paced environments, adapting quickly to change while maintaining attention to detail and a consistent standard of work."
    )
  }

  if (
    jobText.includes("healthcare") ||
    jobText.includes("nhs") ||
    jobText.includes("patient care")
  ) {
    lines.push(
      "I understand the importance of professionalism, compliance, and dependable service in people-focused environments."
    )
  }

  if (
    jobText.includes("security") ||
    jobText.includes("sia") ||
    jobText.includes("nebosh") ||
    jobText.includes("health and safety")
  ) {
    lines.push(
      "I also appreciate the importance of safety, compliance, and maintaining reliable standards in operational settings."
    )
  }

  lines.push(
    "I am particularly drawn to this role because it aligns well with my experience and my motivation to contribute to meaningful and high-quality work."
  )

  return lines.join(" ")
}

function buildClosing(company: string, fullName?: string) {
  return `I would welcome the opportunity to discuss how my experience and strengths could contribute to ${company}. Thank you for your time and consideration.

Kind regards${fullName ? `

${fullName}` : ""}`
}

export function generateCoverLetter(
  company: string,
  role: string,
  cvSummary: string,
  jobDescription: string,
  fullName?: string
) {
  const opening = buildOpening(company, role)
  const body = buildBody(cvSummary, jobDescription)
  const closing = buildClosing(company, fullName)

  return `${opening}

${body}

${closing}`
}

export default function CoverLetterTool({
  cvTitle,
  cvSummary,
  applications,
  initialApplicationId,
}: CoverLetterToolProps) {
  const supabase = createClient()

  const initialSelectedApplication =
    applications.find((app) => app.id === initialApplicationId) ??
    applications[0] ??
    null

  const [applicationId, setApplicationId] = useState(
    initialSelectedApplication?.id ?? ""
  )
  const [customJobDescription, setCustomJobDescription] = useState(
    initialSelectedApplication?.job_description ?? ""
  )
  const [draft, setDraft] = useState(
    initialSelectedApplication?.cover_letter ?? ""
  )
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState("")
  const [error, setError] = useState("")
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const selectedApplication = useMemo(() => {
    return applications.find((app) => app.id === applicationId) ?? null
  }, [applications, applicationId])

  useEffect(() => {
    const nextApp =
      applications.find((app) => app.id === initialApplicationId) ??
      applications[0] ??
      null

    if (!nextApp) return

    setApplicationId(nextApp.id)
    setCustomJobDescription(nextApp.job_description ?? "")
    setDraft(nextApp.cover_letter ?? "")
    setError("")
    setSavedMessage("")
  }, [initialApplicationId, applications])

  const usedCoverLetters = useMemo(() => {
    return applications.filter((app) => app.cover_letter?.trim()).length
  }, [applications])

  const displayUsage = Math.min(
    usedCoverLetters,
    FREE_COVER_LETTER_LIMIT
  )

  const selectedAlreadyHasCoverLetter =
    !!selectedApplication?.cover_letter?.trim()

  const freeLimitReached =
    usedCoverLetters >= FREE_COVER_LETTER_LIMIT && !selectedAlreadyHasCoverLetter

  const openUpgradeModal = () => {
    setShowUpgradeModal(true)
  }

  const closeUpgradeModal = () => {
    setShowUpgradeModal(false)
  }

  const handleGenerate = () => {
    setError("")
    setSavedMessage("")

    if (!selectedApplication) {
      setError("Select an application first.")
      return
    }

    if (freeLimitReached) {
      setError(
        `Free limit reached. You have used ${displayUsage}/${FREE_COVER_LETTER_LIMIT} saved cover letters. Upgrade to Pro to continue.`
      )
      setShowUpgradeModal(true)
      return
    }

    if (!customJobDescription.trim()) {
      setError("Add or select a job description first.")
      return
    }

    const generated = generateCoverLetter(
      selectedApplication.company,
      selectedApplication.role,
      cvSummary,
      customJobDescription,
      "Elena Rahimi"
    )

    setDraft(generated)
  }

  const handleSave = async () => {
    setError("")
    setSavedMessage("")

    if (!selectedApplication) {
      setError("Select an application first.")
      return
    }

    if (freeLimitReached) {
      setError(
        `Free limit reached. You have used ${displayUsage}/${FREE_COVER_LETTER_LIMIT} saved cover letters. Upgrade to Pro to continue.`
      )
      setShowUpgradeModal(true)
      return
    }

    if (!draft.trim()) {
      setError("Generate or write a cover letter first.")
      return
    }

    setSaving(true)

    const { error: updateError } = await supabase
      .from("job_applications")
      .update({
        cover_letter: draft,
      })
      .eq("id", selectedApplication.id)

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSavedMessage(
      `Saved to ${selectedApplication.company} — ${selectedApplication.role}`
    )
  }

  const handleCopy = async () => {
    setError("")
    setSavedMessage("")

    if (!draft.trim()) {
      setError("Nothing to copy yet.")
      return
    }

    try {
      await navigator.clipboard.writeText(draft)
      setSavedMessage("Cover letter copied to clipboard.")
    } catch {
      setError("Copy failed. Please copy manually.")
    }
  }

  return (
    <>
      <div className="space-y-6">
        {error ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        ) : null}

        {savedMessage ? (
          <div className="space-y-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <p>{savedMessage}</p>

            {selectedApplication ? (
              <button
                type="button"
                onClick={() => {
                  window.location.href = `/dashboard/applications/${selectedApplication.id}`
                }}
                className="text-xs text-emerald-200 underline hover:text-white"
              >
                Open application →
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <p className="text-sm font-semibold text-yellow-300">
            Free plan: {displayUsage} / {FREE_COVER_LETTER_LIMIT} cover letters used
          </p>

          {freeLimitReached ? (
            <p className="mt-2 text-sm text-yellow-200">
              You’ve reached your free limit. Upgrade to continue.
            </p>
          ) : (
            <p className="mt-2 text-sm text-yellow-200/80">
              You can still generate and save cover letters until you reach the free limit.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-cyan-300">
                🚀 Upgrade to Pro
              </p>
              <p className="mt-1 text-sm text-white/80">
                Unlimited cover letters + smarter AI
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
  window.location.href = "/pricing"
}}
              className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-black shadow-md transition hover:bg-cyan-300"
            >
              Upgrade
            </button>
          </div>
        </div>

        <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold">Source</h2>
          <p className="mt-2 text-sm text-white/60">
            Choose an application linked to{" "}
            <span className="text-white/80">{cvTitle}</span>.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-white/80">Application</label>

              <select
                value={applicationId}
                onChange={(e) => {
                  const nextId = e.target.value
                  setApplicationId(nextId)

                  const nextApp =
                    applications.find((app) => app.id === nextId) ?? null

                  setDraft(nextApp?.cover_letter ?? "")
                  setCustomJobDescription(nextApp?.job_description ?? "")
                  setError("")
                  setSavedMessage("")
                }}
                className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-white/40"
              >
                {applications.length === 0 ? (
                  <option value="">No linked applications found</option>
                ) : null}

                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.company} — {app.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">
                CV Summary Source
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-white/85">
                {cvSummary || "No CV summary saved yet."}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">Job description</h2>
            <p className="mt-2 text-sm text-white/60">
              Edit the job description before generating the cover letter.
            </p>

            <textarea
              value={customJobDescription}
              onChange={(e) => setCustomJobDescription(e.target.value)}
              rows={16}
              placeholder="Paste or edit the job description here..."
              className="mt-4 w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-white/40"
            />

            <button
              type="button"
              onClick={handleGenerate}
              disabled={freeLimitReached}
              className={`mt-4 rounded-xl px-5 py-3 font-medium transition ${
                freeLimitReached
                  ? "cursor-not-allowed bg-white/10 text-white/40"
                  : "bg-white text-black hover:opacity-90"
              }`}
            >
              {freeLimitReached ? "Limit reached" : "Generate cover letter"}
            </button>
          </section>

          <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">Cover letter draft</h2>
            <p className="mt-2 text-sm text-white/60">
              Review and edit before saving it to the application.
            </p>

            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={16}
              placeholder="Your generated cover letter will appear here..."
              className="mt-4 w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-white/40"
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || freeLimitReached}
                className={`rounded-xl px-5 py-3 font-medium transition ${
                  saving || freeLimitReached
                    ? "cursor-not-allowed bg-white/10 text-white/40"
                    : "bg-white text-black hover:opacity-90"
                }`}
              >
                {saving
                  ? "Saving..."
                  : freeLimitReached
                    ? "Limit reached"
                    : "Save to application"}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 font-medium text-cyan-300 transition hover:bg-cyan-500/20"
              >
                Copy to clipboard
              </button>

              <button
                type="button"
                onClick={() => {
                  setDraft(selectedApplication?.cover_letter ?? "")
                  setCustomJobDescription(
                    selectedApplication?.job_description ?? ""
                  )
                  setError("")
                  setSavedMessage("")
                }}
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-medium text-white transition hover:bg-white/10"
              >
                Reset
              </button>
            </div>
          </section>
        </div>
      </div>

      {showUpgradeModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-cyan-400/30 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-cyan-300">
                  Upgrade to Pro
                </p>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  Unlock unlimited cover letters
                </h3>
              </div>

              <button
                type="button"
                onClick={closeUpgradeModal}
                className="rounded-lg border border-white/15 px-3 py-1 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-white/80">
              <p>
                You’re on the free plan and have reached your saved cover letter limit.
              </p>

              <ul className="space-y-2">
                <li>✅ Unlimited cover letters</li>
                <li>✅ Smarter AI suggestions</li>
                <li>✅ Faster workflow</li>
              </ul>
            </div>

            <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
              Current usage: {displayUsage} / {FREE_COVER_LETTER_LIMIT}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/pricing"
                }}
                className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-black shadow-lg transition hover:bg-cyan-300"
              >
                Upgrade now
              </button>

              <button
                type="button"
                onClick={closeUpgradeModal}
                className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-medium text-white transition hover:bg-white/20"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}