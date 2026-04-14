import Link from "next/link"

type ApplicationCardProps = {
  app: {
    id: string
    company: string
    role: string
    status: string
    created_at: string
    cv_id: string | null
    cv_profiles: {
      id: string
      title: string
      summary: string | null
    } | null
  }
  feedbackPreview: string | null
  tailoredSummary: string | null
}

function formatDate(dateString: string) {
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

function getStatusBadgeClass(status: string) {
  const base =
    "rounded-full border px-3 py-1 text-sm font-medium tracking-wide"

  switch ((status ?? "").toLowerCase()) {
    case "applied":
      return `${base} border-yellow-500/40 bg-yellow-500/10 text-yellow-300`
    case "interview":
    case "interviewing":
      return `${base} border-violet-500/40 bg-violet-500/10 text-violet-300`
    case "offer":
      return `${base} border-emerald-500/40 bg-emerald-500/10 text-emerald-300`
    case "rejected":
      return `${base} border-rose-500/40 bg-rose-500/10 text-rose-300`
    case "saved":
    default:
      return `${base} border-cyan-500/40 bg-cyan-500/10 text-cyan-300`
  }
}

export default function ApplicationCard({
  app,
  feedbackPreview,
  tailoredSummary,
}: ApplicationCardProps) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2 className="text-2xl font-semibold">
              {app.company} — {app.role}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Saved on {formatDate(app.created_at)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={getStatusBadgeClass(app.status)}>
              {app.status}
            </span>

            {app.cv_profiles?.title ? (
              <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
                CV: {app.cv_profiles.title}
              </span>
            ) : (
              <span className="rounded-full border border-zinc-500/40 bg-zinc-500/10 px-3 py-1 text-sm text-zinc-300">
                No CV attached
              </span>
            )}
          </div>

          {feedbackPreview ? (
            <p className="text-sm text-blue-300">{feedbackPreview}</p>
          ) : null}

          {tailoredSummary ? (
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-cyan-300/80">
                ✨ Tailored summary
              </p>
              <p className="line-clamp-3 text-sm leading-6 text-white/85">
                {tailoredSummary}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap gap-3 lg:flex-col lg:items-end">
          <Link
            href={`/dashboard/applications/${app.id}`}
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
          >
            View Details
          </Link>

          {app.cv_id ? (
            <Link
              href={`/dashboard/cvs/${app.cv_id}?applicationId=${app.id}`}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
            >
              View CV
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}