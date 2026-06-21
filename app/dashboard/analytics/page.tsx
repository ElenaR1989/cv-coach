import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import AnalyticsClient from "./analytics-client"
import ReferralWidget from "@/components/referral-widget"

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: jobs } = await supabase
    .from("job_applications")
    .select("id, job_title, company, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  const { data: interviews } = await supabase
    .from("practice_interviews")
    .select("id, created_at, report")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const safeJobs = jobs ?? []
  const safeInterviews = interviews ?? []

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Analytics</h1>
          <p className="mt-1 text-sm text-white/40">Your personal job search performance</p>
        </div>
        <Link href="/dashboard" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:text-white">
          ← Dashboard
        </Link>
      </div>
      <AnalyticsClient jobs={safeJobs} interviews={safeInterviews} />
      <ReferralWidget />
    </div>
  )
}
