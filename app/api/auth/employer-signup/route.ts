import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: "Email and password are required" }, { status: 400 })

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role: "employer" } },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Also sign in immediately so the session cookie is set
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) return NextResponse.json({ error: signInError.message }, { status: 400 })

  return NextResponse.json({ user: data.user })
}
