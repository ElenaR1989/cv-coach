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

export default async function CVsPage() {
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

      <div>
        <h1 className="text-3xl font-bold">Your CVs</h1>
        <p className="text-muted-foreground">
          Manage and preview your CV versions
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
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}