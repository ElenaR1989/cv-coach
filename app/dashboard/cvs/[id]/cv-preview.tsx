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

function getThemeClasses(theme: string) {
  switch (theme) {
    case "blue":
      return {
        accentText: "text-blue-700",
        accentBg: "bg-blue-50",
        accentBorder: "border-blue-200",
        mutedHeading: "text-blue-800",
      }
    case "emerald":
      return {
        accentText: "text-emerald-700",
        accentBg: "bg-emerald-50",
        accentBorder: "border-emerald-200",
        mutedHeading: "text-emerald-800",
      }
    case "burgundy":
      return {
        accentText: "text-red-800",
        accentBg: "bg-red-50",
        accentBorder: "border-red-200",
        mutedHeading: "text-red-900",
      }
    default:
      return {
        accentText: "text-gray-900",
        accentBg: "bg-gray-50",
        accentBorder: "border-gray-200",
        mutedHeading: "text-gray-700",
      }
  }
}

export default function CVPreview({
  cv,
  applicationId = "",
  application = null,
  isPrint = false,
  template = "classic",
  theme = "default",
}: Props) {
  const skills =
    typeof cv.skills === "string"
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

  const experience = parseExperience(cv.experience)
  const educationEntries = parseEducation(cv.education_entries)
  const themeClasses = getThemeClasses(theme)

  if (template === "sidebar") {
    return (
      <div className="min-h-screen bg-background px-4 py-8 md:px-8">
        {!isPrint && (
          <div className="mx-auto mb-6 w-full max-w-5xl">
            <CVPreviewActions cvId={cv.id} template={template} theme={theme} />
          </div>
        )}

        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow md:grid-cols-[280px_1fr] print:max-w-none print:rounded-none print:shadow-none">
          <aside className={`p-8 ${themeClasses.accentBg} border-r ${themeClasses.accentBorder}`}>
            <h1 className={`text-4xl font-bold tracking-tight ${themeClasses.accentText}`}>
              {cv.full_name || cv.title || "Untitled CV"}
            </h1>

            <p className="mt-2 text-lg text-gray-600">
              {cv.title || "Professional Profile"}
            </p>

            {contactItems.length > 0 && (
              <section className="mt-10">
                <h2 className={`text-xl font-semibold uppercase tracking-wide ${themeClasses.mutedHeading}`}>
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
              <section className="mt-10">
                <h2 className={`text-xl font-semibold uppercase tracking-wide ${themeClasses.mutedHeading}`}>
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

          <main className="p-8">
            {cv.summary && (
              <section className="mb-8">
                <h2 className={`text-2xl font-semibold ${themeClasses.accentText}`}>Profile</h2>
                <p className="mt-4 whitespace-pre-line leading-8 text-gray-700">
                  {cv.summary}
                </p>
              </section>
            )}

            {(cv.education || educationEntries.length > 0) && (
              <section className="mb-8">
                <h2 className={`text-2xl font-semibold ${themeClasses.accentText}`}>Education</h2>

                {cv.education && (
                  <p className="mt-4 whitespace-pre-line leading-8 text-gray-700">
                    {cv.education}
                  </p>
                )}

                {educationEntries.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {educationEntries.map((item, index) => (
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

            {experience.length > 0 && (
              <section>
                <h2 className={`text-2xl font-semibold ${themeClasses.accentText}`}>Experience</h2>
                <div className="mt-4 space-y-6">
                  {experience.map((item, index) => (
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
              <section className="mt-8">
                <div className={`rounded-lg border px-4 py-3 text-sm ${themeClasses.accentBg} ${themeClasses.accentBorder} ${themeClasses.accentText}`}>
                  Tailored for {application.company} — {application.role}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    )
  }

  if (template === "minimal") {
    return (
      <div className="min-h-screen bg-background px-4 py-8 md:px-8">
        {!isPrint && (
          <div className="mx-auto mb-6 w-full max-w-4xl">
            <CVPreviewActions cvId={cv.id} template={template} theme={theme} />
          </div>
        )}

        <div className="mx-auto w-full max-w-4xl bg-white p-10 shadow print:max-w-none print:shadow-none">
          <header className="pb-8">
            <h1 className={`text-5xl font-light tracking-tight ${themeClasses.accentText}`}>
              {cv.full_name || cv.title || "Untitled CV"}
            </h1>
            <p className="mt-3 text-xl text-gray-500">
              {cv.title || "Professional Profile"}
            </p>
          </header>

          {contactItems.length > 0 && (
            <section className="border-t border-b border-gray-200 py-4 text-sm text-gray-600">
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {contactItems.map((item, index) => (
                  <span key={index}>{item}</span>
                ))}
              </div>
            </section>
          )}

          <main className="mt-8 space-y-10">
            {cv.summary && (
              <section>
                <h2 className={`text-lg font-semibold uppercase tracking-[0.2em] ${themeClasses.accentText}`}>
                  Profile
                </h2>
                <p className="mt-4 whitespace-pre-line leading-8 text-gray-700">
                  {cv.summary}
                </p>
              </section>
            )}

            {skills.length > 0 && (
              <section>
                <h2 className={`text-lg font-semibold uppercase tracking-[0.2em] ${themeClasses.accentText}`}>
                  Skills
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className={`rounded-full border px-3 py-1 text-sm ${themeClasses.accentBg} ${themeClasses.accentBorder} text-gray-700`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {(cv.education || educationEntries.length > 0) && (
              <section>
                <h2 className={`text-lg font-semibold uppercase tracking-[0.2em] ${themeClasses.accentText}`}>
                  Education
                </h2>

                {cv.education && (
                  <p className="mt-4 whitespace-pre-line leading-8 text-gray-700">
                    {cv.education}
                  </p>
                )}

                {educationEntries.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {educationEntries.map((item, index) => (
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

            {experience.length > 0 && (
              <section>
                <h2 className={`text-lg font-semibold uppercase tracking-[0.2em] ${themeClasses.accentText}`}>
                  Experience
                </h2>
                <div className="mt-4 space-y-6">
                  {experience.map((item, index) => (
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
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8">
      {!isPrint && (
        <div className="mx-auto mb-6 w-full max-w-5xl">
          <CVPreviewActions cvId={cv.id} template={template} theme={theme} />
        </div>
      )}

      <div className="mx-auto w-full max-w-5xl rounded-2xl bg-white p-8 shadow print:shadow-none print:rounded-none print:max-w-none print:w-full print:p-8">
        <header className="border-b border-gray-200 pb-8">
          <h1 className={`text-4xl font-bold tracking-tight md:text-5xl ${themeClasses.accentText}`}>
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
                <h2 className={`text-2xl font-semibold uppercase tracking-wide ${themeClasses.mutedHeading}`}>
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
                <h2 className={`text-2xl font-semibold uppercase tracking-wide ${themeClasses.mutedHeading}`}>
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
                <h2 className={`text-2xl font-semibold ${themeClasses.accentText}`}>Profile</h2>
                <p className="mt-4 whitespace-pre-line leading-8 text-gray-700">
                  {cv.summary}
                </p>
              </section>
            )}

            {(cv.education || educationEntries.length > 0) && (
              <section>
                <h2 className={`text-2xl font-semibold ${themeClasses.accentText}`}>Education</h2>

                {cv.education && (
                  <p className="mt-4 whitespace-pre-line leading-8 text-gray-700">
                    {cv.education}
                  </p>
                )}

                {educationEntries.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {educationEntries.map((item, index) => (
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

            {experience.length > 0 && (
              <section>
                <h2 className={`text-2xl font-semibold ${themeClasses.accentText}`}>Experience</h2>
                <div className="mt-4 space-y-6">
                  {experience.map((item, index) => (
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
                <div className={`rounded-lg border px-4 py-3 text-sm ${themeClasses.accentBg} ${themeClasses.accentBorder} ${themeClasses.accentText}`}>
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