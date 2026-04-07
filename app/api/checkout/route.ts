import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePriceId = process.env.STRIPE_PRICE_ID

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY in environment variables")
}

if (!stripePriceId) {
  throw new Error("Missing STRIPE_PRICE_ID in environment variables")
}

const stripe = new Stripe(stripeSecretKey)

export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

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
      success_url: "http://localhost:3000/dashboard?success=true",
      cancel_url: "http://localhost:3000/dashboard?canceled=true",
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