import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import ReferralCTA from "./referral-cta"

export default function PremiumPage() {
  const included = [
    { icon: "📄", title: "Full CV rewrite — done for you", desc: "Elena rewrites your entire CV professionally, tailored to your target role. Not a template — a real rewrite." },
    { icon: "🎯", title: "3 x 1-on-1 coaching sessions", desc: "60-minute sessions covering your career strategy, interview preparation, and job search plan. Via video call." },
    { icon: "💼", title: "LinkedIn profile optimisation", desc: "Your LinkedIn rewritten to attract recruiters — headline, summary, experience, and skills all optimised." },
    { icon: "🗺️", title: "Personalised career roadmap", desc: "A clear plan showing you exactly what to do over the next 3, 6, and 12 months to reach your goal." },
    { icon: "✉️", title: "Cover letter for your target role", desc: "A professionally written cover letter ready to customise for every application." },
    { icon: "🤖", title: "12 months HireFlow Pro", desc: "Full access to AI interview practice, CV tailoring, application tracking, and Smart Coach for a full year." },
    { icon: "📧", title: "Direct email access for 12 months", desc: "Email Elena any time with questions, feedback requests, or when you need guidance. Replies within 24 hours." },
    { icon: "🧭", title: "Career Fit assessment", desc: "Discover which careers and roles genuinely suit your personality, strengths, and working style." },
    { icon: "🎓", title: "Full university & course application support", desc: "If your dream role needs qualifications you don't have yet, Elena will guide you through the entire process — choosing the right course, applying to universities or colleges, applying for Student Finance, and understanding your funding options. End-to-end support, not just advice." },
  ]

  const faqs = [
    { q: "Who is this for?", a: "People who are serious about changing careers, getting promoted, or finally landing interviews after months of trying alone. It's for people who want real support, not just another app." },
    { q: "How does it work?", a: "You book a free 30-minute discovery call first. Elena reviews your situation, and if it's a good fit, you pay and the work begins within 48 hours." },
    { q: "Is it a one-off payment?", a: "Yes — £500 once. No subscriptions, no hidden fees. That includes everything listed above for 12 months." },
    { q: "What if I'm not happy?", a: "If after the first session you feel it's not right, Elena will refund you in full. No questions asked." },
    { q: "How long does it take?", a: "Your CV and LinkedIn will be ready within 5 working days. Coaching sessions are booked at times that suit you over the following weeks." },
    { q: "Can I pay in instalments?", a: "Yes — contact Elena to arrange two payments of £275 (£550 total). Email hello@hire-flow.app to set this up." },
  ]

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-4xl px-6 py-16">

        {/* Nav */}
        <div className="mb-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="HireFlow" width={32} height={32} className="rounded-md" />
            <span className="font-semibold">HireFlow</span>
          </Link>
          <Link href="/pricing" className="text-sm text-white/50 hover:text-white transition">← Pricing</Link>
        </div>

        {/* Hero */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
            ⭐ Premium Career Package
          </div>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Land your dream job.<br />With expert help.
          </h1>
          <p className="mt-5 text-lg text-white/55 max-w-2xl mx-auto leading-8">
            Stop applying and hoping. Get a professional CV rewrite, personal coaching, LinkedIn optimisation, and a year of HireFlow Pro — everything you need, done with you.
          </p>
          <div className="mt-8">
            <Suspense fallback={
              <a href="mailto:hello@hire-flow.app?subject=Premium Package - Free Discovery Call"
                style={{ backgroundColor: "#f59e0b", color: "#000" }}
                className="rounded-xl px-8 py-4 text-sm font-bold transition hover:opacity-90">
                Book a free discovery call →
              </a>
            }>
              <ReferralCTA />
            </Suspense>
          </div>
          <p className="mt-4 text-xs text-white/30">Limited spots available · Free 30-min call first · Full refund guarantee after first session</p>
        </div>

        {/* What's included */}
        <div className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold">Everything included</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {included.map(item => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/4 p-5">
                <div className="mb-3 text-2xl">{item.icon}</div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-white/50 leading-6">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* About Elena */}
        <div className="mb-16 rounded-2xl border border-white/10 bg-white/4 p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-2xl font-bold text-black">E</div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/30 mb-1">Your coach</p>
              <h3 className="text-xl font-bold text-white">Elena Rahimi</h3>
              <p className="mt-3 text-sm text-white/60 leading-7">
                I built HireFlow because I saw how hard it is for people to navigate the job market alone — especially when you don't know what's going wrong. I've helped hundreds of candidates improve their CVs, prepare for interviews, and land roles they didn't think were possible. The Premium package is for people who want real, personal support — not just another tool to figure out alone.
              </p>
              <p className="mt-3 text-sm text-white/40">Founder, HireFlow · Career Coach · Peterborough, UK</p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold">How it works</h2>
          <div className="space-y-4">
            {[
              { step: "1", title: "Book a free 30-minute discovery call", desc: "We talk about where you are, what's not working, and what you want to achieve. No pressure, no commitment." },
              { step: "2", title: "Pay and get started", desc: "If it's a good fit, you pay £500 and the work begins within 48 hours. CV rewrite starts immediately." },
              { step: "3", title: "CV & LinkedIn delivered in 5 days", desc: "Elena rewrites your CV and LinkedIn profile professionally, ready for you to review and approve." },
              { step: "4", title: "Book your 3 coaching sessions", desc: "Schedule at times that suit you. Sessions cover strategy, interview prep, and your personalised roadmap." },
              { step: "5", title: "Apply with confidence", desc: "Use HireFlow Pro to track applications, practise interviews with AI, and keep improving — for a full 12 months." },
            ].map(s => (
              <div key={s.step} className="flex gap-4 rounded-2xl border border-white/10 bg-white/4 p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-black">{s.step}</div>
                <div>
                  <p className="font-semibold text-white">{s.title}</p>
                  <p className="mt-1 text-sm text-white/50">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold">Questions</h2>
          <div className="space-y-4">
            {faqs.map(item => (
              <div key={item.q} className="rounded-2xl border border-white/10 bg-white/4 p-5">
                <p className="font-semibold text-white">{item.q}</p>
                <p className="mt-2 text-sm text-white/55 leading-6">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-10 text-center">
          <h2 className="text-2xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-2 text-white/50">Book a free 30-minute call. No commitment. Just an honest conversation about your career.</p>
          <div className="mt-6">
            <Suspense fallback={
              <a href="mailto:hello@hire-flow.app?subject=Premium Package - Free Discovery Call"
                style={{ backgroundColor: "#f59e0b", color: "#000" }}
                className="inline-block rounded-xl px-8 py-4 text-sm font-bold transition hover:opacity-90">
                Email Elena to book your free call →
              </a>
            }>
              <ReferralCTA />
            </Suspense>
          </div>
          <p className="mt-4 text-xs text-white/30">hello@hire-flow.app · Usually replies within a few hours</p>
        </div>

      </div>
    </div>
  )
}
