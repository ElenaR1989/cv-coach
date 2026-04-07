"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type JobFormProps = {
  initialData?: any
}

export default function JobForm({ initialData }: JobFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [company, setCompany] = useState(initialData?.company || "")
  const [role, setRole] = useState(initialData?.role || "")
  const [status, setStatus] = useState(initialData?.status || "applied")
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [interviewDate, setInterviewDate] = useState(initialData?.interview_date || "")
  const [followUpDate, setFollowUpDate] = useState(initialData?.follow_up_date || "")
  const [cvId, setCvId] = useState(initialData?.cv_id || "")
  const [jobDescription, setJobDescription] = useState(initialData?.job_description || "")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setError("You must be logged in.")
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from("job_applications").insert({
      user_id: user.id,
      company,
      role,
      status,
      notes: notes || null,
      interview_date: interviewDate || null,
      follow_up_date: followUpDate || null,
      cv_id: cvId || null,
      job_description: jobDescription || null,
    })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-white/20 bg-white/5 p-6"
    >
      <div>
        <h2 className="text-2xl font-semibold">Add Job Application</h2>
        <p className="mt-1 text-sm text-white/60">
          Save a new application.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company"
          className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white"
          required
        />

        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Role"
          className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white"
          required
        />
      </div>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white"
      >
        <option value="applied">Applied</option>
        <option value="interviewing">Interviewing</option>
        <option value="offer">Offer</option>
        <option value="rejected">Rejected</option>
      </select>

      <input
        type="date"
        value={interviewDate}
        onChange={(e) => setInterviewDate(e.target.value)}
        className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white"
      />

      <input
        type="date"
        value={followUpDate}
        onChange={(e) => setFollowUpDate(e.target.value)}
        className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white"
      />

      <select
        value={cvId}
        onChange={(e) => setCvId(e.target.value)}
        className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white"
      >
        <option value="">No CV selected</option>
      </select>

      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Job description"
        rows={4}
        className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white"
      />

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes"
        rows={4}
        className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white"
      />

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-white px-5 py-3 font-medium text-black"
      >
        {loading ? "Saving..." : "Save application"}
      </button>
    </form>
  )
}
