"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function updateCVAction(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const cvId = String(formData.get("cvId") || "").trim()

  if (!cvId) {
    throw new Error("CV id is required")
  }

  const title = String(formData.get("title") || "").trim()
  const full_name = String(formData.get("full_name") || "").trim()
  const summary = String(formData.get("summary") || "").trim()
  const email = String(formData.get("email") || "").trim()
  const phone = String(formData.get("phone") || "").trim()
  const location = String(formData.get("location") || "").trim()
  const website = String(formData.get("website") || "").trim()
  const linkedin = String(formData.get("linkedin") || "").trim()
  const github = String(formData.get("github") || "").trim()
  const skills = String(formData.get("skills") || "").trim()

  const experience: Array<{
    title: string
    company: string
    dates: string
    description: string
  }> = []

  let expIndex = 0
  while (
    formData.has(`exp_title_${expIndex}`) ||
    formData.has(`exp_company_${expIndex}`) ||
    formData.has(`exp_dates_${expIndex}`) ||
    formData.has(`exp_desc_${expIndex}`)
  ) {
    const expTitle = String(formData.get(`exp_title_${expIndex}`) || "").trim()
    const expCompany = String(formData.get(`exp_company_${expIndex}`) || "").trim()
    const expDates = String(formData.get(`exp_dates_${expIndex}`) || "").trim()
    const expDesc = String(formData.get(`exp_desc_${expIndex}`) || "").trim()

    if (expTitle || expCompany || expDates || expDesc) {
      experience.push({
        title: expTitle,
        company: expCompany,
        dates: expDates,
        description: expDesc,
      })
    }

    expIndex += 1
  }

  const education_entries: Array<{
    school: string
    qualification: string
    dates: string
    description: string
  }> = []

  let eduIndex = 0
  while (
    formData.has(`edu_school_${eduIndex}`) ||
    formData.has(`edu_qualification_${eduIndex}`) ||
    formData.has(`edu_dates_${eduIndex}`) ||
    formData.has(`edu_desc_${eduIndex}`)
  ) {
    const eduSchool = String(formData.get(`edu_school_${eduIndex}`) || "").trim()
    const eduQualification = String(
      formData.get(`edu_qualification_${eduIndex}`) || ""
    ).trim()
    const eduDates = String(formData.get(`edu_dates_${eduIndex}`) || "").trim()
    const eduDesc = String(formData.get(`edu_desc_${eduIndex}`) || "").trim()

    if (eduSchool || eduQualification || eduDates || eduDesc) {
      education_entries.push({
        school: eduSchool,
        qualification: eduQualification,
        dates: eduDates,
        description: eduDesc,
      })
    }

    eduIndex += 1
  }

  const education =
    education_entries.length > 0
      ? education_entries
          .map((item) =>
            [item.qualification, item.school, item.dates]
              .filter(Boolean)
              .join(" - ")
          )
          .join(", ")
      : null

  console.log("Updating CV:", {
    cvId,
    userId: user.id,
    title,
    full_name,
    experience,
    education_entries,
  })

  const { data, error } = await supabase
    .from("cv_profiles")
    .update({
      title: title || null,
      full_name: full_name || null,
      summary: summary || null,
      email: email || null,
      phone: phone || null,
      location: location || null,
      website: website || null,
      linkedin: linkedin || null,
      github: github || null,
      skills: skills || null,
      experience,
      education,
      education_entries,
    })
    .eq("id", cvId)
    .eq("user_id", user.id)
    .select()

  console.log("Supabase result data:", data)
  console.log("Supabase result error:", error)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/cvs")
  revalidatePath(`/dashboard/cvs/${cvId}`)
  revalidatePath(`/dashboard/cvs/${cvId}/edit`)
  revalidatePath(`/dashboard/cvs/${cvId}/cover-letter`)

  redirect(`/dashboard/cvs/${cvId}/edit`)
}