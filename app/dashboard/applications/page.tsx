import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ApplicationCard from "@/components/application-card"

type JobApplication = {
  id: string
  company: string
  role: string
  status: string
  created_at: string
  feedback: string | null
  job_description: string | null
  cv_id: string | null
  tailored_cv: string | null
  cv_profiles: {
    id: string
    title: string
    summary: string | null
  } | null
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
    "responsible",
    "including",
    "across",
    "within",
    "daily",
    "duties",
    "hours",
    "benefits",
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
const KEYWORDS = [
  "react",
  "next.js",
  "nextjs",
  "typescript",
  "javascript",
  "node",
  "sql",
  "api",
  "apis",
  "frontend",
  "backend",
  "full stack",
  "ui",
  "ux",
  "testing",
  "jest",
  "cypress",
  "agile",
  "scrum",
  "leadership",
  "management",
  "communication",
  "customer service",
  "sales",
  "health and safety",
  "nebosh",
  "sia",
  "security",
  "auditor",
  "nhs",
  "healthcare",
  "clinical",
  "registration",
  "patient care",
  "support worker",
  "admin",
  "excel",
  "organisation",
  "organization",
  "teamwork",
  "problem solving",
  "stakeholder",
  "stakeholders",
  "collaboration",
  "team",
  "remote",
  "operations",
  "fast-paced",
]

function formatDate(dateString: string) {
  const date =
    dateString.length === 10
      ? new Date(`${dateString}T00:00:00`)
      : new Date(dateString)

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function normaliseText(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim()
}

function getMatchedKeywords(jobDescription: string, summary: string) {
  const jobText = normaliseText(jobDescription)
  const cvText = normaliseText(summary)

  const jobKeywords = KEYWORDS.filter((keyword) => jobText.includes(keyword))
  const matched = jobKeywords.filter((keyword) => cvText.includes(keyword))
  const missing = jobKeywords.filter((keyword) => !cvText.includes(keyword))

  return {
    jobKeywords,
    matched,
    missing,
  }
}

function pickBaseHeadline(summary: string, jobDescription: string) {
  const cleanSummary = summary.trim()
  const jobText = normaliseText(jobDescription)

  if (jobText.includes("react") || jobText.includes("frontend")) {
    return "Frontend developer with experience building modern web applications."
  }

  if (jobText.includes("next.js") || jobText.includes("nextjs")) {
    return "Frontend developer with experience building performant web applications using modern frameworks."
  }

  if (jobText.includes("healthcare") || jobText.includes("nhs")) {
    return "Experienced professional with a background in healthcare, service delivery, and operational support."
  }

  if (jobText.includes("security") || jobText.includes("sia")) {
    return "Experienced professional with a background in security, safety, and frontline operations."
  }

  if (jobText.includes("admin") || jobText.includes("excel")) {
    return "Organised professional with experience supporting teams, administration, and day-to-day operations."
  }

  if (cleanSummary) {
    const firstLine = cleanSummary.split("\n").find((line) => line.trim())
    if (firstLine) return firstLine.trim()
  }

  return "Experienced professional with a strong background and adaptable skill set."
}

function buildImpactLines(jobDescription: string, matched: string[], missing: string[]) {
  const jobText = normaliseText(jobDescription)
  const lines: string[] = []

  if (
    jobText.includes("react") ||
    jobText.includes("next.js") ||
    jobText.includes("nextjs") ||
    jobText.includes("typescript") ||
    jobText.includes("frontend")
  ) {
    lines.push(
      "Built and supported frontend applications using modern frameworks, reusable components, and clean user interfaces."
    )
  }

  if (jobText.includes("api") || jobText.includes("apis")) {
    lines.push(
      "Worked with APIs and integrated data-driven features to support reliable user experiences."
    )
  }

  if (
    jobText.includes("team") ||
    jobText.includes("stakeholder") ||
    jobText.includes("stakeholders") ||
    jobText.includes("collaboration") ||
    jobText.includes("communication")
  ) {
    lines.push(
      "Collaborated effectively with teams and stakeholders to deliver high-quality outcomes in fast-moving environments."
    )
  }

  if (
    jobText.includes("operations") ||
    jobText.includes("fast-paced") ||
    jobText.includes("remote") ||
    jobText.includes("rota")
  ) {
    lines.push(
      "Thrived in fast-paced operational environments, responding quickly to changing priorities and supporting smooth day-to-day delivery."
    )
  }

  if (
    jobText.includes("healthcare") ||
    jobText.includes("nhs") ||
    jobText.includes("clinical") ||
    jobText.includes("patient care")
  ) {
    lines.push(
      "Supported safe, compliant, and patient-focused service delivery while maintaining professionalism and attention to detail."
    )
  }

  if (
    jobText.includes("security") ||
    jobText.includes("sia") ||
    jobText.includes("health and safety") ||
    jobText.includes("nebosh")
  ) {
    lines.push(
      "Maintained strong awareness of safety, compliance, and risk while supporting secure and reliable operations."
    )
  }

  if (
    jobText.includes("admin") ||
    jobText.includes("excel") ||
    jobText.includes("organisation") ||
    jobText.includes("organization")
  ) {
    lines.push(
      "Handled administration, coordination, and organisation tasks accurately while supporting efficient team operations."
    )
  }

  if (
    jobText.includes("senior") ||
    jobText.includes("ownership") ||
    jobText.includes("leadership")
  ) {
    lines.push(
      "Able to take ownership, work independently, and contribute confidently to high-responsibility work."
    )
  }

  if (matched.length > 0) {
    lines.push(
      `Brings strengths in ${[...new Set(matched)].slice(0, 4).join(", ")} that align well with the role requirements.`
    )
  }

  if (missing.length > 0) {
    lines.push(
      `Further strengthen your profile by highlighting ${[...new Set(missing)].slice(0, 3).join(", ")} more clearly where relevant and truthful.`
    )
  }

  return lines
}

function generateTailoredSummary(
  summary: string,
  jobDescription: string,
  impactMode = true
) {
  const cleanSummary = summary.trim()
  const cleanJob = jobDescription.trim()

  if (!cleanSummary || !cleanJob) return ""

  const { matched, missing } = getMatchedKeywords(cleanJob, cleanSummary)
  const headline = pickBaseHeadline(cleanSummary, cleanJob)

  if (!impactMode) {
    const lines: string[] = [headline]

    if (matched.length > 0) {
      lines.push(
        `Strong experience in ${[...new Set(matched)].slice(0, 4).join(", ")}.`
      )
    }

    if (missing.length > 0) {
      lines.push(
        `Further strengthen your profile by highlighting ${[...new Set(missing)].slice(0, 3).join(", ")} where relevant.`
      )
    }

    return lines.join(" ")
  }

  const impactLines = buildImpactLines(cleanJob, matched, missing)
  return [headline, ...impactLines].join(" ")
}

function getStatusBadgeClass(status: string) {
  const base =
    "rounded-full border px-3 py-1 text-sm font-medium tracking-wide"

  switch ((status ?? "").toLowerCase()) {
    case "applied":
      return `${base} border-yellow-500/40 bg-yellow-500/10 text-yellow-300`
    case "interview":
    case "interviewing":
      return `${base} border-violet-500/40 bg-violet-500/10 text-violet-300`
    case "offer":
      return `${base} border-emerald-500/40 bg-emerald-500/10 text-emerald-300`
    case "rejected":
      return `${base} border-rose-500/40 bg-rose-500/10 text-rose-300`
    case "saved":
    default:
      return `${base} border-cyan-500/40 bg-cyan-500/10 text-cyan-300`
  }
}

function getFeedbackPreview(feedback: string | null) {
  if (!feedback) return null

  const lines = feedback
    .split(/(?=⚠️|✅|❌|🎉|💡|📊|🎯|🛡️|🚗|📚|🤝|📎|📄)/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !item.toLowerCase().startsWith("cv match score:"))

  return lines[0] ?? null
}

export default async function ApplicationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

 const { data: applications, error } = await supabase
  .from("job_applications")
  .select(`
    id,
    company,
    role,
    status,
    created_at,
    feedback,
    job_description,
    cv_id,
    tailored_cv,
    cv_profiles (
      id,
      title,
      summary
    )
  `)
  .eq("user_id", user.id)
  .order("created_at", { ascending: false })

  if (error) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300">
          Failed to load applications: {error.message}
        </div>
      </div>
    )
  }

  const safeApplications = (applications ?? []) as unknown as JobApplication[]

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Applications</h1>
            <p className="mt-2 text-sm text-white/60">
              Track your saved job applications, CV matches, and tailored previews.
            </p>
          </div>

          <Link
            href="/dashboard/jobs/new"
            className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:opacity-90"
          >
            Add Job
          </Link>
        </div>
      </section>
     {safeApplications.map((app) => {
  const cvSummary = app.tailored_cv?.trim() || app.cv_profiles?.summary || ""

  const tailoredSummary =
    app.job_description && cvSummary
      ? generateTailoredSummary(cvSummary, app.job_description, true)
      : null

  const feedbackPreview = tailoredSummary
    ? "Tailored CV ready for this application."
    : getFeedbackPreview(app.feedback)

  return (
    <ApplicationCard
      key={app.id}
      app={app}
      feedbackPreview={feedbackPreview}
      tailoredSummary={tailoredSummary}
    />
  )
})}
        </div>
      )}
    </div>
  )
}