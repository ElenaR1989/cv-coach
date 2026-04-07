"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function FollowUpDateEditor({
  applicationId,
  initialDate,
}: {
  applicationId: string
  initialDate: string | null
}) {
  const router = useRouter()
  const [date, setDate] = useState(initialDate ?? "")
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSave() {
    setIsSaving(true)
    setMessage("")
    setError("")

    try {
      const res = await fetch("/api/update-follow-up-date", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          followUpDate: date || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Failed to save follow-up date.")
      }

      setMessage("Follow-up saved.")

      router.refresh()

      setTimeout(() => {
        window.location.reload()
      }, 300)
    } catch (err: any) {
      setError(err?.message || "Failed to save follow-up date.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleClear() {
    setIsSaving(true)
    setMessage("")
    setError("")

    try {
      const res = await fetch("/api/update-follow-up-date", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          followUpDate: null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Failed to clear follow-up date.")
      }

      setDate("")
      setMessage("Follow-up cleared.")

      router.refresh()

      setTimeout(() => {
        window.location.reload()
      }, 300)
    } catch (err: any) {
      setError(err?.message || "Failed to clear follow-up date.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-white/30"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save follow-up"}
        </button>

        <button
          type="button"
          onClick={handleClear}
          disabled={isSaving}
          className="rounded-lg border border-white/15 bg-transparent px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
        >
          Clear
        </button>
      </div>

      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  )
}
