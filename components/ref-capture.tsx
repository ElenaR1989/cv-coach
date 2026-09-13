"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

/**
 * Captures ?ref= from any page URL and stores it in localStorage + cookie.
 * Place this in the root layout so it runs on every page.
 */
export default function RefCapture() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get("ref")
    if (ref && ref.trim()) {
      const clean = ref.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "")
      if (clean) {
        localStorage.setItem("hf_affiliate_ref", clean)
        // Also set a cookie so server-side code can read it
        document.cookie = `hf_affiliate_ref=${clean}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
        // Track the click
        fetch("/api/referral/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ref: clean }),
        }).catch(() => {})
      }
    }
  }, [searchParams])

  return null
}
