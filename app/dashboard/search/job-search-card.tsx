"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import type { JobResult } from "@/app/api/job-search/route"
import { setPrefillJob } from "@/lib/job-prefill-store"

type Props = {
  job: JobResult
  sourceColors: Record<string, string>
}

export default function JobSearchCard({ job, sourceColors }: Props) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)

  function handleAddToTracker() {
    setPrefillJob({
      company: job.company,
      role: job.title,
      source: job.source,
      job_url: job.url,
      job_description: job.description.replace(/<[^>]*>/g, " ").trim(),
    })
    router.push("/dashboard/jobs/new?prefill=1")
  }

  const plainDescription = job.description.replace(/<[^>]*>/g, " ").trim()
  const shortDescription =
    plainDescription.length > 200
      ? plainDescription.slice(0, 200) + "…"
      : plainDescription

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2 py-0.5 text-xs font-medium ${sourceColors[job.source] ?? "bg-white/10 text-white/60 border-white/20"}`}
            >
              {job.source}
            </span>
            {job.salary && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/50">
                {job.salary}
              </span>
            )}
          </div>

          <h3 className="mt-2 text-base font-semibold text-white">
            {job.title}
          </h3>
          <p className="mt-0.5 text-sm text-white/60">
            {job.company}
            {job.location && (
              <span className="text-white/35"> · {job.location}</span>
            )}
          </p>

          {job.description && (
            <div className="mt-3">
              <p className="text-sm leading-6 text-white/50">
                {expanded ? plainDescription : shortDescription}
              </p>
              {plainDescription.length > 200 && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-1 text-xs text-white/30 hover:text-white/60 transition"
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
          >
            View job ↗
          </a>

          <button
            onClick={handleAddToTracker}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
          >
            Add to tracker
          </button>

          <a
            href={`/dashboard/cvs?jobDescription=${encodeURIComponent(job.description.replace(/<[^>]*>/g, " ").trim())}&role=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}`}
            className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/20"
          >
            Analyse vs CV
          </a>
        </div>
      </div>

    </div>
  )
}
