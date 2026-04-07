"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function StatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }

    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="w-full max-w-xs">
      <label className="mb-2 block text-sm font-medium text-gray-300">
        Filter by status
      </label>
      <select
        value={currentStatus}
        onChange={handleChange}
        className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All</option>
        <option value="Applied">Applied</option>
        <option value="Interviewing">Interviewing</option>
        <option value="Offer">Offer</option>
        <option value="Rejected">Rejected</option>
      </select>
    </div>
  );
}