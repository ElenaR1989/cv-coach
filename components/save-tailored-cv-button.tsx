"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Props = {
  applicationId: string
  tailoredSummary: string | null
  hasTailoredCv?: boolean
}

export default function SaveTailoredCVButton({
  applicationId,
  tailoredSummary,
  hasTailoredCv = false,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!tailoredSummary?.trim()) {
      alert("No tailored CV content available yet.")
      return
    }

    setSaving(true)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setSaving(false)
      alert("You must be logged in.")
      return
    }

    const { error } = await supabase
      .from("job_applications")
      .update({
        tailored_cv: tailoredSummary,
      })
      .eq("id", applicationId)
      .eq("user_id", user.id)

    setSaving(false)

    if (error) {
      alert(`Failed to save tailored CV: ${error.message}`)
      return
    }

    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={saving || !tailoredSummary?.trim()}
      className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {saving
        ? "Saving..."
        : hasTailoredCv
        ? "Update tailored CV"
        : "Save tailored CV"}
    </button>
  )
}