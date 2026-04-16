"use client"

import Link from "next/link"

type ExperienceItem = {
  title: string
  company: string
  dates: string
  description: string
}

type EducationItem = {
  school: string
  qualification: string
  dates: string
  description: string
}

type CV = {
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
  education: string | null
  experience: ExperienceItem[] | null
  education_entries: EducationItem[] | null
}

type Props = {
  cv: CV
  applicationId?: string
  application?: {
    id?: string
    company?: string | null
    role?: string | null
    tailored_cv?: string | null
  } | null
  isPrint?: boolean
}

export default function CVPreview({ cv, applicationId, application, isPrint = false }: Props) {
  const contactItems = [
    cv.email,
    cv.phone,
    cv.location,
    cv.website,
    cv.linkedin,
    cv.github,
  ].filter(Boolean)

  const skills = cv.skills
    ? cv.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : []

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .print-page {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .print-card {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 48px 40px !important;
          }
        }
      `}</style>
      
      <div className="print-page min-h-screen bg-background px-4 py-8 md:px-8">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          {!isPrint && (
          <div className="no-print flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/dashboard/cvs"
              className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
            >
              Back to CVs
            </Link>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
              >
                Export PDF
              </button>

              <Link
                href={`/dashboard/cvs/${cv.id}/edit`}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
              >
                Edit CV
              </Link>

              <Link
                href="/dashboard"
                className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
              >
                Dashboard
              </Link>
              

              <Link
               href={`/cv/${cv.id}/print`}
                target="_blank"
                className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
              >
                Download PDF
              </Link>
            </div>
          </div>
          )}

          <div className="print-card mx-auto w-full max-w-4xl rounded-2xl bg-white p-10 pt-16 text-black shadow-2xl md:p-12 md:pt-20">
            {application?.company && application?.role ? (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                Tailored for {application.company} — {application.role}
              </div>
            ) : null}

            <header className="border-b border-gray-200 pb-8">
              <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                {cv.full_name || cv.title}
              </h1>

              <p className="mt-2 text-lg text-gray-500">Professional Profile</p>
            </header>

            <main className="mt-10 grid gap-10 md:grid-cols-3">
              <aside className="space-y-8 md:col-span-1">
                {contactItems.length > 0 && (
                  <section>
                    <h2 className="mb-3 text-lg font-semibold uppercase tracking-wide text-gray-500">
                      Contact
                    </h2>
                    <div className="space-y-1 text-sm text-gray-700">
                      {cv.email && <div>{cv.email}</div>}
                      {cv.phone && <div>{cv.phone}</div>}
                      {cv.location && <div>{cv.location}</div>}
                      {cv.website && <div>{cv.website}</div>}
                      {cv.linkedin && <div>{cv.linkedin}</div>}
                      {cv.github && <div>{cv.github}</div>}
                    </div>
                  </section>
                )}

                {skills.length > 0 && (
                  <section>
                    <h2 className="mb-3 text-lg font-semibold uppercase tracking-wide text-gray-500">
                      Skills
                    </h2>
                    <div className="space-y-1 text-sm text-gray-700">
                      {skills.map((skill, index) => (
                        <div key={index}>• {skill}</div>
                      ))}
                    </div>
                  </section>
                )}
              </aside>

              <section className="space-y-8 md:col-span-2">
                {cv.summary && (
                  <section>
                    <h2 className="mb-3 text-xl font-semibold">Profile</h2>
                    <p className="whitespace-pre-line leading-7 text-gray-700">
                      {cv.summary}
                    </p>
                  </section>
                )}

                {Array.isArray(cv.experience) && cv.experience.length > 0 && (
                  <section>
                    <h2 className="mb-4 text-xl font-semibold">Experience</h2>

                    <div className="space-y-6">
                      {cv.experience.map((job, index) => (
                        <div
                          key={index}
                          className="border-b border-gray-200 pb-6"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              {job.title && (
                                <h3 className="text-lg font-semibold capitalize text-gray-900">
                                  {job.title}
                                </h3>
                              )}

                              {job.company && (
                                <p className="text-sm text-gray-600">
                                  {job.company}
                                </p>
                              )}
                            </div>

                            {job.dates && (
                              <p className="whitespace-nowrap text-sm text-gray-500">
                                {job.dates}
                              </p>
                            )}
                          </div>

                          {job.description && (
                            <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-700">
                              {job.description
                                .split("\n")
                                .filter(Boolean)
                                .map((line, i) => (
                                  <li key={i}>{line}</li>
                                ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {Array.isArray(cv.education_entries) &&
                  cv.education_entries.length > 0 && (
                    <section>
                      <h2 className="mb-4 text-xl font-semibold">Education</h2>

                      <div className="space-y-6">
                        {cv.education_entries.map((item, index) => (
                          <div
                            key={index}
                            className="border-b border-gray-200 pb-6"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                {item.qualification && (
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {item.qualification}
                                  </h3>
                                )}

                                {item.school && (
                                  <p className="text-sm text-gray-600">
                                    {item.school}
                                  </p>
                                )}
                              </div>

                              {item.dates && (
                                <p className="whitespace-nowrap text-sm text-gray-500">
                                  {item.dates}
                                </p>
                              )}
                            </div>

                            {item.description && (
                              <div className="mt-3 whitespace-pre-line text-gray-700">
                                {item.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                {!cv.education_entries?.length && cv.education && (
                  <section>
                    <h2 className="mb-3 text-xl font-semibold">Education</h2>
                    <div className="whitespace-pre-line leading-7 text-gray-700">
                      {cv.education}
                    </div>
                  </section>
                )}
              </section>
            </main>
          </div>
        </div>
      </div>
    </>
  )
}