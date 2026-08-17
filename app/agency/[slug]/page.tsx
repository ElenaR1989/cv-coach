import { notFound } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase/admin"
import Link from "next/link"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function AgencyPage({ params }: Props) {
  const { slug } = await params

  // Look up agency by slug
  const { data: agency } = await supabaseAdmin
    .from("agencies")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!agency) notFound()

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">

        {/* Agency branding */}
        <div className="mb-8">
          {agency.logo_url ? (
            <img src={agency.logo_url} alt={agency.name} className="mx-auto mb-4 h-16 w-auto" />
          ) : (
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/20 text-2xl font-bold text-cyan-300">
              {agency.name?.[0]?.toUpperCase()}
            </div>
          )}
          <h1 className="text-3xl font-bold">{agency.name}</h1>
          {agency.tagline && <p className="mt-2 text-white/50">{agency.tagline}</p>}
        </div>

        {/* Powered by HireFlow */}
        <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/40">
          Powered by <span className="text-cyan-400 font-medium">HireFlow</span>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-white/10 bg-white/4 p-10">
          <h2 className="mb-3 text-2xl font-bold">Free AI job search tools for {agency.name} clients</h2>
          <p className="mb-8 text-white/50">
            Tailor your CV, practice interviews with AI, and track every application — all free.
          </p>
          <Link
            href={`/signup?agency=${slug}`}
            style={{ backgroundColor: agency.brand_color || "#06b6d4", color: "#000" }}
            className="inline-block rounded-xl px-8 py-3 text-sm font-bold transition hover:opacity-90"
          >
            Get started free →
          </Link>
        </div>

      </div>
    </main>
  )
}
