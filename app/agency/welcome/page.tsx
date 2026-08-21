"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

function WelcomeContent() {
  const searchParams = useSearchParams()
  const agencyId = searchParams.get("id")
  const [copied, setCopied] = useState(false)
  const [agency, setAgency] = useState<{ name: string; slug: string; brand_color: string } | null>(null)

  useEffect(() => {
    if (!agencyId) return
    fetch("/api/agency/my")
      .then(r => r.json())
      .then(d => {
        const found = d.agencies?.find((a: { id: string }) => a.id === agencyId) || d.agencies?.[0]
        if (found) setAgency(found)
      })
  }, [agencyId])

  const inviteLink = agency ? `https://hire-flow.app/agency/${agency.slug}` : ""

  const copy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const steps = [
    {
      number: "1",
      title: "Share your invite link",
      desc: "Send it to candidates via email, WhatsApp, LinkedIn, or add it to your website.",
      colour: "#f59e0b",
    },
    {
      number: "2",
      title: "Candidates sign up",
      desc: "They create a free HireFlow account and are automatically linked to your agency.",
      colour: "#06b6d4",
    },
    {
      number: "3",
      title: "Track their progress",
      desc: "See how many applications each candidate sends, and how active they are.",
      colour: "#8b5cf6",
    },
  ]

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">

        <div className="mb-6 flex justify-center">
          <Image src="/logo.png" alt="HireFlow" width={48} height={48} className="rounded-xl" />
        </div>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
          🎉 You&apos;re all set!
        </div>

        <h1 className="text-3xl font-bold sm:text-4xl">
          {agency ? `Welcome, ${agency.name}!` : "Your platform is live!"}
        </h1>
        <p className="mt-3 text-white/50 text-lg">
          Your branded candidate platform is ready. Here&apos;s how to get started.
        </p>

        {agency && (
          <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <p className="mb-2 text-sm font-semibold text-amber-300">Your candidate invite link</p>
            <p className="mb-4 text-xs text-white/40">Share this — candidates who sign up via this link are automatically linked to your agency</p>
            <div className="flex items-center gap-3">
              <code className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 text-left truncate">
                {inviteLink}
              </code>
              <button onClick={copy}
                style={{ backgroundColor: "#f59e0b", color: "#000" }}
                className="rounded-xl px-4 py-3 text-sm font-bold whitespace-nowrap hover:opacity-90 transition">
                {copied ? "Copied! ✓" : "Copy link"}
              </button>
            </div>
          </div>
        )}

        <div className="mt-10 space-y-4 text-left">
          {steps.map(s => (
            <div key={s.number} className="flex gap-4 rounded-2xl border border-white/10 bg-white/4 p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-black"
                style={{ backgroundColor: s.colour }}>
                {s.number}
              </div>
              <div>
                <p className="font-semibold text-white">{s.title}</p>
                <p className="mt-1 text-sm text-white/50">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={agencyId ? `/agency/dashboard?id=${agencyId}` : "/agency/dashboard"}
            style={{ backgroundColor: "#06b6d4", color: "#000" }}
            className="rounded-xl px-6 py-3 text-sm font-bold hover:opacity-90 transition">
            Go to your dashboard →
          </Link>
          <a href={`mailto:hello@hire-flow.app?subject=HireFlow Agency - ${agency?.name || ""}`}
            className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-white/60 hover:text-white transition">
            💬 Talk to Elena
          </a>
        </div>

        <p className="mt-8 text-xs text-white/30">
          A welcome email has been sent to you. Reply any time if you need help.
        </p>

      </div>
    </div>
  )
}

export default function AgencyWelcomePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#050816] text-white/40">Loading…</div>}>
      <WelcomeContent />
    </Suspense>
  )
}
