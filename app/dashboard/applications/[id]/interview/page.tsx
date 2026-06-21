import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getIsPro } from "@/lib/billing/is-pro"
import InterviewClient from "./interview-client"

type Props = {
  params: Promise<{ id: string }>
}

export default async function InterviewPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro, plan")
    .eq("id", user.id)
    .single()

  const { data: job } = await supabase
    .from("job_applications")
    .select("id, role, company, job_description")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!job) notFound()

  // Check monthly usage for free users
  let usedThisMonth = 0
  if (!getIsPro(profile)) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from("practice_interviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString())

    usedThisMonth = count ?? 0
  }

  return (
    <InterviewClient
      applicationId={id}
      role={job.role}
      company={job.company}
      jobDescription={job.job_description ?? ""}
      isPro={getIsPro(profile)}
      usedThisMonth={usedThisMonth}
    />
  )
}
