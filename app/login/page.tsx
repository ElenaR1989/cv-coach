'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

const BENEFITS = [
  { icon: "🎯", text: "Track every application in one place" },
  { icon: "✨", text: "AI-tailored CVs for each job" },
  { icon: "🔍", text: "Search Reed, Adzuna & Remotive at once" },
  { icon: "🤖", text: "AI mock interviews with instant feedback" },
  { icon: "📊", text: "Smart Coach spots your skill gaps" },
]

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-violet-500/10" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="HireFlow" width={36} height={36} className="rounded-md" />
            <span className="text-lg font-semibold">HireFlow</span>
          </Link>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-bold leading-tight">
              Stop guessing.<br />
              Start getting<br />
              <span className="text-cyan-400">hired.</span>
            </h2>
            <p className="mt-4 text-white/55 leading-7">
              HireFlow gives you the tools to apply smarter — track applications, tailor your CV with AI, and know exactly where you stand.
            </p>
          </div>

          <ul className="space-y-4">
            {BENEFITS.map((b) => (
              <li key={b.text} className="flex items-center gap-3 text-sm text-white/70">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-base">
                  {b.icon}
                </span>
                {b.text}
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-sm leading-6 text-white/70 italic">
              "Finally an app that actually helps me apply better, not just track where I applied."
            </p>
            <p className="mt-3 text-xs text-white/35">— HireFlow user</p>
          </div>
        </div>

        <div className="relative text-xs text-white/25">
          © {new Date().getFullYear()} HireFlow. All rights reserved.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12">
        <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
          <Image src="/logo.png" alt="HireFlow" width={32} height={32} className="rounded-md" />
          <span className="text-base font-semibold">HireFlow</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-white/45">Sign in to your HireFlow account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wide">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/25 outline-none transition focus:border-cyan-400/50 focus:bg-white/8"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wide">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/25 outline-none transition focus:border-cyan-400/50 focus:bg-white/8"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/40">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-cyan-400 hover:text-cyan-300 transition">
                Sign up free
              </Link>
            </p>
          </div>

          <div className="mt-10 lg:hidden">
            <p className="mb-4 text-center text-xs text-white/30 uppercase tracking-wide">Why HireFlow?</p>
            <ul className="space-y-3">
              {BENEFITS.map((b) => (
                <li key={b.text} className="flex items-center gap-3 text-sm text-white/55">
                  <span>{b.icon}</span>
                  {b.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
