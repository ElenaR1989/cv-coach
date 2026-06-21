"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"

type Props = {
  cvId: string
  template: string
  theme: string
}

export default function CVPreviewActions({ cvId, template, theme }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const changeTemplate = (newTemplate: string) => {
    startTransition(async () => {
      const response = await fetch("/api/cv-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvId,
          template: newTemplate,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        alert(data?.error || "Failed to save template")
        return
      }

      router.push(`/dashboard/cvs/${cvId}?template=${newTemplate}&theme=${theme}`)
      router.refresh()
    })
  }

  const changeTheme = (newTheme: string) => {
    startTransition(async () => {
      const response = await fetch("/api/cv-theme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvId,
          theme: newTheme,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        alert(data?.error || "Failed to save theme")
        return
      }

      router.push(`/dashboard/cvs/${cvId}?template=${template}&theme=${newTheme}`)
      router.refresh()
    })
  }

  return (
    <div className="print-hide flex flex-wrap items-center gap-2">
      <a
        href="/dashboard/cvs"
        className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
      >
        Back
      </a>

      <a
        href={`/dashboard/cvs/${cvId}/edit`}
        className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
      >
        Edit
      </a>

      <a
        href={`/cv/${cvId}/print`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-500/20 transition"
      >
        ↓ Download PDF
      </a>

      <button
        type="button"
        onClick={() => changeTemplate("classic")}
        disabled={isPending}
        className={`rounded-lg border px-4 py-2 text-sm ${
          template === "classic" ? "bg-black text-white" : "hover:bg-muted"
        }`}
      >
        Classic
      </button>

      <button
        type="button"
        onClick={() => changeTemplate("sidebar")}
        disabled={isPending}
        className={`rounded-lg border px-4 py-2 text-sm ${
          template === "sidebar" ? "bg-black text-white" : "hover:bg-muted"
        }`}
      >
        Sidebar
      </button>

      <button
        type="button"
        onClick={() => changeTemplate("minimal")}
        disabled={isPending}
        className={`rounded-lg border px-4 py-2 text-sm ${
          template === "minimal" ? "bg-black text-white" : "hover:bg-muted"
        }`}
      >
        Minimal
      </button>

      <span className="ml-2 text-sm text-gray-500">Theme:</span>

      <button
        type="button"
        onClick={() => changeTheme("default")}
        disabled={isPending}
        className={`rounded-lg border px-4 py-2 text-sm ${
          theme === "default" ? "bg-black text-white" : "hover:bg-muted"
        }`}
      >
        Default
      </button>

      <button
        type="button"
        onClick={() => changeTheme("blue")}
        disabled={isPending}
        className={`rounded-lg border px-4 py-2 text-sm ${
          theme === "blue" ? "bg-black text-white" : "hover:bg-muted"
        }`}
      >
        Blue
      </button>

      <button
        type="button"
        onClick={() => changeTheme("emerald")}
        disabled={isPending}
        className={`rounded-lg border px-4 py-2 text-sm ${
          theme === "emerald" ? "bg-black text-white" : "hover:bg-muted"
        }`}
      >
        Emerald
      </button>

      <button
        type="button"
        onClick={() => changeTheme("burgundy")}
        disabled={isPending}
        className={`rounded-lg border px-4 py-2 text-sm ${
          theme === "burgundy" ? "bg-black text-white" : "hover:bg-muted"
        }`}
      >
        Burgundy
      </button>
    </div>
  )
}