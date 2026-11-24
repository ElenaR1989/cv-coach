import Link from "next/link"
import BrandLogo from "@/components/brand-logo"

export const metadata = {
  title: "Terms & Conditions — HireFlow",
  description: "Terms and conditions for using HireFlow as a job seeker or employer.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href="/" className="inline-block mb-10">
          <BrandLogo textClassName="font-semibold text-sm" />
        </Link>

        <h1 className="text-3xl font-bold mb-2">Terms & Conditions</h1>
        <p className="text-sm text-white/40 mb-10">Last updated: November 2026</p>

        <div className="space-y-8 text-white/70 leading-7 text-sm">
          <section>
            <h2 className="text-white font-semibold text-lg mb-2">About HireFlow</h2>
            <p>HireFlow is a UK job board and career guidance platform operated by Elena Rahimi. By using HireFlow you agree to these terms. If you do not agree, please do not use the platform. You can contact us at <a href="mailto:hello@hire-flow.app" className="text-cyan-400 hover:underline">hello@hire-flow.app</a>.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">For job seekers</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Creating an account is free. You must provide accurate information when signing up.</li>
              <li>Some features (CV builder, interview practice, cover letter generator) require a Pro subscription at £9/month. Promotional codes may grant free access for a limited period.</li>
              <li>You are responsible for the accuracy of CVs and application materials you create on the platform.</li>
              <li>You must not use HireFlow to apply for jobs fraudulently or misrepresent your identity or qualifications.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">For employers</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>During our launch phase, posting jobs on HireFlow is free. This may change in the future with reasonable notice.</li>
              <li>All job postings are reviewed by HireFlow before going live. We reserve the right to reject any posting without explanation.</li>
              <li>You must only post genuine vacancies for real roles at your company. Fraudulent, misleading or scam listings are strictly prohibited.</li>
              <li>You are responsible for the accuracy of your job listings and for handling applications fairly and lawfully.</li>
              <li>HireFlow is not responsible for the outcome of any hiring process.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Acceptable use</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must not use HireFlow for any unlawful purpose.</li>
              <li>You must not attempt to scrape, copy or reproduce content from the platform without permission.</li>
              <li>You must not upload malicious content, spam or anything that could harm other users.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Limitation of liability</h2>
            <p>HireFlow is provided as a platform to connect job seekers and employers. We do not guarantee employment outcomes, the accuracy of third-party job listings, or the suitability of any candidate or vacancy. To the extent permitted by law, HireFlow is not liable for any loss or damage arising from use of the platform.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Changes to these terms</h2>
            <p>We may update these terms from time to time. We will notify registered users of any significant changes by email. Continued use of HireFlow after changes are posted constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Governing law</h2>
            <p>These terms are governed by the laws of England and Wales.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Contact</h2>
            <p>For any questions about these terms, please contact us at <a href="mailto:hello@hire-flow.app" className="text-cyan-400 hover:underline">hello@hire-flow.app</a>.</p>
          </section>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10">
          <Link href="/privacy" className="text-sm text-cyan-400 hover:underline">Privacy Policy →</Link>
        </div>
      </div>
    </div>
  )
}
