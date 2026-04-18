import Stripe from "stripe"
import { NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY in environment variables")
}

if (!stripeWebhookSecret) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET in environment variables")
}

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in environment variables")
}

if (!supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in environment variables")
}

const stripe = new Stripe(stripeSecretKey)
const supabase = createSupabaseClient(supabaseUrl, supabaseServiceRoleKey)

async function upgradeUserById(params: {
  userId: string
  customerId?: string | null
  subscriptionId?: string | null
}) {
  const { userId, customerId = null, subscriptionId = null } = params

  const { error } = await supabase
    .from("profiles")
    .update({
      is_pro: true,
      plan: "pro",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
    })
    .eq("id", userId)

  if (error) {
    console.error("Failed to upgrade user:", error)
  } else {
    console.log("User upgraded to Pro:", userId)
  }
}

async function updateUserByCustomerId(params: {
  customerId: string
  isActive: boolean
  subscriptionId?: string | null
}) {
  const { customerId, isActive, subscriptionId = null } = params

  const { error } = await supabase
    .from("profiles")
    .update({
      is_pro: isActive,
      plan: isActive ? "pro" : "free",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
    })
    .eq("stripe_customer_id", customerId)

  if (error) {
    console.error("Failed to update user by customer id:", error)
  } else {
    console.log(
      `Customer ${customerId} updated. Active: ${isActive ? "yes" : "no"}`
    )
  }
}

export async function POST(req: Request) {
  console.log("WEBHOOK HIT")

  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    console.error("Missing Stripe signature")
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      stripeWebhookSecret
    )
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Webhook signature verification failed"

    console.error("Webhook signature error:", message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    console.log("Stripe event type:", event.type)

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      const userId =
        session.client_reference_id ||
        session.metadata?.user_id ||
        session.metadata?.userId ||
        null

      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id ?? null

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null

      console.log("checkout.session.completed")
      console.log("resolved userId:", userId)
      console.log("customerId:", customerId)
      console.log("subscriptionId:", subscriptionId)

      if (userId) {
        await upgradeUserById({
          userId,
          customerId,
          subscriptionId,
        })
      } else {
        console.error("No userId found in checkout session")
      }
    }

    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice

      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id ?? null

      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id ?? null

      console.log("invoice.payment_succeeded")
      console.log("customerId:", customerId)
      console.log("subscriptionId:", subscriptionId)

      if (customerId) {
        await updateUserByCustomerId({
          customerId,
          isActive: true,
          subscriptionId,
        })
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id

      const isActive =
        subscription.status === "active" ||
        subscription.status === "trialing"

      console.log("customer.subscription.updated/deleted")
      console.log("subscription.status:", subscription.status)
      console.log("customerId:", customerId)

      await updateUserByCustomerId({
        customerId,
        isActive,
        subscriptionId: subscription.id,
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook handler error:", error)

    const message =
      error instanceof Error ? error.message : "Unknown webhook error"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}