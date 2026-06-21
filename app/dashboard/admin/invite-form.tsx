"use client"

import { useState } from "react"

export default function InviteForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus("loading")
    setMessage("")

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus("error")
        setMessage(data.error || "Failed to send invite")
      } else {
        setStatus("success")
        setMessage(`Invite sent to ${data.email}`)
        setEmail("")
      }
    } catch {
      setStatus("error")
      setMessage("Something went wrong")
    }
  }

  return (
    <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/40">
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@example.com"
          required
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/50 focus:bg-white/8"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading" || !email.trim()}
        style={{ backgroundColor: "#06b6d4", color: "#000" }}
        className="rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50 shrink-0"
      >
        {status === "loading" ? "Sending…" : "Send Invite"}
      </button>
      {message && (
        <p className={`mt-1 text-xs sm:hidden ${status === "success" ? "text-emerald-400" : "text-red-400"}`}>
          {message}
        </p>
      )}
    </form>
  )
}
