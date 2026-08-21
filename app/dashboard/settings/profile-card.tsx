"use client"

import { useState } from "react"

interface ProfileCardProps {
  initialFullName: string | null
  initialCareerGoal: string | null
  initialLocation: string | null
  initialOpenToAgencies: boolean
}

export default function ProfileCard({
  initialFullName,
  initialCareerGoal,
  initialLocation,
  initialOpenToAgencies,
}: ProfileCardProps) {
  const [fullName, setFullName] = useState(initialFullName || "")
  const [careerGoal, setCareerGoal] = useState(initialCareerGoal || "")
  const [location, setLocation] = useState(initialLocation || "")
  const [openToAgencies, setOpenToAgencies] = useState(initialOpenToAgencies)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSaved(false)
    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, career_goal: careerGoal, location, open_to_agencies: openToAgencies }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || "Something went wrong"); setSaving(false); return }
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 p-6 space-y-5">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40 mb-1">Your Profile</h2>
        <p className="text-xs text-white/30">This information helps agencies find you and understand your career goals.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">Full name</label>
        <input
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="e.g. Sarah Johnson"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-cyan-400/50 transition"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">Career goal</label>
        <input
          type="text"
          value={careerGoal}
          onChange={e => setCareerGoal(e.target.value)}
          placeholder="e.g. Software Engineer, Marketing Manager, Nurse…"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-cyan-400/50 transition"
        />
        <p className="mt-1 text-xs text-white/25">The role or career you're working towards</p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">Location</label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="e.g. London, Manchester, Remote…"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-cyan-400/50 transition"
        />
      </div>

      {/* Open to agencies toggle */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer rounded-xl border p-4 transition"
          style={{ borderColor: openToAgencies ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)", background: openToAgencies ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.03)" }}>
          <input
            type="checkbox"
            checked={openToAgencies}
            onChange={e => setOpenToAgencies(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-emerald-400 cursor-pointer flex-shrink-0"
          />
          <div>
            <p className="text-sm font-medium text-white">Open to recruitment agencies</p>
            <p className="mt-0.5 text-xs text-white/40 leading-5">
              Let recruitment agencies on HireFlow see your name, career goal, and location. They may reach out about relevant opportunities. You can turn this off at any time.
            </p>
            {openToAgencies && (
              <span className="mt-2 inline-block rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                ✓ Visible to agencies
              </span>
            )}
          </div>
        </label>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        style={saved ? { backgroundColor: "#10B981", color: "#000" } : { backgroundColor: "#06b6d4", color: "#000" }}
        className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving…" : saved ? "✓ Saved!" : "Save profile"}
      </button>
    </div>
  )
}
