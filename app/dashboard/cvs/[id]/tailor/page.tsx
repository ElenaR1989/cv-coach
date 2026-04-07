import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CVTailorTool from "@/components/cv-tailor-tool"

type TailorPageProps = {
  params: Promise<{
    id: string
  }>
}

type CVProfile = {
  id: string
  title: string
  full_name: string | null
  summary: string | null
}

export default async function TailorCVPage({ params }: TailorPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: cv, error } = await supabase
    .from("cv_profiles")
    .select("id, title, full_name, summary")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !cv) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex justify-end">
        <Link
          href={`/dashboard/cvs/${cv.id}`}
          className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
        >
          ← Back to CV
        </Link>
      </div>

      <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
        <h1 className="text-3xl font-bold">Auto-improve CV</h1>
        <p className="mt-2 text-sm text-white/60">
          Compare your CV against a job description and generate a stronger summary.
        </p>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-white/70">Selected CV</p>
          <p className="mt-1 text-lg font-semibold">{cv.title}</p>
          {cv.full_name ? (
            <p className="text-sm text-white/60">{cv.full_name}</p>
          ) : null}
        </div>
      </section>

      <CVTailorTool
        cvId={cv.id}
        currentSummary={cv.summary ?? ""}
        cvTitle={cv.title}
      />
    </div>
  )
}