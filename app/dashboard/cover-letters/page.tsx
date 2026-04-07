import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

type CoverLettersPageProps = {
  searchParams: Promise<{
    cvId?: string
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
  cv_id: string | null
}

export default async function CoverLettersPage({
  searchParams,
}: CoverLettersPageProps) {
  const { cvId, applicationId } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: cvs, error: cvsError } = await supabase
    .from("cv_profiles")
    .select("id, title, summary, full_name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (cvsError) {
    throw new Error(cvsError.message)
  }

  const cvList = (cvs ?? []) as CVProfile[]

  let selectedCv =
    cvList.find((cv) => cv.id === cvId) ??
    cvList[0] ??
    null

  let selectedApplication: JobApplication | null = null

  if (applicationId) {
    const { data: application } = await supabase
      .from("job_applications")
      .select("id, company, role, cv_id")
      .eq("id", applicationId)
      .eq("user_id", user.id)
      .single()

    if (application) {
      selectedApplication = application as JobApplication

      if (application.cv_id) {
        const matchedCv =
          cvList.find((cv) => cv.id === application.cv_id) ?? null

        if (matchedCv) {
          selectedCv = matchedCv
        }
      }
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold">Cover Letters</h1>
          <p className="mt-2 text-sm text-white/60">
            Choose a CV, then generate and save tailored cover letters for linked applications.
          </p>
        </div>

        {selectedCv ? (
          <Link
            href={`/dashboard/cvs/${selectedCv.id}`}
            className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
          >
            View selected CV
          </Link>
        ) : null}
      </div>

      {selectedApplication ? (
        <section className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6">
          <p className="text-sm text-cyan-300">Application selected</p>
          <h2 className="mt-2 text-2xl font-semibold">
            {selectedApplication.company} — {selectedApplication.role}
          </h2>
          <p className="mt-2 text-sm text-white/70">
            This application was preselected automatically.
          </p>
        </section>
      ) : null}

      <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">Choose CV</h2>
        <p className="mt-2 text-sm text-white/60">
          Start by selecting the CV you want to use for cover letter generation.
        </p>

        {cvList.length === 0 ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
            No CVs found yet. Create a CV first to use the cover letter tool.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cvList.map((cv) => {
              const isSelected = selectedCv?.id === cv.id
              const href = applicationId
                ? `/dashboard/cover-letters?cvId=${cv.id}&applicationId=${applicationId}`
                : `/dashboard/cover-letters?cvId=${cv.id}`

              return (
                <Link
                  key={cv.id}
                  href={href}
                  className={`rounded-2xl border p-4 transition ${
                    isSelected
                      ? "border-cyan-400/50 bg-cyan-500/10"
                      : "border-white/10 bg-black/20 hover:bg-white/5"
                  }`}
                >
                  <p className="text-lg font-semibold">{cv.title}</p>

                  {cv.full_name ? (
                    <p className="mt-1 text-sm text-white/60">{cv.full_name}</p>
                  ) : null}

                  <p className="mt-3 text-xs uppercase tracking-wide text-white/40">
                    {isSelected ? "Selected" : "Click to use this CV"}
                  </p>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {selectedCv ? (
        <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Open tool</h2>
            <p className="mt-2 text-sm text-white/60">
              Continue to the cover letter tool with this CV already selected.
            </p>
          </div>

          <Link
            href={
              applicationId
                ? `/dashboard/cvs/${selectedCv.id}/cover-letter?applicationId=${applicationId}`
                : `/dashboard/cvs/${selectedCv.id}/cover-letter`
            }
            className="inline-flex rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:opacity-90"
          >
            Open Cover Letter Tool
          </Link>
        </section>
      ) : null}
    </div>
  )
}