"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

const questions = [
  {
    id: "qualification",
    section: "About you",
    question: "What is your highest qualification?",
    options: [
      { label: "No formal qualifications", value: "none" },
      { label: "GCSEs or equivalent", value: "gcse" },
      { label: "A-Levels or equivalent", value: "alevels" },
      { label: "Bachelor's Degree", value: "degree" },
      { label: "Master's or higher", value: "masters" },
    ],
  },
  {
    id: "field",
    section: "About you",
    question: "What field did you study or work in?",
    options: [
      { label: "Business / Finance / Admin", value: "business" },
      { label: "Technology / IT / Engineering", value: "tech" },
      { label: "Healthcare / Social Care", value: "healthcare" },
      { label: "Creative / Arts / Media", value: "creative" },
      { label: "Science / Research", value: "science" },
      { label: "Education / Training", value: "education" },
      { label: "No specific field yet", value: "none" },
    ],
  },
  {
    id: "experience",
    section: "About you",
    question: "How much work experience do you have?",
    options: [
      { label: "None — I'm just starting out", value: "0" },
      { label: "Less than 1 year", value: "1" },
      { label: "1–3 years", value: "3" },
      { label: "3–5 years", value: "5" },
      { label: "5–10 years", value: "10" },
      { label: "10+ years", value: "10+" },
    ],
  },
  {
    id: "people",
    section: "Work style",
    question: "Which do you prefer?",
    options: [
      { label: "Working closely with people every day", value: "people" },
      { label: "A mix of people and independent work", value: "mix" },
      { label: "Mostly working independently", value: "solo" },
    ],
  },
  {
    id: "type",
    section: "Work style",
    question: "What kind of work energises you most?",
    options: [
      { label: "Helping and supporting others", value: "helping" },
      { label: "Building or creating things", value: "building" },
      { label: "Analysing data and solving problems", value: "analytical" },
      { label: "Organising, planning, managing", value: "organising" },
      { label: "Selling, persuading, communicating", value: "selling" },
    ],
  },
  {
    id: "environment",
    section: "Work style",
    question: "Where do you prefer to work?",
    options: [
      { label: "Office environment", value: "office" },
      { label: "Remote / from home", value: "remote" },
      { label: "Outdoors or on the move", value: "outdoors" },
      { label: "Doesn't matter to me", value: "any" },
    ],
  },
  {
    id: "pace",
    section: "Work style",
    question: "What pace suits you best?",
    options: [
      { label: "Fast-paced, always something new", value: "fast" },
      { label: "Steady and structured", value: "steady" },
      { label: "A balance of both", value: "balance" },
    ],
  },
  {
    id: "priority",
    section: "What matters to you",
    question: "What matters most in your career?",
    options: [
      { label: "High salary and financial growth", value: "salary" },
      { label: "Work-life balance and flexibility", value: "balance" },
      { label: "Making a difference and helping people", value: "impact" },
      { label: "Career progression and learning", value: "growth" },
      { label: "Job security and stability", value: "stability" },
    ],
  },
  {
    id: "leadership",
    section: "What matters to you",
    question: "How do you see yourself at work?",
    options: [
      { label: "I like to lead and take charge", value: "leader" },
      { label: "I prefer to support and collaborate", value: "supporter" },
      { label: "I like to work independently and deliver results", value: "independent" },
    ],
  },
]

interface CareerMatch {
  title: string
  salary: string
  why: string
  match: number
}

function getResults(answers: Record<string, string>): CareerMatch[] {
  const careers: CareerMatch[] = []

  const q = answers.qualification
  const f = answers.field
  const e = answers.experience
  const p = answers.people
  const t = answers.type
  const env = answers.environment
  const pace = answers.pace
  const pri = answers.priority
  const lead = answers.leadership

  const hasExp = e !== "0"
  const seniorExp = ["5", "10", "10+"].includes(e)
  const juniorExp = ["0", "1"].includes(e)
  const highQual = ["degree", "masters"].includes(q)
  const anyQual = q !== "none"

  // Score each career based on answers
  const all: { career: CareerMatch; score: number }[] = [
    {
      score: (t === "organising" ? 3 : 0) + (p === "mix" || p === "people" ? 2 : 0) + (f === "business" ? 2 : 0) + (pace === "steady" ? 1 : 0) + (anyQual ? 1 : 0),
      career: { title: "Office Manager", salary: "£28,000 – £40,000", why: "You like organising, working with people, and keeping things running smoothly.", match: 0 },
    },
    {
      score: (t === "helping" ? 3 : 0) + (p === "people" ? 3 : 0) + (f === "healthcare" ? 3 : 0) + (pri === "impact" ? 2 : 0),
      career: { title: "Social Worker / Care Coordinator", salary: "£26,000 – £38,000", why: "You're driven by helping people and making a real difference in their lives.", match: 0 },
    },
    {
      score: (t === "selling" ? 3 : 0) + (p === "people" ? 2 : 0) + (pace === "fast" ? 2 : 0) + (f === "business" ? 1 : 0) + (pri === "salary" ? 2 : 0),
      career: { title: "Recruitment Consultant", salary: "£25,000 – £50,000+", why: "You're great with people, enjoy fast pace, and are motivated by results and earnings.", match: 0 },
    },
    {
      score: (t === "analytical" ? 3 : 0) + (p === "solo" || p === "mix" ? 2 : 0) + (f === "tech" || f === "science" || f === "business" ? 2 : 0) + (highQual ? 2 : 0),
      career: { title: "Data Analyst", salary: "£30,000 – £55,000", why: "You enjoy working with information, spotting patterns, and solving problems independently.", match: 0 },
    },
    {
      score: (t === "building" ? 3 : 0) + (f === "tech" ? 3 : 0) + (p === "solo" || p === "mix" ? 2 : 0) + (env === "remote" ? 2 : 0) + (pri === "salary" || pri === "growth" ? 1 : 0),
      career: { title: "Software Developer", salary: "£35,000 – £75,000+", why: "You enjoy building things, problem-solving, and working independently — tech is a great fit.", match: 0 },
    },
    {
      score: (t === "building" ? 2 : 0) + (f === "creative" || f === "tech" ? 2 : 0) + (t === "analytical" ? 1 : 0) + (p === "mix" ? 1 : 0) + (anyQual ? 1 : 0),
      career: { title: "UX / Product Designer", salary: "£32,000 – £60,000", why: "You blend creativity with structure, care about how things feel to use, and like collaborative work.", match: 0 },
    },
    {
      score: (t === "helping" ? 2 : 0) + (f === "education" ? 3 : 0) + (p === "people" ? 2 : 0) + (pri === "impact" ? 2 : 0) + (highQual ? 1 : 0),
      career: { title: "Teacher / Trainer", salary: "£28,000 – £45,000", why: "You care about helping people grow and learn — and you have the patience and communication skills to do it.", match: 0 },
    },
    {
      score: (t === "organising" ? 2 : 0) + (lead === "leader" ? 3 : 0) + (seniorExp ? 2 : 0) + (pace === "fast" ? 1 : 0) + (pri === "growth" || pri === "salary" ? 1 : 0),
      career: { title: "Project Manager", salary: "£35,000 – £65,000", why: "You're a natural organiser and leader — you thrive when coordinating teams and delivering results.", match: 0 },
    },
    {
      score: (t === "helping" ? 3 : 0) + (f === "healthcare" ? 2 : 0) + (p === "people" ? 2 : 0) + (env === "office" || env === "any" ? 1 : 0) + (pri === "stability" ? 1 : 0),
      career: { title: "HR Administrator / HR Assistant", salary: "£24,000 – £35,000", why: "You enjoy supporting people and keeping things organised — HR is a natural fit.", match: 0 },
    },
    {
      score: (t === "selling" ? 3 : 0) + (p === "people" ? 2 : 0) + (pri === "salary" ? 2 : 0) + (pace === "fast" ? 2 : 0) + (f === "business" ? 1 : 0),
      career: { title: "Sales Executive / Account Manager", salary: "£25,000 – £55,000+", why: "You love connecting with people, are motivated by targets, and enjoy the energy of sales.", match: 0 },
    },
    {
      score: (t === "building" ? 2 : 0) + (f === "creative" ? 3 : 0) + (env === "remote" ? 1 : 0) + (p === "solo" || p === "mix" ? 1 : 0),
      career: { title: "Graphic Designer / Content Creator", salary: "£22,000 – £45,000", why: "You're creative and expressive — you love making things look and feel great.", match: 0 },
    },
    {
      score: (t === "analytical" ? 2 : 0) + (f === "business" || f === "science" ? 2 : 0) + (highQual ? 2 : 0) + (pri === "salary" ? 2 : 0) + (pace === "steady" ? 1 : 0),
      career: { title: "Financial Analyst / Accountant", salary: "£30,000 – £60,000", why: "You're detail-oriented, enjoy working with numbers, and value financial security.", match: 0 },
    },
    {
      score: (env === "outdoors" ? 4 : 0) + (t === "building" ? 2 : 0) + (pace === "fast" ? 1 : 0) + (p === "mix" || p === "solo" ? 1 : 0),
      career: { title: "Trades / Construction / Engineering", salary: "£28,000 – £55,000", why: "You prefer working with your hands outdoors, and value practical skills over desk work.", match: 0 },
    },
    {
      score: (t === "helping" ? 2 : 0) + (f === "healthcare" ? 3 : 0) + (p === "people" ? 3 : 0) + (pri === "impact" ? 2 : 0) + (anyQual ? 1 : 0),
      career: { title: "Healthcare Assistant / NHS Support", salary: "£22,000 – £30,000", why: "You care deeply about others and want to make a direct difference in people's health and wellbeing.", match: 0 },
    },
    {
      score: (t === "organising" ? 2 : 0) + (f === "business" ? 1 : 0) + (juniorExp ? 1 : 0) + (pace === "steady" ? 1 : 0) + (p === "mix" ? 1 : 0),
      career: { title: "Administrator / Executive Assistant", salary: "£22,000 – £35,000", why: "You're reliable, organised, and enjoy keeping things running behind the scenes.", match: 0 },
    },
  ]

  // Sort by score and take top 3
  all.sort((a, b) => b.score - a.score)
  const top = all.slice(0, 3)
  const maxScore = top[0].score

  top.forEach((item, i) => {
    const pct = maxScore > 0 ? Math.round((item.score / maxScore) * 100) : 70
    careers.push({ ...item.career, match: i === 0 ? Math.min(pct, 97) : Math.max(pct - (i * 8), 60) })
  })

  return careers
}

export default function CareerQuizPage() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [results, setResults] = useState<CareerMatch[] | null>(null)

  const q = questions[current]
  const progress = ((current) / questions.length) * 100

  const handleSelect = (value: string) => setSelected(value)

  const handleNext = () => {
    if (!selected) return
    const newAnswers = { ...answers, [q.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)
    if (current + 1 >= questions.length) {
      setResults(getResults(newAnswers))
    } else {
      setCurrent(c => c + 1)
    }
  }

  const restart = () => {
    setCurrent(0)
    setAnswers({})
    setSelected(null)
    setResults(null)
  }

  if (results) {
    return (
      <div className="min-h-screen bg-[#050816] text-white">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="mb-8 flex justify-center">
            <Image src="/logo.png" alt="HireFlow" width={40} height={40} className="rounded-xl" />
          </div>

          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
              🎯 Your career matches
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">Here are your top career matches</h1>
            <p className="mt-3 text-white/50">Based on your qualifications, experience, and work preferences.</p>
          </div>

          <div className="space-y-5 mb-10">
            {results.map((r, i) => (
              <div key={r.title} className={`rounded-2xl border p-6 ${i === 0 ? "border-cyan-500/30 bg-cyan-500/5" : "border-white/10 bg-white/4"}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    {i === 0 && <p className="text-xs text-cyan-400 font-semibold mb-1">⭐ Best match</p>}
                    <h2 className="text-xl font-bold text-white">{r.title}</h2>
                    <p className="text-sm text-white/40 mt-0.5">{r.salary} / year</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold" style={{ color: i === 0 ? "#06b6d4" : "#fff" }}>{r.match}%</p>
                    <p className="text-xs text-white/30">match</p>
                  </div>
                </div>
                {/* Match bar */}
                <div className="mb-3 h-1.5 w-full rounded-full bg-white/10">
                  <div className="h-full rounded-full transition-all" style={{ width: `${r.match}%`, backgroundColor: i === 0 ? "#06b6d4" : "#8b5cf6" }} />
                </div>
                <p className="text-sm text-white/60 leading-6">{r.why}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 mb-6 text-center">
            <p className="font-semibold text-white mb-1">Want help landing one of these roles?</p>
            <p className="text-sm text-white/50 mb-4">HireFlow helps you tailor your CV, practise interviews with AI, and track every application.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup"
                style={{ backgroundColor: "#06b6d4", color: "#000" }}
                className="rounded-xl px-6 py-3 text-sm font-bold transition hover:opacity-90">
                Start applying free →
              </Link>
              <Link href="/premium"
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20">
                Get expert career coaching
              </Link>
            </div>
          </div>

          <div className="text-center">
            <button onClick={restart} className="text-sm text-white/30 hover:text-white transition">
              ↩ Retake the quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-xl px-6 py-16">

        <div className="mb-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="HireFlow" width={32} height={32} className="rounded-md" />
            <span className="font-semibold text-sm">HireFlow</span>
          </Link>
          <span className="text-xs text-white/30">{current + 1} / {questions.length}</span>
        </div>

        {/* Progress bar */}
        <div className="mb-8 h-1.5 w-full rounded-full bg-white/10">
          <div className="h-full rounded-full bg-cyan-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        {/* Section label */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/30">{q.section}</p>
        <h2 className="mb-6 text-2xl font-bold leading-snug">{q.question}</h2>

        <div className="space-y-3">
          {q.options.map(opt => (
            <button key={opt.value} onClick={() => handleSelect(opt.value)}
              className={`w-full rounded-xl border px-5 py-4 text-left text-sm font-medium transition ${
                selected === opt.value
                  ? "border-cyan-500 bg-cyan-500/10 text-white"
                  : "border-white/10 bg-white/4 text-white/70 hover:border-white/30 hover:text-white"
              }`}>
              {opt.label}
            </button>
          ))}
        </div>

        <button onClick={handleNext} disabled={!selected}
          style={{ backgroundColor: selected ? "#06b6d4" : undefined, color: selected ? "#000" : undefined }}
          className={`mt-8 w-full rounded-xl py-3.5 text-sm font-bold transition ${
            selected ? "hover:opacity-90" : "border border-white/10 text-white/20 cursor-not-allowed"
          }`}>
          {current + 1 === questions.length ? "See my results →" : "Next →"}
        </button>

      </div>
    </div>
  )
}
