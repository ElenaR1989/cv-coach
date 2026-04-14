"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"

const FREE_COVER_LETTER_LIMIT = 3

type Application = {
  id: string
  company: string | null
  role: string | null
  job_description: string | null
  cover_letter: string | null
  cv_id?: string | null
  hiring_manager?: string | null
  location?: string | null
}

type CoverLetterToolProps = {
  cvTitle: string
  cvSummary: string
  applications: Application[]
  initialApplicationId?: string | null
}

export default function CoverLetterTool({
  cvTitle,
  cvSummary,
  applications,
  initialApplicationId,
}: CoverLetterToolProps) {
  const [localApplications, setLocalApplications] =
    useState<Application[]>(applications)

  const [applicationId, setApplicationId] = useState(
    initialApplicationId || applications[0]?.id || ""
  )

  const [customJobDescription, setCustomJobDescription] = useState("")
  const [draft, setDraft] = useState("")
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [savedMessage, setSavedMessage] = useState("")
  const [copyMessage, setCopyMessage] = useState("")
  const [isPro, setIsPro] = useState(false)
  const [checkingPlan, setCheckingPlan] = useState(true)

  useEffect(() => {
    setLocalApplications(applications)
  }, [applications])

  useEffect(() => {
    if (!applicationId && applications[0]?.id) {
      setApplicationId(applications[0].id)
    }
  }, [applicationId, applications])

  const selectedApplication = useMemo(() => {
    return localApplications.find((app) => app.id === applicationId) ?? null
  }, [localApplications, applicationId])

  useEffect(() => {
    setCustomJobDescription(selectedApplication?.job_description ?? "")
    setDraft(selectedApplication?.cover_letter ?? "")
    setError("")
    setSavedMessage("")
    setCopyMessage("")
  }, [selectedApplication])

  useEffect(() => {
    const loadPlan = async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setCheckingPlan(false)
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_pro, plan")
        .eq("id", user.id)
        .single()

      setIsPro(profile?.is_pro === true || profile?.plan === "pro")
      setCheckingPlan(false)
    }

    loadPlan()
  }, [])

  const usedCoverLetters = useMemo(() => {
    return localApplications.filter((app) => app.cover_letter?.trim()).length
  }, [localApplications])

  const displayUsage = isPro
    ? "Unlimited"
    : Math.min(usedCoverLetters, FREE_COVER_LETTER_LIMIT)

  const selectedAlreadyHasCoverLetter =
    !!selectedApplication?.cover_letter?.trim()

  const freeLimitReached =
    !isPro &&
    usedCoverLetters >= FREE_COVER_LETTER_LIMIT &&
    !selectedAlreadyHasCoverLetter

  const handleGenerate = async () => {
    setError("")
    setSavedMessage("")
    setCopyMessage("")

    if (!selectedApplication) {
      setError("Select an application first.")
      return
    }

    if (freeLimitReached) {
      setError(
        `Free limit reached. You have used ${displayUsage}/${FREE_COVER_LETTER_LIMIT} saved cover letters.`
      )
      return
    }

    if (!customJobDescription.trim()) {
      setError("Add or select a job description first.")
      return
    }

    setGenerating(true)

    try {
      const res = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvId: selectedApplication.cv_id || "",
          cvText: cvSummary || "",
          fullName: cvTitle || "",
          email: "",
          phone: "",
          jobTitle: selectedApplication.role || "",
          companyName: selectedApplication.company || "",
          hiringManager: selectedApplication.hiring_manager || "",
          location: selectedApplication.location || "",
          jobDescription: customJobDescription,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Failed to generate cover letter.")
      }

      setDraft(data.letter || "")
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate cover letter."
      )
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    setError("")
    setSavedMessage("")
    setCopyMessage("")

    if (!selectedApplication) {
      setError("Select an application first.")
      return
    }

    if (!draft.trim()) {
      setError("Generate or write a cover letter first.")
      return
    }

    setSaving(true)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from("job_applications")
        .update({
          cover_letter: draft,
          job_description: customJobDescription || null,
        })
        .eq("id", selectedApplication.id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      setLocalApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApplication.id
            ? {
                ...app,
                cover_letter: draft,
                job_description: customJobDescription,
              }
            : app
        )
      )

      setSavedMessage("Cover letter saved.")
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to save cover letter."
      )
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = async () => {
    if (!draft.trim()) return

    try {
      await navigator.clipboard.writeText(draft)
      setCopyMessage("Copied to clipboard.")
    } catch {
      setCopyMessage("Could not copy.")
    }
  }

  return (
    <div className="space-y-6">
      {!checkingPlan && isPro ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm font-semibold text-emerald-300">
            ✅ You are on Pro. Unlimited cover letters are unlocked.
          </p>
        </div>
      ) : null}

      {!checkingPlan && !isPro ? (
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <p className="text-sm font-semibold text-yellow-300">
            Free plan: {displayUsage} / {FREE_COVER_LETTER_LIMIT} cover letters
            used
          </p>

          {freeLimitReached ? (
            <p className="mt-2 text-sm text-yellow-200">
              You've reached your free limit. Upgrade to continue.
            </p>
          ) : (
            <p className="mt-2 text-sm text-yellow-200/80">
              You can still generate and save cover letters until you reach the
              free limit.
            </p>
          )}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {savedMessage ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          {savedMessage}
        </div>
      ) : null}

      {copyMessage ? (
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-200">
          {copyMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-semibold text-white">Source</h3>
          <p className="mt-2 text-sm text-white/70">
            Choose an application linked to this CV.
          </p>

          <div className="mt-5">
            <label className="mb-2 block text-sm text-white/80">
              Application
            </label>
            <select
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none"
            >
              {localApplications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.company || "Unknown company"} —{" "}
                  {app.role || "Unknown role"}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm text-white/80">
              Full job description
            </label>
            <textarea
              value={customJobDescription}
              onChange={(e) => setCustomJobDescription(e.target.value)}
              rows={18}
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none"
              placeholder="Paste or edit the job description here..."
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-semibold text-white">
            Cover letter draft
          </h3>
          <p className="mt-2 text-sm text-white/70">
            Review and edit before saving it to the application.
          </p>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={22}
            className="mt-5 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none"
            placeholder="Your generated cover letter will appear here..."
          />

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || checkingPlan || freeLimitReached}
              className="rounded-xl bg-white px-5 py-3 font-medium text-black disabled:opacity-50"
            >
              {generating
                ? "Generating..."
                : freeLimitReached
                  ? "Limit reached"
                  : "Generate"}
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !draft.trim()}
              className="rounded-xl border border-white/20 px-5 py-3 font-medium text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!draft.trim()}
              className="rounded-xl border border-cyan-400/40 px-5 py-3 font-medium text-cyan-200 disabled:opacity-50"
            >
              Copy to clipboard
            </button>
          </div>

          <div className="mt-4 text-xs text-white/50">
            Selected CV: {cvTitle}
          </div>
        </div>
      </div>
    </div>
  )
}
