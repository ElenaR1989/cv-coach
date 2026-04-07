"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function duplicateCV(formData: FormData) {
  const cvId = String(formData.get("cvId") || "").trim()

  if (!cvId) {
    throw new Error("CV id is required")
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: existingCV, error: fetchError } = await supabase
    .from("cv_profiles")
    .select(`
      title,
      full_name,
      summary,
      email,
      phone,
      location,
      website,
      linkedin,
      github,
      skills,
      experience,
      education,
      education_entries
    `)
    .eq("id", cvId)
    .eq("user_id", user.id)
    .single()

  if (fetchError || !existingCV) {
    throw new Error("Could not find CV to duplicate")
  }

  const newTitle = existingCV.title
    ? `${existingCV.title} Copy`
    : existingCV.full_name
      ? `${existingCV.full_name} Copy`
      : "Untitled CV Copy"

  const { error: insertError } = await supabase.from("cv_profiles").insert({
    user_id: user.id,
    title: newTitle,
    full_name: existingCV.full_name ?? null,
    summary: existingCV.summary ?? null,
    email: existingCV.email ?? null,
    phone: existingCV.phone ?? null,
    location: existingCV.location ?? null,
    website: existingCV.website ?? null,
    linkedin: existingCV.linkedin ?? null,
    github: existingCV.github ?? null,
    skills: existingCV.skills ?? null,
    experience: existingCV.experience ?? null,
    education: existingCV.education ?? null,
    education_entries: existingCV.education_entries ?? null,
  })

  if (insertError) {
    throw new Error(insertError.message)
  }

  revalidatePath("/dashboard/cvs")
}

export async function deleteCV(formData: FormData) {
  const cvId = String(formData.get("cvId") || "").trim()

  if (!cvId) {
    throw new Error("CV id is required")
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("cv_profiles")
    .delete()
    .eq("id", cvId)
    .eq("user_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/cvs")
}