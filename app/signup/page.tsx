"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"

function SignupForm() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const agencySlug = searchParams.get("agency")
  const nextPath = searchParams.get("next") === "/career-quiz" ? "/career-quiz" : null

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [openToAgencies, setOpenToAgencies] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  const joinAgency = async (slug: string) => {
    try {
      await fetch("/api/agency/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
    } catch (e) {
      console.error("Failed to join agency:", e)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    const callbackParams = new URLSearchParams()
    if (agencySlug) callbackParams.set("agency", agencySlug)
    if (nextPath) callbackParams.set("next", nextPath)
    const query = callbackParams.toString()
    const redirectTo = `${window.location.origin}/auth/callback${query ? `?${query}` : ""}`
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    })
  }

  const handleSignup = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return }
    setLoading(true)
    setError("")
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { open_to_agencies: openToAgencies } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    // Save open_to_agencies preference to profile
    if (data.user) {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ open_to_agencies: openToAgencies }),
      }).catch(() => {})
    }
    if (agencySlug) await joinAgency(agencySlug)
    router.push(nextPath ?? "/verify-email")
  }

  return (
    <div className="flex min-h-screen bg-[#050816] text-white">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="HireFlow" width={36} height={36} className="rounded-md" />
          <span className="text-lg font-semibold">HireFlow</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold leading-tight mb-6">
            Stop guessing your<br />job applications.<br />Start improving them.
          </h2>
          <div className="space-y-4">
            {[
              { icon: "✨", text: "AI tailors your CV to every job description" },
              { icon: "🎯", text: "Track every application in one place" },
              { icon: "🤖", text: "Practice interviews with instant AI feedback" },
              { icon: "📊", text: "Smart Coach shows your skill gaps" },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3 text-white/70">
                <span className="text-xl">{f.icon}</span>
                <span className="text-sm">{f.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 flex gap-1">
            {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400">★</span>)}
            <span className="ml-2 text-sm text-white/50">"Got 3 interviews in my first week"</span>
          </div>
        </div>
        <p className="text-xs text-white/30">© 2026 HireFlow. Free to start — no credit card needed.</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden flex items-center gap-3">
            <Image src="/logo.png" alt="HireFlow" width={32} height={32} className="rounded-md" />
            <span className="text-lg font-semibold">HireFlow</span>
          </div>

          <h1 className="text-2xl font-bold mb-1">Create your free account</h1>
          <p className="text-sm text-white/40 mb-8">No credit card needed. Start in seconds.</p>

          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50 mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/></svg>
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 border-t border-white/10" />
            <span className="text-xs text-white/30">or sign up with email</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            />
            {/* Open to agencies opt-in */}
            <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-white/10 bg-white/4 p-3 hover:bg-white/6 transition">
              <input
                type="checkbox"
                checked={openToAgencies}
                onChange={e => setOpenToAgencies(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-cyan-400 cursor-pointer flex-shrink-0"
              />
              <span className="text-sm text-white/60 leading-5">
                <span className="text-white font-medium">I'm open to being contacted by recruitment agencies</span>
                {" "}— let agencies on HireFlow see my profile and career goals
              </span>
            </label>

            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              onClick={handleSignup}
              disabled={loading}
              style={{ backgroundColor: "#06b6d4", color: "#000" }}
              className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create free account"}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-white/40">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-400 hover:underline">Sign in</Link>
          </p>

          <p className="mt-8 text-center text-xs text-white/25">
            By signing up you agree to our terms. Free forever on the basic plan.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#050816] text-white/40">Loading…</div>}>
      <SignupForm />
    </Suspense>
  )
}
