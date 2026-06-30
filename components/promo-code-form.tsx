"use client"

import { useState } from "react"

export default function PromoCodeForm() {
  const [code, setCode] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [msg, setMsg] = useState("")

  const redeem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setStatus("loading")
    try {
      const res = await fetch("/api/redeem-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus("error")
        setMsg(data.error || "Failed to redeem code")
      } else {
        setStatus("success")
        setMsg("🎉 1 month Pro activated! Refresh the page to see your benefits.")
        setCode("")
      }
    } catch {
      setStatus("error")
      setMsg("Something went wrong. Try again.")
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
      <h2 className="mb-1 text-base font-semibold text-white">Promo code</h2>
      <p className="mb-4 text-sm text-white/40">Have a promo code? Enter it below to activate your free Pro.</p>
      <form onSubmit={redeem} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. PRODUCTHUNT"
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-sm text-white placeholder-white/25 outline-none focus:border-cyan-400/50"
        />
        <button type="submit" disabled={status === "loading" || !code.trim()}
          style={{ backgroundColor: "#06b6d4", color: "#000" }}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50">
          {status === "loading" ? "Redeeming…" : "Redeem"}
        </button>
      </form>
      {msg && (
        <p className={`mt-3 text-sm ${status === "success" ? "text-emerald-400" : "text-red-400"}`}>{msg}</p>
      )}
    </div>
  )
}
