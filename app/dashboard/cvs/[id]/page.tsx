import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CVPreview from "./cv-preview"

type CVPageProps = {
  params: {
    id: string
  }
  searchParams: {
    applicationId?: string
  }
}

export default async function CVPage({ params, searchParams }: CVPageProps) {
  const { id } = params
  const { applicationId } = searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: cv, error: cvError } = await supabase
    .from("cv_profiles")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (cvError || !cv) {
    notFound()
  }

  let cvToShow = cv
  let application = null

  if (applicationId) {
    const { data } = await supabase
      .from("job_applications")
      .select("id, company, role, tailored_cv")
      .eq("id", applicationId)
      .eq("user_id", user.id)
      .single()

    application = data

    if (application?.tailored_cv?.trim()) {
      cvToShow = {
        ...cv,
        summary: application.tailored_cv,
      }
    }
  }

  return (
    <CVPreview
      cv={cvToShow}
      applicationId={applicationId}
      application={application}
    />
  )
}