"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ApplicationNotesEditor({
  applicationId,
  initialNotes,
}: {
  applicationId: string
  initialNotes: string | null
}) {
  const router = useRouter()
  const [notes, setNotes] = useState(initialNotes ?? "")
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSave() {
    setIsSaving(true)
    setMessage("")

    try {
      const res = await fetch("/api/update-application-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          notes,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Failed to save notes.")
      }

      setMessage("Notes saved")
      router.refresh()

      setTimeout(() => {
        setMessage("")
      }, 2000)
    } catch (error: any) {
      setMessage(error?.message || "Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={8}
        placeholder="Add notes about this application..."
        className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-white/40"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Notes"}
        </button>

        {message ? (
          <p className="text-sm text-emerald-300">{message}</p>
        ) : null}
      </div>
    </div>
  )
}