"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateUserRole(formData: FormData) {
  const supabase = await createClient()

  const userId = String(formData.get("userId") ?? "")
  const nextRole = String(formData.get("nextRole") ?? "")

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (myProfile?.role !== "admin") {
    throw new Error("Not authorized")
  }

  if (!userId || !["admin", "user"].includes(nextRole)) {
    throw new Error("Invalid form data")
  }

  if (user.id === userId && nextRole !== "admin") {
    throw new Error("You cannot remove your own admin access")
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: nextRole })
    .eq("id", userId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/admin")
}