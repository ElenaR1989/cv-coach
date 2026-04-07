"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const params = new URLSearchParams(searchParams.toString())

    if (search.trim()) {
      params.set("search", search.trim())
    } else {
      params.delete("search")
    }

    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-sm">
      <label className="mb-2 block text-sm font-medium text-gray-300">
        Search by company
      </label>

      <input
        type="text"
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setSearch(e.target.value)
        }}
        placeholder="Type company name..."
        className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-gray-500"
      />
    </form>
  )
}