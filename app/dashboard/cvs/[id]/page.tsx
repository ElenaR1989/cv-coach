import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

type CVPageProps = {
  params: Promise<{
    id: string
  }>
}

type CVProfile = {
  id: string
  title: string
  full_name: string | null
  summary: string | null
  email: string | null
  phone: string | null
  location: string | null
  website: string | null
  linkedin: string | null
  github: string | null
  skills: string | null
  created_at?: string | null
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return null

  const date =
    dateString.length === 10
      ? new Date(`${dateString}T00:00:00`)
      : new Date(dateString)

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function splitSkills(skills: string | null) {
  if (!skills) return []

  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
}

export default async function CVDetailsPage({ params }: CVPageProps) {
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
    .select(
      `
      id,
      title,
      full_name,
      summary,
      email,
      phone,
      location,
      website,
      linkedin,
      github,
      skills,
      created_at
    `
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !cv) {
    notFound()
  }

  const skills = splitSkills(cv.skills)

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex justify-end">
        <Link
          href="/dashboard/cvs"
          className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
        >
          ← Back to CVs
        </Link>
      </div>

      <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div>
              <h1 className="text-4xl font-bold">{cv.title}</h1>
              {cv.full_name ? (
                <p className="mt-2 text-lg text-white/80">{cv.full_name}</p>
              ) : null}
              {formatDate(cv.created_at) ? (
                <p className="mt-2 text-sm text-white/60">
                  Saved on {formatDate(cv.created_at)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/dashboard/cvs/${cv.id}/edit`}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
            >
              Edit CV
            </Link>

            <Link
              href={`/dashboard/cvs/${cv.id}/cover-letter`}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
            >
              Cover Letter Tool
            </Link>

            <Link
              href={`/dashboard/cvs/${cv.id}/tailor`}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
            >
              Auto-improve CV
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-6">
            <section className="rounded-xl border border-white/10 bg-black/20 p-4">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-white/60">
                Contact
              </h2>

              <div className="space-y-3 text-sm text-white/85">
                {cv.email ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      Email
                    </p>
                    <p className="mt-1 break-all">{cv.email}</p>
                  </div>
                ) : null}

                {cv.phone ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      Phone
                    </p>
                    <p className="mt-1">{cv.phone}</p>
                  </div>
                ) : null}

                {cv.location ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      Location
                    </p>
                    <p className="mt-1">{cv.location}</p>
                  </div>
                ) : null}

                {cv.website ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      Website
                    </p>
                    <a
                      href={cv.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block break-all text-cyan-300 hover:underline"
                    >
                      {cv.website}
                    </a>
                  </div>
                ) : null}

                {cv.linkedin ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      LinkedIn
                    </p>
                    <a
                      href={cv.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block break-all text-cyan-300 hover:underline"
                    >
                      {cv.linkedin}
                    </a>
                  </div>
                ) : null}

                {cv.github ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      GitHub
                    </p>
                    <a
                      href={cv.github}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block break-all text-cyan-300 hover:underline"
                    >
                      {cv.github}
                    </a>
                  </div>
                ) : null}

                {!cv.email &&
                !cv.phone &&
                !cv.location &&
                !cv.website &&
                !cv.linkedin &&
                !cv.github ? (
                  <p className="text-white/60">No contact details saved yet.</p>
                ) : null}
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-black/20 p-4">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-white/60">
                Skills
              </h2>

              {skills.length > 0 ? (
                <div className="space-y-2 text-sm text-white/85">
                  {skills.map((skill) => (
                    <div key={skill}>• {skill}</div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/60">No skills saved yet.</p>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border border-white/10 bg-black/20 p-6">
              <h2 className="text-4xl font-bold">
                {cv.full_name || cv.title}
              </h2>

              {cv.summary ? (
                <p className="mt-4 whitespace-pre-wrap text-lg leading-8 text-white/85">
                  {cv.summary}
                </p>
              ) : (
                <p className="mt-4 text-white/60">No summary saved yet.</p>
              )}
            </section>

            <section className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-6">
              <h2 className="text-xl font-semibold text-cyan-300">
                CV Tools
              </h2>
              <p className="mt-2 text-sm text-white/80">
                Tailor this CV for a job description and improve your summary automatically.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/dashboard/cvs/${cv.id}/tailor`}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90"
                >
                  Auto-improve CV
                </Link>

                <Link
                  href={`/dashboard/cvs/${cv.id}/cover-letter`}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
                >
                  Open Cover Letter Tool
                </Link>

                <Link
                  href={`/dashboard/cvs/${cv.id}/edit`}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
                >
                  Edit CV
                </Link>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}