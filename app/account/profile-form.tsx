"use client"

import { useState } from "react"

type ProfileFormProps = {
  initialProfile: {
    email: string
    full_name: string
    phone: string
    address_line_1: string
    address_line_2: string
    city: string
    postcode: string
    country: string
    date_of_birth: string
    can_work_full_time: boolean
  }
}

export default function AccountForm({ initialProfile }: ProfileFormProps) {
  const [form, setForm] = useState(initialProfile)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    setError("")

    try {
      const res = await fetch("/api/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to save profile.")
        return
      }

      setMessage("Profile updated successfully.")
    } catch (err) {
      console.error("Profile update error:", err)
      setError("Something went wrong while saving your profile.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-white/70">Email</label>
        <input
          value={form.email}
          disabled
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">Full name</label>
        <input
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">Phone</label>
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">Address line 1</label>
        <input
          value={form.address_line_1}
          onChange={(e) => setForm({ ...form, address_line_1: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">Address line 2</label>
        <input
          value={form.address_line_2}
          onChange={(e) => setForm({ ...form, address_line_2: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-white/70">City</label>
          <input
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-white/70">Postcode</label>
          <input
            value={form.postcode}
            onChange={(e) => setForm({ ...form, postcode: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">Country</label>
        <input
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">Date of birth</label>
        <input
          type="date"
          value={form.date_of_birth || ""}
          onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-white/80">
        <input
          type="checkbox"
          checked={form.can_work_full_time}
          onChange={(e) =>
            setForm({ ...form, can_work_full_time: e.target.checked })
          }
        />
        I can work full time
      </label>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save profile"}
      </button>

      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </form>
  )
}