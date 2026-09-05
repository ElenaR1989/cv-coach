"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import BrandLogo from "@/components/brand-logo"

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "£79",
    period: "/month",
    tag: "Best for small agencies",
    color: "cyan",
    candidates: "Up to 20 candidates",
    features: ["Branded subdomain", "Candidate dashboard", "Interview scores & skills gaps", "Quiz results per candidate", "Email support"],
  },
  {
    id: "growth",
    name: "Growth",
    price: "£149",
    period: "/month",
    tag: "Most popular",
    color: "violet",
    candidates: "Up to 100 candidates",
    features: ["Everything in Starter", "Up to 100 candidates", "Bulk invite links", "Priority email support", "Monthly usage report"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "£299",
    period: "/month",
    tag: "Large agencies",
    color: "amber",
    candidates: "Unlimited candidates",
    features: ["Everything in Growth", "Unlimited candidates", "Dedicated account manager", "Custom branding options", "Phone & priority support"],
  },
]

export default function NewAgencyPage() {
  const router = useRouter()
  const [step, setStep] = useState<"plan" | "setup">("plan")
  const [selectedPlan, setSelectedPlan] = useState("starter")
  const [form, setForm] = useState({ name: "", slug: "", tagline: "", brand_color: "#06b6d4" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
    setForm(f => ({ ...f, name, slug }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/agency/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, plan: selectedPlan }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || "Something went wrong"); setLoading(false); return }
    router.push(`/agency/welcome?id=${data.agency.id}`)
  }

  const planColors: Record<string, { border: string; bg: string; badge: string; btn: string; text: string }> = {
    cyan:   { border: "border-cyan-500/30",   bg: "bg-cyan-500/8",   badge: "bg-cyan-500/15 text-cyan-300",   btn: "#06b6d4", text: "text-cyan-300" },
    violet: { border: "border-violet-500/30", bg: "bg-violet-500/8", badge: "bg-violet-500/15 text-violet-300", btn: "#8B5CF6", text: "text-violet-300" },
    amber:  { border: "border-amber-500/30",  bg: "bg-amber-500/8",  badge: "bg-amber-500/15 text-amber-300",  btn: "#f59e0b", text: "text-amber-300" },
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-4xl px-6 py-16">

        {/* Nav */}
        <div className="mb-10 flex items-center justify-between">
          <BrandLogo textClassName="text-lg font-semibold" />
          {step === "setup" && (
            <button onClick={() => setStep("plan")} className="text-sm text-white/40 hover:text-white transition">← Change plan</button>
          )}
        </div>

        {step === "plan" ? (
          <>
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-300 mb-4">
                🎉 First month free on all plans
              </div>
              <h1 className="text-3xl font-bold mb-3">Choose your agency plan</h1>
              <p className="text-white/50 max-w-lg mx-auto">Give your candidates a fully branded job platform — your logo, your colours, your link. Start free for 30 days.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-3 mb-8">
              {PLANS.map(plan => {
                const c = planColors[plan.color]
                const isSelected = selectedPlan === plan.id
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`rounded-2xl border p-6 text-left transition-all ${c.border} ${c.bg} ${isSelected ? "ring-2 ring-white/20 scale-[1.02]" : "opacity-80 hover:opacity-100"}`}
                  >
                    <div className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold mb-3 ${c.badge}`}>{plan.tag}</div>
                    <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
                    <div className="mb-1">
                      <span className="text-3xl font-bold text-white">{plan.price}</span>
                      <span className="text-white/40 text-sm">{plan.period}</span>
                    </div>
                    <p className={`text-xs mb-4 ${c.text}`}>{plan.candidates}</p>
                    <ul className="space-y-2">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                          <span className={`mt-0.5 ${c.text}`}>✓</span>{f}
                        </li>
                      ))}
                    </ul>
                    {isSelected && (
                      <div className="mt-4 rounded-lg bg-white/10 py-1.5 text-center text-xs font-semibold text-white">✓ Selected</div>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/4 p-5 mb-8 text-center">
              <p className="text-sm text-white/50">
                ✅ <strong className="text-white">1 month free</strong> — no credit card needed to get started &nbsp;·&nbsp;
                Cancel anytime &nbsp;·&nbsp; Full candidate dashboard from day one
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={() => setStep("setup")}
                style={{ backgroundColor: "#06b6d4", color: "#000" }}
                className="rounded-xl px-10 py-3.5 text-sm font-bold transition hover:opacity-90"
              >
                Continue with {PLANS.find(p => p.id === selectedPlan)?.name} →
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300 mb-4">
                White-label setup · {PLANS.find(p => p.id === selectedPlan)?.name} plan
              </div>
              <h1 className="text-3xl font-bold">Set up your branded platform</h1>
              <p className="mt-2 text-white/50">Your candidates will access HireFlow under your brand — your logo, your colours, your link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">Organisation name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="e.g. Hire Resolve UK"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-cyan-400/50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">Your unique link *</label>
                <div className="flex items-center rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                  <span className="px-3 text-sm text-white/30 border-r border-white/10 py-3">hire-flow.app/agency/</span>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                    placeholder="your-agency"
                    className="flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none"
                  />
                </div>
                <p className="mt-1 text-xs text-white/30">This is the link you share with candidates</p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">Tagline (optional)</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                  placeholder="e.g. Career support for our candidates"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-cyan-400/50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">Brand colour</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.brand_color}
                    onChange={e => setForm(f => ({ ...f, brand_color: e.target.value }))}
                    className="h-10 w-16 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                  />
                  <span className="text-sm text-white/40">{form.brand_color}</span>
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-xl border border-white/10 bg-white/4 p-4">
                <p className="mb-3 text-xs text-white/30 uppercase tracking-wide">Preview</p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-black" style={{ backgroundColor: form.brand_color }}>
                    {form.name?.[0]?.toUpperCase() || "A"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{form.name || "Your Agency"}</p>
                    <p className="text-xs text-white/40">{form.tagline || "Powered by HireFlow"}</p>
                  </div>
                </div>
                <p className="text-xs text-white/30">hire-flow.app/agency/{form.slug || "your-agency"}</p>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading || !form.name || !form.slug}
                style={{ backgroundColor: "#06b6d4", color: "#000" }}
                className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Creating…" : "Create branded platform — first month free →"}
              </button>
              <p className="text-center text-xs text-white/30">No credit card needed for your free month · Cancel anytime</p>
            </form>
          </>
        )}

      </div>
    </div>
  )
}
