"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type CVProfile = {
  id: string
  title: string
  content?: string | null
  summary?: string | null
  full_name?: string | null
  skills?: string | null
  experience?: string | null
}

type SkillRule = {
  label: string
  requiredKeywords: string[]
  cvKeywords: string[]
  advice: string
  suggestion: string
}

type SmartCoachResult = {
  score: number | null
  messages: string[]
  matched: string[]
  missing: string[]
  suggestions: string[]
}

const SKILL_RULES: SkillRule[] = [
  {
    label: "NEBOSH / health & safety",
    requiredKeywords: ["auditor", "health and safety", "hse", "compliance"],
    cvKeywords: ["nebosh", "health and safety", "hse", "iosh", "compliance"],
    advice: "⚠️ This role may require NEBOSH or health & safety knowledge.",
    suggestion:
      "✍️ Add NEBOSH, compliance, audits, risk assessments, and health & safety responsibilities clearly in your CV summary and experience.",
  },
  {
    label: "SIA licence",
    requiredKeywords: ["security", "security officer", "guard", "door supervisor"],
    cvKeywords: ["sia", "door supervisor", "security licence", "security officer"],
    advice: "🛡️ Security roles usually require an SIA licence.",
    suggestion:
      "✍️ Add your SIA licence status and security duties clearly, such as patrolling, incident handling, access control, or conflict management.",
  },
  {
    label: "React / frontend skills",
    requiredKeywords: ["react", "frontend", "front end", "developer", "javascript", "typescript"],
    cvKeywords: ["react", "javascript", "typescript", "frontend", "front end", "next.js", "nextjs"],
    advice: "💡 Add projects, technical skills, and frameworks to strengthen your CV.",
    suggestion:
      "✍️ Add React, TypeScript, JavaScript, Next.js, frontend projects, APIs, and UI work more clearly in your summary and skills.",
  },
  {
    label: "Leadership",
    requiredKeywords: ["manager", "supervisor", "team lead", "leadership"],
    cvKeywords: ["manager", "managed", "supervisor", "team lead", "leadership"],
    advice: "📊 Highlight leadership and team management experience.",
    suggestion:
      "✍️ Add examples of leading teams, managing rotas, supervising staff, improving processes, or making operational decisions.",
  },
  {
    label: "Healthcare registration",
    requiredKeywords: ["doctor", "nurse", "nhs", "healthcare", "clinical"],
    cvKeywords: ["gmc", "nmc", "hcpc", "healthcare", "nhs", "clinical"],
    advice: "⚠️ Make sure you meet the required qualifications and registration for this role.",
    suggestion:
      "✍️ Add your healthcare registration, clinical qualifications, NHS experience, or patient-care responsibilities clearly in your CV.",
  },
  {
    label: "Driving licence",
    requiredKeywords: ["driver", "delivery driver", "courier", "hgv"],
    cvKeywords: ["driving licence", "driver", "hgv", "full uk licence", "full driving licence"],
    advice: "🚗 Driving roles usually require a valid driving licence or the correct licence category.",
    suggestion:
      "✍️ Add your driving licence type, years of driving experience, delivery work, route planning, or vehicle handling experience.",
  },
  {
    label: "Teaching qualification",
    requiredKeywords: ["teacher", "teaching assistant", "lecturer", "school"],
    cvKeywords: ["qts", "teacher", "teaching", "pgce", "education"],
    advice: "📚 Teaching roles may require QTS or relevant education and safeguarding checks.",
    suggestion:
      "✍️ Add QTS, PGCE, classroom experience, lesson planning, safeguarding, and student support examples.",
  },
  {
    label: "Care / support experience",
    requiredKeywords: ["care assistant", "support worker", "carer", "care", "support"],
    cvKeywords: ["care", "support worker", "safeguarding", "moving and handling", "carer"],
    advice: "🤝 Care roles are stronger with safeguarding, moving and handling, or care experience.",
    suggestion:
      "✍️ Add safeguarding, care plans, moving and handling, personal care, and support work examples.",
  },
]

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word))
}

function getCvSearchText(selectedCv: CVProfile | null) {
  if (!selectedCv) return ""

  return [
    selectedCv.title ?? "",
    selectedCv.full_name ?? "",
    selectedCv.summary ?? "",
    selectedCv.skills ?? "",
    selectedCv.experience ?? "",
    selectedCv.content ?? "",
  ]
    .join(" ")
    .toLowerCase()
}

function calculateScore(totalRules: number, matchedCount: number) {
  if (totalRules === 0) return null
  return Math.round((matchedCount / totalRules) * 100)
}

function buildSmartCoachResult(
  role: string,
  company: string,
  jobDescription: string,
  selectedCv: CVProfile | null
): SmartCoachResult {
  const jobText = `${role} ${company} ${jobDescription}`.toLowerCase()
  const cvText = getCvSearchText(selectedCv)

  const messages: string[] = []
  const matched: string[] = []
  const missing: string[] = []
  const suggestions: string[] = []

  if (jobText.includes("senior")) {
    messages.push("⚠️ This role may be senior level. Make sure your experience matches.")
    if (!cvText.includes("senior") && !cvText.includes("lead") && !cvText.includes("manager")) {
      suggestions.push(
        "✍️ Add stronger senior-level evidence such as ownership, leadership, mentoring, or complex project responsibility."
      )
    }
  }

  if (jobText.includes("intern") || jobText.includes("trainee")) {
    messages.push("🎯 Great for gaining experience. Show willingness to learn and grow.")
  }

  const triggeredRules = SKILL_RULES.filter((rule) =>
    includesAny(jobText, rule.requiredKeywords)
  )

  for (const rule of triggeredRules) {
    messages.push(rule.advice)
  }

  if (!selectedCv) {
    messages.push("📎 Attach a CV to compare your profile with the job requirements.")
    return {
      score: null,
      messages: Array.from(new Set(messages)),
      matched,
      missing,
      suggestions: Array.from(new Set(suggestions)),
    }
  }

  if (!cvText.trim()) {
    messages.push("📄 Add CV summary or content to enable CV match feedback.")
    return {
      score: null,
      messages: Array.from(new Set(messages)),
      matched,
      missing,
      suggestions: Array.from(new Set(suggestions)),
    }
  }

  for (const rule of triggeredRules) {
    if (includesAny(cvText, rule.cvKeywords)) {
      matched.push(rule.label)
    } else {
      missing.push(rule.label)
      suggestions.push(rule.suggestion)
    }
  }

  const score = calculateScore(triggeredRules.length, matched.length)

  if (matched.length > 0) {
    messages.push(`✅ CV match found for: ${matched.join(", ")}.`)
  }

  if (missing.length > 0) {
    messages.push(`❌ Your CV may be missing: ${missing.join(", ")}.`)
  }

  if (triggeredRules.length > 0 && missing.length === 0) {
    messages.push("🎉 Your selected CV looks aligned with the main role requirements.")
  }

  if (triggeredRules.length === 0) {
    messages.push("✅ Looks like a good application. Keep going!")
  }

  return {
    score,
    messages: Array.from(new Set(messages)),
    matched,
    missing,
    suggestions: Array.from(new Set(suggestions)),
  }
}

function getFeedbackBoxClass(messages: string[]) {
  const joined = messages.join(" ")

  if (joined.includes("❌") || joined.includes("⚠️") || joined.includes("🛡️")) {
    return "rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4"
  }

  if (
    joined.includes("💡") ||
    joined.includes("📊") ||
    joined.includes("📄") ||
    joined.includes("📎")
  ) {
    return "rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4"
  }

  return "rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4"
}

function getScoreBadgeClass(score: number | null) {
  if (score === null) {
    return "rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/70"
  }

  if (score >= 80) {
    return "rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300"
  }

  if (score >= 50) {
    return "rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-300"
  }

  return "rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-sm font-medium text-rose-300"
}

function formatScoreText(score: number | null) {
  if (score === null) return "Match score unavailable"
  return `CV match score: ${score}%`
}

export default function JobForm({ cvs = [], initialData }: JobFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [mounted, setMounted] = useState(false)
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [status, setStatus] = useState("applied")
  const [notes, setNotes] = useState("")
  const [interviewDate, setInterviewDate] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [cvId, setCvId] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [cvs, setCvs] = useState<CVProfile[]>([])
  const [loadingCvs, setLoadingCvs] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadCvs = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoadingCvs(false)
        return
      }

      const { data, error } = await supabase
        .from("cv_profiles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading CVs:", error.message)
      }

      setCvs((data as CVProfile[]) ?? [])
      setLoadingCvs(false)
    }

    loadCvs()
  }, [supabase])

  const selectedCv = useMemo(
    () => cvs.find((cv) => cv.id === cvId) ?? null,
    [cvs, cvId]
  )

  const smartCoach = mounted
    ? buildSmartCoachResult(role, company, jobDescription, selectedCv)
    : {
        score: null,
        messages: [],
        matched: [],
        missing: [],
        suggestions: [],
      }

  const feedback = [
    smartCoach.score !== null ? `CV Match Score: ${smartCoach.score}%` : null,
    ...smartCoach.messages,
    ...(smartCoach.suggestions.length > 0
      ? [`CV Improvement Suggestions: ${smartCoach.suggestions.join(" ")}`]
      : []),
  ]
    .filter(Boolean)
    .join(" ")

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
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-white/20 bg-white/5 p-6"
    >
      <div>
        <h2 className="text-2xl font-semibold">Add Job Application</h2>
        <p className="mt-1 text-sm text-white/60">
          Save a new application and compare your CV against the job.
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
            placeholder="e.g. NHS"
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
            placeholder="e.g. Senior Security Officer"
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
        <label className="text-sm text-white/80">Job description</label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          rows={5}
          className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-white/40"
        />
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

      {mounted ? (
        <div className={getFeedbackBoxClass(smartCoach.messages)}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-white/80">Smart Coach preview</p>
            <span className={getScoreBadgeClass(smartCoach.score)}>
              {formatScoreText(smartCoach.score)}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {smartCoach.messages.map((message, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90"
              >
                {message}
              </div>
            ))}
          </div>

          {smartCoach.suggestions.length > 0 ? (
            <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/10 p-3">
              <p className="text-sm font-medium text-violet-300">Improve CV suggestions</p>
              <div className="mt-2 space-y-2">
                {smartCoach.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-violet-500/10 bg-black/20 px-3 py-2 text-sm text-white/90"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
          <p className="text-sm text-white/60">Loading Smart Coach...</p>
        </div>
      )}

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
