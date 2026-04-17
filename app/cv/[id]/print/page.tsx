import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CVPreview from "@/app/dashboard/cvs/[id]/cv-preview"
import PrintTrigger from "./PrintTrigger"

type PageProps = {
  params: { id: string }
}

export default async function CvPrintPage({ params }: PageProps) {
  const { id } = params
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
      <CVPreview cv={cv} isPrint={true} />
    </div>
  )
}