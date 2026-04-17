import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CVPreview from "@/app/dashboard/cvs/[id]/cv-preview"
import PrintTrigger from "./PrintTrigger"

type PageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    template?: string
    theme?: string
  }>
}

export default async function CvPrintPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const resolvedSearchParams = (await searchParams) ?? {}
  const { template, theme } = resolvedSearchParams

  const selectedTemplate = template ?? "classic"
  const selectedTheme = theme ?? "default"

  const supabase = await createClient()

  const { data: cv, error } = await supabase
    .from("cv_profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !cv) {
    notFound()
  }

  return (
    <div style={{ background: "white", padding: "20px" }}>
      <PrintTrigger />
      <CVPreview
        cv={cv}
        isPrint={true}
        template={selectedTemplate}
        theme={selectedTheme}
      />
    </div>
  )
}