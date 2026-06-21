"use client"

import { useState, useEffect } from "react"

export default function ReferralWidget() {
  const [code, setCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchCode = async () => {
    setLoading(true)
    const res = await fetch("/api/referral/get-or-create", { method: "POST" })
    const data = await res.json()
    if (data.code) setCode(data.code)
    setLoading(false)
  }

  useEffect(() => { fetchCode() }, [])

  const referralUrl = code ? `${window.location.origin}/register?ref=${code}` : ""

  const copy = () => {
    if (!referralUrl) return
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Refer a friend</h2>
          <p className="mt-1 text-sm text-white/40">Share your link — get 1 month Pro free when they sign up</p>
        </div>
        <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-bold text-violet-300">Free Pro month</span>
      </div>

      {loading ? (
        <div className="h-12 animate-pulse rounded-xl bg-white/5" />
      ) : code ? (
        <div className="flex gap-2">
          <div className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white/70 truncate">
            {referralUrl}
          </div>
          <button onClick={copy}
            style={copied ? { backgroundColor: "#34d399", color: "#000" } : { backgroundColor: "#06b6d4", color: "#000" }}
            className="rounded-xl px-4 py-3 text-sm font-semibold transition hover:opacity-90 whitespace-nowrap">
            {copied ? "✓ Copied!" : "Copy link"}
          </button>
        </div>
      ) : (
        <p className="text-sm text-red-400">Could not load referral code</p>
      )}

      <p className="mt-3 text-xs text-white/25">Your code: <span className="font-mono text-white/40">{code ?? "…"}</span></p>
    </div>
  )
}
