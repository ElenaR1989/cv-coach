import Stripe from "stripe"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY in environment variables")
}

const stripe = new Stripe(stripeSecretKey)

function getBaseUrl(req: NextRequest) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL

  if (envUrl) return envUrl

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host")
  const protocol = req.headers.get("x-forwarded-proto") ?? "https"

  if (!host) {
    throw new Error("Could not determine app URL")
  }

  return `${protocol}://${host}`
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No Stripe customer found for this user." },
        { status: 400 }
      )
    }

    const baseUrl = getBaseUrl(req)

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${baseUrl}/account`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to open billing portal"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}