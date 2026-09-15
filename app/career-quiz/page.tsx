"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import BrandLogo from "@/components/brand-logo"

const QuizClient = dynamic(() => import("./quiz-client"), {
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-[#050816]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
        <p className="text-xs text-white/30">Loading quiz…</p>
      </div>
    </div>
  ),
  ssr: false,
})

export default function CareerQuizPage() {
  const [started, setStarted] = useState(false)

  if (started) {
    return <QuizClient autoStart={true} />
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="flex flex-col items-center text-center">
          <BrandLogo className="mb-6 flex items-center gap-3" textClassName="font-semibold text-sm" />

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
            🧭 Free Career Match Quiz
          </div>

          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            Not sure what career<br />is right for you?
          </h1>
          <p className="mt-3 text-base text-white/60 leading-7 max-w-sm">
            Answer 7 quick questions and get your <strong className="text-white">top 3 career matches</strong> — with real UK salary ranges.
          </p>

          {/* Social proof */}
          <div className="mt-5 flex items-center gap-2">
            <div className="flex -space-x-2">
              {["J","S","M","A","R"].map(l => (
                <div key={l} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#050816] bg-cyan-500/20 text-xs font-semibold text-cyan-300">{l}</div>
              ))}
            </div>
            <p className="text-xs text-white/40"><span className="text-white font-semibold">242 people</span> took this quiz this month</p>
          </div>

          <button
            onClick={() => setStarted(true)}
            style={{ backgroundColor: "#06b6d4", color: "#000" }}
            className="mt-6 w-full rounded-xl py-4 text-lg font-bold transition hover:opacity-90 shadow-lg shadow-cyan-500/20">
            Find my career match →
          </button>
          <p className="mt-3 text-xs text-white/25">Free · Takes 2 minutes · Enter your email to unlock results</p>

          {/* Social links */}
          <div className="mt-5 flex items-center justify-center gap-4">
            <a href="https://www.instagram.com/hire_flowapp" target="_blank" rel="noreferrer noopener" className="text-white/30 hover:text-white transition" aria-label="Instagram">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61591738826836" target="_blank" rel="noreferrer noopener" className="text-white/30 hover:text-white transition" aria-label="Facebook">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@hireflow26" target="_blank" rel="noreferrer noopener" className="text-white/30 hover:text-white transition" aria-label="TikTok">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/elena-rahimi-34b618404" target="_blank" rel="noreferrer noopener" className="text-white/30 hover:text-white transition" aria-label="LinkedIn">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://www.pinterest.com/user_olhle0656" target="_blank" rel="noreferrer noopener" className="text-white/30 hover:text-white transition" aria-label="Pinterest">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-3 gap-3 w-full">
            {[
              { icon: "⏱️", label: "2 minutes" },
              { icon: "💰", label: "Real UK salaries" },
              { icon: "🎯", label: "Top 3 matches" },
            ].map(b => (
              <div key={b.label} className="rounded-xl border border-white/8 bg-white/3 py-3 px-2">
                <p className="text-lg mb-1">{b.icon}</p>
                <p className="text-xs text-white/40">{b.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
