import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ApplicationStatusSelect from "@/components/application-status-select"
import DeleteApplicationButton from "@/components/delete-application-button"
import SaveTailoredCVButton from "@/components/save-tailored-cv-button"
import AutoImproveCVButton from "@/components/auto-improve-cv-button"
import { getIsPro } from "@/lib/billing/is-pro"

type ApplicationDetailsPageProps = {
  params: Promise<{
    id: string
  }>
}

type CVProfile = {
  id: string
  title: string
  summary: string | null
  content: string | null
  skills: string | null
  experience: string | null
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
  tailored_cv: string | null
  original_tailored_cv: string | null
  cv_profiles?: CVProfile | null
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

function pickBaseHeadline(summary: string, jobDescription: string) {
  const cleanSummary = summary.trim()
  const jobText = jobDescription.toLowerCase()

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
  const jobText = jobDescription.toLowerCase()
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
    jobText.includes("leadership") ||
    jobText.includes("manager")
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
  jobDescription: string | null,
  matched: string[],
  missing: string[]
) {
  const summary = cvSummary?.trim() ?? ""
  const job = jobDescription?.trim() ?? ""

  if (!summary || !job) return null

  const headline = pickBaseHeadline(summary, job)
  const lines = buildImpactLines(job, matched, missing)

  return [headline, ...lines].join(" ")
}

function buildSmartCoachMessages(
  score: number | null,
  matched: string[],
  missing: string[],
  hasCv: boolean,
  hasJobDescription: boolean,
  isPro: boolean
) {
  const messages: string[] = []

  if (!hasCv) {
    messages.push("⚠️ Link a CV to unlock match score and tailored summary.")
  }

  if (!hasJobDescription) {
    messages.push(
      "⚠️ Add a job description to compare your CV against the role."
    )
  }

  if (!hasCv || !hasJobDescription) {
    return messages
  }

  if (score === null) {
    messages.push("⚠️ Match score unavailable for this application.")
    return messages
  }

  if (score >= 80) {
    messages.push(
      "✅ Strong fit overall based on your linked CV and this job description."
    )
  } else if (score >= 50) {
    messages.push(
      "📊 Partial fit found. You match some of the core role keywords."
    )
  } else {
    messages.push(
      "❌ Low keyword match so far. Your CV may not clearly reflect this role yet."
    )
  }

  if (matched.length > 0) {
    messages.push(`✅ Matched keywords: ${matched.join(", ")}`)
  }

  if (missing.length > 0) {
    messages.push(
      `❌ Missing keywords: ${(isPro ? missing : missing.slice(0, 2)).join(", ")}`
    )

    if (!isPro && missing.length > 2) {
      messages.push(
        `🔒 Upgrade to Pro to unlock ${missing.length - 2} more keyword${missing.length - 2 === 1 ? "" : "s"}`
      )
    }

    messages.push(
      `✍️ CV Improvement Suggestions: Highlight ${missing
        .slice(0, 3)
        .join(", ")} more clearly where relevant and truthful.`
    )
  }

  return messages
}

function getSmartCoachLineClass(text: string) {
  if (text.includes("❌") || text.toLowerCase().includes("missing")) {
    return "rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
  }

  if (text.includes("⚠️") || text.includes("📊")) {
    return "rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300"
  }

  if (text.includes("✅")) {
    return "rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
  }

  if (text.includes("✍️")) {
    return "rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-300"
  }

  if (text.includes("🔒")) {
    return "rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300"
  }

  return "rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/90"
}

function SmartCoachCard({
  score,
  matched,
  missing,
  messages,
  tailoredSummary,
  isPro,
}: {
  score: number | null
  matched: string[]
  missing: string[]
  messages: string[]
  tailoredSummary: string | null
  isPro: boolean
}) {
  const upgradeHref = "/pricing"

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

          {!isPro ? (
            <div className="flex flex-wrap gap-3">
              <Link
                href={upgradeHref}
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300 transition hover:bg-amber-500/20"
              >
                Upgrade to Pro
              </Link>
            </div>
          ) : null}

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

                {isPro ? (
                  <span className={getScoreBadgeClass(score)}>
                    {score !== null ? `${score}%` : "N/A"}
                  </span>
                ) : (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                    Pro
                  </span>
                )}
              </div>

              <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-4 relative overflow-hidden">
                {isPro ? (
                  <p className="whitespace-pre-wrap text-sm leading-7 text-white/90">
                    {tailoredSummary}
                  </p>
                ) : (
                  <>
                    <div className="pointer-events-none max-h-[220px] overflow-hidden opacity-40 blur-sm">
                      <p className="whitespace-pre-wrap text-sm leading-7 text-white/90">
                        {tailoredSummary}
                      </p>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black/70" />

                    <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                      <div className="max-w-md rounded-2xl border border-amber-500/30 bg-black/85 px-5 py-4 shadow-lg">
                        <div className="text-sm font-semibold text-amber-300">
                          🔒 Upgrade to Pro to unlock the full tailored summary
                        </div>
                        <div className="mt-1 text-xs text-white/60">
                          See the full AI-tailored version for this application
                        </div>

                        <div className="mt-4">
                          <Link
                            href={upgradeHref}
                            className="inline-flex rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300 transition hover:bg-amber-500/20"
                          >
                            Upgrade now
                          </Link>
                        </div>
                      </div>
                    </div>
                  </>
                )}
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
        </div>

        {isPro ? (
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
              {getScoreLabel(score)} • {matched.length} matched / {missing.length} missing
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
                  {matched.length}
                </p>
              </div>

              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3">
                <p className="text-xs uppercase tracking-wide text-rose-300/70">
                  Missing
                </p>
                <p className="mt-1 text-xl font-semibold text-rose-300">
                  {missing.length}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
            <p className="text-sm font-medium text-amber-300">Pro insights</p>
            <div className="mt-3 text-xl font-semibold text-white">
              Unlock full match analysis
            </div>
            <p className="mt-2 text-sm text-white/65">
              See your full score, matched keywords, missing keywords, and detailed breakdown.
            </p>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-white/50">Preview</p>
              <p className="mt-2 text-sm text-white/80">
                Partial fit detected
              </p>
              <p className="mt-1 text-xs text-white/50">
                Detailed score available in Pro
              </p>
            </div>

            <div className="mt-4">
              <Link
                href={upgradeHref}
                className="inline-flex rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300 transition hover:bg-amber-500/20"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        )}
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

  const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("is_pro, plan")
  .eq("id", user.id)
  .single()

const isPro = getIsPro(profile)

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
      tailored_cv,
      original_tailored_cv,
      cv_profiles (
        id,
        title,
        summary,
        content,
        skills,
        experience
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
    cv_profiles?: CVProfile[] | CVProfile | null
  }

  const job: JobApplication = {
    ...rawJob,
    cv_profiles: Array.isArray(rawJob.cv_profiles)
      ? rawJob.cv_profiles[0] ?? null
      : rawJob.cv_profiles ?? null,
  }

  const baseCvText = [
    job.cv_profiles?.summary ?? "",
    job.cv_profiles?.content ?? "",
    job.cv_profiles?.skills ?? "",
    job.cv_profiles?.experience ?? "",
  ].join("\n")

  const cvText = job.tailored_cv?.trim() ? job.tailored_cv : baseCvText

  const matchResult =
    cvText.trim() && job.job_description?.trim()
      ? getMatchResult(cvText, job.job_description)
      : null

  const score = matchResult?.score ?? null
  const matched = matchResult?.matched ?? []
  const missing = matchResult?.missing ?? []

  const tailoredSummary = job.tailored_cv?.trim()
    ? job.tailored_cv
    : generateTailoredSummaryPreview(
        job.cv_profiles?.summary ?? null,
        job.job_description ?? null,
        matched,
        missing
      )

  const messages = buildSmartCoachMessages(
    score,
    matched,
    missing,
    Boolean(job.cv_profiles),
    Boolean(job.job_description?.trim()),
    isPro
  )

  const originalMatchResult =
    job.original_tailored_cv?.trim() && job.job_description?.trim()
      ? getMatchResult(job.original_tailored_cv, job.job_description)
      : null

  const originalScore = originalMatchResult?.score ?? null

  const scoreImprovement =
    score !== null && originalScore !== null ? score - originalScore : null

  const aiSourceText =
    job.original_tailored_cv?.trim() ||
    job.tailored_cv?.trim() ||
    tailoredSummary ||
    ""

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
                  href={`/dashboard/cvs/${job.cv_id}?applicationId=${job.id}`}
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
              currentInterviewDate={job.interview_date ?? ""}
            />

            <div className="flex flex-wrap gap-2">
              {job.cv_id ? (
                <Link
                  href={`/dashboard/cvs/${job.cv_id}?applicationId=${job.id}`}
                  className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
                >
                  View CV
                </Link>
              ) : null}

              {job.cv_id ? (
                <SaveTailoredCVButton
                  applicationId={job.id}
                  tailoredSummary={tailoredSummary}
                  hasTailoredCv={Boolean(job.tailored_cv?.trim())}
                />
              ) : null}

              {job.cv_id ? (
              <AutoImproveCVButton
  applicationId={job.id}
  currentText={aiSourceText}
  missingKeywords={missing}
  jobDescription={job.job_description}
  hasExistingTailoredCv={Boolean(job.tailored_cv?.trim())}
  isPro={isPro}
/>
              ) : null}

         {job.cv_id ? (
  isPro ? (
    <Link
      href={`/dashboard/cover-letters?cvId=${job.cv_id}&applicationId=${job.id}`}
      className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-500/20"
    >
      Generate Cover Letter
    </Link>
  ) : (
    <Link
      href="/pricing"
      className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300 transition hover:bg-amber-500/20"
    >
      Upgrade to Pro
    </Link>
  )
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
        score={score}
        matched={matched}
        missing={missing}
        messages={messages}
        tailoredSummary={tailoredSummary}
        isPro={isPro}
      />

      {job.tailored_cv?.trim() ? (
        <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Before vs After</h2>
              <p className="mt-1 text-sm text-white/60">
                Compare your original tailored CV with the AI-improved version.
              </p>
            </div>

            {scoreImprovement !== null ? (
              isPro ? (
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    scoreImprovement > 0
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : scoreImprovement < 0
                        ? "border border-rose-500/30 bg-rose-500/10 text-rose-300"
                        : "border border-white/20 bg-white/10 text-white/70"
                  }`}
                >
                  {scoreImprovement > 0 ? "+" : ""}
                  {scoreImprovement}%
                </span>
              ) : (
                <Link
                  href={upgradeHref}
                  className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300 transition hover:bg-amber-500/20"
                >
                  🔒 Pro
                </Link>
              )
            ) : null}
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/50">
                Before AI
              </p>
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="whitespace-pre-wrap text-sm leading-7 text-white/80">
                  {job.original_tailored_cv ?? "No original tailored CV saved."}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 relative overflow-hidden">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-emerald-300/80">
                After AI
              </p>

              {isPro ? (
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-white/90">
                    {job.tailored_cv}
                  </p>
                </div>
              ) : (
                <>
                  <div className="pointer-events-none max-h-[200px] overflow-hidden opacity-40 blur-sm rounded-lg border border-white/10 bg-black/20 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-white/90">
                      {job.tailored_cv}
                    </p>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/80" />

                  <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                    <div className="max-w-md rounded-2xl border border-amber-500/30 bg-black/85 px-5 py-4 shadow-lg">
                      <div className="text-sm font-semibold text-amber-300">
                        🔒 Unlock your improved CV
                      </div>
                      <div className="mt-1 text-xs text-white/60">
                        See your full AI-enhanced version and improvements
                      </div>

                      <Link
                        href={upgradeHref}
                        className="mt-4 inline-flex rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20"
                      >
                        Upgrade to Pro
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      ) : null}

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