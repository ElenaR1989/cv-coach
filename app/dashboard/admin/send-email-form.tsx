"use client"

import { useState } from "react"

type Props = {
  allEmails: string[]
}

export default function SendEmailForm({ allEmails }: Props) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [mode, setMode] = useState<"all" | "single">("all")
  const [singleEmail, setSingleEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [resultMsg, setResultMsg] = useState("")

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return
    if (mode === "single" && !singleEmail.trim()) return

    const confirmed = window.confirm(
      mode === "all"
        ? `Send to all ${allEmails.length} users?`
        : `Send to ${singleEmail}?`
    )
    if (!confirmed) return

    setStatus("loading")
    setResultMsg("")

    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          recipients: mode === "single" ? [singleEmail.trim()] : [],
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus("error")
        setResultMsg(data.error || "Failed to send")
      } else {
        setStatus("success")
        setResultMsg(`✓ Sent to ${data.sent} user${data.sent !== 1 ? "s" : ""}`)
        setSubject("")
        setMessage("")
        setSingleEmail("")
      }
    } catch {
      setStatus("error")
      setResultMsg("Something went wrong")
    }
  }

  const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/50 focus:bg-white/8"

  return (
    <form onSubmit={handleSend} className="space-y-4">
      {/* Recipient mode */}
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode("all")}
          className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${mode === "all" ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300" : "border-white/10 text-white/50 hover:text-white"}`}>
          All users ({allEmails.length})
        </button>
        <button type="button" onClick={() => setMode("single")}
          className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${mode === "single" ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300" : "border-white/10 text-white/50 hover:text-white"}`}>
          Specific user
        </button>
      </div>

      {mode === "single" && (
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/40">Recipient email</label>
          <input type="email" value={singleEmail} onChange={e => setSingleEmail(e.target.value)}
            placeholder="user@example.com" required={mode === "single"} list="email-suggestions"
            className={inputClass} />
          <datalist id="email-suggestions">
            {allEmails.map(e => <option key={e} value={e} />)}
          </datalist>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/40">Subject</label>
        <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
          placeholder="e.g. New feature on HireFlow 🎉" required className={inputClass} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/40">Message</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)}
          placeholder="Write your message here…" required rows={6}
          className={inputClass + " resize-none"} />
        <p className="mt-1 text-xs text-white/25">Plain text — line breaks are preserved</p>
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={status === "loading" || !subject.trim() || !message.trim()}
          style={{ backgroundColor: "#06b6d4", color: "#000" }}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50">
          {status === "loading" ? "Sending…" : mode === "all" ? `Send to all ${allEmails.length} users` : "Send email"}
        </button>
        {resultMsg && (
          <p className={`text-sm ${status === "success" ? "text-emerald-400" : "text-red-400"}`}>{resultMsg}</p>
        )}
      </div>
    </form>
  )
}
