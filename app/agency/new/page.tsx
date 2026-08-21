"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function NewAgencyPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", slug: "", tagline: "", brand_color: "#06b6d4" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
    setForm(f => ({ ...f, name, slug }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/agency/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || "Something went wrong"); setLoading(false); return }
    router.push(`/agency/welcome?id=${data.agency.id}`)
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-xl px-6 py-16">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-3 mb-6">
            <Image src="/logo.png" alt="HireFlow" width={32} height={32} className="rounded-md" />
            <span className="text-lg font-semibold">HireFlow</span>
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300 mb-4">
            White-label setup
          </div>
          <h1 className="text-3xl font-bold">Set up your branded platform</h1>
          <p className="mt-2 text-white/50">Your candidates will access HireFlow under your brand — your logo, your colours, your link.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">Organisation name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Hire Resolve UK"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-cyan-400/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">Your unique link *</label>
            <div className="flex items-center rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <span className="px-3 text-sm text-white/30 border-r border-white/10 py-3">hire-flow.app/agency/</span>
              <input
                type="text"
                required
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                placeholder="your-agency"
                className="flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-white/30">This is the link you share with candidates</p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">Tagline (optional)</label>
            <input
              type="text"
              value={form.tagline}
              onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
              placeholder="e.g. Career support for our candidates"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-cyan-400/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">Brand colour</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.brand_color}
                onChange={e => setForm(f => ({ ...f, brand_color: e.target.value }))}
                className="h-10 w-16 cursor-pointer rounded-lg border border-white/10 bg-transparent"
              />
              <span className="text-sm text-white/40">{form.brand_color}</span>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-white/10 bg-white/4 p-4">
            <p className="mb-3 text-xs text-white/30 uppercase tracking-wide">Preview</p>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-black" style={{ backgroundColor: form.brand_color }}>
                {form.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{form.name || "Your Agency"}</p>
                <p className="text-xs text-white/40">{form.tagline || "Powered by HireFlow"}</p>
              </div>
            </div>
            <p className="text-xs text-white/30">hire-flow.app/agency/{form.slug || "your-agency"}</p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !form.name || !form.slug}
            style={{ backgroundColor: "#06b6d4", color: "#000" }}
            className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create branded platform →"}
          </button>
        </form>
      </div>
    </div>
  )
}
