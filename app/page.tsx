import Image from "next/image"
import Link from "next/link"

const features = [
  {
    icon: "🎯",
    title: "Track every application",
    text: "Keep applications, statuses, interview dates, notes, and follow-ups in one clear dashboard.",
  },
  {
    icon: "✨",
    title: "Tailor CVs with AI",
    text: "Generate job-specific CV summaries and improve applications against real job descriptions.",
  },
  {
    icon: "🤖",
    title: "AI Practice Interviews",
    text: "Get 6 role-specific questions, instant scoring on every answer, and a full performance report.",
    highlight: true,
    link: "/demo",
  },
  {
    icon: "📊",
    title: "Smart Coach guidance",
    text: "Understand what to improve, where you are strong, and when you may be ready for higher roles.",
  },
  {
    icon: "🔍",
    title: "Search 4 job boards at once",
    text: "Search Reed, Adzuna, Remotive and more from one place — then add directly to your tracker.",
  },
  {
    icon: "🗓️",
    title: "Stay organised",
    text: "See recent activity, applications over time, upcoming interviews, and actions that need attention.",
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-7xl px-6 py-6 sm:px-8 lg:px-10">
        <header className="sticky top-0 z-30 mb-10 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="HireFlow logo"
                width={36}
                height={36}
                className="rounded-md"
                priority
              />
              <div>
                <p className="text-lg font-semibold tracking-tight">HireFlow</p>
                <p className="text-xs text-white/50">
                  Where talent meets opportunity
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-3 text-sm text-white/80">
              <a href="#features" className="transition hover:text-white">
                Features
              </a>
              <a href="#who-its-for" className="transition hover:text-white">
                Who it’s for
              </a>
              <Link href="/demo" className="transition hover:text-white text-violet-300">
                🤖 Demo
              </Link>
              <Link href="/coaching" className="transition hover:text-white text-cyan-300">
                💼 Coaching
              </Link>
              <Link href="/career-quiz" className="transition hover:text-white text-emerald-300">
                🧭 Career Quiz
              </Link>
              <Link href="/agency/new" className="transition hover:text-white text-amber-300">
                🏢 Agencies
              </Link>
              <a href="#contact" className="transition hover:text-white">
                Contact
              </a>
              <Link
                href="/dashboard"
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/20"
              >
                Sign in
              </Link>
            </nav>
          </div>
        </header>

        <section className="grid gap-10 py-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
              <span>Smart job application support</span>
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
  Stop guessing your job applications. Start improving them.
</h1>

<p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
  Track every application, tailor your CV to real job descriptions, and understand exactly what you're missing — before you hit apply.
</p>

<p className="mt-4 text-sm text-white/50">
  Built for job seekers who want clarity, not guesswork.
</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Start improving your applications
              </Link>

              <a
                href="mailto:hello@hire-flow.app"
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Request a demo
              </a>
            </div>
            <p className="mt-4 text-xs text-white/40">
  No guesswork. No wasted applications. Just better results — faster.
</p>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/55">
              <div>Application tracking</div>
              <div>Tailored CV support</div>
              <div>Qualification alerts</div>
              <div>Smart Coach</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-violet-500/20 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#08101f] p-4">
                <Image
                  src="/landing-preview.png"
                  alt="HireFlow dashboard preview"
                  width={1400}
                  height={900}
                  className="h-auto w-full rounded-xl border border-white/10"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-semibold text-cyan-300">
                Track applications
              </p>
              <p className="mt-2 text-sm leading-7 text-white/70">
                Keep every job, interview, note, and follow-up in one place.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-semibold text-emerald-300">
                Improve application quality
              </p>
              <p className="mt-2 text-sm leading-7 text-white/70">
                Compare CV content against the role and tailor it faster.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-semibold text-amber-300">
                Flag required qualifications
              </p>
              <p className="mt-2 text-sm leading-7 text-white/70">
                Help users spot licences, certifications, or role requirements
                early.
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl">Everything in one place</h2>
            <p className="mt-4 text-lg leading-8 text-white/65">
              From application tracking to CV improvement, HireFlow helps users
              stay organised and make better job applications.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                text={feature.text}
                highlight={"highlight" in feature ? feature.highlight : undefined}
                link={"link" in feature ? feature.link : undefined}
              />
            ))}
          </div>
        </section>

        <section
          id="who-its-for"
          className="grid gap-6 py-4 lg:grid-cols-2"
        >
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
              For job seekers
            </p>
            <h3 className="mt-3 text-2xl font-bold">
              Apply with more clarity and confidence
            </h3>
            <p className="mt-4 text-base leading-8 text-white/70">
              HireFlow helps users keep track of progress, improve CVs for
              specific roles, and understand what they may be missing before
              sending an application.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
              For job centres and advisors
            </p>
            <h3 className="mt-3 text-2xl font-bold">
              Support people into work more effectively
            </h3>
            <p className="mt-4 text-base leading-8 text-white/70">
              HireFlow can help advisors guide clients more practically by
              showing application progress, qualification gaps, and areas where
              a CV may need strengthening.
            </p>
          </div>
        </section>

        {/* Early reviewers */}
        <section className="py-12">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-300">
              🌱 Early access
            </div>
            <h2 className="text-3xl font-bold">Be one of our first reviewers</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/50">
              HireFlow is brand new and we're looking for early users to try it free and share honest feedback. Your review helps us improve and helps other job seekers find us.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { icon: "🆓", title: "Try it free", text: "Sign up in 30 seconds — no credit card needed. Full access to all core features." },
                { icon: "💬", title: "Share feedback", text: "Tell us what works, what doesn't, and what you'd love to see next." },
                { icon: "⭐", title: "Leave a review", text: "Help other job seekers find HireFlow by leaving an honest review." },
              ].map(c => (
                <div key={c.title} className="rounded-xl border border-white/10 bg-white/4 p-5 text-left">
                  <div className="mb-2 text-2xl">{c.icon}</div>
                  <p className="font-semibold text-white">{c.title}</p>
                  <p className="mt-1 text-sm text-white/50">{c.text}</p>
                </div>
              ))}
            </div>
            <Link href="/signup" style={{ backgroundColor: "#06b6d4", color: "#000" }}
              className="mt-8 inline-block rounded-xl px-8 py-3 text-sm font-bold transition hover:opacity-90">
              Try HireFlow free →
            </Link>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-12">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">Simple, transparent pricing</h2>
            <p className="mt-3 text-white/50">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3 max-w-5xl mx-auto">
            {/* Free */}
            <div className="rounded-2xl border border-white/10 bg-white/4 p-8">
              <h3 className="text-lg font-bold text-white">Free</h3>
              <div className="mt-2 mb-6">
                <span className="text-4xl font-bold text-white">£0</span>
                <span className="text-white/40"> / forever</span>
              </div>
              <ul className="space-y-3 text-sm text-white/70 mb-8">
                {["Track unlimited applications", "Search multiple job boards", "1 AI practice interview / month", "Basic CV editor", "Cover letter generator"].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-emerald-400">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full rounded-xl border border-white/20 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10">
                Get started free
              </Link>
            </div>
            {/* Pro */}
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-4 py-1 text-xs font-bold text-black">MOST POPULAR</div>
              <h3 className="text-lg font-bold text-white">Pro</h3>
              <div className="mt-2 mb-6">
                <span className="text-4xl font-bold text-cyan-300">£9</span>
                <span className="text-white/40"> / month</span>
              </div>
              <ul className="space-y-3 text-sm text-white/70 mb-8">
                {["Everything in Free", "Unlimited AI practice interviews", "Scored interview reports", "AI CV tailoring for every job", "Smart Coach analysis", "AI cover letters", "Weekly progress emails", "Interview reminders"].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-cyan-400">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/signup" style={{ backgroundColor: "#06b6d4", color: "#000" }} className="block w-full rounded-xl py-3 text-center text-sm font-bold transition hover:opacity-90">
                Get started with Pro
              </Link>
            </div>
            {/* Premium */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1 text-xs font-bold text-black">BEST RESULTS</div>
              <h3 className="text-lg font-bold text-white">Premium</h3>
              <p className="text-xs text-amber-300 mt-0.5 mb-2">Done-with-you career support</p>
              <div className="mt-2 mb-6">
                <span className="text-4xl font-bold text-amber-300">£500</span>
                <span className="text-white/40"> one-time</span>
              </div>
              <ul className="space-y-3 text-sm text-white/70 mb-8">
                {["Full CV rewrite by Elena", "3 × 1-on-1 coaching sessions", "LinkedIn optimisation", "Personalised career roadmap", "University & Student Finance support", "12 months HireFlow Pro included", "Email access to Elena for 12 months"].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-amber-400">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/premium" style={{ backgroundColor: "#f59e0b", color: "#000" }} className="block w-full rounded-xl py-3 text-center text-sm font-bold transition hover:opacity-90">
                Learn more →
              </Link>
              <p className="mt-2 text-center text-xs text-white/30">Instalments available · Full refund guarantee</p>
            </div>
          </div>

          {/* Agency white-label pricing */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-300 mb-3">🏢 For recruitment agencies</div>
                  <h3 className="text-2xl font-bold text-white">White-label platform for your candidates</h3>
                  <p className="mt-2 text-sm text-white/50 max-w-lg">Give your candidates a fully branded HireFlow experience under your name. First month free on all plans.</p>
                </div>
                <Link href="/agency/new" style={{ backgroundColor: "#f59e0b", color: "#000" }} className="shrink-0 rounded-xl px-6 py-3 text-sm font-bold transition hover:opacity-90 text-center">
                  Start free →
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { name: "Starter", price: "£79", desc: "Up to 20 candidates", color: "text-cyan-300", border: "border-cyan-500/20" },
                  { name: "Growth", price: "£149", desc: "Up to 100 candidates", color: "text-violet-300", border: "border-violet-500/20", popular: true },
                  { name: "Enterprise", price: "£299", desc: "Unlimited candidates", color: "text-amber-300", border: "border-amber-500/20" },
                ].map(p => (
                  <div key={p.name} className={`rounded-xl border ${p.border} bg-white/4 p-5 text-center relative`}>
                    {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-500 px-3 py-0.5 text-xs font-bold text-white">Popular</div>}
                    <p className="font-semibold text-white mb-1">{p.name}</p>
                    <p className={`text-2xl font-bold ${p.color}`}>{p.price}<span className="text-sm font-normal text-white/40">/mo</span></p>
                    <p className="text-xs text-white/40 mt-1">{p.desc}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-white/30">No credit card needed · Cancel anytime · Branded subdomain + candidate dashboard included</p>
            </div>
          </div>

          {/* 1-on-1 Coaching */}
          <div className="mt-12 max-w-5xl mx-auto rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-8">
            <div className="mb-6 text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                💼 1-on-1 Coaching Sessions
              </div>
              <h3 className="text-2xl font-bold text-white">Need personal help? Book a session with Elena</h3>
              <p className="mt-2 text-sm text-white/50">One-off sessions — no subscription needed.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto">
              <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
                <div className="mb-3 text-2xl">📄</div>
                <h4 className="font-semibold text-white">CV Review Session</h4>
                <p className="mt-1 mb-4 text-sm text-white/50">Live 30-min call. Elena reviews your CV and shows you exactly what to fix.</p>
                <div className="mb-4 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">£35</span>
                  <span className="text-xs text-white/40">/ 30 min</span>
                </div>
                <a href="https://calendly.com/hello-hire-flow/cv-review-session"
                  target="_blank" rel="noopener noreferrer"
                  className="block w-full rounded-xl border border-cyan-500/30 py-2.5 text-center text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/10">
                  Book CV Review →
                </a>
              </div>
              <div className="rounded-2xl border border-cyan-500/30 bg-white/4 p-6">
                <div className="mb-3 text-2xl">🚀</div>
                <h4 className="font-semibold text-white">Career Strategy Session</h4>
                <p className="mt-1 mb-4 text-sm text-white/50">60-min deep dive — CV, job search plan, LinkedIn, and mock interview.</p>
                <div className="mb-4 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">£60</span>
                  <span className="text-xs text-white/40">/ 60 min</span>
                </div>
                <a href="https://calendly.com/hello-hire-flow/career-strategy-session"
                  target="_blank" rel="noopener noreferrer"
                  style={{ backgroundColor: "#06b6d4", color: "#000" }}
                  className="block w-full rounded-xl py-2.5 text-center text-sm font-bold transition hover:opacity-90">
                  Book Strategy Session →
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-white/[0.03] to-violet-500/10 p-8 text-center backdrop-blur-xl sm:p-12">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Want a quick demo?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/70">
              See how HireFlow can support smarter job applications for
              individuals, advisors, and job centres.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="mailto:hello@hire-flow.app"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Email us
              </a>

              <Link
                href="/dashboard"
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View app
              </Link>
            </div>
          </div>
        </section>

        {/* Career Quiz CTA */}
        <section className="mt-16 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                🧭 Free career quiz
              </div>
              <h2 className="text-3xl font-bold sm:text-4xl">Not sure what career suits you?</h2>
              <p className="mt-4 text-lg text-white/60 leading-8">
                Answer 9 quick questions about your qualifications, work style, and what matters to you — and we'll match you to real careers with salary ranges.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-white/60">
                {["Takes less than 3 minutes", "Based on your real qualifications and experience", "Matched to careers with average UK salaries", "Free — no sign up needed"].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/career-quiz"
                  style={{ backgroundColor: "#10b981", color: "#000" }}
                  className="inline-block rounded-xl px-6 py-3 text-sm font-bold transition hover:opacity-90">
                  Take the free quiz →
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-3">
              <p className="text-xs uppercase tracking-wide text-white/30 mb-4">Example result</p>
              {[
                { title: "Project Manager", salary: "£35,000 – £65,000", match: 94, color: "#06b6d4" },
                { title: "HR Administrator", salary: "£24,000 – £35,000", match: 81, color: "#8b5cf6" },
                { title: "Recruitment Consultant", salary: "£25,000 – £50,000+", match: 73, color: "#8b5cf6" },
              ].map((r, i) => (
                <div key={r.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex justify-between mb-2">
                    <div>
                      {i === 0 && <p className="text-xs text-cyan-400 mb-0.5">⭐ Best match</p>}
                      <p className="text-sm font-semibold text-white">{r.title}</p>
                      <p className="text-xs text-white/40">{r.salary}</p>
                    </div>
                    <p className="text-lg font-bold" style={{ color: r.color }}>{r.match}%</p>
                  </div>
                  <div className="h-1 w-full rounded-full bg-white/10">
                    <div className="h-full rounded-full" style={{ width: `${r.match}%`, backgroundColor: r.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Agency / White-label section */}
        <section className="mt-16 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                🏢 For recruitment agencies
              </div>
              <h2 className="text-3xl font-bold sm:text-4xl">Give your candidates a competitive edge</h2>
              <p className="mt-4 text-lg text-white/60 leading-8">
                Offer HireFlow to your candidates under your own brand — your logo, your colours, your link. They get powerful job application tools. You stand out from every other agency.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-white/60">
                {["Your own branded platform in minutes", "Candidates sign up via your unique link", "Track how many applications they send", "No technical setup needed"].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-amber-400">✓</span> {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/agency/new" className="rounded-xl px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90" style={{ backgroundColor: "#f59e0b" }}>
                  Set up your agency platform →
                </Link>
                <a href="mailto:hello@hire-flow.app" className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  Talk to us first
                </a>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
              <p className="mb-4 text-xs uppercase tracking-wide text-white/30">Example branded platform</p>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-black bg-blue-600">T</div>
                <div>
                  <p className="font-semibold text-white">Talent Bridge Recruitment</p>
                  <p className="text-xs text-white/40">Helping our candidates land their dream job</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[["12", "Candidates"], ["47", "Applications sent"], ["3", "Joined this week"]].map(([val, label]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                    <p className="text-xl font-bold text-white">{val}</p>
                    <p className="text-xs text-white/40 mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/40">
                hire-flow.app/agency/talent-bridge
              </div>
            </div>
          </div>
        </section>

        <footer
          id="contact"
          className="mt-6 border-t border-white/10 py-8 text-sm text-white/55"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="HireFlow logo"
                width={28}
                height={28}
                className="rounded-md"
              />
              <span className="font-medium text-white/80">HireFlow</span>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <a
                href="mailto:hello@hire-flow.app"
                className="transition hover:text-white"
              >
                hello@hire-flow.app
              </a>
              <span>©️ {new Date().getFullYear()} HireFlow. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  text,
  highlight,
  link,
}: {
  icon?: string
  title: string
  text: string
  highlight?: boolean
  link?: string
}) {
  const inner = (
    <div className={`h-full rounded-3xl border p-6 transition ${highlight ? "border-violet-500/30 bg-violet-500/5 hover:border-violet-500/50 hover:bg-violet-500/10" : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"}`}>
      {icon && <span className="mb-3 block text-2xl">{icon}</span>}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/65">{text}</p>
      {highlight && link && (
        <span className="mt-4 inline-block text-xs font-medium text-violet-300">Try the demo →</span>
      )}
    </div>
  )
  if (link) return <Link href={link}>{inner}</Link>
  return inner
}