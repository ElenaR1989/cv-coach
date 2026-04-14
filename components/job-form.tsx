"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

function detectSourceFromUrl(url: string) {
  const lower = url.trim().toLowerCase()

  if (!lower) return ""

  if (lower.includes("indeed")) return "Indeed"
  if (lower.includes("totaljobs")) return "TotalJobs"
  if (lower.includes("linkedin")) return "LinkedIn"
  if (lower.includes("reed")) return "Reed"
  if (lower.includes("cv-library") || lower.includes("cvlibrary")) {
    return "CV Library"
  }
  if (lower.includes("glassdoor")) return "Glassdoor"
  if (lower.includes("monster")) return "Monster"

  return "Other"
}

function extractKeywords(text: string) {
  const stopWords = new Set([
    "about",
    "after",
    "again",
    "against",
    "along",
    "also",
    "among",
    "and",
    "are",
    "because",
    "been",
    "before",
    "being",
    "between",
    "both",
    "could",
    "each",
    "from",
    "have",
    "into",
    "must",
    "need",
    "role",
    "this",
    "that",
    "their",
    "there",
    "they",
    "with",
    "will",
    "would",
    "your",
    "ours",
    "team",
    "work",
    "working",
    "experience",
    "looking",
    "skills",
    "ability",
    "required",
    "requirements",
    "candidate",
    "support",
    "service",
  ])

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 4 && !stopWords.has(word))

  const counts = new Map<string, number>()

  for (const word of words) {
    counts.set(word, (counts.get(word) || 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 12)
}

function getMatchResult(cvText: string, jobDescription: string) {
  if (!cvText.trim() || !jobDescription.trim()) {
    return null
  }

  const keywords = extractKeywords(jobDescription)
  if (keywords.length === 0) {
    return null
  }

  const cvLower = cvText.toLowerCase()

  const matched = keywords.filter((keyword) => cvLower.includes(keyword))
  const missing = keywords.filter((keyword) => !cvLower.includes(keyword))

  const score = Math.round((matched.length / keywords.length) * 100)

  return {
    score,
    matched: matched.slice(0, 6),
    missing: missing.slice(0, 6),
  }
}

type CVProfile = {
  id: string
  title: string
  summary?: string | null
  content?: string | null
  skills?: string | null
  experience?: string | null
}

type JobFormProps = {
  initialData?: {
    id?: string
    company?: string | null
    role?: string | null
    status?: string | null
    notes?: string | null
    job_url?: string | null
    source?: string | null
    cv_id?: string | null
    job_description?: string | null
    interview_date?: string | null
    follow_up_date?: string | null
  } | null
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium tracking-wide text-white/80">
      {children}
    </label>
  )
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-white/15 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-sm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm leading-6 text-white/55">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

const inputClass =
  "w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition placeholder:text-white/30 hover:border-white/25 focus:border-cyan-400/50 focus:bg-black/35"
const textareaClass =
  "w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition placeholder:text-white/30 hover:border-white/25 focus:border-cyan-400/50 focus:bg-black/35"
const selectClass =
  "w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition hover:border-white/25 focus:border-cyan-400/50 focus:bg-black/35"

export default function JobForm({ initialData }: JobFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [company, setCompany] = useState(initialData?.company ?? "")
  const [role, setRole] = useState(initialData?.role ?? "")
  const [status, setStatus] = useState(initialData?.status ?? "Applied")
  const [notes, setNotes] = useState(initialData?.notes ?? "")
  const [jobUrl, setJobUrl] = useState(initialData?.job_url ?? "")
  const [source, setSource] = useState(initialData?.source ?? "")
  const [cvId, setCvId] = useState(initialData?.cv_id ?? "")
  const [jobDescription, setJobDescription] = useState(
    initialData?.job_description ?? ""
  )
  const [interviewDate, setInterviewDate] = useState(
    initialData?.interview_date ?? ""
  )
  const [followUpDate, setFollowUpDate] = useState(
    initialData?.follow_up_date ?? ""
  )

  const [cvs, setCvs] = useState<CVProfile[]>([])
  const [loadingCvs, setLoadingCvs] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setCompany(initialData?.company ?? "")
    setRole(initialData?.role ?? "")
    setStatus(initialData?.status ?? "Applied")
    setNotes(initialData?.notes ?? "")
    setJobUrl(initialData?.job_url ?? "")
    setSource(initialData?.source ?? "")
    setCvId(initialData?.cv_id ?? "")
    setJobDescription(initialData?.job_description ?? "")
    setInterviewDate(initialData?.interview_date ?? "")
    setFollowUpDate(initialData?.follow_up_date ?? "")
  }, [initialData])

  useEffect(() => {
    let cancelled = false

    async function loadCvs() {
      setLoadingCvs(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        if (!cancelled) {
          setCvs([])
          setLoadingCvs(false)
        }
        return
      }

      const { data, error } = await supabase
        .from("cv_profiles")
        .select("id, title, summary, content, skills, experience")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!cancelled) {
        if (error) {
          console.error("Error loading CVs:", error.message)
          setCvs([])
        } else {
          setCvs((data as CVProfile[]) ?? [])
        }
        setLoadingCvs(false)
      }
    }

    loadCvs()

    return () => {
      cancelled = true
    }
  }, [supabase])

  useEffect(() => {
    if (status !== "Interviewing") {
      setInterviewDate("")
    }

    if (status !== "Applied" && status !== "Interviewing") {
      setFollowUpDate("")
    }
  }, [status])

  const selectedCv = useMemo(
    () => cvs.find((cv) => cv.id === cvId) ?? null,
    [cvs, cvId]
  )

  const selectedCvText = useMemo(() => {
    if (!selectedCv) return ""

    return [
      selectedCv.summary ?? "",
      selectedCv.content ?? "",
      selectedCv.skills ?? "",
      selectedCv.experience ?? "",
    ].join("\n")
  }, [selectedCv])

  const matchResult = useMemo(
    () => getMatchResult(selectedCvText, jobDescription),
    [selectedCvText, jobDescription]
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setLoading(false)
      alert("You must be logged in.")
      return
    }

    const payload = {
      company: company.trim(),
      role: role.trim(),
      status,
      notes: notes.trim() || null,
      job_url: jobUrl.trim() || null,
      source: source || null,
      cv_id: cvId || null,
      job_description: jobDescription.trim() || null,
      interview_date: interviewDate || null,
      follow_up_date: followUpDate || null,
    }

    let error: { message: string } | null = null

    if (initialData?.id) {
      const { error: updateError } = await supabase
        .from("job_applications")
        .update(payload)
        .eq("id", initialData.id)
        .eq("user_id", user.id)

      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from("job_applications")
        .insert({
          ...payload,
          user_id: user.id,
        })

      error = insertError
    }

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {initialData?.id ? "Edit application" : "Add new application"}
        </h1>
        <p className="text-sm text-white/55">
          Keep your applications organised, polished, and easy to review later.
        </p>
      </div>

      <SectionCard
        title="Basic information"
        subtitle="Start with the employer and role details."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>Company</FieldLabel>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. NHS"
              className={inputClass}
              required
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>Role</FieldLabel>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Support Worker"
              className={inputClass}
              required
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Application details"
        subtitle="Source, status, linked CV, and follow-up timeline."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <FieldLabel>Job URL</FieldLabel>
            <input
              type="text"
              value={jobUrl}
              onChange={(e) => {
                const value = e.target.value
                setJobUrl(value)
                setSource(detectSourceFromUrl(value))
              }}
              placeholder="Paste job link from Indeed, LinkedIn, Reed, and more"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>Source</FieldLabel>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className={`${selectClass} max-w-md`}
            >
              <option value="">Select source</option>
              <option value="Indeed">Indeed</option>
              <option value="TotalJobs">TotalJobs</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Reed">Reed</option>
              <option value="CV Library">CV Library</option>
              <option value="Glassdoor">Glassdoor</option>
              <option value="Monster">Monster</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <FieldLabel>Link CV</FieldLabel>
            <select
              value={cvId}
              onChange={(e) => setCvId(e.target.value)}
              className={`${selectClass} max-w-md`}
            >
              <option value="">
                {loadingCvs ? "Loading CVs..." : "No CV selected"}
              </option>
              {cvs.map((cv) => (
                <option key={cv.id} value={cv.id}>
                  {cv.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <FieldLabel>Status</FieldLabel>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`${selectClass} max-w-md`}
            >
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {(status === "Interviewing" || status === "Interview") ? (
            <div className="space-y-2">
              <FieldLabel>Interview date</FieldLabel>
              <input
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className={`${inputClass} max-w-xs`}
              />
            </div>
          ) : null}

          {(status === "Applied" || status === "Interviewing") ? (
            <div className="space-y-2">
              <FieldLabel>Follow-up date</FieldLabel>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className={`${inputClass} max-w-xs`}
              />
            </div>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard
        title="Job description"
        subtitle="Paste the vacancy details to power Smart Coach feedback."
      >
        <div className="space-y-2">
          <FieldLabel>Job description</FieldLabel>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
            placeholder="Paste the full job description here..."
            className={textareaClass}
          />
        </div>
      </SectionCard>

      {selectedCv && jobDescription.trim() && matchResult ? (
        <section className="overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-5 shadow-[0_0_0_1px_rgba(251,191,36,0.08)]">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">
                Smart Coach preview
              </p>
              <p className="mt-1 text-sm text-white/60">
                Live score based on your linked CV and this job description.
              </p>
            </div>

            <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200">
              CV match score: {matchResult.score}%
            </span>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              <span className="font-medium">✅ Matched:</span>{" "}
              {matchResult.matched.length > 0
                ? matchResult.matched.join(", ")
                : "No strong keyword matches yet"}
            </div>

            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              <span className="font-medium">❌ Missing:</span>{" "}
              {matchResult.missing.length > 0
                ? matchResult.missing.join(", ")
                : "No major gaps found"}
            </div>
          </div>
        </section>
      ) : null}

      <SectionCard
        title="Notes"
        subtitle="Capture reminders, impressions, deadlines, or next actions."
      >
        <div className="space-y-2">
          <FieldLabel>Notes</FieldLabel>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Add anything useful for later..."
            className={textareaClass}
          />
        </div>
      </SectionCard>

<div className="sticky bottom-4 z-10 rounded-3xl border border-white/15 bg-black/40 p-4 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white">
              Application summary
            </p>
            <p className="text-xs text-white/55">
              Review your details and save when ready.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/[0.08]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Saving..."
                : initialData?.id
                ? "Update application"
                : "Save application"}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}