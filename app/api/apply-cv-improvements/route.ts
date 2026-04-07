import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

type ImprovedBullet = {
  before: string
  after: string
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const cvId = String(body.cvId || "").trim()
    const improvedBullets = Array.isArray(body.improvedBullets)
      ? (body.improvedBullets as ImprovedBullet[])
      : []

    if (!cvId) {
      return NextResponse.json({ error: "Missing CV id" }, { status: 400 })
    }

    if (improvedBullets.length === 0) {
      return NextResponse.json(
        { error: "No improved bullets provided" },
        { status: 400 }
      )
    }

    const { data: cv, error: fetchError } = await supabase
      .from("cv_profiles")
      .select("id, user_id, experience")
      .eq("id", cvId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !cv) {
      return NextResponse.json(
        { error: "CV not found" },
        { status: 404 }
      )
    }

    let experience: any[] = []

    if (Array.isArray(cv.experience)) {
      experience = cv.experience
    } else if (typeof cv.experience === "string" && cv.experience.trim()) {
      try {
        const parsed = JSON.parse(cv.experience)
        if (Array.isArray(parsed)) {
          experience = parsed
        }
      } catch {
        experience = []
      }
    }

    if (experience.length === 0) {
      return NextResponse.json(
        { error: "No experience section found in this CV" },
        { status: 400 }
      )
    }

    const improvedDescription = improvedBullets
      .map((item) => String(item.after || "").trim())
      .filter(Boolean)
      .join("\n")

    experience[0] = {
      ...experience[0],
      description: improvedDescription,
    }

    const { error: updateError } = await supabase
      .from("cv_profiles")
      .update({
        experience: JSON.stringify(experience),
      })
      .eq("id", cvId)
      .eq("user_id", user.id)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    revalidatePath(`/dashboard/cvs/${cvId}`)
    revalidatePath(`/dashboard/cvs/${cvId}/edit`)

    return NextResponse.json({
      success: true,
      message: "CV updated successfully",
    })
  } catch (error: any) {
    console.error("Apply CV improvements error:", error)
    return NextResponse.json(
      {
        error: error?.message || "Failed to apply improvements",
      },
      { status: 500 }
    )
  }
}