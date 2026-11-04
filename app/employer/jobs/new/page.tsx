"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import BrandLogo from "@/components/brand-logo"

export default function NewJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [jobType, setJobType] = useState("full-time")
  const [salaryMin, setSalaryMin] = useState("")
  const [salaryMax, setSalaryMax] = useState("")
  const [applyUrl, setApplyUrl] = useState("")
  const [requirements, setRequirements] = useState("")

  const handleGenerate = async () => {
    if (!title) { setError("Please enter a job title first."); return }
    setGenerating(true)
    setError("")
    const res = await fetch("/api/employer/generate-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, location, job_type: jobType, requirements }),
    })
    const data = await res.json()
    setGenerating(false)
    if (res.ok) setDescription(data.description)
    else setError(data.error ?? "Failed to generate description")
  }

  const handleSubmit = async () => {
    if (!title || !description || !location) { setError("Title, description and location are required."); return }
    setLoading(true)
    setError("")
    const res = await fetch("/api/employer/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, description, location, job_type: jobType,
        salary_min: salaryMin ? parseInt(salaryMin) : null,
        salary_max: salaryMax ? parseInt(salaryMax) : null,
        apply_url: applyUrl || null,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) router.push("/employer/dashboard")
    else setError(data.error ?? "Failed to post job")
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <BrandLogo textClassName="font-semibold text-sm" />
          <Link href="/employer/dashboard" className="text-sm text-white/40 hover:text-white transition">← Dashboard</Link>
        </div>

        <h1 className="text-2xl font-bold mb-1">Post a new job</h1>
        <p className="text-sm text-white/40 mb-8">Your job will be visible to thousands of active job seekers on HireFlow.</p>

        <div className="space-y-5">
          {/* Job title */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/40">Job title *</label>
            <input type="text" placeholder="e.g. Customer Service Advisor" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50 transition" />
          </div>

          {/* Location + type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/40">Location *</label>
              <input type="text" placeholder="e.g. Peterborough / Remote" value={location} onChange={e => setLocation(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50 transition" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/40">Job type</label>
              <select value={jobType} onChange={e => setJobType(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#050816] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50 transition">
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="apprenticeship">Apprenticeship</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>
          </div>

          {/* Salary */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/40">Salary from (£/year)</label>
              <input type="number" placeholder="e.g. 22000" value={salaryMin} onChange={e => setSalaryMin(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50 transition" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/40">Salary to (£/year)</label>
              <input type="number" placeholder="e.g. 28000" value={salaryMax} onChange={e => setSalaryMax(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50 transition" />
            </div>
          </div>

          {/* AI description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-white/40">Job description *</label>
              <div className="flex items-center gap-3">
                <input type="text" placeholder="Key requirements (optional)" value={requirements} onChange={e => setRequirements(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-cyan-400/50 transition w-48" />
                <button onClick={handleGenerate} disabled={generating || !title}
                  className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-40">
                  {generating ? (
                    <><span className="h-3 w-3 animate-spin rounded-full border border-cyan-300/30 border-t-cyan-300" />Generating…</>
                  ) : (
                    <>✨ AI Generate</>
                  )}
                </button>
              </div>
            </div>
            <textarea placeholder="Describe the role, responsibilities and requirements…" value={description} onChange={e => setDescription(e.target.value)}
              rows={10}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50 transition resize-none" />
          </div>

          {/* Apply URL */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/40">External apply link (optional)</label>
            <input type="url" placeholder="https://your-website.com/apply — leave blank to receive applications on HireFlow" value={applyUrl} onChange={e => setApplyUrl(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50 transition" />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button onClick={handleSubmit} disabled={loading}
            style={{ backgroundColor: "#06b6d4", color: "#000" }}
            className="w-full rounded-xl py-4 text-sm font-bold transition hover:opacity-90 disabled:opacity-50">
            {loading ? "Posting job…" : "Post job →"}
          </button>
        </div>
      </div>
    </div>
  )
}
