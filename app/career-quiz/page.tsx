"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
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

interface QualRoute {
  icon: string
  name: string
  detail: string
  url: string
}

const qualRoutes: Record<string, QualRoute[]> = {
  "Project Manager": [
    { icon: "📜", name: "PRINCE2 Foundation", detail: "Online certification from ~£200 — widely recognised by UK employers", url: "https://www.axelos.com/certifications/propath/prince2-project-management" },
    { icon: "🎓", name: "Open University — Business Degree", detail: "Part-time, study from home, from £6,000/year with Student Finance available", url: "https://www.open.ac.uk/courses/business-management" },
    { icon: "🏫", name: "Local College — HNC in Business", detail: "Level 4 qualification, often 1 year part-time, funded options available", url: "https://nationalcareers.service.gov.uk/find-a-course" },
  ],
  "Data Analyst": [
    { icon: "💻", name: "Google Data Analytics Certificate", detail: "Online via Coursera, ~6 months, ~£200 total — highly recognised", url: "https://www.coursera.org/google-certificates/data-analytics-certificate" },
    { icon: "🎓", name: "Open University — Computing & IT", detail: "Part-time degree, Student Finance available, study from home", url: "https://www.open.ac.uk/courses/computing-and-it" },
    { icon: "📊", name: "Microsoft Power BI Certification", detail: "Online, self-paced, from £100 — in high demand by UK employers", url: "https://learn.microsoft.com/en-us/certifications/power-bi-data-analyst-associate/" },
  ],
  "Software Developer": [
    { icon: "💻", name: "Codecademy / freeCodeCamp", detail: "Free online coding courses — start with Python or JavaScript", url: "https://www.freecodecamp.org" },
    { icon: "🎓", name: "Open University — Software Engineering", detail: "Accredited degree, part-time, Student Finance available", url: "https://www.open.ac.uk/courses/computing-and-it/degrees/bsc-computing-software-q62" },
    { icon: "🏫", name: "Apprenticeship — Software Developer", detail: "Earn while you learn — paid role with full training, no degree needed", url: "https://www.findapprenticeship.service.gov.uk" },
  ],
  "Teacher / Trainer": [
    { icon: "📜", name: "PGCE — Postgraduate Certificate in Education", detail: "1-year qualification, salaried school direct routes available", url: "https://www.gov.uk/become-teacher" },
    { icon: "🏫", name: "Level 3 Award in Education & Training", detail: "Entry-level teaching qualification, available at most colleges", url: "https://nationalcareers.service.gov.uk/find-a-course" },
    { icon: "🎓", name: "Open University — Education Studies", detail: "Flexible degree for aspiring teachers, Student Finance available", url: "https://www.open.ac.uk/courses/education" },
  ],
  "Social Worker / Care Coordinator": [
    { icon: "🎓", name: "BA Social Work Degree", detail: "Required to become a qualified social worker — 3 years full-time or part-time options", url: "https://www.ucas.com/explore/subjects/social-work" },
    { icon: "📜", name: "Level 3 Diploma in Health & Social Care", detail: "Entry route into care roles, available at colleges and online", url: "https://nationalcareers.service.gov.uk/find-a-course" },
    { icon: "🏫", name: "Apprenticeship — Social Care", detail: "Work in care while studying — paid and funded by employer", url: "https://www.findapprenticeship.service.gov.uk" },
  ],
  "HR Administrator / HR Assistant": [
    { icon: "📜", name: "CIPD Level 3 Foundation Certificate", detail: "The standard HR qualification — available online from ~£1,500", url: "https://www.cipd.org/en/qualifications/hr-qualifications/" },
    { icon: "🏫", name: "Local College — Business Admin Level 3", detail: "Broad business qualification, often funded or low cost", url: "https://nationalcareers.service.gov.uk/find-a-course" },
    { icon: "🎓", name: "Open University — Business & Management", detail: "Flexible degree with HR modules, Student Finance available", url: "https://www.open.ac.uk/courses/business-management" },
  ],
  "Financial Analyst / Accountant": [
    { icon: "📜", name: "AAT Accounting Qualification", detail: "Industry-standard, levels 2–4, available online from ~£800", url: "https://www.aat.org.uk/qualifications" },
    { icon: "📜", name: "ACCA — Association of Chartered Certified Accountants", detail: "Globally recognised, can be done alongside work", url: "https://www.accaglobal.com/uk/en/qualifications.html" },
    { icon: "🎓", name: "Open University — Accounting & Finance Degree", detail: "Part-time, Student Finance available, study from home", url: "https://www.open.ac.uk/courses/accounting-finance" },
  ],
  "UX / Product Designer": [
    { icon: "💻", name: "Google UX Design Certificate", detail: "Online via Coursera, ~6 months, ~£200 — portfolio included", url: "https://www.coursera.org/google-certificates/ux-design-certificate" },
    { icon: "🎓", name: "Open University — Design & Innovation", detail: "Part-time degree, Student Finance available", url: "https://www.open.ac.uk/courses/design-innovation" },
    { icon: "🏫", name: "Short course — Figma & UX Fundamentals", detail: "Online, self-paced, many free options on YouTube and Udemy", url: "https://www.udemy.com/topic/ux-design/" },
  ],
  "default": [
    { icon: "🎓", name: "Open University", detail: "Study a degree from home, part-time, with Student Finance available", url: "https://www.open.ac.uk" },
    { icon: "🏫", name: "National Careers Service — Find a Course", detail: "Free UK tool to find funded courses and qualifications near you", url: "https://nationalcareers.service.gov.uk/find-a-course" },
    { icon: "🏫", name: "Find an Apprenticeship", detail: "Earn while you learn — government-funded, no prior qualifications needed", url: "https://www.findapprenticeship.service.gov.uk" },
  ],
}

function getQualRoutes(topCareer: string, qual: string): QualRoute[] | null {
  // If they already have a degree or masters, don't show this section
  if (qual === "degree" || qual === "masters") return null
  return qualRoutes[topCareer] || qualRoutes["default"]
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
  const [finalAnswers, setFinalAnswers] = useState<Record<string, string>>({})
  const [unlocked, setUnlocked] = useState(false)

  // On mount: restore saved answers and check if user is already logged in
  useEffect(() => {
    const saved = sessionStorage.getItem("quiz_answers")
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Record<string, string>
        if (Object.keys(parsed).length === questions.length) {
          // All answers complete — restore results
          setFinalAnswers(parsed)
          setResults(getResults(parsed))
          sessionStorage.removeItem("quiz_answers")
        }
      } catch {}
    }
    // Check auth to auto-unlock
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUnlocked(true)
    })
  }, [])

  const q = questions[current]
  const progress = ((current) / questions.length) * 100

  const handleSelect = (value: string) => setSelected(value)

  const handleNext = () => {
    if (!selected) return
    const newAnswers = { ...answers, [q.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)
    if (current + 1 >= questions.length) {
      setFinalAnswers(newAnswers)
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
    sessionStorage.removeItem("quiz_answers")
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

          <div className="relative mb-10">
            <div className="space-y-5">
              {results.map((r, i) => (
                <div key={r.title} className={`rounded-2xl border p-6 transition-all ${i === 0 ? "border-cyan-500/30 bg-cyan-500/5" : "border-white/10 bg-white/4"} ${!unlocked && i > 0 ? "blur-sm select-none" : ""}`}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      {i === 0 && <p className="text-xs text-cyan-400 font-semibold mb-1">⭐ Best match</p>}
                      <h2 className="text-xl font-bold text-white">{!unlocked && i > 0 ? "████████████" : r.title}</h2>
                      <p className="text-sm text-white/40 mt-0.5">{!unlocked && i > 0 ? "£██,000 – £██,000" : `${r.salary} / year`}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-bold" style={{ color: i === 0 ? "#06b6d4" : "#fff" }}>{r.match}%</p>
                      <p className="text-xs text-white/30">match</p>
                    </div>
                  </div>
                  <div className="mb-3 h-1.5 w-full rounded-full bg-white/10">
                    <div className="h-full rounded-full transition-all" style={{ width: `${r.match}%`, backgroundColor: i === 0 ? "#06b6d4" : "#8b5cf6" }} />
                  </div>
                  <p className="text-sm text-white/60 leading-6">{!unlocked && i > 0 ? "██████ ███ ████ ████████ ████ ████████ ██ ████████ ████ ████." : r.why}</p>
                </div>
              ))}
            </div>

            {/* Unlock overlay */}
            {!unlocked && (
              <div className="absolute inset-0 flex items-end justify-center pb-4">
                <div className="mx-4 w-full max-w-md rounded-2xl border border-cyan-500/30 bg-[#050816]/95 backdrop-blur-md p-6 text-center shadow-2xl">
                  <div className="mb-2 text-2xl">🔒</div>
                  <h3 className="text-lg font-bold text-white mb-1">Your full results are ready</h3>
                  <p className="text-sm text-white/50 mb-5">
                    Create your free account to unlock all 3 career matches, salary ranges, qualification routes, and your personalised next steps.
                  </p>
                  <Link href={`/signup?next=/career-quiz`}
                    onClick={() => sessionStorage.setItem("quiz_answers", JSON.stringify(finalAnswers))}
                    style={{ backgroundColor: "#06b6d4", color: "#000" }}
                    className="block w-full rounded-xl py-3 text-sm font-bold mb-3 hover:opacity-90 transition">
                    Create free account to unlock →
                  </Link>
                  <Link href="/login?next=/career-quiz" onClick={() => sessionStorage.setItem("quiz_answers", JSON.stringify(finalAnswers))}
                    className="text-xs text-white/30 hover:text-white/60 transition underline">
                    I already have an account — sign in
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Qualification routes — only shown when unlocked */}
          {unlocked && results && (() => {
            const routes = getQualRoutes(results[0].title, finalAnswers.qualification)
            if (!routes) return null
            return (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 mb-6">
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400 mb-1">🎓 Missing qualifications?</p>
                  <h3 className="font-bold text-white text-lg">How to get there</h3>
                  <p className="text-sm text-white/50 mt-1">
                    If your top match requires qualifications you don&apos;t have yet, here are the best routes to get them — including free and funded options.
                  </p>
                </div>
                <div className="space-y-3">
                  {routes.map(r => (
                    <a key={r.name} href={r.url} target="_blank" rel="noreferrer"
                      className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/4 p-4 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition">
                      <span className="text-xl shrink-0">{r.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{r.name}</p>
                        <p className="text-xs text-white/50 mt-0.5">{r.detail}</p>
                      </div>
                      <span className="text-white/20 text-sm shrink-0">↗</span>
                    </a>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <p className="text-sm font-semibold text-emerald-300 mb-1">We can support you through this too</p>
                  <p className="text-xs text-white/50 mb-3">
                    Our Premium coaching package includes end-to-end support — choosing the right course, applying to university or college, applying for Student Finance, and understanding all your funding options. Elena handles the entire process with you, not just the advice.
                  </p>
                  <Link href="/premium" className="text-xs font-semibold text-emerald-300 hover:text-white transition">
                    Find out more about Premium coaching →
                  </Link>
                </div>
              </div>
            )
          })()}

          {unlocked && <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 mb-6 text-center">
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
          </div>}

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
