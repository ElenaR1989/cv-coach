"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type AutoImproveCVButtonProps = {
  applicationId: string
  currentText: string | null
  missingKeywords: string[]
  jobDescription: string | null
  hasExistingTailoredCv?: boolean
  isPro: boolean
}

export default function AutoImproveCVButton({
  applicationId,
  currentText,
  missingKeywords,
  jobDescription,
  hasExistingTailoredCv = false,
  isPro,
}: AutoImproveCVButtonProps) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleAutoImprove() {
    setLoading(true)
    setMessage("")
    setError("")

    try {
      const res = await fetch("/api/ai-improve-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          currentText: currentText ?? "",
          missingKeywords,
          jobDescription: jobDescription ?? "",
        }),
      })

      const data = (await res.json()) as {
        success?: boolean
        error?: string
        tailored_cv?: string
      }

      if (!res.ok) {
        setError(data.error || "Failed to improve CV.")
        return
      }

      setMessage(
        hasExistingTailoredCv
          ? "New AI version generated and saved."
          : "AI improved and saved your tailored CV."
      )

      router.refresh()
    } catch (err) {
      console.error("Auto improve fetch error:", err)
      setError("Something went wrong while improving the CV.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
    {isPro ? (
  <button
    type="button"
    onClick={handleAutoImprove}
    disabled={loading || !currentText?.trim() || !jobDescription?.trim()}
    className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {loading
      ? "AI improving..."
      : hasExistingTailoredCv
      ? "Try another AI version"
      : "AI rewrite CV"}
  </button>
) : (
  <Link
  href="/pricing"
  className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300 transition hover:bg-amber-500/20 text-center"
>
  Upgrade to Pro
</Link>
)}

      {message ? <p className="text-xs text-emerald-300">{message}</p> : null}
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  )
}
