"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  function handleSearch(e) {
    e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }

    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-sm">
      <label className="mb-2 block text-sm font-medium text-gray-300">
        Search by company
      </label>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Type company name..."
        className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </form>
  );
}