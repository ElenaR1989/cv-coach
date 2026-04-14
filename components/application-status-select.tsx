"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type ApplicationStatusSelectProps = {
  applicationId: string
  currentStatus: string
  currentInterviewDate?: string | null
}

export default function ApplicationStatusSelect({
  applicationId,
  currentStatus,
  currentInterviewDate,
}: ApplicationStatusSelectProps) {
  const router = useRouter()
  const supabase = createClient()

  const [status, setStatus] = useState(currentStatus || "Applied")
  const [interviewDate, setInterviewDate] = useState(currentInterviewDate ?? "")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSave() {
    setLoading(true)
    setMessage("")

    const updatePayload: {
      status: string
      interview_date?: string | null
    } = {
      status,
    }

    if (status === "Interviewing") {
      updatePayload.interview_date = interviewDate || null
    } else {
      updatePayload.interview_date = null
    }

    const { error } = await supabase
      .from("job_applications")
      .update(updatePayload)
      .eq("id", applicationId)

    setLoading(false)

    if (error) {
      setMessage("Could not update.")
      return
    }

    setMessage("Updated")
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white"
      >
        <option value="Saved">Saved</option>
        <option value="Applied">Applied</option>
        <option value="Interviewing">Interviewing</option>
        <option value="Offer">Offer</option>
        <option value="Rejected">Rejected</option>
      </select>

      {status === "Interviewing" ? (
        <input
          type="date"
          value={interviewDate}
          onChange={(e) => setInterviewDate(e.target.value)}
          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white"
        />
      ) : null}

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save status"}
      </button>

      {message ? (
        <p className="text-xs text-emerald-300">{message}</p>
      ) : null}
    </div>
  )
}
