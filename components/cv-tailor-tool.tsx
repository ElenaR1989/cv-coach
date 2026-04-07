"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type CVTailorToolProps = {
  cvId: string
  currentSummary: string
  cvTitle: string
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

  if (jobText.includes("admin") || jobText.includes("excel") || jobText.includes("organisation")) {
    lines.push(
      "Handled administration, coordination, and organisation tasks accurately while supporting efficient team operations."
    )
  }

  if (jobText.includes("senior") || jobText.includes("ownership") || jobText.includes("leadership")) {
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
      `"Further strengthen your profile by highlighting ${missing.slice(0, 3).join(", ")} more visible where relevant and truthful.`
    )
  }

  return lines
}

function generateTailoredSummary(
  summary: string,
  jobDescription: string,
  impactMode: boolean
) {
  const cleanJob = jobDescription.trim()
  if (!cleanJob) return summary.trim()

  const { matched, missing } = getMatchedKeywords(cleanJob, summary)
  const headline = pickBaseHeadline(summary, cleanJob)

  if (!impactMode) {
    const lines: string[] = [headline]

    if (matched.length > 0) {
      lines.push(`Strong experience in ${matched.slice(0, 4).join(", ")}.`)
    }

    if (
      normaliseText(cleanJob).includes("team") ||
      normaliseText(cleanJob).includes("stakeholder") ||
      normaliseText(cleanJob).includes("collaboration")
    ) {
      lines.push(
        "Strong collaboration skills and experience working effectively with teams and stakeholders."
      )
    }

    if (missing.length > 0) {
      lines.push(
        `This CV should also highlight ${missing.slice(0, 3).join(", ")} more clearly where relevant.`
      )
    }

    return lines.join(" ")
  }

  const impactLines = buildImpactLines(cleanJob, matched, missing)

  return [headline, ...impactLines].join(" ")
}

function generateSuggestions(jobDescription: string, summary: string) {
  const cleanJob = normaliseText(jobDescription)
  const { matched, missing } = getMatchedKeywords(jobDescription, summary)

  const suggestions: string[] = []

  if (
    cleanJob.includes("react") ||
    cleanJob.includes("next.js") ||
    cleanJob.includes("nextjs") ||
    cleanJob.includes("typescript")
  ) {
    suggestions.push(
      "Mention specific frontend projects, frameworks, and technical achievements."
    )
  }

  if (
    cleanJob.includes("team") ||
    cleanJob.includes("stakeholder") ||
    cleanJob.includes("communication")
  ) {
    suggestions.push(
      "Show stronger examples of teamwork, collaboration, and communication."
    )
  }

  if (cleanJob.includes("senior") || cleanJob.includes("ownership")) {
    suggestions.push(
      "Add evidence of ownership, leadership, or independent decision-making."
    )
  }

  if (cleanJob.includes("healthcare") || cleanJob.includes("nhs")) {
    suggestions.push(
      "Highlight healthcare experience, compliance, registrations, or patient-care responsibilities."
    )
  }

  if (cleanJob.includes("security") || cleanJob.includes("sia")) {
    suggestions.push(
      "Show any security experience, licence details, incident handling, or safety responsibilities."
    )
  }

  if (cleanJob.includes("auditor") || cleanJob.includes("nebosh")) {
    suggestions.push(
      "Add compliance, inspection, auditing, or health and safety experience more clearly."
    )
  }

  if (cleanJob.includes("admin") || cleanJob.includes("excel")) {
    suggestions.push(
      "Add stronger examples of administration, organisation, record-keeping, or Excel-based work."
    )
  }

  if (matched.length > 0) {
    suggestions.push(
      `Keep these matched strengths visible: ${matched.slice(0, 4).join(", ")}.`
    )
  }

  if (missing.length > 0) {
    suggestions.push(
      `Consider adding these missing keywords where truthful: ${missing.slice(0, 5).join(", ")}.`
    )
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "Tailor the summary to mirror the language of the job description more closely."
    )
  }

  return suggestions
}

export default function CVTailorTool({
  cvId,
  currentSummary,
  cvTitle,
}: CVTailorToolProps) {
  const router = useRouter()
  const supabase = createClient()

  const [jobDescription, setJobDescription] = useState("")
  const [summaryDraft, setSummaryDraft] = useState(currentSummary)
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState("")
  const [error, setError] = useState("")
  const [impactMode, setImpactMode] = useState(true)

  const analysis = useMemo(() => {
    const matchedData = getMatchedKeywords(jobDescription, summaryDraft)
    const tailoredSummary = generateTailoredSummary(
      currentSummary,
      jobDescription,
      impactMode
    )
    const suggestions = generateSuggestions(jobDescription, summaryDraft)

    const total = matchedData.jobKeywords.length
    const matchedCount = matchedData.matched.length
    const score = total === 0 ? null : Math.round((matchedCount / total) * 100)

    return {
      score,
      matched: matchedData.matched,
      missing: matchedData.missing,
      tailoredSummary,
      suggestions,
    }
  }, [jobDescription, summaryDraft, currentSummary, impactMode])

  const handleGenerate = () => {
    setError("")
    setSavedMessage("")

    if (!jobDescription.trim()) {
      setError("Paste a job description first.")
      return
    }

    setSummaryDraft(analysis.tailoredSummary)
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSavedMessage("")

    const { error: updateError } = await supabase
      .from("cv_profiles")
      .update({
        summary: summaryDraft,
      })
      .eq("id", cvId)

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSavedMessage("Improved summary saved to CV.")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      ) : null}

      {savedMessage ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {savedMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold">Job description</h2>
          <p className="mt-2 text-sm text-white/60">
            Paste the job description you want to tailor{" "}
            <span className="font-medium text-white/80">{cvTitle}</span> for.
          </p>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={14}
            className="mt-4 w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-white/40"
          />

          <div className="mt-4 flex items-center gap-3">
            <input
              id="impact-mode"
              type="checkbox"
              checked={impactMode}
              onChange={(e) => setImpactMode(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="impact-mode" className="text-sm text-white/80">
              Impact mode
            </label>
          </div>

          <p className="mt-2 text-xs text-white/50">
            Impact mode makes the summary sound stronger and more results-focused.
          </p>

          <button
            type="button"
            onClick={handleGenerate}
            className="mt-4 rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90"
          >
            Auto-improve summary
          </button>
        </section>

        <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold">Tailored summary</h2>
          <p className="mt-2 text-sm text-white/60">
            Edit the generated version before saving it to your CV.
          </p>

          <textarea
            value={summaryDraft}
            onChange={(e) => setSummaryDraft(e.target.value)}
            rows={14}
            className="mt-4 w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-white/40"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save to CV"}
            </button>

            <button
              type="button"
              onClick={() => setSummaryDraft(currentSummary)}
              className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Reset
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Match review</h2>
            <p className="mt-2 text-sm text-white/60">
              Simple keyword-based match for now. Later we can upgrade this to AI rewriting.
            </p>
          </div>

          <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300">
            Match score: {analysis.score !== null ? `${analysis.score}%` : "N/A"}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-300/70">
              Matched keywords
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {analysis.matched.length > 0 ? (
                analysis.matched.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <p className="text-sm text-emerald-200/80">
                  No matched keywords yet.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
            <p className="text-xs uppercase tracking-wide text-rose-300/70">
              Missing keywords
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {analysis.missing.length > 0 ? (
                analysis.missing.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs text-rose-200"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <p className="text-sm text-rose-200/80">
                  No missing keywords detected.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
            <p className="text-xs uppercase tracking-wide text-violet-300/70">
              Improvement suggestions
            </p>
            <div className="mt-3 space-y-2">
              {analysis.suggestions.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-violet-500/10 bg-black/20 px-3 py-2 text-sm text-white/90"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
