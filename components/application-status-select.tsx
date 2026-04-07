"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

const statuses = ["Saved", "Applied", "Interviewing", "Offer", "Rejected"]

export default function ApplicationStatusSelect({
  applicationId,
  currentStatus,
}: {
  applicationId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  const selectClassName = useMemo(() => {
    const base =
      "rounded-lg border px-3 py-2 text-sm font-medium outline-none transition"

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
  }, [status])

  async function handleChange(nextStatus: string) {
    setStatus(nextStatus)
    setIsSaving(true)
    setMessage("")

    try {
      const res = await fetch("/api/update-application-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          status: nextStatus,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Failed to update status.")
      }

      setMessage("Updated")
      router.refresh()

      setTimeout(() => {
        setMessage("")
      }, 2000)
    } catch (error: any) {
      setMessage(error?.message || "Failed")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isSaving}
        className={selectClassName}
      >
        {statuses.map((item) => (
          <option key={item} value={item} className="bg-zinc-900 text-white">
            {item}
          </option>
        ))}
      </select>

      {message ? <p className="text-xs text-emerald-300">{message}</p> : null}
    </div>
  )
}
