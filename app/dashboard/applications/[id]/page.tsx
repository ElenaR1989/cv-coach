import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ApplicationStatusSelect from "@/components/application-status-select"
import DeleteApplicationButton from "@/components/delete-application-button"

type ApplicationDetailsPageProps = {
  params: Promise<{
    id: string
  }>
}

type JobApplication = {
  id: string
  company: string
  role: string
  status: string
  notes: string | null
  interview_date: string | null
  follow_up_date: string | null
  cv_id: string | null
  cover_letter: string | null
  job_description: string | null
  created_at: string
  feedback: string | null
  cv_profiles?: {
    id: string
    title: string
    summary: string | null
  } | null
}

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

function getSmartCoachLineClass(text: string) {
  if (text.includes("❌") || text.toLowerCase().includes("missing")) {
    return "rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
  }

  if (
    text.includes("⚠️") ||
    text.includes("🛡️") ||
    text.includes("🚗") ||
    text.includes("📚")
  ) {
    return "rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300"
  }

  if (text.includes("✅") || text.includes("🎉")) {
    return "rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
  }

  if (text.includes("✍️") || text.toLowerCase().includes("suggest")) {
    return "rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-300"
  }

  return "rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/90"
}

function extractSmartCoachSections(feedback: string | null) {
  if (!feedback) {
    return {
      score: null as number | null,
      messages: [] as string[],
      suggestions: [] as string[],
    }
  }

  const scoreMatch = feedback.match(/CV Match Score:\s*(\d+)%/i)
  const score = scoreMatch ? Number(scoreMatch[1]) : null

  const suggestionStart = feedback.indexOf("CV Improvement Suggestions:")
  const mainPart =
    suggestionStart === -1 ? feedback : feedback.slice(0, suggestionStart)
  const suggestionPart =
    suggestionStart === -1 ? "" : feedback.slice(suggestionStart)

  const rawMessages = mainPart
    .split(/(?=⚠️|✅|❌|🎉|💡|📊|🎯|🛡️|🚗|📚|🤝|📎|📄)/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !item.toLowerCase().startsWith("cv match score:"))

  const rawSuggestions = suggestionPart
    .replace("CV Improvement Suggestions:", "")
    .split(/(?=✍️)/)
    .map((item) => item.trim())
    .filter(Boolean)

  return {
    score,
    messages: rawMessages,
    suggestions: rawSuggestions,
  }
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

function getScoreBarClass(score: number | null) {
  if (score === null) return "bg-white/20"
  if (score >= 80) return "bg-emerald-400"
  if (score >= 50) return "bg-amber-400"
  return "bg-rose-400"
}

function getScoreLabel(score: number | null) {
  if (score === null) return "Match score unavailable"
  if (score >= 80) return "Strong match"
  if (score >= 50) return "Partial match"
  return "Low match"
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

function buildImpactLines(
  jobDescription: string,
  matched: string[],
  missing: string[]
) {
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
    jobText.includes("organisation")
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

function generateTailoredSummaryPreview(
  cvSummary: string | null,
  jobDescription: string | null
) {
  const summary = cvSummary?.trim() ?? ""
  const job = jobDescription?.trim() ?? ""

  if (!summary || !job) return null

  const { matched, missing } = getMatchedKeywords(job, summary)
  const headline = pickBaseHeadline(summary, job)
  const lines = buildImpactLines(job, matched, missing)

  return [headline, ...lines].join(" ")
}

function SmartCoachCard({
  feedback,
  tailoredSummary,
}: {
  feedback: string | null
  tailoredSummary: string | null
}) {
  const { score, messages, suggestions } = extractSmartCoachSections(feedback)

  if (!feedback && !tailoredSummary) return null

  const matchedCount = messages.filter((message) => message.includes("✅")).length
  const missingCount = messages.filter(
    (message) =>
      message.includes("❌") || message.toLowerCase().includes("missing")
  ).length

  return (
    <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-semibold">Smart Coach</h2>
            <p className="mt-1 text-sm text-white/60">
              Feedback based on this application and linked CV.
            </p>
          </div>

          {messages.length > 0 ? (
            <div className="space-y-2">
              {messages.map((message, index) => (
                <div key={index} className={getSmartCoachLineClass(message)}>
                  {message}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
              No Smart Coach messages yet.
            </div>
          )}

          {tailoredSummary ? (
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-cyan-300">
                    Tailored summary preview
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    Based on this job description and your linked CV summary.
                  </p>
                </div>

                {score !== null ? (
                  <span className={getScoreBadgeClass(score)}>{score}%</span>
                ) : null}
              </div>

              <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="whitespace-pre-wrap text-sm leading-7 text-white/90">
                  {tailoredSummary}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href="#job-description"
                  className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs transition hover:bg-white/20"
                >
                  View job description
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
              Add a job description and link a CV to preview a tailored summary here.
            </div>
          )}

          {suggestions.length > 0 ? (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
              <p className="text-sm font-medium text-violet-300">
                Improve CV suggestions
              </p>

              <div className="mt-3 space-y-2">
                {suggestions.map((suggestion, index) => (
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

        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Match score</span>
            <span className={getScoreBadgeClass(score)}>
              {score !== null ? `${score}%` : "N/A"}
            </span>
          </div>

          <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreBarClass(score)}`}
              style={{ width: `${score ?? 0}%` }}
            />
          </div>

          <p className="mt-3 text-xs text-white/60">
            {getScoreLabel(score)} • {matchedCount} matched / {missingCount} missing
          </p>

          <div className="mt-4 grid gap-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-wide text-white/50">
                Score
              </p>
              <p className="mt-1 text-xl font-semibold text-white">
                {score ?? 0}%
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
              <p className="text-xs uppercase tracking-wide text-emerald-300/70">
                Matched
              </p>
              <p className="mt-1 text-xl font-semibold text-emerald-300">
                {matchedCount}
              </p>
            </div>

            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3">
              <p className="text-xs uppercase tracking-wide text-rose-300/70">
                Missing
              </p>
              <p className="mt-1 text-xl font-semibold text-rose-300">
                {missingCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default async function ApplicationDetailsPage({
  params,
}: ApplicationDetailsPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: application, error } = await supabase
    .from("job_applications")
    .select(
      `
      id,
      company,
      role,
      status,
      notes,
      interview_date,
      follow_up_date,
      cv_id,
      cover_letter,
      job_description,
      created_at,
      feedback,
      cv_profiles (
        id,
        title,
        summary
      )
    `
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !application) {
    notFound()
  }

const rawJob = application as unknown as JobApplication & {
  cv_profiles?:
    | { id: string; title: string; summary: string | null }[]
    | { id: string; title: string; summary: string | null }
    | null
}

const job: JobApplication = {
  ...rawJob,
  cv_profiles: Array.isArray(rawJob.cv_profiles)
    ? rawJob.cv_profiles[0] ?? null
    : rawJob.cv_profiles ?? null,
}

const tailoredSummary = generateTailoredSummaryPreview(
  job.cv_profiles?.summary ?? null,
  job.job_description ?? null
)

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex justify-end">
        <Link
          href="/dashboard/applications"
          className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
        >
          ← Back to Applications
        </Link>
      </div>

      <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div>
              <h1 className="text-4xl font-bold">
                {job.company} — {job.role}
              </h1>
              <p className="mt-2 text-sm text-white/60">
                Saved on {formatDate(job.created_at)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={getStatusBadgeClass(job.status)}>
                {job.status}
              </span>

              {job.cv_id && job.cv_profiles?.title ? (
                <Link
                  href={`/dashboard/cvs/${job.cv_id}`}
                  className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-sm text-blue-300 transition hover:bg-blue-500/20"
                >
                  CV: {job.cv_profiles.title}
                </Link>
              ) : (
                <span className="rounded-full border border-zinc-500/40 bg-zinc-500/10 px-3 py-1 text-sm text-zinc-300">
                  No CV attached
                </span>
              )}

              {job.interview_date ? (
                <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-sm text-amber-300">
                  Interview: {formatDate(job.interview_date)}
                </span>
              ) : null}

              {job.follow_up_date ? (
                <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-sm text-rose-300">
                  Follow-up: {formatDate(job.follow_up_date)}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <ApplicationStatusSelect
              applicationId={job.id}
              currentStatus={job.status}
            />

           <div className="flex flex-wrap gap-2">
  {job.cv_id ? (
    <Link
      href={`/dashboard/cvs/${job.cv_id}`}
      className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
    >
      View CV
    </Link>
  ) : null}

  {job.cv_id ? (
    <Link
      href={`/dashboard/cover-letters?cvId=${job.cv_id}&applicationId=${job.id}`}
      className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-500/20"
    >
      Generate Cover Letter
    </Link>
  ) : null}

  <DeleteApplicationButton
    applicationId={job.id}
    company={job.company}
    role={job.role}
  />
</div>
          </div>
        </div>
      </section>

      <SmartCoachCard
        feedback={job.feedback}
        tailoredSummary={tailoredSummary}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <section
          id="job-description"
          className="rounded-2xl border border-white/20 bg-white/5 p-6"
        >
          <h2 className="text-2xl font-semibold">Job Description</h2>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
            {job.job_description ? (
              <p className="whitespace-pre-wrap text-sm text-white/90">
                {job.job_description}
              </p>
            ) : (
              <p className="text-sm text-white/60">
                No job description saved.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold">Cover Letter</h2>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
            {job.cover_letter ? (
              <p className="whitespace-pre-wrap text-sm text-white/90">
                {job.cover_letter}
              </p>
            ) : (
              <p className="text-sm text-white/60">
                No cover letter saved yet.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">Notes</h2>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
          {job.notes ? (
            <p className="whitespace-pre-wrap text-sm text-white/90">
              {job.notes}
            </p>
          ) : (
            <p className="text-sm text-white/60">
              No notes saved for this application.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}