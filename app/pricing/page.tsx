"use client"

import { useState } from "react"

export default function PricingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleUpgrade() {
    try {
      setLoading(true)
      setError("")

      const res = await fetch("/api/checkout", {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong.")
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error("Upgrade error:", err)
      setError("Something went wrong starting checkout.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-10 text-center">
        Simple pricing
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 p-6 bg-white/5">
          <h2 className="text-xl font-semibold mb-2">Free</h2>
          <p className="text-sm text-white/60 mb-4">
            Get started and test the platform
          </p>

          <p className="text-3xl font-bold mb-6">£0</p>

          <ul className="space-y-2 text-sm text-white/80 mb-6">
            <li>✔ 3 cover letters</li>
            <li>✔ Basic CV tracking</li>
            <li>✔ Limited AI suggestions</li>
          </ul>

          <button
            disabled
            className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white/50 cursor-not-allowed"
          >
            Current plan
          </button>
        </div>

        <div className="rounded-xl border border-violet-500/30 p-6 bg-violet-500/10">
          <h2 className="text-xl font-semibold mb-2">Pro</h2>
          <p className="text-sm text-violet-300 mb-4">
            Everything you need to land interviews
          </p>

          <p className="text-3xl font-bold mb-6">£9 / month</p>

          <ul className="space-y-2 text-sm text-white/90 mb-6">
            <li>✔ Unlimited cover letters</li>
            <li>✔ AI CV rewriting</li>
            <li>✔ Match score insights</li>
            <li>✔ Keyword optimisation</li>
          </ul>

          <button
  onClick={handleUpgrade}
  disabled={loading}
  className="w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
>
  {loading ? "Redirecting..." : "Upgrade to Pro"}
</button>

          {error ? (
            <p className="mt-3 text-sm text-rose-300">{error}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
