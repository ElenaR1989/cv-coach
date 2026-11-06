import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import BrandLogo from "@/components/brand-logo"

export const metadata = {
  title: "Jobs — HireFlow",
  description: "Browse jobs matched to your skills and career goals. Free to apply.",
}

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: jobs } = await supabase
    .from("job_postings")
    .select("*, employers(company_name, location, website)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null
    if (min && max) return `£${min.toLocaleString()} – £${max.toLocaleString()}`
    if (min) return `From £${min.toLocaleString()}`
    return `Up to £${max!.toLocaleString()}`
  }

  const jobTypeLabel: Record<string, string> = {
    "full-time": "Full-time",
    "part-time": "Part-time",
    "contract": "Contract",
    "apprenticeship": "Apprenticeship",
    "volunteer": "Volunteer",
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <Link href="/"><BrandLogo textClassName="font-semibold text-sm" /></Link>
          <Link href="/employer/signup" className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/60 transition hover:text-white">
            Post a job →
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Jobs board</h1>
          <p className="text-white/50">Jobs matched to real career paths. Free to apply.</p>
        </div>

        {!jobs || jobs.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/4 p-12 text-center">
            <p className="text-4xl mb-4">🔍</p>
            <h2 className="text-lg font-bold mb-2">No jobs posted yet</h2>
            <p className="text-sm text-white/40 mb-6">Be the first employer to reach our community of job seekers.</p>
            <Link href="/employer/signup"
              style={{ backgroundColor: "#06b6d4", color: "#000" }}
              className="inline-block rounded-xl px-6 py-3 text-sm font-bold transition hover:opacity-90">
              Post a job for free →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => {
              const salary = formatSalary(job.salary_min, job.salary_max)
              return (
                <div key={job.id} className="rounded-2xl border border-white/10 bg-white/4 p-5 hover:border-white/20 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Link href={`/jobs/${job.id}`}><h2 className="text-lg font-bold text-white hover:text-cyan-300 transition">{job.title}</h2></Link>
                      <p className="text-sm text-cyan-400 font-medium mt-0.5">{job.employers?.company_name}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/50">{job.location}</span>
                        <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/50">{jobTypeLabel[job.job_type] ?? job.job_type}</span>
                        {salary && <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">{salary}</span>}
                      </div>
                      <p className="mt-3 text-sm text-white/50 line-clamp-3">{job.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-white/25">
                      Posted {new Date(job.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    {job.apply_url ? (
                      <a href={job.apply_url} target="_blank" rel="noreferrer noopener"
                        style={{ backgroundColor: "#06b6d4", color: "#000" }}
                        className="rounded-xl px-5 py-2 text-sm font-bold transition hover:opacity-90">
                        Apply now →
                      </a>
                    ) : (
                      <Link href={user ? `/dashboard` : `/signup`}
                        style={{ backgroundColor: "#06b6d4", color: "#000" }}
                        className="rounded-xl px-5 py-2 text-sm font-bold transition hover:opacity-90">
                        {user ? "Apply with HireFlow →" : "Sign up to apply →"}
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <p className="text-sm text-white/30">Not sure what job is right for you?</p>
          <Link href="/career-quiz" className="text-sm text-cyan-400 hover:underline">Take the free career quiz →</Link>
        </div>
      </div>
    </div>
  )
}
