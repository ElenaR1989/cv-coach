import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CoverLetterTool from "@/components/cover-letter-tool"

type CoverLetterPageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    applicationId?: string
  }>
}

type CVProfile = {
  id: string
  title: string
  summary: string | null
  full_name: string | null
}

type JobApplication = {
  id: string
  company: string
  role: string
  job_description: string | null
  cover_letter: string | null
}

export default async function CoverLetterPage({
  params,
  searchParams,
}: CoverLetterPageProps) {
  const { id } = await params
  const { applicationId } = await searchParams

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: cv, error: cvError } = await supabase
    .from("cv_profiles")
    .select("id, title, summary, full_name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (cvError || !cv) {
    notFound()
  }

  const { data: applications, error: applicationsError } = await supabase
    .from("job_applications")
    .select("id, company, role, job_description, cover_letter")
    .eq("user_id", user.id)
    .eq("cv_id", id)
    .order("created_at", { ascending: false })

  if (applicationsError) {
    notFound()
  }

  const jobApplications = (applications ?? []) as JobApplication[]

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold">Cover Letter Tool</h1>
          <p className="mt-2 text-sm text-white/60">
            Generate and save a tailored cover letter using this CV.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/cover-letters"
            className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
          >
            ← Back to Cover Letters
          </Link>

          <Link
            href={`/dashboard/cvs/${id}`}
            className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
          >
            View selected CV
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
        <p className="text-sm text-white/70">Selected CV</p>
        <h2 className="mt-2 text-3xl font-semibold">{cv.title}</h2>

        {cv.full_name ? (
          <p className="mt-2 text-white/60">{cv.full_name}</p>
        ) : null}
      </section>

      <CoverLetterTool
  cvTitle={cv.title}
  cvSummary={cv.summary ?? ""}
  applications={jobApplications}
/>
    </div>
  )
}
