import CVPreviewActions from "./CVPreviewActions"

type ExperienceItem = {
  company?: string | null
  role?: string | null
  start_date?: string | null
  end_date?: string | null
  description?: string | null
}

type EducationItem = {
  school?: string | null
  degree?: string | null
  start_date?: string | null
  end_date?: string | null
}

type CV = {
  id: string
  full_name?: string | null
  title?: string | null
  summary?: string | null
  email?: string | null
  phone?: string | null
  location?: string | null
  website?: string | null
  linkedin?: string | null
  github?: string | null
  skills?: string | null
  education?: string | null
  experience?: ExperienceItem[] | string | null
  education_entries?: EducationItem[] | string | null
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
  template?: string
  theme?: string
}

function parseExperience(value: CV["experience"]): ExperienceItem[] {
  if (Array.isArray(value)) return value
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function parseEducation(value: CV["education_entries"]): EducationItem[] {
  if (Array.isArray(value)) return value
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export default function CVPreview({
  cv,
  applicationId = "",
  application = null,
  isPrint = false,
  template = "classic",
  theme = "default",
}: Props) {
  const skills = cv.skills
    ? cv.skills.split(",").map((skill) => skill.trim()).filter(Boolean)
    : []

  const contactItems = [
    cv.email,
    cv.phone,
    cv.location,
    cv.website,
    cv.linkedin,
    cv.github,
  ].filter(Boolean)

  const experienceItems = parseExperience(cv.experience)
  const educationItems = parseEducation(cv.education_entries)

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8">
      {!isPrint && (
        <div className="mx-auto mb-6 w-full max-w-5xl">
          <CVPreviewActions cvId={cv.id} template={template} theme={theme} />
        </div>
      )}

      <div className="mx-auto w-full max-w-5xl rounded-2xl bg-white p-8 shadow print:shadow-none print:rounded-none print:max-w-none print:w-full print:p-8">
        <header className="border-b border-gray-200 pb-8">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            {cv.full_name || cv.title || "Untitled CV"}
          </h1>

          <p className="mt-2 text-lg text-gray-500">
            {cv.title || "Professional Profile"}
          </p>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-3">
          <aside className="space-y-8">
            {contactItems.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold uppercase tracking-wide text-gray-700">
                  Contact
                </h2>
                <div className="mt-4 space-y-2 text-gray-700">
                  {contactItems.map((item, index) => (
                    <div key={index}>{item}</div>
                  ))}
                </div>
              </section>
            )}

            {skills.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold uppercase tracking-wide text-gray-700">
                  Skills
                </h2>
                <ul className="mt-4 list-disc space-y-1 pl-5 text-gray-700">
                  {skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </section>
            )}
          </aside>

          <main className="space-y-8 md:col-span-2">
            {cv.summary && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-900">Profile</h2>
                <p className="mt-4 whitespace-pre-line leading-8 text-gray-700">
                  {cv.summary}
                </p>
              </section>
            )}

            {(cv.education || educationItems.length > 0) && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-900">Education</h2>

                {cv.education && (
                  <p className="mt-4 whitespace-pre-line leading-8 text-gray-700">
                    {cv.education}
                  </p>
                )}

                {educationItems.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {educationItems.map((item, index) => (
                      <div key={index}>
                        <div className="font-medium text-gray-900">
                          {item.degree || "Education"}
                          {item.school ? ` — ${item.school}` : ""}
                        </div>
                        <div className="text-sm text-gray-500">
                          {[item.start_date, item.end_date].filter(Boolean).join(" - ")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {experienceItems.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-900">Experience</h2>
                <div className="mt-4 space-y-6">
                  {experienceItems.map((item, index) => (
                    <div key={index}>
                      <div className="font-medium text-gray-900">
                        {item.role || "Role"}
                        {item.company ? ` — ${item.company}` : ""}
                      </div>
                      <div className="text-sm text-gray-500">
                        {[item.start_date, item.end_date].filter(Boolean).join(" - ")}
                      </div>
                      {item.description && (
                        <p className="mt-2 whitespace-pre-line leading-8 text-gray-700">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {application?.company && application?.role && (
              <section>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  Tailored for {application.company} — {application.role}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}