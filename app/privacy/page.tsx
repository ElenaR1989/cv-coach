import Link from "next/link"
import BrandLogo from "@/components/brand-logo"

export const metadata = {
  title: "Privacy Policy — HireFlow",
  description: "How HireFlow collects, uses and protects your personal data.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href="/" className="inline-block mb-10">
          <BrandLogo textClassName="font-semibold text-sm" />
        </Link>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-white/40 mb-10">Last updated: September 2026</p>

        <div className="space-y-8 text-white/70 leading-7 text-sm">
          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Who we are</h2>
            <p>HireFlow is a career guidance and job application tool operated by Elena Rahimi, based in the United Kingdom. You can contact us at <a href="mailto:hello@hire-flow.app" className="text-cyan-400 hover:underline">hello@hire-flow.app</a>.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">What data we collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your email address when you sign up or complete the career quiz</li>
              <li>Your name if you provide it</li>
              <li>Quiz answers and career preferences</li>
              <li>CV and job application data you upload or create on the platform</li>
              <li>Usage data (pages visited, features used) via analytics tools</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">How we use your data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and improve our career guidance services</li>
              <li>To send you your career quiz results and follow-up support</li>
              <li>To contact you about your account or services you've requested</li>
              <li>To improve the platform based on how people use it</li>
            </ul>
            <p className="mt-3">We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Data storage</h2>
            <p>Your data is stored securely using Supabase, a cloud database provider. Data is encrypted in transit and at rest. We retain your data for as long as your account is active or as needed to provide our services.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Your rights</h2>
            <p>Under UK GDPR you have the right to access, correct or delete your personal data at any time. To exercise these rights, email us at <a href="mailto:hello@hire-flow.app" className="text-cyan-400 hover:underline">hello@hire-flow.app</a> and we will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Cookies</h2>
            <p>We use essential cookies to keep you logged in and analytics cookies to understand how people use the site. We do not use advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Contact</h2>
            <p>If you have any questions about this privacy policy, please contact us at <a href="mailto:hello@hire-flow.app" className="text-cyan-400 hover:underline">hello@hire-flow.app</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
