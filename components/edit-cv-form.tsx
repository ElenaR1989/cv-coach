"use client"

import { useState, useRef } from "react"

type ExperienceItem = {
  title: string
  company: string
  dates: string
  description: string
}

type EducationItem = {
  school: string
  qualification: string
  dates: string
  description: string
}

type EditCVFormProps = {
  cv: {
    id: string
    title: string | null
    full_name: string | null
    summary: string | null
    email: string | null
    phone: string | null
    location: string | null
    website: string | null
    linkedin: string | null
    github: string | null
    skills: string | null
    experience: ExperienceItem[] | null
    education_entries: EducationItem[] | null
  }
  action: (formData: FormData) => void
}

const inputClass =
  "w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition placeholder:text-white/30 hover:border-white/25 focus:border-cyan-400/50 focus:bg-black/35"

const textareaClass =
  "w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition placeholder:text-white/30 hover:border-white/25 focus:border-cyan-400/50 focus:bg-black/35 resize-none"

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-white/45">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-white/70">{children}</label>
}

export default function EditCVForm({ cv, action }: EditCVFormProps) {
  const formRef = useRef<HTMLFormElement>(null)

  const [summary, setSummary] = useState(cv.summary ?? "")
  const [skills, setSkills] = useState(cv.skills ?? "")

  const [experience, setExperience] = useState<ExperienceItem[]>(
    Array.isArray(cv.experience) && cv.experience.length > 0
      ? cv.experience
      : [{ title: "", company: "", dates: "", description: "" }]
  )
  const [education, setEducation] = useState<EducationItem[]>(
    Array.isArray(cv.education_entries) && cv.education_entries.length > 0
      ? cv.education_entries
      : [{ school: "", qualification: "", dates: "", description: "" }]
  )

  const [improvingIndex, setImprovingIndex] = useState<number | null>(null)
  const [improvingSummary, setImprovingSummary] = useState(false)
  const [improvingWhole, setImprovingWhole] = useState(false)
  const [suggestingSkills, setSuggestingSkills] = useState(false)
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([])
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  // ── Experience helpers ────────────────────────────────────────────────────
  const addExperience = () =>
    setExperience([...experience, { title: "", company: "", dates: "", description: "" }])

  const removeExperience = (i: number) =>
    setExperience(experience.length === 1
      ? [{ title: "", company: "", dates: "", description: "" }]
      : experience.filter((_, idx) => idx !== i))

  const updateExperience = (i: number, field: keyof ExperienceItem, value: string) => {
    const next = [...experience]
    next[i] = { ...next[i], [field]: value }
    setExperience(next)
  }

  // ── Education helpers ─────────────────────────────────────────────────────
  const addEducation = () =>
    setEducation([...education, { school: "", qualification: "", dates: "", description: "" }])

  const removeEducation = (i: number) =>
    setEducation(education.length === 1
      ? [{ school: "", qualification: "", dates: "", description: "" }]
      : education.filter((_, idx) => idx !== i))

  const updateEducation = (i: number, field: keyof EducationItem, value: string) => {
    const next = [...education]
    next[i] = { ...next[i], [field]: value }
    setEducation(next)
  }

  // ── AI: improve single experience ─────────────────────────────────────────
  const improveExperience = async (index: number) => {
    const current = experience[index]?.description?.trim()
    if (!current) return alert("Add some experience text first.")
    setImprovingIndex(index)
    try {
      const res = await fetch("/api/improve-experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: current }),
      })
      const data = await res.json()
      if (!res.ok) return alert(data.error ?? "Failed to improve.")
      updateExperience(index, "description", data.improved ?? current)
    } catch {
      alert("Failed to improve experience.")
    } finally {
      setImprovingIndex(null)
    }
  }

  // ── AI: improve summary ───────────────────────────────────────────────────
  const improveSummary = async () => {
    if (!summary.trim()) return alert("Add a summary first.")
    setImprovingSummary(true)
    try {
      const res = await fetch("/api/rewrite-cv-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentSummary: summary, jobDescription: "" }),
      })
      const data = await res.json()
      if (!res.ok) return alert(data.error ?? "Failed.")
      if (data.rewritten) setSummary(data.rewritten)
    } catch {
      alert("Failed to improve summary.")
    } finally {
      setImprovingSummary(false)
    }
  }

  // ── AI: improve whole CV ──────────────────────────────────────────────────
  const improveWholeCv = async () => {
    if (!summary.trim() && experience.every(e => !e.description.trim()))
      return alert("Add some content to your CV first.")
    setImprovingWhole(true)
    try {
      const res = await fetch("/api/improve-whole-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary, experience }),
      })
      const data = await res.json()
      if (!res.ok) return alert(data.error ?? "Failed.")
      if (data.summary) setSummary(data.summary)
      if (Array.isArray(data.experience)) setExperience(data.experience)
    } catch {
      alert("Failed to improve CV.")
    } finally {
      setImprovingWhole(false)
    }
  }

  // ── AI: suggest skills ────────────────────────────────────────────────────
  const suggestSkills = async () => {
    const expText = experience.map(e => `${e.title} at ${e.company}: ${e.description}`).join("\n")
    if (!expText.trim()) return alert("Add some work experience first.")
    setSuggestingSkills(true)
    setSuggestedSkills([])
    try {
      const res = await fetch("/api/suggest-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experience: expText, currentSkills: skills }),
      })
      const data = await res.json()
      if (!res.ok) return alert(data.error ?? "Failed.")
      setSuggestedSkills(data.skills ?? [])
    } catch {
      alert("Failed to suggest skills.")
    } finally {
      setSuggestingSkills(false)
    }
  }

  const addSuggestedSkill = (skill: string) => {
    const current = skills.trim()
    const already = current.toLowerCase().split(/,\s*/).map(s => s.trim())
    if (already.includes(skill.toLowerCase())) return
    setSkills(current ? `${current}, ${skill}` : skill)
    setSuggestedSkills(prev => prev.filter(s => s !== skill))
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formRef.current) return
    setSaving(true)
    setSaved(false)
    const formData = new FormData(formRef.current)
    // Sync controlled fields back into hidden inputs (handled via name fields)
    await action(formData)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form ref={formRef} action={action} className="space-y-6 pb-24">
      <input type="hidden" name="cvId" value={cv.id} />
      {/* Sync controlled fields */}
      <input type="hidden" name="summary" value={summary} />
      <input type="hidden" name="skills" value={skills} />
      {experience.map((exp, i) => (
        <input key={i} type="hidden" name={`exp_desc_${i}`} value={exp.description} />
      ))}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit CV</h1>
          <p className="mt-1 text-sm text-white/45">Keep your CV accurate and well-worded.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={improveWholeCv}
            disabled={improvingWhole}
            className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition hover:bg-violet-500/20 disabled:opacity-50"
          >
            {improvingWhole ? (
              <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-400/40 border-t-violet-300" />Improving…</>
            ) : "✨ Improve whole CV with AI"}
          </button>
          <a
            href={`/cv/${cv.id}/print`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
          >
            Download PDF ↗
          </a>
        </div>
      </div>

      {/* Basic Details */}
      <SectionCard title="Basic Details" subtitle="Your name and internal CV label.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <FieldLabel>CV Label</FieldLabel>
            <input name="title" defaultValue={cv.title ?? ""} placeholder="e.g. Main CV" className={inputClass} />
            <p className="text-xs text-white/30">Internal name — not shown on the CV itself.</p>
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Full Name</FieldLabel>
            <input name="full_name" defaultValue={cv.full_name ?? ""} placeholder="e.g. Elena Rahimi" className={inputClass} />
          </div>
        </div>
      </SectionCard>

      {/* Contact */}
      <SectionCard title="Contact Details" subtitle="Shown at the top of your CV.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <FieldLabel>Email</FieldLabel>
            <input name="email" type="email" defaultValue={cv.email ?? ""} placeholder="you@example.com" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Phone</FieldLabel>
            <input name="phone" defaultValue={cv.phone ?? ""} placeholder="+44 7700 000000" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Location</FieldLabel>
            <input name="location" defaultValue={cv.location ?? ""} placeholder="London, UK" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Website</FieldLabel>
            <input name="website" defaultValue={cv.website ?? ""} placeholder="yoursite.com" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>LinkedIn</FieldLabel>
            <input name="linkedin" defaultValue={cv.linkedin ?? ""} placeholder="linkedin.com/in/you" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>GitHub</FieldLabel>
            <input name="github" defaultValue={cv.github ?? ""} placeholder="github.com/you" className={inputClass} />
          </div>
        </div>
      </SectionCard>

      {/* Summary */}
      <SectionCard title="Professional Summary" subtitle="2–4 sentences that open your CV.">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FieldLabel>Summary</FieldLabel>
            <button
              type="button"
              onClick={improveSummary}
              disabled={improvingSummary}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-50"
            >
              {improvingSummary ? (
                <><span className="h-3 w-3 animate-spin rounded-full border-2 border-cyan-400/40 border-t-cyan-300" />Improving…</>
              ) : "✨ Improve with AI"}
            </button>
          </div>
          <textarea
            value={summary}
            onChange={e => setSummary(e.target.value)}
            placeholder="Experienced professional with a background in…"
            rows={5}
            className={textareaClass}
          />
          <p className="text-right text-xs text-white/25">{summary.length} characters</p>
        </div>
      </SectionCard>

      {/* Skills */}
      <SectionCard title="Skills" subtitle="Comma-separated list of your key skills.">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FieldLabel>Skills</FieldLabel>
            <button
              type="button"
              onClick={suggestSkills}
              disabled={suggestingSkills}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
            >
              {suggestingSkills ? (
                <><span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-400/40 border-t-emerald-300" />Analysing…</>
              ) : "✨ Suggest skills from experience"}
            </button>
          </div>
          <textarea
            value={skills}
            onChange={e => setSkills(e.target.value)}
            placeholder="e.g. teamwork, communication, Microsoft Excel, customer service"
            rows={3}
            className={textareaClass}
          />
          {suggestedSkills.length > 0 && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="mb-2 text-xs font-medium text-emerald-300">Suggested skills — click to add:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedSkills.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSuggestedSkill(skill)}
                    className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200 transition hover:bg-emerald-500/30"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Experience */}
      <SectionCard title="Work Experience" subtitle="List your roles, most recent first.">
        <div className="space-y-4">
          {experience.map((item, index) => (
            <div key={index} className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/60">Job {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="rounded-lg border border-white/10 px-3 py-1 text-xs text-white/40 transition hover:border-red-500/30 hover:text-red-400"
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name={`exp_title_${index}`}
                  value={item.title}
                  onChange={e => updateExperience(index, "title", e.target.value)}
                  placeholder="Job Title"
                  className={inputClass}
                />
                <input
                  name={`exp_company_${index}`}
                  value={item.company}
                  onChange={e => updateExperience(index, "company", e.target.value)}
                  placeholder="Company"
                  className={inputClass}
                />
              </div>
              <input
                name={`exp_dates_${index}`}
                value={item.dates}
                onChange={e => updateExperience(index, "dates", e.target.value)}
                placeholder="e.g. Jan 2023 – Mar 2025"
                className={inputClass}
              />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FieldLabel>Description</FieldLabel>
                  <button
                    type="button"
                    onClick={() => improveExperience(index)}
                    disabled={improvingIndex === index}
                    className="flex items-center gap-1.5 rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-50"
                  >
                    {improvingIndex === index ? (
                      <><span className="h-3 w-3 animate-spin rounded-full border-2 border-cyan-400/40 border-t-cyan-300" />Improving…</>
                    ) : "✨ Improve with AI"}
                  </button>
                </div>
                <textarea
                  name={`exp_desc_${index}`}
                  value={item.description}
                  onChange={e => updateExperience(index, "description", e.target.value)}
                  placeholder={"One achievement per line, e.g.:\nManaged a team of 8 staff\nReduced admin time by 30%\nHandled customer queries and complaints"}
                  rows={5}
                  className={textareaClass}
                />
                <p className="text-xs text-white/25">One achievement per line — each becomes a bullet point on the CV.</p>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addExperience}
            className="w-full rounded-xl border border-dashed border-white/15 py-3 text-sm text-white/40 transition hover:border-white/25 hover:text-white/60"
          >
            + Add another role
          </button>
        </div>
      </SectionCard>

      {/* Education */}
      <SectionCard title="Education" subtitle="Qualifications, courses, and certifications.">
        <div className="space-y-4">
          {education.map((item, index) => (
            <div key={index} className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/60">Education {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="rounded-lg border border-white/10 px-3 py-1 text-xs text-white/40 transition hover:border-red-500/30 hover:text-red-400"
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name={`edu_school_${index}`}
                  value={item.school}
                  onChange={e => updateEducation(index, "school", e.target.value)}
                  placeholder="School / College / University"
                  className={inputClass}
                />
                <input
                  name={`edu_qualification_${index}`}
                  value={item.qualification}
                  onChange={e => updateEducation(index, "qualification", e.target.value)}
                  placeholder="Qualification or Degree"
                  className={inputClass}
                />
              </div>
              <input
                name={`edu_dates_${index}`}
                value={item.dates}
                onChange={e => updateEducation(index, "dates", e.target.value)}
                placeholder="e.g. 2015 – 2018"
                className={inputClass}
              />
              <textarea
                name={`edu_desc_${index}`}
                value={item.description}
                onChange={e => updateEducation(index, "description", e.target.value)}
                placeholder="Grades, modules, achievements…"
                rows={3}
                className={textareaClass}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addEducation}
            className="w-full rounded-xl border border-dashed border-white/15 py-3 text-sm text-white/40 transition hover:border-white/25 hover:text-white/60"
          >
            + Add another qualification
          </button>
        </div>
      </SectionCard>

      {/* Sticky save bar */}
      <div className="fixed bottom-4 left-0 right-0 z-20 flex justify-center px-4">
        <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-black/60 px-6 py-3 shadow-2xl backdrop-blur-xl">
          <a
            href={`/dashboard/cvs/${cv.id}`}
            className="text-sm text-white/50 transition hover:text-white/80"
          >
            Cancel
          </a>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save CV"}
          </button>
          <a
            href={`/cv/${cv.id}/print`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10"
          >
            PDF ↗
          </a>
        </div>
      </div>
    </form>
  )
}
