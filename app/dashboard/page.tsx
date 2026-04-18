import type { ReactNode } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import StatusChart from "@/components/status-chart"
import ApplicationsOverTimeChart from "@/components/applications-over-time-chart"
import DeleteApplicationButton from "@/components/delete-application-button"
import { getIsPro } from "@/lib/billing/is-pro"
export const dynamic = "force-dynamic"

type JobApplication = {
  id: string
  company: string
  role: string
  status: string
  notes: string | null
  interview_date: string | null
  follow_up_date: string | null
  cv_id: string | null
  created_at: string
  feedback: string | null
  tailored_cv: string | null
  original_tailored_cv?: string | null
  cv_profiles?: {
    id: string
    title: string
  } | null
}

type TimelineEvent = {
  id: string
  job_application_id: string
  title: string
  description: string | null
  event_type: string
  created_at: string
}

type DashboardPageProps = {
  searchParams: Promise<{
    cv_id?: string
    status?: string
    range?: string
  }>
}

function normalizeDate(dateString: string) {
  return dateString.length === 10 ? `${dateString}T00:00:00` : dateString
}

function formatDate(dateString: string) {
  return new Date(normalizeDate(dateString)).toLocaleDateString("en-GB")
}

function formatInterviewDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`)

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getDaysUntil(dateString: string) {
  const today = new Date()
  const target = new Date(`${dateString}T00:00:00`)

  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)

  const diffMs = target.getTime() - today.getTime()
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

function getDaysSince(dateString: string) {
  const today = new Date()
  const past = new Date(normalizeDate(dateString))

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )
  const startOfPast = new Date(
    past.getFullYear(),
    past.getMonth(),
    past.getDate()
  )

  const diffTime = startOfToday.getTime() - startOfPast.getTime()
  return Math.round(diffTime / (1000 * 60 * 60 * 24))
}

function getDashboardFollowUpText(dateString: string) {
  const days = getDaysUntil(dateString)

  if (days < 0) return "⚠️ Overdue follow-up"
  if (days === 0) return "Follow up today"
  if (days === 1) return "Follow up tomorrow"
  return `Follow up in ${days} days`
}

function normalizeStatus(status: string) {
  switch (status) {
    case "Applied":
      return "Applied"
    case "Interview":
    case "Interviewing":
      return "Interviewing"
    case "Offer":
      return "Offer"
    case "Rejected":
      return "Rejected"
    default:
      return ""
  }
}

function matchesStatus(jobStatus: string, selectedStatus: string) {
  if (selectedStatus === "Interviewing") {
    return jobStatus === "Interviewing" || jobStatus === "Interview"
  }

  return jobStatus === selectedStatus
}

function getStatusBadgeClass(status: string) {
  const base =
    "rounded-full border px-3 py-1 text-sm font-medium tracking-wide"

  switch (status) {
    case "Applied":
      return `${base} border-yellow-500/40 bg-yellow-500/10 text-yellow-300`
    case "Interview":
    case "Interviewing":
      return `${base} border-violet-500/40 bg-violet-500/10 text-violet-300`
    case "Offer":
      return `${base} border-emerald-500/40 bg-emerald-500/10 text-emerald-300`
    case "Rejected":
      return `${base} border-rose-500/40 bg-rose-500/10 text-rose-300`
    case "Saved":
    default:
      return `${base} border-cyan-500/40 bg-cyan-500/10 text-cyan-300`
  }
}

function buildDashboardHref(cvId: string, status: string, range?: string) {
  const params = new URLSearchParams()

  if (cvId) params.set("cv_id", cvId)
  if (status) params.set("status", status)
  if (range && range !== "all") params.set("range", range)

  const query = params.toString()
  return query ? `/dashboard?${query}` : "/dashboard"
}

function buildRangeHref(range: string, status: string, cvId: string) {
  const params = new URLSearchParams()

  if (range && range !== "all") params.set("range", range)
  if (status) params.set("status", status)
  if (cvId) params.set("cv_id", cvId)

  const query = params.toString()
  return query ? `/dashboard?${query}` : "/dashboard"
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

 const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("is_pro, plan")
  .eq("id", user.id)
  .single()

const isPro = getIsPro(profile)
const upgradeHref = "/pricing"

  const params = await searchParams
  const selectedCvId = params.cv_id ?? ""
  const selectedStatus = normalizeStatus(params.status ?? "")
  const selectedRange = params.range ?? "30d"

  const now = new Date()
  let fromDate: string | null = null

  if (selectedRange === "7d") {
    fromDate = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000
    ).toISOString()
  } else if (selectedRange === "30d") {
    fromDate = new Date(
      now.getTime() - 30 * 24 * 60 * 60 * 1000
    ).toISOString()
  } else if (selectedRange === "90d") {
    fromDate = new Date(
      now.getTime() - 90 * 24 * 60 * 60 * 1000
    ).toISOString()
  }

  let jobsQuery = supabase
    .from("job_applications")
    .select(`
      id,
      company,
      role,
      status,
      notes,
      interview_date,
      follow_up_date,
      cv_id,
      created_at,
      feedback,
      tailored_cv,
      original_tailored_cv,
      cv_profiles (
        id,
        title
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (fromDate) {
    jobsQuery = jobsQuery.gte("created_at", fromDate)
  }

  if (selectedCvId) {
    jobsQuery = jobsQuery.eq("cv_id", selectedCvId)
  }

  const { data: jobs, error } = await jobsQuery

  if (error) {
    console.error("Error fetching dashboard jobs:", error.message)
  }

  const { data: events, error: eventsError } = await supabase
    .from("job_application_events")
    .select("id, job_application_id, title, description, event_type, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (eventsError) {
    console.error("Error fetching dashboard events:", eventsError.message)
  }

  const safeJobs: JobApplication[] = (jobs ?? []).map((job: any) => ({
    ...job,
    cv_profiles: Array.isArray(job.cv_profiles)
      ? (job.cv_profiles[0] ?? null)
      : (job.cv_profiles ?? null),
  }))

  const safeEvents: TimelineEvent[] = events ?? []

  const total = safeJobs.length
  const applied = safeJobs.filter((job) => job.status === "Applied").length
  const interviewing = safeJobs.filter(
    (job) => job.status === "Interviewing" || job.status === "Interview"
  ).length
  const offer = safeJobs.filter((job) => job.status === "Offer").length
  const rejected = safeJobs.filter((job) => job.status === "Rejected").length

  const filteredJobs = selectedStatus
    ? safeJobs.filter((job) => matchesStatus(job.status, selectedStatus))
    : safeJobs

  const filteredJobIds = new Set(filteredJobs.map((job) => job.id))

  const filteredEvents = safeEvents.filter((event) =>
    filteredJobIds.has(event.job_application_id)
  )

  const recentApplications = filteredJobs.slice(0, 5)

  const upcomingInterviews = filteredJobs
    .filter(
      (job) =>
        (job.status === "Interviewing" || job.status === "Interview") &&
        Boolean(job.interview_date)
    )
    .filter((job) => getDaysUntil(job.interview_date!) >= 0)
    .sort(
      (a, b) =>
        new Date(a.interview_date!).getTime() -
        new Date(b.interview_date!).getTime()
    )
    .slice(0, 3)

  const latestEventByJob = new Map<string, string>()
  for (const event of safeEvents) {
    if (!latestEventByJob.has(event.job_application_id)) {
      latestEventByJob.set(event.job_application_id, event.created_at)
    }
  }

  const needsAttention = filteredJobs
    .filter((job) => {
      if (job.status === "Offer" || job.status === "Rejected") return false

      if (job.follow_up_date) {
        return getDaysUntil(job.follow_up_date) <= 0
      }

      const lastActivity = latestEventByJob.get(job.id) ?? job.created_at
      return getDaysSince(lastActivity) >= 7
    })
    .sort((a, b) => {
      const aDate = a.follow_up_date ?? latestEventByJob.get(a.id) ?? a.created_at
      const bDate = b.follow_up_date ?? latestEventByJob.get(b.id) ?? b.created_at

      return (
        new Date(normalizeDate(aDate)).getTime() -
        new Date(normalizeDate(bDate)).getTime()
      )
    })
    .slice(0, 4)

  const recentActivity = filteredEvents.slice(0, 5)

  const applicationsLast7Days = safeJobs.filter(
    (job) => getDaysSince(job.created_at) <= 7
  ).length

  const interviewsSoon = filteredJobs.filter((job) => {
    if (!job.interview_date) return false
    const days = getDaysUntil(job.interview_date)
    return days >= 0 && days <= 7
  }).length

  let momentumTitle = "Steady progress"
  let momentumText =
    "Keep going — your dashboard is moving in the right direction."

  if (applicationsLast7Days === 0) {
    momentumTitle = "Time to apply"
    momentumText = "You have not added any new applications in the last 7 days."
  } else if (applicationsLast7Days >= 5) {
    momentumTitle = "Strong momentum"
    momentumText = `You added ${applicationsLast7Days} applications in the last 7 days.`
  } else {
    momentumTitle = "Good progress"
    momentumText = `You added ${applicationsLast7Days} application${
      applicationsLast7Days === 1 ? "" : "s"
    } in the last 7 days.`
  }

  let momentumExtra = ""

  if (interviewsSoon > 0) {
    momentumExtra = `${interviewsSoon} interview${
      interviewsSoon === 1 ? "" : "s"
    } coming up in the next 7 days.`
  }

  const interviewingCount = filteredJobs.filter(
    (job) => job.status === "Interviewing" || job.status === "Interview"
  ).length

  const overdueFollowUps = filteredJobs.filter((job) => {
    if (!job.follow_up_date) return false
    return getDaysUntil(job.follow_up_date) < 0
  }).length

  let focusTitle = "Everything looks balanced"
  let focusText = "Your pipeline looks healthy right now."

  if (overdueFollowUps > 0) {
    focusTitle = "Follow-ups need attention"
    focusText = `You have ${overdueFollowUps} overdue follow-up${
      overdueFollowUps === 1 ? "" : "s"
    }.`
  } else if (interviewingCount >= 3 && offer === 0) {
    focusTitle = "Strong interview momentum"
    focusText = `You have ${interviewingCount} applications in interviewing. Keep pushing toward offers.`
  } else if (applied >= 5 && interviewing === 0) {
    focusTitle = "Applications need conversion"
    focusText =
      "You have many applications out, but none have moved to interviewing yet."
  }

  const statusChartData = [
    {
      name: "Applied",
      value: filteredJobs.filter((job) => job.status === "Applied").length,
    },
    {
      name: "Interviewing",
      value: filteredJobs.filter(
        (job) => job.status === "Interviewing" || job.status === "Interview"
      ).length,
    },
    {
      name: "Offer",
      value: filteredJobs.filter((job) => job.status === "Offer").length,
    },
    {
      name: "Rejected",
      value: filteredJobs.filter((job) => job.status === "Rejected").length,
    },
  ]

  const monthlyCounts = filteredJobs.reduce((acc, job) => {
    const date = new Date(normalizeDate(job.created_at))
    const month = date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    })

    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const applicationsOverTimeData = Object.entries(monthlyCounts)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([month, applications]) => ({
      month,
      applications,
    }))

  async function deleteJob(formData: FormData) {
    "use server"

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    const jobId = String(formData.get("job_id") || "").trim()

    if (!jobId) {
      throw new Error("Missing job id")
    }

    const { error } = await supabase
      .from("job_applications")
      .delete()
      .eq("id", jobId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error deleting job:", error.message)
      throw new Error(error.message)
    }

    const nextParams = new URLSearchParams()
    if (selectedCvId) nextParams.set("cv_id", selectedCvId)
    if (selectedStatus) nextParams.set("status", selectedStatus)
    if (selectedRange && selectedRange !== "all") {
      nextParams.set("range", selectedRange)
    }

    const nextQuery = nextParams.toString()
    redirect(nextQuery ? `/dashboard?${nextQuery}` : "/dashboard")
  }

  return (
    <div className="space-y-8 p-6">
      {isPro ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-300">
            ✅ You are on Pro. Unlimited applications, smarter CV tailoring, and better cover letters are unlocked.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-yellow-300">
              ✨ Upgrade to Pro to unlock unlimited applications, smarter CV tailoring, and better cover letters.
            </p>

            <Link
              href="/pricing"
              className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300"
            >
              Upgrade
            </Link>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your applications and upcoming interviews
        </p>
      </div>

      <section className="rounded-2xl border border-white/20 bg-white/5 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Applications timeframe</h2>
            <p className="text-sm text-white/60">
              View applications by recent time period.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={buildRangeHref("7d", selectedStatus, selectedCvId)}
              className={`rounded-lg border px-4 py-2 text-sm transition ${
                selectedRange === "7d"
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                  : "border-white/20 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              Last 7 days
            </Link>

            <Link
              href={buildRangeHref("30d", selectedStatus, selectedCvId)}
              className={`rounded-lg border px-4 py-2 text-sm transition ${
                selectedRange === "30d"
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                  : "border-white/20 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              Last 30 days
            </Link>

            <Link
              href={buildRangeHref("90d", selectedStatus, selectedCvId)}
              className={`rounded-lg border px-4 py-2 text-sm transition ${
                selectedRange === "90d"
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                  : "border-white/20 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              Last 90 days
            </Link>

            <Link
              href={buildRangeHref("all", selectedStatus, selectedCvId)}
              className={`rounded-lg border px-4 py-2 text-sm transition ${
                selectedRange === "all"
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                  : "border-white/20 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              All time
            </Link>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {(selectedStatus || selectedCvId || selectedRange !== "30d") && (
          <div className="flex justify-end">
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/20 px-4 py-2 text-sm text-muted-foreground transition hover:bg-white/10 hover:text-white"
            >
              Clear filters ✕
            </Link>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatLinkCard
            title="Total"
            value={total}
            href={buildDashboardHref(selectedCvId, "", selectedRange)}
            isActive={!selectedStatus}
            variant="default"
          />
          <StatLinkCard
            title="Applied"
            value={applied}
            href={buildDashboardHref(selectedCvId, "Applied", selectedRange)}
            isActive={selectedStatus === "Applied"}
            variant="applied"
          />
          <StatLinkCard
            title="Interviewing"
            value={interviewing}
            href={buildDashboardHref(
              selectedCvId,
              "Interviewing",
              selectedRange
            )}
            isActive={selectedStatus === "Interviewing"}
            variant="interviewing"
          />
          <StatLinkCard
            title="Offer"
            value={offer}
            href={buildDashboardHref(selectedCvId, "Offer", selectedRange)}
            isActive={selectedStatus === "Offer"}
            variant="offer"
          />
          <StatLinkCard
            title="Rejected"
            value={rejected}
            href={buildDashboardHref(selectedCvId, "Rejected", selectedRange)}
            isActive={selectedStatus === "Rejected"}
            variant="rejected"
          />
        </div>

        <section className="rounded-2xl border border-white/20 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Recent Job Applications</h2>
              <p className="text-muted-foreground">
                {selectedStatus
                  ? `Showing ${selectedStatus.toLowerCase()} applications`
                  : "Your latest saved applications"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/applications"
                className="text-sm text-blue-400 hover:underline"
              >
                View all →
              </Link>

              <Link
                href="/dashboard/jobs/new"
                className="rounded-lg border border-white/20 px-4 py-2 transition hover:bg-white/10"
              >
                Add another
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {recentApplications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-muted-foreground">
                {selectedStatus
                  ? `No ${selectedStatus.toLowerCase()} applications yet. Click "Total" to see all jobs.`
                  : "No job applications yet."}
              </div>
            ) : (
              recentApplications.map((job) => {
                const hasTailoredCv = Boolean(job.tailored_cv?.trim())

                return (
                  <div
                    key={job.id}
                    className="rounded-xl border border-white/10 p-4 transition hover:bg-white/[0.04]"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {job.company} — {job.role}
                          </h3>

                          {job.feedback ? (
                            <p className="mt-2 text-sm text-blue-300">
                              {job.feedback}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className={getStatusBadgeClass(job.status)}>
                            {job.status}
                          </span>

                          {job.cv_id && job.cv_profiles?.title ? (
                            <>
                              <Link
                                href={`/dashboard/cvs/${job.cv_id}/edit`}
                                className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-blue-300 transition hover:bg-blue-500/20"
                              >
                                Base CV: {job.cv_profiles.title}
                              </Link>

                              <Link
                                href={`/dashboard/cvs/${job.cv_id}?applicationId=${job.id}`}
                                className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-300 transition hover:bg-emerald-500/20"
                              >
                                View tailored CV
                              </Link>
                            </>
                          ) : (
                            <span className="rounded-full border border-zinc-500/40 bg-zinc-500/10 px-3 py-1 text-zinc-300">
                              No CV attached
                            </span>
                          )}

                          {job.interview_date ? (
                            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-amber-300">
                              Interview: {formatDate(job.interview_date)}
                            </span>
                          ) : null}

                          {job.follow_up_date ? (
                            <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-rose-300">
                              Follow-up: {formatDate(job.follow_up_date)}
                            </span>
                          ) : null}
                        </div>

                        {hasTailoredCv ? (
                          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                            <p>Job-specific CV ready for this application.</p>
                            <p className="mt-1 text-xs text-emerald-200/80">
                              This version is tailored specifically for this job.
                            </p>
                          </div>
                        ) : job.cv_id ? (
                          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
                            No tailored CV yet. This application is still using your base CV.
                          </div>
                        ) : null}

                        {job.notes ? (
                          <p className="pt-1 text-sm text-muted-foreground">
                            {job.notes}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/dashboard/applications/${job.id}`}
                          className="rounded-lg border border-white/20 px-3 py-1 text-sm transition hover:bg-white/10"
                        >
                          View
                        </Link>

                        <Link
                          href={`/dashboard/jobs/${job.id}/edit`}
                          className="rounded-lg border border-white/20 px-3 py-1 text-sm transition hover:bg-white/10"
                        >
                          Edit
                        </Link>

                        <form action={deleteJob}>
                          <input type="hidden" name="job_id" value={job.id} />
                          <DeleteApplicationButton
                            applicationId={job.id}
                            company={job.company}
                            role={job.role}
                          />
                        </form>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <InsightCard
          title="Upcoming Interviews"
          subtitle="Your next scheduled interviews"
        >
          {upcomingInterviews.length === 0 ? (
            <EmptyInsight text="No upcoming interviews scheduled yet." />
          ) : (
            <div className="space-y-3">
              {upcomingInterviews.map((job) => {
                const daysUntil = getDaysUntil(job.interview_date!)

                return (
                  <Link
                    key={job.id}
                    href={`/dashboard/applications/${job.id}`}
                    className="group block rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-black/30 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-cyan-950/20"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate font-semibold text-white transition group-hover:text-cyan-200">
                          {job.company} — {job.role}
                        </p>
                        <p className="text-sm text-white/55">
                          {formatInterviewDate(job.interview_date!)}
                        </p>
                      </div>

                      <div
                        className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${
                          daysUntil === 0
                            ? "border-rose-400/30 bg-rose-500/15 text-rose-200"
                            : daysUntil === 1
                              ? "border-amber-400/30 bg-amber-500/15 text-amber-200"
                              : daysUntil <= 3
                                ? "border-cyan-400/30 bg-cyan-500/15 text-cyan-200"
                                : "border-white/15 bg-white/5 text-white/70"
                        }`}
                      >
                        {daysUntil === 0
                          ? "Today"
                          : daysUntil === 1
                            ? "Tomorrow"
                            : `In ${daysUntil} days`}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </InsightCard>

        <InsightCard
          title="Needs Attention"
          subtitle="Follow-ups due or older applications needing action"
        >
          {needsAttention.length === 0 ? (
            <EmptyInsight text="Everything looks up to date." />
          ) : (
            <div className="space-y-3">
              {needsAttention.map((job) => {
                const lastActivity = latestEventByJob.get(job.id) ?? job.created_at

                return (
                  <Link
                    key={job.id}
                    href={`/dashboard/applications/${job.id}`}
                    className="group block rounded-xl border border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent p-4 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:border-rose-400/40 hover:bg-rose-500/10 hover:shadow-xl hover:shadow-black/30"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-medium text-white transition group-hover:text-rose-200">
                          {job.company} — {job.role}
                        </p>
                        <p className="text-sm text-gray-400">
                          {job.follow_up_date
                            ? getDashboardFollowUpText(job.follow_up_date)
                            : `Last update ${getDaysSince(lastActivity)} days ago`}
                        </p>
                      </div>

                      <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs text-rose-300">
                        Attention
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </InsightCard>

        <InsightCard
          title="Recent Activity"
          subtitle="Latest changes across your applications"
        >
          {recentActivity.length === 0 ? (
            <EmptyInsight text="No recent activity yet." />
          ) : (
            <div className="space-y-3">
              {recentActivity.map((event) => (
                <Link
                  key={event.id}
                  href={`/dashboard/applications/${event.job_application_id}`}
                  className="block rounded-xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/5 hover:border-white/20"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{event.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(event.created_at)}
                    </span>
                  </div>

                  {event.description ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  ) : null}
                </Link>
              ))}
            </div>
          )}
        </InsightCard>

        <InsightCard
          title="Momentum"
          subtitle="A quick read on your job search progress"
        >
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <p className="text-sm font-semibold text-cyan-300">
              {momentumTitle}
            </p>

            <p className="mt-2 text-sm text-white/80">
              {momentumText}
            </p>

            {momentumExtra ? (
              <p className="mt-2 text-xs text-cyan-200/80">
                {momentumExtra}
              </p>
            ) : null}
          </div>
        </InsightCard>

        <InsightCard
          title="Focus Area"
          subtitle="What deserves your attention most"
        >
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-sm font-semibold text-amber-300">
              {focusTitle}
            </p>

            <p className="mt-2 text-sm text-white/80">
              {focusText}
            </p>
          </div>
        </InsightCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Application Status</h2>
            <p className="mt-1 text-sm text-gray-400">
              Breakdown of your current application stages.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <StatusChart data={statusChartData} />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Applications Over Time</h2>
            <p className="mt-1 text-sm text-gray-400">
              Track how your applications are growing over time.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <ApplicationsOverTimeChart data={applicationsOverTimeData} />
          </div>
        </section>
      </div>
    </div>
  )
}

function InsightCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function EmptyInsight({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">
      {text}
    </div>
  )
}

function StatLinkCard({
  title,
  value,
  href,
  isActive,
  variant,
}: {
  title: string
  value: number
  href: string
  isActive: boolean
  variant: "default" | "applied" | "interviewing" | "offer" | "rejected"
}) {
  const activeClasses: Record<typeof variant, string> = {
    default: "border-white/60 bg-white/10",
    applied: "border-yellow-500/50 bg-yellow-500/10",
    interviewing: "border-violet-500/50 bg-violet-500/10",
    offer: "border-emerald-500/50 bg-emerald-500/10",
    rejected: "border-rose-500/50 bg-rose-500/10",
  }

  return (
    <Link
      href={href}
      className={`block rounded-2xl border p-6 transition hover:scale-[1.02] hover:border-white/40 hover:bg-white/10 hover:shadow-lg hover:shadow-black/20 active:scale-[0.98] ${
        isActive ? activeClasses[variant] : "border-white/20"
      }`}
    >
      <p className="text-muted-foreground">{title}</p>
      <p className="mt-2 text-4xl font-bold">{value}</p>
    </Link>
  )
}