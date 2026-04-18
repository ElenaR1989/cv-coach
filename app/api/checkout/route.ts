import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

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
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const stripePriceId = process.env.STRIPE_PRICE_ID

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY" },
        { status: 500 }
      )
    }

    if (!stripePriceId) {
      return NextResponse.json(
        { error: "Missing STRIPE_PRICE_ID" },
        { status: 500 }
      )
    }

    const stripe = new Stripe(stripeSecretKey)

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const baseUrl = getBaseUrl(req)

  
    const price = await stripe.prices.retrieve(stripePriceId)
    

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
      metadata: {
        user_id: user.id,
      },
      success_url: `${baseUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard?canceled=true`,
    })

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe checkout URL was not created" },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)

    const message =
      error instanceof Error ? error.message : "Unknown Stripe error"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}