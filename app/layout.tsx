import type { Metadata } from "next"
import "./globals.css"
import PostHogProvider from "@/components/posthog-provider"
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: "CV Integration in Job Form",
  description: "Track applications and manage CVs",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="relative min-h-screen overflow-x-hidden bg-black text-white">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-500/30 blur-[120px]" />
          <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-purple-500/30 blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-emerald-500/20 blur-[100px]" />
        </div>

        <main>{children}</main>

        <Analytics />
      </body>
    </html>
  )
}