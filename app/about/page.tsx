import Link from "next/link"
import BrandLogo from "@/components/brand-logo"

export const metadata = {
  title: "About — HireFlow",
  description: "HireFlow was built to make job searching and hiring simpler, fairer and free for everyone.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href="/" className="inline-block mb-10">
          <BrandLogo textClassName="font-semibold text-sm" />
        </Link>

        <h1 className="text-3xl font-bold mb-2">About HireFlow</h1>
        <p className="text-sm text-white/40 mb-10">Built in the UK, for the UK</p>

        <div className="space-y-8 text-white/70 leading-7 text-sm">
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">Why I built HireFlow</h2>
            <p>Hi, I'm Elena — founder of HireFlow.</p>
            <p className="mt-3">I built HireFlow because I saw how hard it was for people to find work, and how expensive it had become for small businesses to hire. Job boards were charging employers hundreds of pounds per listing, and job seekers were drowning in irrelevant results with no real guidance on where to start.</p>
            <p className="mt-3">I wanted to build something better — a platform that genuinely helps people find the right job, and helps businesses find the right person, without the cost and complexity of the big job boards.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">What HireFlow does</h2>
            <p>HireFlow is a UK job board and career guidance platform. For job seekers it offers a free career quiz, CV builder, interview practice and job search. For employers it offers free job posting during our launch phase, with every vacancy reviewed before going live to protect job seekers.</p>
            <p className="mt-3">We also work with job centres, career advisors and recruitment agencies to help more people access the support they need.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">Where we are now</h2>
            <p>HireFlow is in its launch phase. We're based in the UK and focused on connecting local employers with local job seekers. We're growing steadily and always looking for feedback from employers, job seekers and advisors who want to help shape the platform.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">Get in touch</h2>
            <p>I'd love to hear from you — whether you're an employer, a job seeker, a career advisor or just curious about HireFlow.</p>
            <p className="mt-3">
              Email: <a href="mailto:hello@hire-flow.app" className="text-cyan-400 hover:underline">hello@hire-flow.app</a>
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/employer/signup"
            style={{ backgroundColor: "#06b6d4", color: "#000" }}
            className="inline-block rounded-xl px-6 py-3 text-sm font-bold transition hover:opacity-90">
            Post a job for free →
          </Link>
          <Link href="/signup"
            className="inline-block rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white/60 transition hover:text-white">
            Sign up as a job seeker →
          </Link>
        </div>
      </div>
    </div>
  )
}
