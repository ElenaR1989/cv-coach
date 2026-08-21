"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

interface Agency {
  id: string
  name: string
  slug: string
  tagline: string
  brand_color: string
}

interface Candidate {
  user_id: string
  joined_at: string
  applications: number
}

interface Lead {
  user_id: string
  full_name: string | null
  career_goal: string | null
  location: string | null
  created_at: string
  applications: number
}

function AgencyDashboardInner() {
  const searchParams = useSearchParams()
  const agencyId = searchParams.get("id")

  const [agencies, setAgencies] = useState<Agency[]>([])
  const [selected, setSelected] = useState<Agency | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [activeTab, setActiveTab] = useState<"candidates" | "leads">("candidates")
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch("/api/agency/my")
      .then(r => r.json())
      .then(d => {
        setAgencies(d.agencies || [])
        const active = d.agencies?.find((a: Agency) => a.id === agencyId) || d.agencies?.[0]
        if (active) setSelected(active)
        setLoading(false)
      })
  }, [agencyId])

  useEffect(() => {
    if (!selected) return
    fetch(`/api/agency/candidates?agency_id=${selected.id}`)
      .then(r => r.json())
      .then(d => setCandidates(d.candidates || []))
    fetch(`/api/agency/leads?agency_id=${selected.id}`)
      .then(r => r.json())
      .then(d => setLeads(d.leads || []))
  }, [selected])

  const inviteLink = selected ? `${window.location.origin}/agency/${selected.slug}` : ""

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#050816] text-white/40">Loading…</div>
  )

  if (!agencies.length) return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050816] text-white text-center px-6">
      <h1 className="text-2xl font-bold mb-3">No agency set up yet</h1>
      <p className="text-white/40 mb-6">Create your branded platform in 2 minutes.</p>
      <Link href="/agency/new" style={{ backgroundColor: "#06b6d4", color: "#000" }} className="rounded-xl px-6 py-3 text-sm font-bold">
        Set up your agency →
      </Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="HireFlow" width={32} height={32} className="rounded-md" />
            <div>
              <p className="text-sm font-semibold text-white">Agency Dashboard</p>
              <p className="text-xs text-white/40">HireFlow White-label</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/agency/new" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white transition">
              + New agency
            </Link>
            <Link href="/dashboard" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white transition">
              ← HireFlow
            </Link>
          </div>
        </div>

        {agencies.length > 1 && (
          <div className="mb-6 flex gap-2 flex-wrap">
            {agencies.map(a => (
              <button key={a.id} onClick={() => setSelected(a)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${selected?.id === a.id ? "text-black" : "border border-white/10 text-white/60 hover:text-white"}`}
                style={selected?.id === a.id ? { backgroundColor: a.brand_color } : {}}>
                {a.name}
              </button>
            ))}
          </div>
        )}

        {selected && (
          <>
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/4 p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl text-xl font-bold text-black"
                    style={{ backgroundColor: selected.brand_color }}>
                    {selected.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">{selected.name}</h1>
                    <p className="text-sm text-white/40">{selected.tagline || "No tagline set"}</p>
                  </div>
                </div>
                <a href={inviteLink} target="_blank" rel="noreferrer"
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white transition">
                  View branded page ↗
                </a>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-4">
              {[
                { label: "Candidates", value: candidates.length },
                { label: "Total applications", value: candidates.reduce((s, c) => s + c.applications, 0) },
                { label: "Joined this week", value: candidates.filter(c => new Date(c.joined_at) > new Date(Date.now() - 7 * 86400000)).length },
              ].map(s => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/4 p-5 text-center">
                  <p className="text-3xl font-bold text-white">{s.value}</p>
                  <p className="mt-1 text-xs text-white/40">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
              <p className="mb-2 text-sm font-semibold text-cyan-300">Candidate invite link</p>
              <p className="mb-3 text-xs text-white/40">Share this link with candidates — they sign up and are automatically linked to your agency.</p>
              <div className="flex items-center gap-3">
                <code className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 truncate">
                  {inviteLink}
                </code>
                <button onClick={copyLink}
                  style={{ backgroundColor: "#06b6d4", color: "#000" }}
                  className="rounded-xl px-4 py-2.5 text-sm font-bold transition hover:opacity-90 whitespace-nowrap">
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab("candidates")}
                className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${activeTab === "candidates" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
              >
                My Candidates <span className="ml-1.5 rounded-full bg-white/10 px-2 py-0.5 text-xs">{candidates.length}</span>
              </button>
              <button
                onClick={() => setActiveTab("leads")}
                className={`rounded-xl px-5 py-2 text-sm font-semibold transition flex items-center gap-2 ${activeTab === "leads" ? "bg-emerald-500/15 text-emerald-300" : "text-white/40 hover:text-white"}`}
              >
                🎯 HireFlow Leads
                {leads.length > 0 && (
                  <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-black">{leads.length}</span>
                )}
              </button>
            </div>

            {activeTab === "candidates" ? (
              <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/40">Your Candidates</h2>
                {candidates.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-white/30 text-sm">No candidates yet.</p>
                    <p className="mt-2 text-xs text-white/20">Share the invite link above to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {candidates.map(c => (
                      <div key={c.user_id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/60">
                            {c.user_id.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm text-white/70 font-mono">{c.user_id.slice(0, 8)}…</p>
                            <p className="text-xs text-white/30">Joined {new Date(c.joined_at).toLocaleDateString("en-GB")}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">{c.applications}</p>
                          <p className="text-xs text-white/30">applications</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-emerald-300 uppercase tracking-wide">HireFlow Leads</h2>
                    <p className="text-xs text-white/30 mt-1">Active job seekers who opted in to be contacted by agencies</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-300 font-semibold">{leads.length} available</span>
                </div>
                {leads.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-2xl mb-3">🔍</p>
                    <p className="text-white/30 text-sm">No leads available yet.</p>
                    <p className="mt-2 text-xs text-white/20">As more people sign up and opt in, they'll appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leads.map(lead => (
                      <div key={lead.user_id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3 gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-300">
                            {lead.full_name ? lead.full_name[0].toUpperCase() : "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{lead.full_name || "Anonymous user"}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {lead.career_goal && (
                                <span className="text-xs text-emerald-400">🎯 {lead.career_goal}</span>
                              )}
                              {lead.location && (
                                <span className="text-xs text-white/30">📍 {lead.location}</span>
                              )}
                              <span className="text-xs text-white/20">Joined {new Date(lead.created_at).toLocaleDateString("en-GB")}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-semibold text-white">{lead.applications}</p>
                            <p className="text-xs text-white/30">apps sent</p>
                          </div>
                          <a
                            href={`mailto:hello@hire-flow.app?subject=Lead enquiry via HireFlow&body=I'm interested in candidate ${lead.user_id.slice(0,8)} from HireFlow leads.`}
                            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition whitespace-nowrap"
                          >
                            Enquire →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function AgencyDashboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#050816] text-white/40">Loading…</div>}>
      <AgencyDashboardInner />
    </Suspense>
  )
}
