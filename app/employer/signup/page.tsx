"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import BrandLogo from "@/components/brand-logo"
import Link from "next/link"

export default function EmployerSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<"account" | "company">("account")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyDescription, setCompanyDescription] = useState("")
  const [website, setWebsite] = useState("")
  const [location, setLocation] = useState("")

  const handleAccount = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return }
    setLoading(true)
    setError("")
    const res = await fetch("/api/auth/employer-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? "Something went wrong"); setLoading(false); return }
    setLoading(false)
    setStep("company")
  }

  const handleCompany = async () => {
    if (!companyName) { setError("Company name is required."); return }
    setLoading(true)
    setError("")
    const res = await fetch("/api/employer/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_name: companyName, company_description: companyDescription, website, location }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? "Something went wrong"); setLoading(false); return }
    router.push("/employer/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-md px-6 py-16">
        <Link href="/" className="inline-block mb-10">
          <BrandLogo textClassName="font-semibold text-sm" />
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            {["account", "company"].map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === s || (step === "company" && i === 0) ? "bg-cyan-400 text-black" : "bg-white/10 text-white/40"}`}>
                  {i + 1}
                </div>
                <span className={`text-sm ${step === s ? "text-white" : "text-white/40"}`}>
                  {s === "account" ? "Create account" : "Company details"}
                </span>
                {i === 0 && <div className="h-px w-8 bg-white/10" />}
              </div>
            ))}
          </div>

          {step === "account" ? (
            <>
              <h1 className="text-2xl font-bold mb-1">Post jobs on HireFlow</h1>
              <p className="text-sm text-white/40 mb-6">Reach pre-matched candidates actively looking for work.</p>
              <div className="space-y-4">
                <input type="email" placeholder="Work email address" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50 transition" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAccount()}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50 transition" />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button onClick={handleAccount} disabled={loading}
                  style={{ backgroundColor: "#06b6d4", color: "#000" }}
                  className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90 disabled:opacity-50">
                  {loading ? "Creating account…" : "Continue →"}
                </button>
              </div>
              <p className="mt-4 text-center text-sm text-white/40">
                Already have an account? <Link href="/employer/login" className="text-cyan-400 hover:underline">Sign in</Link>
              </p>
              <p className="mt-6 text-center text-xs text-white/25">Free to post jobs during our launch period.</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1">Tell us about your company</h1>
              <p className="text-sm text-white/40 mb-6">This appears on your job listings.</p>
              <div className="space-y-4">
                <input type="text" placeholder="Company name *" value={companyName} onChange={e => setCompanyName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50 transition" />
                <textarea placeholder="What does your company do? (optional)" value={companyDescription} onChange={e => setCompanyDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50 transition resize-none" />
                <input type="text" placeholder="Location (e.g. Peterborough, Remote)" value={location} onChange={e => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50 transition" />
                <input type="url" placeholder="Website (optional)" value={website} onChange={e => setWebsite(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50 transition" />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button onClick={handleCompany} disabled={loading}
                  style={{ backgroundColor: "#06b6d4", color: "#000" }}
                  className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90 disabled:opacity-50">
                  {loading ? "Setting up…" : "Create employer account →"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
