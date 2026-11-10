import Image from "next/image"
import Link from "next/link"


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
              <Link href="/career-quiz" className="transition hover:text-white text-emerald-300">
                🧭 Career Quiz
              </Link>
              <Link href="/coaching" className="transition hover:text-white text-cyan-300">
                💼 Coaching
              </Link>
              <Link href="/agency/new" className="transition hover:text-white text-amber-300">
                🏢 Agencies
              </Link>
              <Link href="/affiliate" className="transition hover:text-white text-violet-300">
                💸 Affiliates
              </Link>
              <Link href="/employer/signup" className="transition hover:text-white text-rose-300">
                📋 Post a Job
              </Link>
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

        {/* Who it's for */}
        <section id="who-its-for" className="py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Who is HireFlow for?</h2>
            <p className="mt-3 text-white/50">One platform, four different ways to use it.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            {/* Job Seekers */}
            <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-8 flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-3">Job Seekers</p>
              <h3 className="text-xl font-bold mb-3">Apply smarter, not harder</h3>
              <p className="text-sm text-white/60 leading-7 flex-1">
                Track every application, tailor your CV to real job descriptions, practise interviews with AI, and understand exactly what you're missing — before you hit apply. Free forever.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-white/50">
                {["Application tracker", "AI CV tailoring", "Practice interviews", "Career quiz"].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-cyan-400">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/signup" style={{ backgroundColor: "#06b6d4", color: "#000" }}
                className="mt-6 inline-block rounded-xl px-6 py-3 text-sm font-bold text-center transition hover:opacity-90">
                Get started free →
              </Link>
            </div>

            {/* Employers */}
            <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-widest text-rose-400 mb-3">Employers</p>
              <h3 className="text-xl font-bold mb-3">Post jobs, find the right people</h3>
              <p className="text-sm text-white/60 leading-7 flex-1">
                Post a job in minutes with an AI-written description. Reach motivated job seekers who have already told us what kind of work they're looking for. Traditional job boards charge up to £300 — we don't.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-white/50">
                {["AI job description writer", "Reach motivated candidates", "Free to post during launch", "From £19/job in 2027"].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-rose-400">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/employer/signup" style={{ backgroundColor: "#f43f5e", color: "#fff" }}
                className="mt-6 inline-block rounded-xl px-6 py-3 text-sm font-bold text-center transition hover:opacity-90">
                Post a job for free →
              </Link>
            </div>

            {/* Job Centres */}
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">Job Centres & Advisors</p>
              <h3 className="text-xl font-bold mb-3">Support clients more effectively</h3>
              <p className="text-sm text-white/60 leading-7 flex-1">
                Give your clients a tool that shows them exactly where their applications are falling short. Track their progress, spot qualification gaps, and help them build better CVs — all in one place.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-white/50">
                {["Client application tracking", "CV gap analysis", "Career quiz results", "Free career tools"].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-emerald-400">✓</span>{f}</li>
                ))}
              </ul>
              <a href="mailto:hello@hire-flow.app"
                className="mt-6 inline-block rounded-xl border border-emerald-500/30 px-6 py-3 text-sm font-bold text-center text-emerald-300 transition hover:bg-emerald-500/10">
                Get in touch →
              </a>
            </div>

            {/* Agencies */}
            <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-8 flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Recruitment Agencies</p>
              <h3 className="text-xl font-bold mb-3">Give candidates your own branded platform</h3>
              <p className="text-sm text-white/60 leading-7 flex-1">
                White-label HireFlow under your agency name. Your logo, your link, your candidates. They get powerful job tools — you get a competitive edge that no other agency is offering.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-white/50">
                {["Your own branded subdomain", "Candidate activity tracking", "No technical setup needed", "First month free"].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-amber-400">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/agency/new" style={{ backgroundColor: "#f59e0b", color: "#000" }}
                className="mt-6 inline-block rounded-xl px-6 py-3 text-sm font-bold text-center transition hover:opacity-90">
                Set up your agency platform →
              </Link>
            </div>

          </div>
        </section>

        {/* Final CTA */}
        <section className="py-8 pb-16">
          <div className="rounded-3xl border border-white/10 bg-white/4 p-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to get started?</h2>
            <p className="mt-3 text-white/50 max-w-md mx-auto">Join job seekers, advisors and employers already using HireFlow.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/signup" style={{ backgroundColor: "#06b6d4", color: "#000" }}
                className="rounded-xl px-8 py-3 text-sm font-bold transition hover:opacity-90">
                Sign up free →
              </Link>
              <Link href="/career-quiz"
                className="rounded-xl border border-white/20 px-8 py-3 text-sm font-semibold text-white/70 transition hover:text-white hover:bg-white/8">
                Take the career quiz →
              </Link>
            </div>
          </div>
        </section>

        <footer
          id="contact"
          className="mt-6 border-t border-white/10 py-8 text-sm text-white/55"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
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

            {/* Social links */}
            <div className="flex items-center gap-4">
              <a href="https://www.linkedin.com/in/elena-rahimi-34b618404" target="_blank" rel="noopener noreferrer" className="transition hover:text-white" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61591738826836" target="_blank" rel="noopener noreferrer" className="transition hover:text-white" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/hire_flowapp" target="_blank" rel="noopener noreferrer" className="transition hover:text-white" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@hireflow26" target="_blank" rel="noopener noreferrer" className="transition hover:text-white" aria-label="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>
              </a>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <a href="mailto:hello@hire-flow.app" className="transition hover:text-white">
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

