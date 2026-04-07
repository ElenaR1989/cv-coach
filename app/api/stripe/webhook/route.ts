import Stripe from "stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY in environment variables")
}

if (!stripeWebhookSecret) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET in environment variables")
}

const stripe = new Stripe(stripeSecretKey)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook signature verification failed"

    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      const userId =
        session.client_reference_id ||
        session.subscription_details?.metadata?.user_id ||
        null

      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id

      if (userId) {
        await supabase
  .from("profiles")
  .update({
    is_pro: true,
    plan: "pro", // 👈 ADD THIS
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
  })
  .eq("id", userId)

        if (error) {
          console.error("Supabase update error on checkout.session.completed:", error.message)
        }
      }
    }

    if (
      event.type === "customer.subscription.deleted" ||
      event.type === "customer.subscription.updated"
    ) {
      const subscription = event.data.object as Stripe.Subscription
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id

      const isActive =
        subscription.status === "active" || subscription.status === "trialing"

      const { error } = await supabase
        .from("profiles")
        .update({
          is_pro: isActive,
          stripe_customer_id: customerId ?? null,
          stripe_subscription_id: subscription.id,
        })
        .eq("stripe_customer_id", customerId)

      if (error) {
        console.error("Supabase update error on subscription event:", error.message)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook handler error:", error)

    const message =
      error instanceof Error ? error.message : "Unknown webhook error"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}