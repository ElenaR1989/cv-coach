"use client"

import { useState } from "react"

export default function PromoCodeCard() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)

  const handleRedeem = async () => {
    if (!code.trim()) return
    setLoading(true)
    setMessage("")
    const res = await fetch("/api/redeem-promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setSuccess(true)
      setMessage("🎉 Pro access activated! Enjoy your free plan.")
      setCode("")
    } else {
      setSuccess(false)
      setMessage(data.error ?? "Something went wrong. Please try again.")
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-white/40">Promo Code</h2>
      <p className="mb-4 text-sm text-white/50">Have a promo code? Enter it below to unlock free Pro access.</p>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Enter code"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === "Enter" && handleRedeem()}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50 transition"
        />
        <button
          onClick={handleRedeem}
          disabled={loading || !code.trim()}
          style={{ backgroundColor: "#06b6d4", color: "#000" }}
          className="rounded-xl px-5 py-2.5 text-sm font-bold transition hover:opacity-90 disabled:opacity-40"
        >
          {loading ? "Checking…" : "Redeem"}
        </button>
      </div>
      {message && (
        <p className={`mt-3 text-sm ${success ? "text-cyan-400" : "text-red-400"}`}>{message}</p>
      )}
    </div>
  )
}
