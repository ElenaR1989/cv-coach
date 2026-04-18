"use client"

import { useEffect } from "react"
import posthog from "posthog-js"

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    posthog.init("phc_m67rvmZoPrXkJ5BqqW9svJt3NASSNFedsfJ7hDj7da75", {
      api_host: "https://eu.posthog.com",
      capture_pageview: true,
      capture_pageleave: true,
      loaded: (ph) => {
        ph.capture("test_event")
      },
    })
  }, [])

  return <>{children}</>
}