import CVPreview from "@/app/dashboard/cvs/[id]/CVPreview"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function CvPrintPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: cv, error } = await supabase
    .from("cvs")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !cv) {
    notFound()
  }

  return (
    <div style={{ background: "white", padding: "20px" }}>
      <CVPreview
        cv={cv}
        applicationId=""
        application={null}
        isPrint={true}
      />
    </div>
  )
}