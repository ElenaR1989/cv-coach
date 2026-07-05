"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

export default function SignupPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignup = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return }
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push("/verify-email")
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
