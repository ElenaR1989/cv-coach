import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export type JobResult = {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  description: string
  url: string
  source: "Adzuna" | "Reed" | "Jooble" | "Remotive"
  postedAt?: string
}

async function fetchAdzuna(
  keywords: string,
  location: string
): Promise<JobResult[]> {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) return []

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: "20",
    what: keywords,
    where: location || "uk",
    content_type: "application/json",
  })

  try {
    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/gb/search/1?${params}`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.results ?? []).map((job: any) => ({
      id: `adzuna-${job.id}`,
      title: job.title,
      company: job.company?.display_name ?? "Unknown",
      location: job.location?.display_name ?? "",
      salary:
        job.salary_min && job.salary_max
          ? `£${Math.round(job.salary_min / 1000)}k–£${Math.round(job.salary_max / 1000)}k`
          : job.salary_min
            ? `From £${Math.round(job.salary_min / 1000)}k`
            : undefined,
      description: job.description ?? "",
      url: job.redirect_url,
      source: "Adzuna" as const,
      postedAt: job.created,
    }))
  } catch {
    return []
  }
}

async function fetchReed(
  keywords: string,
  location: string
): Promise<JobResult[]> {
  const apiKey = process.env.REED_API_KEY
  if (!apiKey) return []

  const params = new URLSearchParams({
    keywords,
    locationName: location || "United Kingdom",
    resultsToTake: "20",
  })

  try {
    const res = await fetch(
      `https://www.reed.co.uk/api/1.0/search?${params}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
        },
        next: { revalidate: 300 },
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.results ?? []).map((job: any) => ({
      id: `reed-${job.jobId}`,
      title: job.jobTitle,
      company: job.employerName ?? "Unknown",
      location: job.locationName ?? "",
      salary:
        job.minimumSalary > 0 && job.maximumSalary > 0
          ? `£${Math.round(job.minimumSalary / 1000)}k–£${Math.round(job.maximumSalary / 1000)}k`
          : job.minimumSalary > 0
            ? `From £${Math.round(job.minimumSalary / 1000)}k`
            : undefined,
      description: job.jobDescription ?? "",
      url: job.jobUrl,
      source: "Reed" as const,
      postedAt: job.date,
    }))
  } catch {
    return []
  }
}

async function fetchJooble(
  keywords: string,
  location: string
): Promise<JobResult[]> {
  const apiKey = process.env.JOOBLE_API_KEY
  if (!apiKey) return []

  try {
    const res = await fetch(`https://jooble.org/api/${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords, location: location || "United Kingdom" }),
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.jobs ?? []).slice(0, 20).map((job: any) => ({
      id: `jooble-${job.id}`,
      title: job.title,
      company: job.company ?? "Unknown",
      location: job.location ?? "",
      salary: job.salary || undefined,
      description: job.snippet ?? "",
      url: job.link,
      source: "Jooble" as const,
      postedAt: job.updated,
    }))
  } catch {
    return []
  }
}

async function fetchRemotive(keywords: string): Promise<JobResult[]> {
  try {
    const res = await fetch(
      `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(keywords)}&limit=20`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.jobs ?? []).map((job: any) => ({
      id: `remotive-${job.id}`,
      title: job.title,
      company: job.company_name ?? "Unknown",
      location: "Remote",
      salary: job.salary || undefined,
      description: job.description ?? "",
      url: job.url,
      source: "Remotive" as const,
      postedAt: job.publication_date,
    }))
  } catch {
    return []
  }
}

function deduplicateJobs(jobs: JobResult[]): JobResult[] {
  const seen = new Set<string>()
  return jobs.filter((job) => {
    const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function GET(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const keywords = searchParams.get("keywords") ?? ""
  const location = searchParams.get("location") ?? ""

  if (!keywords.trim()) {
    return NextResponse.json({ error: "Keywords required" }, { status: 400 })
  }

  const [adzuna, reed, jooble, remotive] = await Promise.allSettled([
    fetchAdzuna(keywords, location),
    fetchReed(keywords, location),
    fetchJooble(keywords, location),
    fetchRemotive(keywords),
  ])

  const allJobs = [
    ...(adzuna.status === "fulfilled" ? adzuna.value : []),
    ...(reed.status === "fulfilled" ? reed.value : []),
    ...(jooble.status === "fulfilled" ? jooble.value : []),
    ...(remotive.status === "fulfilled" ? remotive.value : []),
  ]

  const jobs = deduplicateJobs(allJobs)

  const sources = {
    Adzuna: adzuna.status === "fulfilled" ? adzuna.value.length : 0,
    Reed: reed.status === "fulfilled" ? reed.value.length : 0,
    Jooble: jooble.status === "fulfilled" ? jooble.value.length : 0,
    Remotive: remotive.status === "fulfilled" ? remotive.value.length : 0,
  }

  return NextResponse.json({ jobs, sources, total: jobs.length })
}
