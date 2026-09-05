import Link from "next/link"
import BrandLogo from "@/components/brand-logo"

export default function CoachingPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <BrandLogo textClassName="text-lg font-semibold" />
          <Link href="/dashboard" className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/60 transition hover:text-white">
            Go to app →
          </Link>
        </div>

        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-300">
            1-on-1 Career Coaching
          </div>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Get personalised help<br />landing your next job
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/50">
            Book a private 30-minute session with Elena — founder of HireFlow and career strategist — to get tailored advice on your CV, job search, and interview prep.
          </p>
        </div>

        {/* Sessions */}
        <div className="mb-12 grid gap-6 md:grid-cols-2">
          {/* Session 1 */}
          <div className="rounded-2xl border border-white/10 bg-white/4 p-8">
            <div className="mb-4 text-3xl">📄</div>
            <h2 className="mb-2 text-xl font-bold">CV Review Session</h2>
            <p className="mb-6 text-sm leading-7 text-white/55">
              30-minute 1-on-1 call. I review your CV live, show you exactly what to fix, and tailor it to the roles you want using HireFlow's AI tools.
            </p>
            <ul className="mb-8 space-y-2 text-sm text-white/70">
              {["Live CV review on video call", "AI-powered tailoring for your target role", "Specific rewrite suggestions", "Recording sent after the session"].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="text-emerald-400">✓</span>{f}</li>
              ))}
            </ul>
            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold">£35</span>
              <span className="text-white/40">/ 30 min</span>
            </div>
            <a
              href="https://calendly.com/hello-hire-flow/cv-review-session"
              target="_blank" rel="noopener noreferrer"
              style={{ backgroundColor: "#06b6d4", color: "#000" }}
              className="block w-full rounded-xl py-3 text-center text-sm font-bold transition hover:opacity-90"
            >
              Book CV Review — £35
            </a>
          </div>

          {/* Session 2 */}
          <div className="relative rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 to-violet-500/5 p-8">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-5 py-1.5 text-xs font-bold text-black">
              MOST POPULAR
            </div>
            <div className="mb-4 text-3xl">🚀</div>
            <h2 className="mb-2 text-xl font-bold">Full Job Search Strategy</h2>
            <p className="mb-6 text-sm leading-7 text-white/55">
              60-minute deep dive. We review your CV, build your job search strategy, set up HireFlow for your situation, and practice interview questions for your target roles.
            </p>
            <ul className="mb-8 space-y-2 text-sm text-white/80">
              {["Full CV and LinkedIn review", "Personalised job search plan", "HireFlow setup and walkthrough", "Mock interview with feedback", "Follow-up email with action plan"].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="text-cyan-400">✓</span>{f}</li>
              ))}
            </ul>
            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold">£60</span>
              <span className="text-white/40">/ 60 min</span>
            </div>
            <a
              href="https://calendly.com/hello-hire-flow/career-strategy-session"
              target="_blank" rel="noopener noreferrer"
              style={{ backgroundColor: "#06b6d4", color: "#000" }}
              className="block w-full rounded-xl py-3 text-center text-sm font-bold transition hover:opacity-90"
            >
              Book Strategy Session — £60
            </a>
          </div>
        </div>

        {/* About Elena */}
        <div className="mb-12 rounded-2xl border border-white/10 bg-white/4 p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-cyan-500/20 text-3xl font-bold text-cyan-300">
              ER
            </div>
            <div>
              <h2 className="mb-1 text-xl font-bold">About Elena</h2>
              <p className="text-sm leading-7 text-white/60">
                Elena is the founder of HireFlow and has helped hundreds of job seekers improve their applications and land interviews. Based in Peterborough, UK, she built HireFlow after seeing how many people struggle with the job search process — sending applications into the void with no feedback. Her sessions combine practical CV advice with AI-powered tools to get results fast.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="mb-6 text-center text-2xl font-bold">Common questions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { q: "How does booking work?", a: "Click the button above to send an email. Elena will reply within 24 hours with available times and a payment link." },
              { q: "How do I pay?", a: "Payment is taken via bank transfer or PayPal before the session. Details sent after booking confirmation." },
              { q: "What do I need to prepare?", a: "Just your CV and a list of the roles you're applying for. Elena will do the rest." },
              { q: "Is it on video call?", a: "Yes — sessions are held on Google Meet or Zoom. A recording is sent afterwards so you can refer back to it." },
            ].map(item => (
              <div key={item.q} className="rounded-2xl border border-white/10 bg-white/4 p-5">
                <p className="font-semibold text-white">{item.q}</p>
                <p className="mt-2 text-sm text-white/55">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-violet-500/5 p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold">Not sure which session is right for you?</h2>
          <p className="mb-6 text-white/50">Send an email and Elena will help you decide.</p>
          <a
            href="mailto:hello@hire-flow.app?subject=Coaching enquiry"
            className="inline-block rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Email hello@hire-flow.app
          </a>
        </div>

      </div>
    </main>
  )
}
