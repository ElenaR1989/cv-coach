import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import BrandLogo from "@/components/brand-logo"
import { notFound } from "next/navigation"

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: job } = await supabase
    .from("job_postings")
    .select("*, employers(company_name, location, website, company_description)")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (!job) notFound()

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null
    if (min && max) return `£${min.toLocaleString()} – £${max.toLocaleString()} per year`
    if (min) return `From £${min.toLocaleString()} per year`
    return `Up to £${max!.toLocaleString()} per year`
  }

  const jobTypeLabel: Record<string, string> = {
    "full-time": "Full-time", "part-time": "Part-time",
    "contract": "Contract", "apprenticeship": "Apprenticeship", "volunteer": "Volunteer",
  }

  const salary = formatSalary(job.salary_min, job.salary_max)

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <Link href="/jobs"><BrandLogo textClassName="font-semibold text-sm" /></Link>
          <Link href="/jobs" className="text-sm text-white/40 hover:text-white transition">← All jobs</Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/4 p-8">
          <h1 className="text-2xl font-bold mb-1">{job.title}</h1>
          <p className="text-cyan-400 font-medium mb-4">{job.employers?.company_name}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/50">{job.location}</span>
            <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/50">{jobTypeLabel[job.job_type] ?? job.job_type}</span>
            {salary && <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">{salary}</span>}
          </div>

          <div className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40 mb-3">About the role</h2>
            <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{job.description}</p>
          </div>

          {job.employers?.company_description && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40 mb-3">About {job.employers.company_name}</h2>
              <p className="text-sm text-white/70">{job.employers.company_description}</p>
            </div>
          )}

          <div className="border-t border-white/10 pt-6">
            {job.apply_url ? (
              <a href={job.apply_url} target="_blank" rel="noreferrer noopener"
                style={{ backgroundColor: "#06b6d4", color: "#000" }}
                className="block w-full rounded-xl py-4 text-center text-sm font-bold transition hover:opacity-90">
                Apply now →
              </a>
            ) : user ? (
              <Link href="/dashboard"
                style={{ backgroundColor: "#06b6d4", color: "#000" }}
                className="block w-full rounded-xl py-4 text-center text-sm font-bold transition hover:opacity-90">
                Apply with HireFlow →
              </Link>
            ) : (
              <Link href="/signup"
                style={{ backgroundColor: "#06b6d4", color: "#000" }}
                className="block w-full rounded-xl py-4 text-center text-sm font-bold transition hover:opacity-90">
                Sign up to apply →
              </Link>
            )}
            <p className="mt-3 text-center text-xs text-white/25">
              Posted {new Date(job.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
