import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import JobForm from "@/components/job-form"

type EditJobPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: job, error } = await supabase
    .from("job_applications")
    .select("id, company, role, status, notes, interview_date, cv_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !job) {
    notFound()
  }

  return <JobForm initialData={job} />
}