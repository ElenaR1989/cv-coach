"use client"

import { useState } from "react"

export default function ExtensionTokenPanel({ existingToken }: { existingToken: string | null }) {
  const [token, setToken] = useState<string | null>(existingToken)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const generate = async () => {
    if (!confirm(token ? "This will invalidate your current token. Continue?" : "Generate a new API token?")) return
    setLoading(true)
    const res = await fetch("/api/extension/generate-token", { method: "POST" })
    const data = await res.json()
    if (data.token) {
      setToken(data.token)
      setRevealed(true)
    }
    setLoading(false)
  }

  const copy = () => {
    if (!token) return
    navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const masked = token ? token.slice(0, 8) + "••••••••••••••••••••••••••••" : null

  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
      <div className="mb-1 flex items-center gap-2">
        <h2 className="text-base font-semibold text-white">Chrome Extension</h2>
        <span className="rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-xs font-bold text-cyan-300">Beta</span>
      </div>
      <p className="mb-6 text-sm text-white/40">
        Install the HireFlow Chrome extension then paste your API token to connect it to your account.
      </p>

      {token ? (
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/35">Your API token</label>
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white/60 truncate">
                {revealed ? token : masked}
              </div>
              <button onClick={() => setRevealed(v => !v)}
                className="rounded-xl border border-white/10 px-3 py-3 text-xs text-white/40 transition hover:text-white/70">
                {revealed ? "Hide" : "Show"}
              </button>
              <button onClick={copy}
                style={copied ? { backgroundColor: "#34d399", color: "#000" } : { backgroundColor: "#06b6d4", color: "#000" }}
                className="rounded-xl px-4 py-3 text-sm font-semibold transition hover:opacity-90">
                {copied ? "✓" : "Copy"}
              </button>
            </div>
          </div>
          <button onClick={generate} disabled={loading}
            className="text-xs text-white/25 transition hover:text-white/50 disabled:opacity-50">
            {loading ? "Generating…" : "Regenerate token"}
          </button>
        </div>
      ) : (
        <button onClick={generate} disabled={loading}
          style={{ backgroundColor: "#06b6d4", color: "#000" }}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50">
          {loading ? "Generating…" : "Generate API token"}
        </button>
      )}

      <div className="mt-6 rounded-xl border border-white/6 bg-white/3 p-4">
        <p className="mb-2 text-xs font-semibold text-white/50">How to set up:</p>
        <ol className="space-y-1 text-xs text-white/35 list-decimal list-inside">
          <li>Generate your token above and copy it</li>
          <li>Install the HireFlow extension in Chrome</li>
          <li>Click the extension icon and paste your token</li>
          <li>Browse any job on LinkedIn, Indeed, Reed, or Glassdoor</li>
          <li>Click the extension to save it instantly</li>
        </ol>
      </div>
    </div>
  )
}
