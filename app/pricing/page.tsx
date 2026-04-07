"use client"

import { useState } from "react"
import Link from "next/link"

export default function PricingPage() {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    try {
      setLoading(true)

      const res = await fetch("/api/checkout", {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Something went wrong")
        setLoading(false)
        return
      }

      if (data.url) {
        window.location.href = data.url
        return
      }

      alert("No checkout URL returned")
      setLoading(false)
    } catch (error) {
      console.error(error)
      alert("Something went wrong starting checkout")
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-300">Pricing</p>
          <h1 className="mt-2 text-4xl font-bold text-white">
            Simple pricing
          </h1>
          <p className="mt-3 max-w-2xl text-white/60">
            Start free, then upgrade when you&apos;re ready to apply smarter.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
        >
          ← Back to dashboard
        </Link>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/20 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold text-white">Free</h2>
          <p className="mt-3 text-4xl font-bold text-white">£0</p>
          <p className="text-sm text-white/60">/month</p>

          <p className="mt-4 text-sm text-white/65">
            Good for testing the product and creating your first tailored applications.
          </p>

          <ul className="mt-6 space-y-3 text-sm text-white/85">
            <li>✔ Track job applications</li>
            <li>✔ Manage CVs</li>
            <li>✔ Basic CV tailoring</li>
            <li>✔ Up to 3 cover letters</li>
            <li>✔ Basic AI suggestions</li>
          </ul>

          <button
            disabled
            className="mt-8 w-full rounded-xl border border-white/20 bg-white/5 py-3 text-sm font-medium text-white/40"
          >
            Current plan
          </button>
        </div>

        <div className="rounded-3xl border border-cyan-400/60 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6 shadow-[0_0_40px_rgba(34,211,238,0.15)]">
          <h2 className="text-2xl font-semibold text-white">Pro</h2>
          <p className="mt-3 text-4xl font-bold text-white">£9</p>
          <p className="text-sm text-white/60">/month</p>
          <p className="mt-1 text-xs text-cyan-300">
            Includes advanced CV match and smart coaching
          </p>

          <p className="mt-4 text-sm text-white/75">
            Best for active job seekers who want faster, smarter application workflows.
          </p>

          <ul className="mt-6 space-y-3 text-sm text-white/90">
            <li>✔ Unlimited cover letters</li>
            <li>✔ Advanced CV matching per job</li>
            <li>✔ Smart coaching & feedback</li>
            <li>✔ Improved AI suggestions</li>
            <li>✔ Faster workflow</li>
          </ul>

          <button
            type="button"
            onClick={handleUpgrade}
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-white py-3 text-sm font-semibold text-black shadow-xl transition hover:scale-[1.02] hover:bg-gray-100 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Upgrade now"}
          </button>
        </div>
      </div>

      <div className="mt-16 rounded-3xl border border-white/15 bg-white/5 p-8 text-center">
        <h3 className="text-2xl font-semibold text-white">
          Apply faster. Get better results.
        </h3>
        <p className="mt-3 text-white/60">
          Tailor your CV, generate cover letters, and improve every application with AI-powered insights.
        </p>
      </div>
    </div>
  )
}
