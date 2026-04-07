"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DeleteApplicationButton({
  applicationId,
  company,
  role,
}: {
  applicationId: string
  company: string
  role: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  async function handleDelete() {
    setIsDeleting(true)
    setError("")

    try {
      const res = await fetch("/api/delete-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ applicationId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete application.")
      }

      setOpen(false)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err?.message || "Failed to delete application.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20"
      >
        Delete
      </button>

      {open ? (
        <div
  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
  onClick={() => setOpen(false)}
>
          <div
  className="w-full max-w-sm rounded-2xl border border-white/15 bg-zinc-900 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.65)]"
  onClick={(e) => e.stopPropagation()}
>
            <h2 className="text-lg font-semibold text-white">
              Delete application?
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-300">
              You are about to delete this application:
            </p>

            <div className="mt-3 rounded-xl border border-white/10 bg-zinc-800 p-4">
              <p className="font-medium text-white">{company}</p>
              <p className="text-sm text-gray-400">{role}</p>
            </div>

            <p className="mt-4 text-sm text-gray-400">
              This action cannot be undone.
            </p>

            {error ? (
              <p className="mt-3 text-sm text-rose-300">{error}</p>
            ) : null}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isDeleting}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg border border-rose-500/30 bg-rose-500/15 px-3 py-1.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
