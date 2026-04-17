import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

type CVPageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    applicationId?: string
  }>
}

export default async function CVPage({ params, searchParams }: CVPageProps) {
  const { id } = await params
  const resolvedSearchParams = (await searchParams) ?? {}
  const { applicationId } = resolvedSearchParams

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

  return (
    <div style={{ padding: "24px", background: "white", color: "black" }}>
      <h1>CV PAGE DEBUG</h1>
      <p>Route works.</p>
      <p>id: {id}</p>
      <p>cv.id: {cv.id}</p>
      <p>full_name: {cv.full_name ?? "none"}</p>
      <p>title: {cv.title ?? "none"}</p>
      <p>applicationId: {applicationId ?? "none"}</p>
    </div>
  )
}