import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { deleteCV, duplicateCV } from "./actions"
import DeleteCVButton from "@/components/delete-cv-button"

type CVProfile = {
  id: string
  title: string | null
  full_name: string | null
  created_at: string | null
}

function formatDate(dateString: string | null) {
  if (!dateString) return "No date"

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) return "No date"

  return date.toLocaleDateString("en-GB")
}

type CVsPageProps = {
  searchParams: Promise<{
    jobDescription?: string
    role?: string
    company?: string
  }>
}

export default async function CVsPage({ searchParams }: CVsPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: cvs, error } = await supabase
    .from("cv_profiles")
    .select("id, title, full_name, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const cvList = (cvs ?? []) as CVProfile[]
  const { jobDescription, role, company } = await searchParams
  const isAnalyseMode = !!jobDescription

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Back to Dashboard
        </Link>

        <Link
          href="/dashboard/cvs/new"
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          + New CV
        </Link>
      </div>

      {isAnalyseMode && (
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5">
          <p className="text-sm font-semibold text-cyan-300">
            Analysing against: {role ? `${role}${company ? ` at ${company}` : ""}` : "job description"}
          </p>
          <p className="mt-1 text-sm text-white/60">
            Pick a CV below to analyse it against this job.
          </p>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold">Your CVs</h1>
        <p className="text-muted-foreground">
          {isAnalyseMode ? "Select a CV to analyse against this job." : "Manage and preview your CV versions"}
        </p>
      </div>

      {cvList.length === 0 ? (
        <div className="rounded-2xl border p-6">
          <p className="text-sm text-muted-foreground">
            You do not have any CVs yet.
          </p>

          <div className="mt-4">
            <Link
              href="/dashboard/cvs/new"
              className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
            >
              Create your first CV
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {cvList.map((cv) => {
            const displayTitle = cv.title || cv.full_name || "Untitled CV"
            const analyseHref = isAnalyseMode
              ? `/dashboard/cvs/${cv.id}/tailor?jobDescription=${encodeURIComponent(jobDescription!)}`
              : null

            return (
              <div
                key={cv.id}
                className="flex items-center justify-between rounded-2xl border p-4"
              >
                <div>
                  <h2 className="font-semibold">{displayTitle}</h2>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(cv.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {isAnalyseMode ? (
                    <Link
                      href={analyseHref!}
                      className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-500/20"
                    >
                      Analyse this CV
                    </Link>
                  ) : (
                    <>
                      <Link
                        href={`/dashboard/cvs/${cv.id}`}
                        className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
                      >
                        Preview
                      </Link>

                      <Link
                        href={`/dashboard/cvs/${cv.id}/edit`}
                        className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
                      >
                        Edit
                      </Link>

                      <Link
                        href={`/dashboard/cvs/${cv.id}/cover-letter`}
                        className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
                      >
                        Cover Letter
                      </Link>

                      <form action={duplicateCV}>
                        <input type="hidden" name="cvId" value={cv.id} />
                        <button
                          type="submit"
                          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
                        >
                          Duplicate
                        </button>
                      </form>

                      <form action={deleteCV}>
                        <input type="hidden" name="cvId" value={cv.id} />
                        <DeleteCVButton title={displayTitle} />
                      </form>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}