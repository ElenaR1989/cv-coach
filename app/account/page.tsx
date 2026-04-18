import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import AccountForm from "./profile-form"
import { getIsPro } from "@/lib/billing/is-pro"
import AccountBillingButtons from "./subscription-buttons"

export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      email,
      full_name,
      phone,
      address_line_1,
      address_line_2,
      city,
      postcode,
      country,
      date_of_birth,
      can_work_full_time,
      is_pro,
      plan,
      stripe_customer_id
    `)
    .eq("id", user.id)
    .single()

  if (error) {
    console.error("Error loading account profile:", error.message)
  }

  const isPro = getIsPro(profile)

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-white/70 hover:text-white transition"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 opacity-90 hover:opacity-100 transition"
        >
          <Image
            src="/logo.png"
            alt="Hireflow"
            width={36}
            height={36}
            priority
          />
          <span className="text-lg font-semibold">Hireflow</span>
        </Link>
      </div>

      <div>
        <h1 className="text-4xl font-bold">Account</h1>
        <p className="text-sm text-white/60 mt-2">
          Manage your profile details and billing.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold mb-4">Profile</h2>

          <AccountForm
            initialProfile={{
              email: profile?.email ?? user.email ?? "",
              full_name: profile?.full_name ?? "",
              phone: profile?.phone ?? "",
              address_line_1: profile?.address_line_1 ?? "",
              address_line_2: profile?.address_line_2 ?? "",
              city: profile?.city ?? "",
              postcode: profile?.postcode ?? "",
              country: profile?.country ?? "",
              date_of_birth: profile?.date_of_birth ?? "",
              can_work_full_time: profile?.can_work_full_time ?? true,
            }}
          />
        </div>

        <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-6">
          <h2 className="text-2xl font-semibold mb-4">Billing</h2>

          <div className="space-y-3 text-sm">
            <p>
              <span className="text-white/60">Current plan:</span>{" "}
              <span className="font-semibold">{isPro ? "Pro" : "Free"}</span>
            </p>

            <p>
              <span className="text-white/60">Email:</span>{" "}
              <span>{profile?.email ?? user.email}</span>
            </p>

            <AccountBillingButtons isPro={isPro} />

            {isPro ? (
              <p className="text-xs text-white/60">
                You can update payment method or cancel your subscription from the billing portal.
              </p>
            ) : (
              <p className="text-xs text-white/60">
                Upgrade to unlock unlimited cover letters, AI CV rewriting, and match insights.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}