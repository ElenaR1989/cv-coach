import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import EditCVForm from "@/components/edit-cv-form"
import { updateCVAction } from "../actions"

type ExperienceItem = {
  title?: string
  company?: string
  dates?: string
  description?: string
}

type EducationItem = {
  school?: string
  qualification?: string
  dates?: string
  description?: string
}

type PageProps = {
  params: Promise<{
    id: string
  }>
}

function parseExperience(value: unknown): ExperienceItem[] {
  if (Array.isArray(value)) {
    return value as ExperienceItem[]
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed as ExperienceItem[]
      }
    } catch {
      return []
    }
  }

  return []
}

function parseEducation(value: unknown): EducationItem[] {
  if (Array.isArray(value)) {
    return value as EducationItem[]
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed as EducationItem[]
      }
    } catch {
      return []
    }
  }

  return []
}

export default async function EditCVPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: cv, error } = await supabase
    .from("cv_profiles")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !cv) {
    notFound()
  }

  const parsedExperience = parseExperience(cv.experience)
  const parsedEducation = parseEducation(cv.education_entries)

  const safeExperience =
    parsedExperience.length > 0
      ? parsedExperience.map((item) => ({
          title: item.title ?? "",
          company: item.company ?? "",
          dates: item.dates ?? "",
          description: item.description ?? "",
        }))
      : []

  const safeEducation =
    parsedEducation.length > 0
      ? parsedEducation.map((item) => ({
          school: item.school ?? "",
          qualification: item.qualification ?? "",
          dates: item.dates ?? "",
          description: item.description ?? "",
        }))
      : []

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/cvs"
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Back to CVs
        </Link>

        <Link
          href={`/dashboard/cvs/${cv.id}`}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Preview CV
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Edit CV</h1>
        <p className="text-muted-foreground">Update your CV details</p>
      </div>

      <EditCVForm
        action={updateCVAction}
        cv={{
          id: cv.id,
          title: cv.title ?? "",
          full_name: cv.full_name ?? "",
          summary: cv.summary ?? "",
          email: cv.email ?? "",
          phone: cv.phone ?? "",
          location: cv.location ?? "",
          website: cv.website ?? "",
          linkedin: cv.linkedin ?? "",
          github: cv.github ?? "",
          skills: cv.skills ?? "",
          experience: safeExperience.map((item) => ({
            title: item.title,
            company: item.company,
            dates: item.dates,
            description: item.description,
          })),
          education_entries: safeEducation.map((item) => ({
            school: item.school,
            qualification: item.qualification,
            dates: item.dates,
            description: item.description,
          })),
        }}
      />
    </div>
  )
}