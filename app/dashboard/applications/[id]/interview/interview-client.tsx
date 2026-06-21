"use client"

import { useState } from "react"
import Link from "next/link"

type Question = {
  question: string
  type: "behavioural" | "technical" | "situational" | "motivation"
  tip: string
}

type Feedback = {
  score: number
  feedback: string
  strengths: string[]
  improvements: string[]
}

type QA = {
  question: string
  answer: string
  score: number
  feedback: string
}

type Report = {
  overallScore: number
  summary: string
  topStrengths: string[]
  areasToImprove: string[]
  readyToInterview: boolean
  encouragement: string
}

type Stage = "intro" | "interview" | "report"

type Props = {
  applicationId: string
  role: string
  company: string
  jobDescription: string
  isPro: boolean
  usedThisMonth: number
}

const TYPE_COLOURS: Record<string, string> = {
  behavioural: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  technical: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  situational: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  motivation: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
}

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100
  const colour =
    score >= 8 ? "bg-emerald-500" : score >= 6 ? "bg-yellow-500" : "bg-red-500"
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${colour} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-sm font-semibold text-white">{score}/10</span>
    </div>
  )
}

export default function InterviewClient({
  applicationId,
  role,
  company,
  jobDescription,
  isPro,
  usedThisMonth,
}: Props) {
  const [stage, setStage] = useState<Stage>("intro")
  const [questions, setQuestions] = useState<Question[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answer, setAnswer] = useState("")
  const [feedbackMap, setFeedbackMap] = useState<Record<number, Feedback>>({})
  const [qaLog, setQaLog] = useState<QA[]>([])
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isBlocked = !isPro && usedThisMonth >= 1

  const startInterview = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/interview-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, role, company, jobDescription }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === "free_limit") {
          setError(data.message)
        } else {
          setError(data.error || "Failed to start interview")
        }
        return
      }
      setQuestions(data.questions)
      setSessionId(data.sessionId)
      setCurrentQ(0)
      setAnswer("")
      setFeedbackMap({})
      setQaLog([])
      setReport(null)
      setStage("interview")
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (!answer.trim()) return
    setLoading(true)
    try {
      const q = questions[currentQ]
      const res = await fetch("/api/interview-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q.question, answer, role, company }),
      })
      const fb: Feedback = await res.json()
      setFeedbackMap((prev) => ({ ...prev, [currentQ]: fb }))
      setQaLog((prev) => [
        ...prev,
        { question: q.question, answer, score: fb.score, feedback: fb.feedback },
      ])
    } finally {
      setLoading(false)
    }
  }

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((i) => i + 1)
      setAnswer("")
    }
  }

  const finishInterview = async () => {
    if (!isPro) {
      setStage("report")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/interview-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, qa: qaLog, role, company }),
      })
      const data = await res.json()
      setReport(data)
    } finally {
      setLoading(false)
      setStage("report")
    }
  }

  const currentFeedback = feedbackMap[currentQ]
  const allAnswered = qaLog.length === questions.length

  // ---- Intro ----
  if (stage === "intro") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Link href={`/dashboard/applications/${applicationId}`} className="mb-8 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white/70 transition">
          ← Back to application
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/4 p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            <div>
              <h1 className="text-xl font-bold text-white">AI Practice Interview</h1>
              <p className="text-sm text-white/45">{role} at {company}</p>
            </div>
          </div>

          <p className="mb-6 text-sm leading-7 text-white/65">
            The AI will generate 6 role-specific questions based on the job description.
            Answer each one, receive instant feedback and a score, then get a full performance report.
          </p>

          <ul className="mb-8 space-y-3">
            {[
              { icon: "🎯", text: "6 tailored questions (behavioural, technical, motivational)" },
              { icon: "⚡", text: "Instant per-answer feedback and score" },
              { icon: isPro ? "📊" : "🔒", text: isPro ? "Full scored report at the end" : "Full report — Pro only" },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm text-white/70">
                <span>{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>

          {!isPro && (
            <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${usedThisMonth >= 1
              ? "border-red-500/20 bg-red-500/10 text-red-300"
              : "border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
            }`}>
              {usedThisMonth >= 1
                ? <>You've used your free interview this month. <Link href="/pricing" className="underline font-medium">Upgrade to Pro</Link> for unlimited sessions + full reports.</>
                : "Free plan: 1 practice interview per month. Upgrade to Pro for unlimited + full scored report."
              }
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            onClick={startInterview}
            disabled={loading || isBlocked}
            style={{ backgroundColor: "#06b6d4", color: "#000" }}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Generating questions…" : "Start Practice Interview"}
          </button>
        </div>
      </div>
    )
  }

  // ---- Interview ----
  if (stage === "interview") {
    const q = questions[currentQ]
    if (!q) return <div className="mx-auto max-w-2xl px-4 py-12 text-white/50">Loading question…</div>
    const progress = Math.round(((currentQ + (currentFeedback ? 1 : 0)) / questions.length) * 100)

    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-white/45">
            <span>Question {currentQ + 1} of {questions.length}</span>
            <span>{progress}% complete</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question card */}
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/4 p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${TYPE_COLOURS[q.type] ?? TYPE_COLOURS.behavioural}`}>
              {q.type}
            </span>
          </div>
          <p className="mb-4 text-base font-medium leading-7 text-white">{q.question}</p>
          <p className="text-xs text-white/35 italic">💡 {q.tip}</p>
        </div>

        {/* Answer area */}
        {!currentFeedback ? (
          <div className="mb-4">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              placeholder="Type your answer here…"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/50 focus:bg-white/8 resize-none"
            />
            <button
              onClick={submitAnswer}
              disabled={loading || !answer.trim()}
              style={{ backgroundColor: "#ffffff", color: "#000" }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Scoring your answer…" : "Submit Answer"}
            </button>
          </div>
        ) : (
          <div className="mb-4 space-y-4">
            {/* Your answer */}
            <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3">
              <p className="mb-1 text-xs font-medium text-white/40 uppercase tracking-wide">Your answer</p>
              <p className="text-sm text-white/70 leading-6">{answer}</p>
            </div>

            {/* Feedback */}
            <div className="rounded-2xl border border-white/10 bg-white/4 p-5 space-y-4">
              <ScoreBar score={currentFeedback.score} />
              <p className="text-sm leading-6 text-white/75">{currentFeedback.feedback}</p>

              {currentFeedback.strengths?.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-emerald-400 uppercase tracking-wide">Strengths</p>
                  <ul className="space-y-1">
                    {currentFeedback.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-white/65 before:mr-2 before:content-['✓'] before:text-emerald-500">{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {currentFeedback.improvements?.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-yellow-400 uppercase tracking-wide">To improve</p>
                  <ul className="space-y-1">
                    {currentFeedback.improvements.map((s, i) => (
                      <li key={i} className="text-sm text-white/65 before:mr-2 before:content-['→'] before:text-yellow-500">{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Navigation */}
            {currentQ < questions.length - 1 ? (
              <button
                onClick={nextQuestion}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Next Question →
              </button>
            ) : (
              <button
                onClick={finishInterview}
                disabled={loading}
                style={{ backgroundColor: "#06b6d4", color: "#000" }}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Generating report…" : isPro ? "Get Full Report →" : "See Summary →"}
              </button>
            )}
          </div>
        )}

        {/* Skip to next if already answered */}
        {!currentFeedback && currentQ > 0 && (
          <p className="text-center text-xs text-white/25">Answer above to continue</p>
        )}
      </div>
    )
  }

  // ---- Report ----
  if (stage === "report") {
    const avgScore = qaLog.length
      ? Math.round((qaLog.reduce((s, q) => s + q.score, 0) / qaLog.length) * 10) / 10
      : 0

    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">{avgScore >= 7 ? "🎉" : avgScore >= 5 ? "💪" : "📚"}</div>
          <h1 className="text-2xl font-bold text-white">Interview Complete</h1>
          <p className="mt-1 text-sm text-white/45">{role} at {company}</p>
        </div>

        {/* Quick scores */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/4 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide">Your Scores</h2>
          {qaLog.map((item, i) => (
            <div key={i}>
              <p className="mb-1 text-xs text-white/45 truncate">Q{i + 1}: {item.question.slice(0, 60)}…</p>
              <ScoreBar score={item.score} />
            </div>
          ))}
          <div className="border-t border-white/8 pt-4">
            <p className="mb-1 text-xs font-semibold text-white/70 uppercase tracking-wide">Overall</p>
            <ScoreBar score={avgScore} />
          </div>
        </div>

        {/* Pro report */}
        {isPro && report ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
              <p className="mb-3 text-sm leading-7 text-white/75">{report.summary}</p>
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${report.readyToInterview ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"}`}>
                {report.readyToInterview ? "✓ Ready to interview" : "⚡ Keep practising"}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
              <p className="mb-3 text-sm font-semibold text-emerald-400 uppercase tracking-wide">Top Strengths</p>
              <ul className="space-y-2">
                {report.topStrengths?.map((s, i) => (
                  <li key={i} className="text-sm text-white/70 leading-6">✓ {s}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
              <p className="mb-3 text-sm font-semibold text-yellow-400 uppercase tracking-wide">Areas to Improve</p>
              <ul className="space-y-2">
                {report.areasToImprove?.map((s, i) => (
                  <li key={i} className="text-sm text-white/70 leading-6">→ {s}</li>
                ))}
              </ul>
            </div>

            {report.encouragement && (
              <div className="rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-5">
                <p className="text-sm text-cyan-300/80 italic">"{report.encouragement}"</p>
              </div>
            )}
          </div>
        ) : !isPro ? (
          <div className="rounded-2xl border border-white/10 bg-white/4 p-6 text-center">
            <p className="mb-2 text-sm font-semibold text-white">Want a full performance report?</p>
            <p className="mb-4 text-sm text-white/50">Upgrade to Pro for detailed strengths analysis, improvement tips, and readiness score.</p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-400"
            >
              Upgrade to Pro
            </Link>
          </div>
        ) : null}

        <div className="mt-8 flex gap-3">
          <Link
            href={`/dashboard/applications/${applicationId}`}
            className="flex-1 rounded-xl border border-white/15 py-3 text-center text-sm font-medium text-white/70 transition hover:border-white/25 hover:text-white"
          >
            Back to Application
          </Link>
          <button
            onClick={() => { setStage("intro"); setQuestions([]); setQaLog([]); setReport(null) }}
            className="flex-1 rounded-xl border border-cyan-500/30 bg-cyan-500/10 py-3 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
          >
            {isPro ? "Practice Again" : "Try Another Month"}
          </button>
        </div>
      </div>
    )
  }

  return null
}
