"use client"

import { useState } from "react"
import Link from "next/link"

const FREE_FEATURES = [
  "Track unlimited applications",
  "Search jobs across LinkedIn, Indeed, Reed & more",
  "1 AI practice interview per month",
  "Basic CV editor",
  "3 AI cover letters",
  "Application status tracking",
  "Interview date reminders",
  "Chrome extension to save jobs",
]

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited AI practice interviews",
  "Scored interview reports with feedback",
  "AI tailors your CV for every job",
  "Unlimited AI cover letters",
  "Smart Coach skill gap analysis",
  "AI CV summary & experience improver",
  "Weekly progress email digest",
  "Job alert saved searches",
  "Referral rewards — 1 month free per friend",
  "Priority support",
]

const PREMIUM_FEATURES = [
  "Everything in Pro — 12 months included",
  "3 x 1-on-1 coaching sessions with Elena (60 min each)",
  "Full professional CV rewrite — done for you",
  "LinkedIn profile review & optimisation",
  "Personalised career roadmap",
  "Career Fit assessment",
  "Cover letter written for your target role",
  "Interview preparation coaching",
  "Email access to Elena for 12 months",
  "Priority responses within 24 hours",
]

export default function PricingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [promoCode, setPromoCode] = useState("")
  const [promoMsg, setPromoMsg] = useState("")
  const [promoStatus, setPromoStatus] = useState<"idle" | "success" | "error">("idle")

  async function handleUpgrade() {
    try {
      setLoading(true)
      setError("")
      const res = await fetch("/api/checkout", { method: "POST" })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Something went wrong."); return }
      if (data.url) window.location.href = data.url
    } catch {
      setError("Something went wrong starting checkout.")
    } finally {
      setLoading(false)
    }
  }

  async function redeemPromo(e: React.FormEvent) {
    e.preventDefault()
    if (!promoCode.trim()) return
    const res = await fetch("/api/redeem-promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoCode.trim() }),
    })
    const data = await res.json()
    if (!res.ok) {
      setPromoStatus("error")
      setPromoMsg(data.error || "Invalid code")
    } else {
      setPromoStatus("success")
      setPromoMsg("🎉 1 month Pro activated! Refresh to see your benefits.")
      setPromoCode("")
    }
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">

        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-white/50 transition hover:text-white">← Back to Dashboard</Link>
        </div>

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold">Simple, transparent pricing</h1>
          <p className="mt-3 text-lg text-white/50">Start free. Upgrade when you're ready.</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
            🌱 Early access — free to start, no credit card needed
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Free */}
          <div className="rounded-2xl border border-white/10 bg-white/4 p-8">
            <h2 className="text-xl font-bold text-white">Free</h2>
            <p className="mt-1 text-sm text-white/40">Get started, no credit card needed</p>
            <div className="my-6">
              <span className="text-5xl font-bold text-white">£0</span>
              <span className="text-white/40"> / forever</span>
            </div>
            <ul className="mb-8 space-y-3">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                  <span className="mt-0.5 text-emerald-400">✓</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/signup"
              className="block w-full rounded-xl border border-white/20 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10">
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 to-violet-500/5 p-8">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-5 py-1.5 text-xs font-bold text-black">
              MOST POPULAR
            </div>
            <h2 className="text-xl font-bold text-white">Pro</h2>
            <p className="mt-1 text-sm text-cyan-300">Everything you need to land interviews</p>
            <div className="my-6">
              <span className="text-5xl font-bold text-white">£9</span>
              <span className="text-white/40"> / month</span>
            </div>
            <ul className="mb-8 space-y-3">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                  <span className="mt-0.5 text-cyan-400">✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={handleUpgrade} disabled={loading}
              style={{ backgroundColor: "#06b6d4", color: "#000" }}
              className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90 disabled:opacity-50">
              {loading ? "Redirecting…" : "Upgrade to Pro — £9/month"}
            </button>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            {/* Promo code */}
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="mb-2 text-xs text-white/40">Have a promo code? Get Pro free:</p>
              <form onSubmit={redeemPromo} className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Enter promo code"
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white placeholder-white/20 outline-none focus:border-cyan-400/50"
                />
                <button type="submit"
                  className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                  Redeem
                </button>
              </form>
              {promoMsg && (
                <p className={`mt-2 text-xs ${promoStatus === "success" ? "text-emerald-400" : "text-red-400"}`}>{promoMsg}</p>
              )}
            </div>
          </div>

          {/* Premium */}
          <div className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-orange-500/5 p-8">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-5 py-1.5 text-xs font-bold text-black">
              BEST RESULTS
            </div>
            <h2 className="text-xl font-bold text-white">Premium</h2>
            <p className="mt-1 text-sm text-amber-300">Done-with-you career transformation</p>
            <div className="my-6">
              <span className="text-5xl font-bold text-white">£500</span>
              <span className="text-white/40"> / one-time</span>
            </div>
            <ul className="mb-8 space-y-3">
              {PREMIUM_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                  <span className="mt-0.5 text-amber-400">✓</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/premium"
              style={{ backgroundColor: "#f59e0b", color: "#000" }}
              className="block w-full rounded-xl py-3 text-center text-sm font-bold transition hover:opacity-90">
              Learn more & apply →
            </Link>
            <p className="mt-3 text-center text-xs text-white/30">Limited spots — book a free call first</p>
          </div>
        </div>

        {/* Agency CTA */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/4 p-6 text-center">
          <p className="text-sm text-white/50">Are you a recruitment agency?</p>
          <p className="mt-1 font-semibold text-white">Get a branded platform for your candidates — £500 one-time</p>
          <Link href="/agency/new" className="mt-3 inline-block rounded-xl border border-white/20 px-5 py-2 text-sm text-white/70 transition hover:text-white">
            Set up your agency platform →
          </Link>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="mb-8 text-center text-2xl font-bold">Common questions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { q: "Can I cancel anytime?", a: "Yes — cancel anytime with no questions asked. You keep Pro until the end of your billing period." },
              { q: "Is my CV data safe?", a: "Yes. Your data is stored securely and never shared with third parties or employers." },
              { q: "What's included in the free plan?", a: "You get full access to job tracking, job search, 1 practice interview per month, and 3 AI cover letters." },
              { q: "Do you offer any discounts?", a: "We occasionally run promotions for early users. Sign up free and keep an eye on your email for special offers." },
              { q: "What is the Premium package?", a: "A full done-with-you career service — CV rewrite, 3 coaching sessions, LinkedIn review, career roadmap, and 12 months of HireFlow Pro. Limited spots available." },
              { q: "How does the affiliate programme work?", a: "Refer someone to the Premium package and earn £100 when they pay. Apply to become an affiliate and get your unique link." },
            ].map(item => (
              <div key={item.q} className="rounded-2xl border border-white/10 bg-white/4 p-5">
                <p className="font-semibold text-white">{item.q}</p>
                <p className="mt-2 text-sm text-white/55">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Affiliate CTA */}
        <div className="mt-10 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
            💸 Earn money with HireFlow
          </div>
          <h3 className="text-xl font-bold text-white">Become an affiliate — earn £100 per sale</h3>
          <p className="mt-2 text-sm text-white/50">Refer people to our Premium package. They get their dream career, you earn £100. No experience needed.</p>
          <Link href="/affiliate"
            className="mt-5 inline-block rounded-xl border border-violet-400/30 bg-violet-500/10 px-6 py-3 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/20">
            Apply to become an affiliate →
          </Link>
        </div>

      </div>
    </div>
  )
}
