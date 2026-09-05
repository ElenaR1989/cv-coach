"use client"

import { useState } from "react"
import Link from "next/link"
import BrandLogo from "@/components/brand-logo"

export default function AffiliatePage() {
  const [form, setForm] = useState({ name: "", email: "", how: "" })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/affiliate/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || "Something went wrong"); setLoading(false); return }
    setDone(true)
  }

  const howOptions = [
    "LinkedIn outreach",
    "Facebook / Instagram",
    "TikTok / YouTube",
    "WhatsApp / personal network",
    "I work in recruitment",
    "I'm a career coach",
    "University / college contacts",
    "Other",
  ]

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-4xl px-6 py-16">

        {/* Nav */}
        <div className="mb-10 flex items-center justify-between">
          <BrandLogo />
          <Link href="/pricing" className="text-sm text-white/50 hover:text-white transition">Pricing</Link>
        </div>

        {/* Hero */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
            💸 Affiliate Programme
          </div>
          <h1 className="text-4xl font-bold sm:text-5xl">Earn £100 per sale.<br />Work when you want.</h1>
          <p className="mt-5 text-lg text-white/55 max-w-2xl mx-auto leading-8">
            Refer people to HireFlow's £500 Premium Career Package. Every time someone buys through your link, you earn £100 — paid directly to you.
          </p>
        </div>

        {/* How it works */}
        <div className="mb-14 grid gap-4 sm:grid-cols-3">
          {[
            { icon: "🔗", title: "Get your unique link", desc: "Apply below. We approve you and send your personal referral link within 24 hours." },
            { icon: "📣", title: "Share it", desc: "Post on LinkedIn, WhatsApp, TikTok, or message people directly. You decide how you work." },
            { icon: "💰", title: "Get paid", desc: "When someone buys the £500 Premium package via your link, we pay you £100 within 7 days." },
          ].map(s => (
            <div key={s.title} className="rounded-2xl border border-white/10 bg-white/4 p-6 text-center">
              <div className="mb-3 text-3xl">{s.icon}</div>
              <h3 className="font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-white/50 leading-6">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Earnings table */}
        <div className="mb-14 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-8">
          <h2 className="mb-6 text-center text-xl font-bold">What you could earn</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-left">
                  <th className="pb-3 font-medium">Sales per month</th>
                  <th className="pb-3 font-medium">Monthly earnings</th>
                  <th className="pb-3 font-medium">Annual earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ["1 sale", "£100", "£1,200"],
                  ["3 sales", "£300", "£3,600"],
                  ["5 sales", "£500", "£6,000"],
                  ["10 sales", "£1,000", "£12,000"],
                ].map(([sales, monthly, annual]) => (
                  <tr key={sales}>
                    <td className="py-3 text-white">{sales}</td>
                    <td className="py-3 text-violet-300 font-semibold">{monthly}</td>
                    <td className="py-3 text-white/60">{annual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-white/30 text-center">No cap on earnings. No minimum. Paid per confirmed sale.</p>
        </div>

        {/* Who it's for */}
        <div className="mb-14">
          <h2 className="mb-6 text-center text-xl font-bold">Who this works well for</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: "👔", text: "Freelance recruiters who talk to job seekers daily" },
              { icon: "🎓", text: "Career coaches looking to add value for clients" },
              { icon: "📱", text: "LinkedIn / TikTok creators in the careers space" },
              { icon: "🏫", text: "University students with access to career networks" },
              { icon: "💬", text: "Anyone with a WhatsApp group, Facebook group, or audience" },
              { icon: "🤝", text: "People who know others struggling with job applications" },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/4 p-4">
                <span className="text-xl">{item.icon}</span>
                <p className="text-sm text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Application form */}
        <div className="rounded-2xl border border-white/10 bg-white/4 p-8">
          {done ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white">Application received!</h2>
              <p className="mt-3 text-white/50">Elena will review your application and send your unique referral link within 24 hours.</p>
              <p className="mt-2 text-sm text-white/30">Check your email at {form.email}</p>
            </div>
          ) : (
            <>
              <h2 className="mb-2 text-xl font-bold text-white">Apply to become an affiliate</h2>
              <p className="mb-6 text-sm text-white/40">Takes 2 minutes. We'll review and get back to you within 24 hours.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/40">Your name *</label>
                  <input type="text" required value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Sarah Johnson"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-violet-400/50" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/40">Email address *</label>
                  <input type="email" required value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-violet-400/50" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/40">How would you promote HireFlow? *</label>
                  <select required value={form.how}
                    onChange={e => setForm(f => ({ ...f, how: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-[#0a0f1e] px-4 py-3 text-sm text-white outline-none focus:border-violet-400/50">
                    <option value="">Select an option…</option>
                    {howOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button type="submit" disabled={loading}
                  style={{ backgroundColor: "#8b5cf6", color: "#fff" }}
                  className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90 disabled:opacity-50">
                  {loading ? "Submitting…" : "Apply now — it's free →"}
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
