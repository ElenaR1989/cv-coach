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

        {/* Testimonials */}
        <section className="py-12">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">What job seekers say</h2>
            <p className="mt-3 text-white/50">Real feedback from people using HireFlow</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { name: "Sarah M.", role: "Marketing Graduate", text: "I was applying to 10 jobs a week and hearing nothing back. HireFlow's AI tailored my CV for each role and I got 3 interviews in my first week using it." },
              { name: "James T.", role: "Software Developer", text: "The practice interview feature is incredible. I went in so much more prepared and actually got the job. Worth every penny of Pro." },
              { name: "Priya K.", role: "Career Changer", text: "Smart Coach showed me exactly what skills I was missing for the roles I wanted. It saved me months of guessing." },
            ].map(t => (
              <div key={t.name} className="rounded-2xl border border-white/10 bg-white/4 p-6">
                <div className="mb-3 flex gap-1">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400">★</span>)}
                </div>
                <p className="text-sm leading-7 text-white/70">"{t.text}"</p>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-12">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">Simple, transparent pricing</h2>
            <p className="mt-3 text-white/50">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
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
                Start Pro free with PRODUCTHUNT
              </Link>
              <p className="mt-2 text-center text-xs text-white/30">Use code PRODUCTHUNT for 1 month free</p>
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