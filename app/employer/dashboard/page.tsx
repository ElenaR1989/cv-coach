"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import BrandLogo from "@/components/brand-logo"

interface Job {
  id: string
  title: string
  location: string
  job_type: string
  salary_min: number | null
  salary_max: number | null
  is_active: boolean
  created_at: string
  job_applications: { count: number }[]
}

export default function EmployerDashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState("")

  useEffect(() => {
    fetch("/api/employer/jobs")
      .then(r => r.json())
      .then(d => {
        if (d.error) setApiError(d.error)
        setJobs(d.jobs ?? [])
        setLoading(false)
      })
  }, [])

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Salary not specified"
    if (min && max) return `£${min.toLocaleString()} – £${max.toLocaleString()}`
    if (min) return `From £${min.toLocaleString()}`
    return `Up to £${max!.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <BrandLogo textClassName="font-semibold text-sm" />
          <Link href="/employer/jobs/new"
            style={{ backgroundColor: "#06b6d4", color: "#000" }}
            className="rounded-xl px-5 py-2.5 text-sm font-bold transition hover:opacity-90">
            + Post a job
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-1">Employer Dashboard</h1>
        <p className="text-sm text-white/40 mb-8">Manage your job postings and view applicants.</p>

        {apiError && <p className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">Error: {apiError}</p>}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/4 p-12 text-center">
            <p className="text-4xl mb-4">📋</p>
            <h2 className="text-lg font-bold mb-2">No jobs posted yet</h2>
            <p className="text-sm text-white/40 mb-6">Post your first job and reach thousands of active job seekers.</p>
            <Link href="/employer/jobs/new"
              style={{ backgroundColor: "#06b6d4", color: "#000" }}
              className="inline-block rounded-xl px-6 py-3 text-sm font-bold transition hover:opacity-90">
              Post your first job →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="rounded-2xl border border-white/10 bg-white/4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">{job.title}</h2>
                    <p className="text-sm text-white/40 mt-0.5">{job.location} · {job.job_type} · {formatSalary(job.salary_min, job.salary_max)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${job.is_active ? "bg-green-500/15 text-green-400" : "bg-white/10 text-white/40"}`}>
                      {job.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <span>👥</span>
                    <span><strong className="text-white">0</strong> applicants</span>
                  </div>
                  <div className="text-sm text-white/30">
                    Posted {new Date(job.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">
          <h3 className="font-semibold text-cyan-300 mb-1">🚀 Coming soon: candidate match scores</h3>
          <p className="text-sm text-white/50">Soon you'll see how well each applicant matches your role — based on their skills, career goals and quiz results.</p>
        </div>
      </div>
    </div>
  )
}
