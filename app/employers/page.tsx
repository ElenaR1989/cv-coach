import Link from "next/link"
import BrandLogo from "@/components/brand-logo"

export const metadata = {
  title: "Post Jobs Free — HireFlow for Employers",
  description: "Post jobs on HireFlow for free during our launch phase. No fees, no contracts. Reach local UK job seekers in minutes.",
}

export default function EmployersPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="inline-block mb-10">
          <BrandLogo textClassName="font-semibold text-sm" />
        </Link>

        {/* Hero */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/20 px-4 py-1.5 text-xs font-semibold text-green-400 mb-6">
            ✓ Free during launch — no credit card required
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Post jobs for free.<br />
            <span style={{ color: "#06b6d4" }}>Find your next hire today.</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl">
            HireFlow is a new UK job board built for independent businesses. Post your vacancy in minutes — we review it and it goes live within 24 hours.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/employer/signup"
              style={{ backgroundColor: "#06b6d4", color: "#000" }}
              className="inline-block rounded-xl px-8 py-4 text-sm font-bold transition hover:opacity-90">
              Post a job for free →
            </Link>
            <Link href="/employer/login"
              className="inline-block rounded-xl border border-white/15 px-8 py-4 text-sm font-semibold text-white/60 transition hover:text-white">
              Sign in
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-14">
          <h2 className="text-xl font-bold mb-6">How it works</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { step: "1", title: "Create your account", desc: "Just your email and password. Takes 2 minutes." },
              { step: "2", title: "Post your vacancy", desc: "Fill in the job details. We'll review it within 24 hours." },
              { step: "3", title: "Start receiving applicants", desc: "Your job goes live and job seekers can apply directly." },
            ].map(item => (
              <div key={item.step} className="rounded-2xl border border-white/10 bg-white/4 p-5">
                <div className="w-8 h-8 rounded-full mb-3 flex items-center justify-center text-sm font-bold text-black" style={{ backgroundColor: "#06b6d4" }}>{item.step}</div>
                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why HireFlow */}
        <div className="mb-14">
          <h2 className="text-xl font-bold mb-6">Why choose HireFlow</h2>
          <div className="space-y-3">
            {[
              { title: "Free during launch", desc: "Post as many jobs as you like at no cost during our launch phase. Traditional job boards charge up to £300 per listing." },
              { title: "Every vacancy is reviewed", desc: "We check every job before it goes live, so job seekers trust the listings and you get better quality applicants." },
              { title: "Simple and fast", desc: "No complicated dashboards or lengthy processes. Post a job in 5 minutes." },
              { title: "Local job seekers", desc: "Reach candidates actively looking for work in the UK." },
            ].map(item => (
              <div key={item.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/4 p-5">
                <span className="text-cyan-400 mt-0.5">✓</span>
                <div>
                  <p className="font-semibold text-white text-sm">{item.title}</p>
                  <p className="text-sm text-white/50 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Ready to post your first job?</h2>
          <p className="text-sm text-white/50 mb-6">Free during launch. No credit card. Live within 24 hours.</p>
          <Link href="/employer/signup"
            style={{ backgroundColor: "#06b6d4", color: "#000" }}
            className="inline-block rounded-xl px-8 py-4 text-sm font-bold transition hover:opacity-90">
            Create your free employer account →
          </Link>
          <p className="text-xs text-white/30 mt-4">Questions? Email us at <a href="mailto:hello@hire-flow.app" className="text-cyan-400 hover:underline">hello@hire-flow.app</a></p>
        </div>

      </div>
    </div>
  )
}
