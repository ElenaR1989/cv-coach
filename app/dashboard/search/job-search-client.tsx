"use client"

import { useState } from "react"
import type { JobResult } from "@/app/api/job-search/route"
import JobSearchCard from "./job-search-card"

const SOURCE_COLORS: Record<string, string> = {
  Adzuna: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Reed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Jooble: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Remotive: "bg-amber-500/20 text-amber-300 border-amber-500/30",
}

export default function JobSearchClient() {
  const [keywords, setKeywords] = useState("")
  const [location, setLocation] = useState("")
  const [jobs, setJobs] = useState<JobResult[]>([])
  const [sources, setSources] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!keywords.trim()) return

    setLoading(true)
    setError(null)
    setJobs([])
    setSources({})

    try {
      const params = new URLSearchParams({ keywords, location })
      const res = await fetch(`/api/job-search?${params}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Search failed. Please try again.")
        return
      }

      setJobs(data.jobs)
      setSources(data.sources)
      setSearched(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const totalConfigured = Object.values(sources).filter(Boolean).length
  const activeSourceNames = Object.entries(sources)
    .filter(([, count]) => count > 0)
    .map(([name]) => name)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Search Jobs</h1>
        <p className="mt-1 text-sm text-white/50">
          Search across Adzuna, Reed, Jooble, and Remotive in one place.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="mb-8 flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="text"
          placeholder="Job title, skills, keywords…"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 focus:bg-white/8"
          required
        />
        <input
          type="text"
          placeholder="Location (e.g. London)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 focus:bg-white/8 sm:w-52"
        />
        <button
          type="submit"
          disabled={loading || !keywords.trim()}
          className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-40"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-4 py-20 text-white/40">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
          <p className="text-sm">Searching across job boards…</p>
        </div>
      )}

      {!loading && searched && (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="text-sm text-white/50">
              {jobs.length} results
              {activeSourceNames.length > 0 && (
                <> from {activeSourceNames.join(", ")}</>
              )}
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(sources).map(([name, count]) => (
                <span
                  key={name}
                  className={`rounded-full border px-2 py-0.5 text-xs font-medium ${SOURCE_COLORS[name] ?? "bg-white/10 text-white/60 border-white/20"}`}
                >
                  {name}: {count}
                </span>
              ))}
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-16 text-center text-sm text-white/40">
              No results found. Try different keywords or a broader location.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {jobs.map((job) => (
                <JobSearchCard key={job.id} job={job} sourceColors={SOURCE_COLORS} />
              ))}
            </div>
          )}
        </>
      )}

      {!loading && !searched && (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-16 text-center text-sm text-white/40">
          Enter keywords above to search across multiple job boards at once.
        </div>
      )}
    </div>
  )
}
