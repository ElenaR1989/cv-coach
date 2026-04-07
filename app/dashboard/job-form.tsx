"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type CVProfile = {
  id: string
  title: string
}

type JobFormProps = {
  cvs?: CVProfile[]
  initialData?:any
}

function generateFeedback(role: string, company: string) {
  const text = `${role} ${company}`.toLowerCase()

  if (text.includes("senior")) {
    return "⚠️ This role may be senior level. Make sure your experience matches."
  }

  if (text.includes("react") || text.includes("developer")) {
    return "💡 Add projects and technical skills to strengthen your CV."
  }

  if (text.includes("manager")) {
    return "📊 Highlight leadership and team experience."
  }

  if (text.includes("intern")) {
    return "🎯 Great for gaining experience. Focus on learning and growth."
  }

  return "✅ Looks like a good application. Keep going!"
}

export default function JobForm({ initialData }: JobFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [status, setStatus] = useState("applied")
  const [notes, setNotes] = useState("")
  const [interviewDate, setInterviewDate] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [cvId, setCvId] = useState("")
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

    const feedback = generateFeedback(role, company)

    const { error: insertError } = await supabase.from("job_applications").insert({
      user_id: user.id,
      company,
      role,
      status,
      notes: notes || null,
      interview_date: interviewDate || null,
      follow_up_date: followUpDate || null,
      cv_id: cvId || null,
      feedback,
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
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-white/20 bg-white/5 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Add Job Application</h2>
        <p className="mt-1 text-sm text-white/60">
          Save a new application and get smart feedback automatically.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-white/80">Company</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Google"
            className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-white/40"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/80">Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. React Developer"
            className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-white/40"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm text-white/80">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-white/40"
          >
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/80">Interview date</label>
          <input
            type="date"
            value={interviewDate}
            onChange={(e) => setInterviewDate(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-white/40"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/80">Follow-up date</label>
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-white/40"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white/80">Link CV</label>
        <select
          value={cvId}
          onChange={(e) => setCvId(e.target.value)}
          className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-white/40"
        >
          <option value="">No CV selected</option>
          {cvs.map((cv) => (
            <option key={cv.id} value={cv.id}>
              {cv.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white/80">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this application..."
          rows={4}
          className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-white/40"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save application"}
        </button>
      </div>
    </form>
  )
}
