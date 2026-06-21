"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const STEPS = [
  {
    id: "welcome",
    icon: "👋",
    title: "Welcome to HireFlow!",
    subtitle: "Let's get you set up in 3 quick steps",
  },
  {
    id: "cv",
    icon: "📄",
    title: "Create your CV",
    subtitle: "Your CV is the foundation — the AI will use it to tailor every application",
  },
  {
    id: "job",
    icon: "🎯",
    title: "Add your first job",
    subtitle: "Search for a job or add one manually to start tracking",
  },
  {
    id: "coach",
    icon: "📊",
    title: "Run Smart Coach",
    subtitle: "See how well your CV matches the job and what to improve",
  },
]

type Props = {
  userName?: string
}

export default function Onboarding({ userName }: Props) {
  const [step, setStep] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const router = useRouter()

  if (dismissed) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d1117] p-8 shadow-2xl">

        {/* Progress dots */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-cyan-400" : i < step ? "w-4 bg-cyan-400/40" : "w-4 bg-white/10"}`} />
          ))}
        </div>

        {/* Step content */}
        <div className="mb-8 text-center">
          <div className="mb-4 text-5xl">{current.icon}</div>
          <h2 className="text-2xl font-bold text-white">{current.title}</h2>
          <p className="mt-2 text-sm text-white/50">{current.subtitle}</p>
        </div>

        {/* Step-specific content */}
        {step === 0 && (
          <div className="mb-8 space-y-3">
            {[
              { icon: "🔍", text: "Search 4 job boards at once" },
              { icon: "✨", text: "AI improves your CV for each job" },
              { icon: "🤖", text: "Practice interviews with instant feedback" },
              { icon: "📊", text: "Smart Coach spots your skill gaps" },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-4 py-3">
                <span>{item.icon}</span>
                <span className="text-sm text-white/70">{item.text}</span>
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="mb-8 space-y-3">
            <Link href="/dashboard/cvs/new" onClick={() => setDismissed(true)}
              style={{ backgroundColor: "#06b6d4", color: "#000" }}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition hover:opacity-90">
              ✨ Create CV from scratch
            </Link>
            <p className="text-center text-xs text-white/30">or continue and add your CV later</p>
          </div>
        )}

        {step === 2 && (
          <div className="mb-8 space-y-3">
            <Link href="/dashboard/search" onClick={() => setDismissed(true)}
              style={{ backgroundColor: "#06b6d4", color: "#000" }}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition hover:opacity-90">
              🔍 Search for jobs
            </Link>
            <Link href="/dashboard/jobs/new" onClick={() => setDismissed(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5">
              + Add job manually
            </Link>
          </div>
        )}

        {step === 3 && (
          <div className="mb-8 space-y-3">
            <Link href="/dashboard/cvs" onClick={() => setDismissed(true)}
              style={{ backgroundColor: "#06b6d4", color: "#000" }}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition hover:opacity-90">
              📊 Go to Smart Coach
            </Link>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => setDismissed(true)}
            className="text-xs text-white/25 hover:text-white/50 transition">
            Skip for now
          </button>

          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/50 transition hover:text-white">
                Back
              </button>
            )}
            {!isLast ? (
              <button onClick={() => setStep(s => s + 1)}
                className="rounded-xl border border-white/15 bg-white/8 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/12">
                Next →
              </button>
            ) : (
              <button onClick={() => setDismissed(true)}
                className="rounded-xl border border-white/15 bg-white/8 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/12">
                Go to dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
