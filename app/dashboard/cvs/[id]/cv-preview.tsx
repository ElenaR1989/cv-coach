import CVPreviewActions from "./CVPreviewActions"

type ExperienceItem = {
  // editor schema
  title?: string | null
  company?: string | null
  dates?: string | null
  description?: string | null
  // legacy schema
  role?: string | null
  start_date?: string | null
  end_date?: string | null
}

type EducationItem = {
  // editor schema
  school?: string | null
  qualification?: string | null
  dates?: string | null
  description?: string | null
  // legacy schema
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
    } catch { return [] }
  }
  return []
}

function parseEducation(value: CV["education_entries"]): EducationItem[] {
  if (Array.isArray(value)) return value
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch { return [] }
  }
  return []
}

// normalise experience to always use title/dates
function normaliseExp(item: ExperienceItem) {
  return {
    title: item.title || item.role || "",
    company: item.company || "",
    dates: item.dates || [item.start_date, item.end_date].filter(Boolean).join(" – ") || "",
    description: item.description || "",
  }
}

// normalise education to always use qualification/dates
function normaliseEdu(item: EducationItem) {
  return {
    qualification: item.qualification || item.degree || "",
    school: item.school || "",
    dates: item.dates || [item.start_date, item.end_date].filter(Boolean).join(" – ") || "",
    description: item.description || "",
  }
}

type ThemeConfig = {
  accent: string
  accentLight: string
  accentBorder: string
  heading: string
  divider: string
  badge: string
}

function getTheme(theme: string): ThemeConfig {
  switch (theme) {
    case "blue":
      return {
        accent: "text-blue-700",
        accentLight: "bg-blue-50",
        accentBorder: "border-blue-200",
        heading: "text-blue-800",
        divider: "border-blue-100",
        badge: "bg-blue-50 text-blue-700 border-blue-200",
      }
    case "emerald":
      return {
        accent: "text-emerald-700",
        accentLight: "bg-emerald-50",
        accentBorder: "border-emerald-200",
        heading: "text-emerald-800",
        divider: "border-emerald-100",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      }
    case "burgundy":
      return {
        accent: "text-red-800",
        accentLight: "bg-red-50",
        accentBorder: "border-red-200",
        heading: "text-red-900",
        divider: "border-red-100",
        badge: "bg-red-50 text-red-800 border-red-200",
      }
    default:
      return {
        accent: "text-gray-900",
        accentLight: "bg-gray-50",
        accentBorder: "border-gray-200",
        heading: "text-gray-800",
        divider: "border-gray-200",
        badge: "bg-gray-100 text-gray-700 border-gray-200",
      }
  }
}

function SectionHeading({ label, t, style }: { label: string; t: ThemeConfig; style: "classic" | "modern" | "minimal" }) {
  if (style === "minimal") {
    return (
      <h2 className={`text-xs font-bold uppercase tracking-[0.18em] ${t.accent} mb-4`}>
        {label}
      </h2>
    )
  }
  if (style === "modern") {
    return (
      <div className="flex items-center gap-3 mb-5">
        <h2 className={`text-sm font-bold uppercase tracking-widest ${t.accent}`}>{label}</h2>
        <div className={`flex-1 h-px ${t.accentBorder} border-t`} />
      </div>
    )
  }
  // classic
  return (
    <div className={`border-b-2 ${t.accentBorder} pb-1 mb-5`}>
      <h2 className={`text-xl font-bold ${t.heading}`}>{label}</h2>
    </div>
  )
}

function DescriptionLines({ text }: { text: string }) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean)
  if (lines.length === 0) return null
  return (
    <ul className="mt-2 space-y-1">
      {lines.map((line, i) => (
        <li key={i} className="flex gap-2 text-gray-600 text-sm leading-6">
          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
          {line}
        </li>
      ))}
    </ul>
  )
}

export default function CVPreview({
  cv,
  applicationId = "",
  application = null,
  isPrint = false,
  template = "classic",
  theme = "default",
}: Props) {
  const t = getTheme(theme)
  const skills = typeof cv.skills === "string"
    ? cv.skills.split(",").map(s => s.trim()).filter(Boolean)
    : []
  const experience = parseExperience(cv.experience).map(normaliseExp)
  const educationEntries = parseEducation(cv.education_entries).map(normaliseEdu)
  const name = cv.full_name || "Your Name"

  const contacts = [
    { icon: "✉", value: cv.email },
    { icon: "📞", value: cv.phone },
    { icon: "📍", value: cv.location },
    { icon: "🌐", value: cv.website },
    { icon: "in", value: cv.linkedin },
    { icon: "gh", value: cv.github },
  ].filter(c => c.value)

  // ─── CLASSIC ──────────────────────────────────────────────────────────────
  if (template === "classic") {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-8 md:px-8">
        {!isPrint && (
          <div className="mx-auto mb-6 max-w-4xl">
            <CVPreviewActions cvId={cv.id} template={template} theme={theme} />
          </div>
        )}
        <div className="mx-auto max-w-4xl bg-white shadow-lg print:shadow-none print:max-w-none">
          {/* Header */}
          <header className={`${t.accentLight} px-10 py-8 border-b ${t.accentBorder}`}>
            <h1 className={`text-4xl font-bold tracking-tight ${t.accent}`}>{name}</h1>
            {contacts.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
                {contacts.map((c, i) => (
                  <span key={i}>{c.value}</span>
                ))}
              </div>
            )}
          </header>

          <div className="px-10 py-8 space-y-8">
            {/* Summary */}
            {cv.summary && (
              <section>
                <SectionHeading label="Profile" t={t} style="classic" />
                <p className="text-gray-700 leading-7 text-sm">{cv.summary}</p>
              </section>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <section>
                <SectionHeading label="Experience" t={t} style="classic" />
                <div className="space-y-6">
                  {experience.map((exp, i) => (
                    <div key={i}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">{exp.title}</p>
                          <p className="text-sm text-gray-600">{exp.company}</p>
                        </div>
                        {exp.dates && (
                          <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">{exp.dates}</span>
                        )}
                      </div>
                      {exp.description && <DescriptionLines text={exp.description} />}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {educationEntries.length > 0 && (
              <section>
                <SectionHeading label="Education" t={t} style="classic" />
                <div className="space-y-4">
                  {educationEntries.map((edu, i) => (
                    <div key={i}>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <p className="font-semibold text-gray-900">{edu.qualification}</p>
                        {edu.school && <span className="text-sm text-gray-500">· {edu.school}</span>}
                        {edu.dates && <span className="text-xs text-gray-400">· {edu.dates}</span>}
                      </div>
                      {edu.description && <p className="text-sm text-gray-500 mt-1">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <section>
                <SectionHeading label="Skills" t={t} style="classic" />
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <span key={skill} className={`rounded border px-2.5 py-1 text-xs font-medium ${t.badge}`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {application?.company && application?.role && (
              <p className={`text-xs ${t.accent} border-t ${t.divider} pt-4`}>
                Tailored for {application.company} — {application.role}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ─── MODERN (was Sidebar) ─────────────────────────────────────────────────
  if (template === "sidebar") {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-8 md:px-8">
        {!isPrint && (
          <div className="mx-auto mb-6 max-w-4xl">
            <CVPreviewActions cvId={cv.id} template={template} theme={theme} />
          </div>
        )}
        <div className="mx-auto max-w-4xl bg-white shadow-lg overflow-hidden print:shadow-none print:max-w-none">
          {/* Bold header bar */}
          <header className={`${t.accentLight} border-b-4 ${t.accentBorder} px-10 py-10`}>
            <h1 className={`text-5xl font-extrabold tracking-tight ${t.accent}`}>{name}</h1>
            {contacts.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-gray-600">
                {contacts.map((c, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="text-xs opacity-50">{c.icon}</span>
                    {c.value}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="grid grid-cols-[1fr_2fr] divide-x divide-gray-100">
            {/* Left column */}
            <aside className="p-8 space-y-8 bg-gray-50">
              {skills.length > 0 && (
                <section>
                  <SectionHeading label="Skills" t={t} style="modern" />
                  <ul className="space-y-2">
                    {skills.map(skill => (
                      <li key={skill} className="text-sm text-gray-700 flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${t.accent.replace("text-", "bg-")}`} />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {educationEntries.length > 0 && (
                <section>
                  <SectionHeading label="Education" t={t} style="modern" />
                  <div className="space-y-4">
                    {educationEntries.map((edu, i) => (
                      <div key={i}>
                        <p className="font-semibold text-gray-900 text-sm">{edu.qualification}</p>
                        <p className="text-xs text-gray-500">{edu.school}</p>
                        {edu.dates && <p className="text-xs text-gray-400 mt-0.5">{edu.dates}</p>}
                        {edu.description && <p className="text-xs text-gray-500 mt-1">{edu.description}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </aside>

            {/* Right column */}
            <main className="p-8 space-y-8">
              {cv.summary && (
                <section>
                  <SectionHeading label="Profile" t={t} style="modern" />
                  <p className="text-gray-700 leading-7 text-sm">{cv.summary}</p>
                </section>
              )}

              {experience.length > 0 && (
                <section>
                  <SectionHeading label="Experience" t={t} style="modern" />
                  <div className="space-y-6">
                    {experience.map((exp, i) => (
                      <div key={i}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900">{exp.title}</p>
                            <p className={`text-sm font-medium ${t.accent}`}>{exp.company}</p>
                          </div>
                          {exp.dates && (
                            <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5 bg-gray-100 px-2 py-0.5 rounded">{exp.dates}</span>
                          )}
                        </div>
                        {exp.description && <DescriptionLines text={exp.description} />}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {application?.company && application?.role && (
                <p className={`text-xs ${t.accent} border-t ${t.divider} pt-4`}>
                  Tailored for {application.company} — {application.role}
                </p>
              )}
            </main>
          </div>
        </div>
      </div>
    )
  }

  // ─── MINIMAL ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white px-4 py-8 md:px-8">
      {!isPrint && (
        <div className="mx-auto mb-6 max-w-3xl">
          <CVPreviewActions cvId={cv.id} template={template} theme={theme} />
        </div>
      )}
      <div className="mx-auto max-w-3xl print:max-w-none">
        {/* Header */}
        <header className="mb-10 border-b border-gray-200 pb-8">
          <h1 className={`text-5xl font-light tracking-tight ${t.accent}`}>{name}</h1>
          {contacts.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
              {contacts.map((c, i) => (
                <span key={i}>{c.value}</span>
              ))}
            </div>
          )}
        </header>

        <div className="space-y-10">
          {cv.summary && (
            <section>
              <SectionHeading label="Profile" t={t} style="minimal" />
              <p className="text-gray-600 leading-8 text-sm">{cv.summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <SectionHeading label="Experience" t={t} style="minimal" />
              <div className="space-y-7">
                {experience.map((exp, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto] gap-x-6">
                    <div>
                      <p className="font-semibold text-gray-900">{exp.title}</p>
                      <p className="text-sm text-gray-500">{exp.company}</p>
                      {exp.description && <DescriptionLines text={exp.description} />}
                    </div>
                    {exp.dates && (
                      <p className="text-xs text-gray-400 whitespace-nowrap pt-0.5">{exp.dates}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {educationEntries.length > 0 && (
            <section>
              <SectionHeading label="Education" t={t} style="minimal" />
              <div className="space-y-4">
                {educationEntries.map((edu, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto] gap-x-6">
                    <div>
                      <p className="font-semibold text-gray-900">{edu.qualification}</p>
                      <p className="text-sm text-gray-500">{edu.school}</p>
                      {edu.description && <p className="text-sm text-gray-400 mt-0.5">{edu.description}</p>}
                    </div>
                    {edu.dates && (
                      <p className="text-xs text-gray-400 whitespace-nowrap pt-0.5">{edu.dates}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {skills.length > 0 && (
            <section>
              <SectionHeading label="Skills" t={t} style="minimal" />
              <p className="text-sm text-gray-600 leading-7">{skills.join(" · ")}</p>
            </section>
          )}

          {application?.company && application?.role && (
            <p className={`text-xs ${t.accent} border-t ${t.divider} pt-6`}>
              Tailored for {application.company} — {application.role}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
