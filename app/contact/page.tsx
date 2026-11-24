import Link from "next/link"
import BrandLogo from "@/components/brand-logo"

export const metadata = {
  title: "Contact — HireFlow",
  description: "Get in touch with the HireFlow team.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href="/" className="inline-block mb-10">
          <BrandLogo textClassName="font-semibold text-sm" />
        </Link>

        <h1 className="text-3xl font-bold mb-2">Get in touch</h1>
        <p className="text-sm text-white/40 mb-10">We'd love to hear from you.</p>

        <div className="space-y-6">

          <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
            <h2 className="font-semibold text-white mb-1">General enquiries</h2>
            <p className="text-sm text-white/50 mb-3">Questions about HireFlow, partnerships or anything else.</p>
            <a href="mailto:hello@hire-flow.app" className="text-cyan-400 hover:underline text-sm font-medium">hello@hire-flow.app</a>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
            <h2 className="font-semibold text-white mb-1">Employers</h2>
            <p className="text-sm text-white/50 mb-3">Want to post a job or need help with your listing? We'll get back to you within 24 hours.</p>
            <a href="mailto:hello@hire-flow.app" className="text-cyan-400 hover:underline text-sm font-medium">hello@hire-flow.app</a>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
            <h2 className="font-semibold text-white mb-1">Job centres & advisors</h2>
            <p className="text-sm text-white/50 mb-3">Interested in offering HireFlow to the people you support? We'd love to work with you.</p>
            <a href="mailto:hello@hire-flow.app" className="text-cyan-400 hover:underline text-sm font-medium">hello@hire-flow.app</a>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
            <h2 className="font-semibold text-white mb-1">Follow us</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              <a href="https://www.linkedin.com/in/elena-rahimi-34b618404" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition">LinkedIn</a>
              <a href="https://www.facebook.com/profile.php?id=61591738826836" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition">Facebook</a>
              <a href="https://www.instagram.com/hire_flowapp" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition">Instagram</a>
              <a href="https://www.tiktok.com/@hireflow26" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition">TikTok</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
