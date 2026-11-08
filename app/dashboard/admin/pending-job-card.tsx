"use client"

import { useState } from "react"

type PendingJob = {
  id: string
  title: string
  location: string
  job_type: string
  created_at: string
  employers?: { company_name?: string } | { company_name?: string }[] | null
}

export default function PendingJobCard({ job }: { job: PendingJob }) {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "loading">("pending")

  const act = async (action: "approve" | "reject") => {
    setStatus("loading")
    const res = await fetch(`/api/admin/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    if (res.ok) setStatus(action === "approve" ? "approved" : "rejected")
    else setStatus("pending")
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/4 p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-white">{job.title}</p>
        <p className="text-xs text-white/40 mt-0.5">
          {(Array.isArray(job.employers) ? job.employers[0]?.company_name : job.employers?.company_name) ?? "Unknown company"} · {job.location} · {job.job_type}
        </p>
        <p className="text-xs text-white/25 mt-0.5">
          Submitted {new Date(job.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {status === "approved" && <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-400">Approved ✓</span>}
        {status === "rejected" && <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400">Rejected</span>}
        {status === "loading" && <span className="text-xs text-white/40">Saving…</span>}
        {status === "pending" && (
          <>
            <button onClick={() => act("reject")}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20">
              Reject
            </button>
            <button onClick={() => act("approve")}
              className="rounded-xl bg-green-500/20 px-4 py-2 text-xs font-semibold text-green-400 transition hover:bg-green-500/30">
              Approve →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
