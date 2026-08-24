"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

export default function ReferralCTA() {
  const searchParams = useSearchParams()
  const [ref, setRef] = useState<string | null>(null)

  useEffect(() => {
    // Read ref from URL or localStorage (persists if they browse around)
    const urlRef = searchParams.get("ref")
    if (urlRef) {
      localStorage.setItem("hf_ref", urlRef)
      setRef(urlRef)
      // Log the click
      fetch("/api/referral/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: urlRef }),
      }).catch(() => {})
    } else {
      const stored = localStorage.getItem("hf_ref")
      if (stored) setRef(stored)
    }
  }, [searchParams])

  const subject = encodeURIComponent("Premium Package - Free Discovery Call")
  const body = ref
    ? encodeURIComponent(`Hi Elena,\n\nI'd like to book a free discovery call about the Premium package.\n\n(Referred by: ${ref})`)
    : encodeURIComponent(`Hi Elena,\n\nI'd like to book a free discovery call about the Premium package.`)

  const mailto = `mailto:hello@hire-flow.app?subject=${subject}&body=${body}`

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <a href={mailto}
        style={{ backgroundColor: "#f59e0b", color: "#000" }}
        className="rounded-xl px-8 py-4 text-sm font-bold transition hover:opacity-90">
        Book a free discovery call →
      </a>
      <div className="text-center">
        <p className="text-2xl font-bold text-white">£500</p>
        <p className="text-xs text-white/40">one-time payment</p>
      </div>
    </div>
  )
}
