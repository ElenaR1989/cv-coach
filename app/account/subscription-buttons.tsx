"use client"

import { useState } from "react"

type Props = {
  isPro: boolean
}

export default function AccountBillingButtons({ isPro }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleManageSubscription() {
    try {
      setLoading(true)
      setError("")

      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Could not open billing portal.")
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error("Manage subscription error:", err)
      setError("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  if (!isPro) {
    return (
      <a
        href="/pricing"
        className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
      >
        Upgrade to Pro
      </a>
    )
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleManageSubscription}
        disabled={loading}
        className="w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
      >
        {loading ? "Opening portal..." : "Manage subscription"}
      </button>

      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
    </div>
  )
}