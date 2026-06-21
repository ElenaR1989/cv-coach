"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"

/* ─── Mock data ─────────────────────────────────────────────── */

const APPS = [
  { role: "Senior CRM Manager", company: "FRP Group", status: "interview", score: 82, days: 3 },
  { role: "Marketing Manager", company: "Acme Corp", status: "applied", score: 71, days: 7 },
  { role: "Head of Growth", company: "Venture Ltd", status: "offer", score: 91, days: 14 },
  { role: "Digital Marketing Lead", company: "TechStart", status: "saved", score: 58, days: 1 },
]

const JOBS = [
  { title: "CRM Manager", company: "British Gas", location: "London", salary: "£55k–£65k", source: "Reed", remote: false },
  { title: "Marketing Manager", company: "Spotify", location: "Remote", salary: "£60k–£75k", source: "Remotive", remote: true },
  { title: "Growth Lead", company: "Revolut", location: "London", salary: "£70k–£85k", source: "Adzuna", remote: false },
]

const CV_BEFORE = `Managed social media accounts and helped with campaigns. Worked with the sales team. Did some analysis and reporting.`
const CV_AFTER = `Directed end-to-end digital marketing campaigns across LinkedIn, email and paid search — driving a 34% increase in qualified pipeline and reducing CPA by 22% YoY. Partnered with sales leadership to align targeting strategy with conversion quality, contributing to a £2.1M revenue quarter.`

const QUESTIONS = [
  { q: "Tell me about a time you led a successful marketing campaign.", type: "behavioural" },
  { q: "How do you prioritise between campaigns competing for the same budget?", type: "situational" },
]

const SKILLS_MISSING = ["Salesforce", "Google Ads", "A/B Testing", "SQL"]
const SKILLS_MATCHED = ["CRM Strategy", "Email Marketing", "Campaign Management", "Stakeholder Management", "Data Analysis"]

const STATUS_STYLE: Record<string, string> = {
  interview: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  applied: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
  offer: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  saved: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
}

const SOURCE_STYLE: Record<string, string> = {
  Reed: "bg-red-500/20 text-red-300",
  Remotive: "bg-emerald-500/20 text-emerald-300",
  Adzuna: "bg-blue-500/20 text-blue-300",
}

/* ─── Helpers ────────────────────────────────────────────────── */

function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.2 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [ref])
  return inView
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/50 uppercase tracking-widest">
      {children}
    </span>
  )
}

function ScoreRing({ score, animate }: { score: number; animate: boolean }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const [dash, setDash] = useState(circ)
  useEffect(() => {
    if (animate) setTimeout(() => setDash(circ - (score / 100) * circ), 200)
  }, [animate, score, circ])
  const colour = score >= 80 ? "#10b981" : score >= 60 ? "#eab308" : "#ef4444"
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={88} height={88} className="-rotate-90">
        <circle cx={44} cy={44} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
        <circle cx={44} cy={44} r={r} fill="none" stroke={colour} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={dash}
          style={{ transition: "stroke-dashoffset 1s ease" }} strokeLinecap="round" />
      </svg>
      <span className="absolute text-lg font-bold text-white">{score}%</span>
    </div>
  )
}

/* ─── Sections ───────────────────────────────────────────────── */

function DashboardSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  return (
    <section ref={ref} className="py-24">
      <div className="mb-12 text-center">
        <SectionLabel>🎯 Feature 1</SectionLabel>
        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Application Tracker</h2>
        <p className="mt-3 text-white/55 mx-auto max-w-xl">Every job in one place — status, score, interview dates, notes. Never lose track again.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {APPS.map((app, i) => (
          <div key={app.company}
            className="rounded-2xl border border-white/10 bg-white/4 p-5 transition-all duration-700"
            style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)", transitionDelay: `${i * 100}ms` }}>
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-white">{app.role}</p>
                <p className="text-xs text-white/40">{app.company}</p>
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLE[app.status]}`}>{app.status}</span>
            </div>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full bg-cyan-500 transition-all duration-1000"
                style={{ width: inView ? `${app.score}%` : "0%", transitionDelay: `${i * 100 + 300}ms` }} />
            </div>
            <div className="flex items-center justify-between text-xs text-white/35">
              <span>{app.score}% CV match</span>
              <span>{app.days}d ago</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function JobSearchSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  return (
    <section ref={ref} className="py-24">
      <div className="mb-12 text-center">
        <SectionLabel>🔍 Feature 2</SectionLabel>
        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Search 4 Job Boards at Once</h2>
        <p className="mt-3 text-white/55 mx-auto max-w-xl">One search. Results from Reed, Adzuna, Remotive & Jooble — deduplicated and ranked. Add any job directly to your tracker.</p>
      </div>
      <div className="mx-auto max-w-2xl">
        {/* Search bar mock */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          <span className="text-white/30 text-sm flex-1">CRM Manager · London</span>
          <span className="rounded-lg px-4 py-1.5 text-sm font-semibold text-black" style={{ backgroundColor: "#06b6d4" }}>Search</span>
        </div>
        <div className="mb-3 flex gap-2 text-xs text-white/40">
          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-red-300">Reed 14</span>
          <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-blue-300">Adzuna 9</span>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300">Remotive 4</span>
        </div>
        <div className="space-y-3">
          {JOBS.map((job, i) => (
            <div key={job.title}
              className="rounded-2xl border border-white/10 bg-white/4 p-5 transition-all duration-700"
              style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateX(-20px)", transitionDelay: `${i * 120}ms` }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{job.title}</p>
                    {job.remote && <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">Remote</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-white/45">{job.company} · {job.location}</p>
                  <p className="mt-1 text-xs font-medium text-cyan-400">{job.salary}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${SOURCE_STYLE[job.source]}`}>{job.source}</span>
                  <span className="rounded-lg border border-white/10 px-3 py-1 text-xs text-white/60 hover:text-white cursor-pointer transition">+ Add to tracker</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CVSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const [improved, setImproved] = useState(false)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (inView && !improved) {
      setTimeout(() => {
        setLoading(true)
        setTimeout(() => { setLoading(false); setImproved(true) }, 1800)
      }, 600)
    }
  }, [inView])
  return (
    <section ref={ref} className="py-24">
      <div className="mb-12 text-center">
        <SectionLabel>✨ Feature 3</SectionLabel>
        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">AI CV Editor</h2>
        <p className="mt-3 text-white/55 mx-auto max-w-xl">Write a rough draft. The AI rewrites it to sound polished, specific, and impactful — in seconds.</p>
      </div>
      <div className="mx-auto max-w-3xl grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/4 p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-white/35">Before</p>
          <p className="text-sm leading-7 text-white/55 italic">{CV_BEFORE}</p>
        </div>
        <div className={`rounded-2xl border p-5 transition-all duration-500 ${improved ? "border-cyan-500/30 bg-cyan-500/5" : "border-white/10 bg-white/4"}`}>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-white/35">After AI</p>
            {loading && <span className="text-xs text-cyan-400 animate-pulse">✨ Improving…</span>}
            {improved && <span className="text-xs text-cyan-400">✓ Improved</span>}
          </div>
          <p className={`text-sm leading-7 transition-all duration-700 ${improved ? "text-white" : "text-white/20"}`}>
            {improved ? CV_AFTER : CV_BEFORE}
          </p>
        </div>
      </div>
      {/* Templates */}
      <div className="mx-auto mt-10 max-w-3xl">
        <p className="mb-4 text-center text-xs text-white/35 uppercase tracking-wider">3 professional templates</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: "Classic", accent: "#06b6d4" },
            { name: "Modern", accent: "#8b5cf6" },
            { name: "Minimal", accent: "#10b981" },
          ].map((t) => (
            <div key={t.name} className="rounded-xl border border-white/10 bg-white/4 p-4 text-center">
              <div className="mb-2 h-2 w-full rounded-full" style={{ backgroundColor: t.accent + "40" }}>
                <div className="h-full w-3/4 rounded-full" style={{ backgroundColor: t.accent }} />
              </div>
              <div className="space-y-1.5">
                {[100, 75, 90, 60].map((w, i) => (
                  <div key={i} className="h-1 rounded-full bg-white/10" style={{ width: `${w}%` }} />
                ))}
              </div>
              <p className="mt-3 text-xs font-medium text-white/50">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SmartCoachSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  return (
    <section ref={ref} className="py-24">
      <div className="mb-12 text-center">
        <SectionLabel>📊 Feature 4</SectionLabel>
        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Smart Coach</h2>
        <p className="mt-3 text-white/55 mx-auto max-w-xl">Compare your CV against any job description. See your match score, missing keywords, and exactly what to add.</p>
      </div>
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/4 p-8">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <ScoreRing score={82} animate={inView} />
            <p className="text-xs text-white/40">CV match score</p>
          </div>
          <div className="flex-1 space-y-5 w-full">
            <div>
              <p className="mb-2 text-xs font-medium text-emerald-400 uppercase tracking-wide">Matched skills</p>
              <div className="flex flex-wrap gap-2">
                {SKILLS_MATCHED.map((s) => (
                  <span key={s} className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-300">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-red-400 uppercase tracking-wide">Missing keywords</p>
              <div className="flex flex-wrap gap-2">
                {SKILLS_MISSING.map((s) => (
                  <span key={s} className="rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-0.5 text-xs text-red-300">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
          <p className="text-xs text-white/50 leading-6">💡 <span className="text-white/70">Coach tip:</span> Adding "Salesforce" and "Google Ads" to your experience section could push your match score above 90%.</p>
        </div>
      </div>
    </section>
  )
}

function InterviewSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const [step, setStep] = useState(0)
  const [typed, setTyped] = useState("")
  const ANSWER = "In my last role I led a £500k LinkedIn campaign that generated 620 qualified leads — 24% above target — at a 22% lower CPA than the previous quarter."

  useEffect(() => {
    if (!inView || step !== 0) return
    const t = setTimeout(() => setStep(1), 800)
    return () => clearTimeout(t)
  }, [inView, step])

  useEffect(() => {
    if (step !== 1) return
    let i = 0
    const iv = setInterval(() => {
      i++
      setTyped(ANSWER.slice(0, i))
      if (i >= ANSWER.length) { clearInterval(iv); setTimeout(() => setStep(2), 500) }
    }, 22)
    return () => clearInterval(iv)
  }, [step])

  return (
    <section ref={ref} className="py-24">
      <div className="mb-12 text-center">
        <SectionLabel>🤖 Feature 5</SectionLabel>
        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">AI Practice Interview</h2>
        <p className="mt-3 text-white/55 mx-auto max-w-xl">Role-specific questions generated from the job description. Answer, get scored instantly, finish with a full report.</p>
      </div>
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Question */}
        <div className="rounded-2xl border border-white/10 bg-white/4 p-5"
          style={{ opacity: inView ? 1 : 0, transition: "opacity 0.5s", transitionDelay: "100ms" }}>
          <span className="mb-3 inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-300">Behavioural</span>
          <p className="text-sm font-medium leading-7 text-white">{QUESTIONS[0].q}</p>
          <p className="mt-2 text-xs italic text-white/30">💡 Use the STAR method: Situation, Task, Action, Result.</p>
        </div>

        {/* Answer typing */}
        {step >= 1 && (
          <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-4"
            style={{ opacity: 1, transition: "opacity 0.4s" }}>
            <p className="mb-1.5 text-xs uppercase tracking-wide text-white/30">Your answer</p>
            <p className="text-sm leading-7 text-white/75">
              {typed}{step === 1 && <span className="animate-pulse text-cyan-400">▋</span>}
            </p>
          </div>
        )}

        {/* Score feedback */}
        {step >= 2 && (
          <div className="rounded-2xl border border-white/10 bg-white/4 p-5 space-y-3"
            style={{ animation: "fadeIn 0.5s ease" }}>
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-1000" style={{ width: "80%" }} />
              </div>
              <span className="text-sm font-bold text-white">8/10</span>
            </div>
            <p className="text-sm text-white/65">Strong answer with specific metrics that immediately build credibility. The data-driven approach shows commercial awareness.</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-300">✓ Specific metrics</span>
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-300">✓ Clear ownership</span>
              <span className="rounded-full border border-yellow-500/25 bg-yellow-500/10 px-2.5 py-0.5 text-xs text-yellow-300">→ Add the outcome impact</span>
            </div>
          </div>
        )}

        {/* Pro report teaser */}
        {step >= 2 && (
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5"
            style={{ animation: "fadeIn 0.5s ease 0.3s both" }}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-violet-300">Pro: Full performance report</p>
              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-xs text-violet-300">After 6 questions</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs text-white/40">
              <div className="rounded-lg border border-white/8 bg-white/3 p-2">Overall score</div>
              <div className="rounded-lg border border-white/8 bg-white/3 p-2">Top strengths</div>
              <div className="rounded-lg border border-white/8 bg-white/3 p-2">Readiness badge</div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function CoverLetterSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const [revealed, setRevealed] = useState(0)
  const LINES = [
    "Dear Hiring Manager,",
    "",
    "I am writing to express my interest in the Senior CRM Manager position at FRP Group. With over six years of experience leading CRM strategy and digital marketing campaigns, I bring a proven track record of driving measurable pipeline growth and reducing customer acquisition costs.",
    "",
    "In my most recent role, I led a full-funnel campaign that generated 620 qualified leads at 22% below target CPA — directly contributing to a £2.1M revenue quarter. I am confident I can deliver similar results at FRP Group.",
  ]
  useEffect(() => {
    if (!inView) return
    let i = 0
    const iv = setInterval(() => {
      i++
      setRevealed(i)
      if (i >= LINES.length) clearInterval(iv)
    }, 350)
    return () => clearInterval(iv)
  }, [inView])
  return (
    <section ref={ref} className="py-24">
      <div className="mb-12 text-center">
        <SectionLabel>📝 Feature 6</SectionLabel>
        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">AI Cover Letter Generator</h2>
        <p className="mt-3 text-white/55 mx-auto max-w-xl">Generates a tailored cover letter from your CV and the job description. Edit it, save it, done.</p>
      </div>
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/4 p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-white/35">AI writing…</span>
        </div>
        <div className="space-y-2 font-mono text-sm leading-7 text-white/75">
          {LINES.map((line, i) => (
            <p key={i} className="transition-all duration-500" style={{ opacity: i < revealed ? 1 : 0 }}>
              {line || <span>&nbsp;</span>}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Page ────────────────────────────────────────────────────── */

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:none } }
        .animate-in { animation: fadeIn 0.5s ease both }
      `}</style>

      {/* Nav */}
      <div className="sticky top-0 z-30 border-b border-white/8 bg-[#050816]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="HireFlow" width={28} height={28} className="rounded-md" />
            <span className="text-sm font-semibold">HireFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/50 hover:text-white transition">Sign in</Link>
            <Link href="/signup" style={{ backgroundColor: "#06b6d4", color: "#000" }}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90">
              Start free →
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6">
        {/* Hero */}
        <section className="py-20 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs text-cyan-300">
            ✦ Full platform demo
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Everything you need to<br />
            <span className="text-cyan-400">get hired faster</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/55">
            HireFlow combines job search, application tracking, AI-powered CVs, interview practice, and smart coaching — all in one place.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup" style={{ backgroundColor: "#06b6d4", color: "#000" }}
              className="rounded-xl px-8 py-3.5 text-sm font-semibold transition hover:opacity-90">
              Start for free — no card needed
            </Link>
            <Link href="/pricing" className="rounded-xl border border-white/15 px-8 py-3.5 text-sm font-medium text-white/70 hover:text-white hover:border-white/30 transition">
              See pricing
            </Link>
          </div>

          {/* Feature pills */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {[
              "🎯 Application tracker",
              "🔍 4 job boards",
              "✨ AI CV editor",
              "📊 Smart Coach",
              "🤖 Practice interviews",
              "📝 Cover letters",
              "📄 PDF export",
            ].map((f) => (
              <span key={f} className="rounded-full border border-white/8 bg-white/4 px-4 py-1.5 text-sm text-white/55">{f}</span>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-white/8" />

        <DashboardSection />
        <div className="border-t border-white/8" />
        <JobSearchSection />
        <div className="border-t border-white/8" />
        <CVSection />
        <div className="border-t border-white/8" />
        <SmartCoachSection />
        <div className="border-t border-white/8" />
        <InterviewSection />
        <div className="border-t border-white/8" />
        <CoverLetterSection />
        <div className="border-t border-white/8" />

        {/* Final CTA */}
        <section className="py-24 text-center">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-white/[0.02] to-violet-500/10 p-12 backdrop-blur-xl">
            <h2 className="text-3xl font-bold sm:text-4xl">Ready to apply smarter?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/55">Join thousands of job seekers using HireFlow to land interviews faster.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup" style={{ backgroundColor: "#06b6d4", color: "#000" }}
                className="rounded-xl px-8 py-3.5 text-sm font-semibold transition hover:opacity-90">
                Create free account
              </Link>
              <Link href="/pricing" className="rounded-xl border border-white/20 px-8 py-3.5 text-sm font-medium text-white/70 hover:text-white transition">
                View Pro features
              </Link>
            </div>
            <p className="mt-6 text-xs text-white/25">Free plan includes 1 practice interview/month · No credit card required</p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/8 py-8 text-center text-xs text-white/25">
        <Link href="/" className="hover:text-white/50 transition">← Back to hireflow.app</Link>
        <span className="mx-4">·</span>
        <a href="mailto:hello@hire-flow.app" className="hover:text-white/50 transition">hello@hire-flow.app</a>
      </footer>
    </main>
  )
}
