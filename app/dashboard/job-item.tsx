"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type JobItemProps = {
  job: {
    id: string;
    company: string;
    role: string;
    status: string;
    notes?: string | null;
    interview_date?: string | null;
  };
};

function getStatusStyles(status: string) {
  switch (status) {
    case "Applied":
      return "border border-yellow-500/30 bg-yellow-500/20 text-yellow-300";
    case "Interviewing":
      return "border border-blue-500/30 bg-blue-500/20 text-blue-300";
    case "Offer":
      return "border border-green-500/30 bg-green-500/20 text-green-300";
    case "Rejected":
      return "border border-red-500/30 bg-red-500/20 text-red-300";
    default:
      return "border border-gray-500/30 bg-gray-500/20 text-gray-300";
  }
}

export default function JobItem({ job }: JobItemProps) {
  const supabase = createClient();
  const router = useRouter();

  const [status, setStatus] = useState(job.status);
  const [loading, setLoading] = useState(false);

  async function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    setLoading(true);

    const updates: { status: string; interview_date?: null } = {
      status: newStatus,
    };

    if (newStatus !== "Interviewing") {
      updates.interview_date = null;
    }

    const { error } = await supabase
      .from("job_applications")
      .update(updates)
      .eq("id", job.id);

    setLoading(false);

    if (error) {
      console.error(error.message);
      return;
    }

    router.refresh();
  }

  async function handleDelete() {
    setLoading(true);

    const { error } = await supabase
      .from("job_applications")
      .delete()
      .eq("id", job.id);

    setLoading(false);

    if (error) {
      console.error(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-6 shadow-sm transition hover:border-gray-600 hover:shadow-lg">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400">Company</p>
            <h3 className="text-2xl font-semibold text-white">{job.company}</h3>
          </div>

          <div>
            <p className="text-sm text-gray-400">Role</p>
            <p className="text-lg text-gray-200">{job.role}</p>
          </div>

          {job.interview_date ? (
            <div>
              <p className="text-sm text-gray-400">Interview Date</p>
              <p className="text-gray-200">
                {new Date(job.interview_date).toLocaleDateString()}
              </p>
            </div>
          ) : null}

          {job.notes ? (
            <div>
              <p className="text-sm text-gray-400">Notes</p>
              <p className="text-gray-300">{job.notes}</p>
            </div>
          ) : null}
        </div>

        <div className="min-w-[220px] space-y-4">
          <div>
            <p className="mb-2 text-sm text-gray-400">Current Status</p>
            <span
              className={`inline-flex rounded-full px-4 py-1.5 text-sm font-medium ${getStatusStyles(
                status
              )}`}
            >
              {status}
            </span>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Change Status
            </label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={loading}
              className="w-full appearance-none rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Working..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}