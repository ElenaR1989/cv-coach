"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import FavoriteButton from "./favorite-button";

type Job = {
  id: string;
  company: string;
  role: string;
  status: "Applied" | "Interviewing" | "Offer" | "Rejected";
  notes: string | null;
  interview_date: string | null;
  is_favorite: boolean | null;
  created_at: string;
};

type JobsListProps = {
  jobs: Job[];
};

type EditFormData = {
  company: string;
  role: string;
  status: "Applied" | "Interviewing" | "Offer" | "Rejected";
  notes: string;
  interview_date: string;
};

function formatUtcDate(dateString: string) {
  const date = new Date(dateString);

  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const month = months[date.getUTCMonth()];

  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

function toDatetimeLocalValue(dateString: string | null) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getStatusClasses(status: Job["status"]) {
  switch (status) {
    case "Applied":
      return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
    case "Interviewing":
      return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
    case "Offer":
      return "bg-green-500/20 text-green-300 border border-green-500/30";
    case "Rejected":
      return "bg-red-500/20 text-red-300 border border-red-500/30";
    default:
      return "bg-zinc-500/20 text-zinc-300 border border-zinc-500/30";
  }
}

export default function JobsList({ jobs }: JobsListProps) {
  const router = useRouter();
  const supabase = createClient();

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);

  const [coverLetterJob, setCoverLetterJob] = useState<Job | null>(null);
  const [coverLetterText, setCoverLetterText] = useState("");

  const [editForm, setEditForm] = useState<EditFormData>({
    company: "",
    role: "",
    status: "Applied",
    notes: "",
    interview_date: "",
  });

  const favoriteCount = useMemo(() => {
    return jobs.filter((job) => job.is_favorite).length;
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = jobs.filter((job) => {
      const matchesFavorites = showFavoritesOnly ? job.is_favorite : true;

      const matchesStatus =
        selectedStatus === "All" ? true : job.status === selectedStatus;

      const matchesSearch =
        normalizedSearch === ""
          ? true
          : job.company.toLowerCase().includes(normalizedSearch) ||
            job.role.toLowerCase().includes(normalizedSearch);

      return matchesFavorites && matchesStatus && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      const aFav = a.is_favorite ? 1 : 0;
      const bFav = b.is_favorite ? 1 : 0;

      if (bFav !== aFav) {
        return bFav - aFav;
      }

      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [jobs, showFavoritesOnly, searchTerm, selectedStatus]);

  function handleGenerateCoverLetter(job: Job) {
    const text = `Dear Hiring Manager,

I am writing to express my interest in the ${job.role} position at ${job.company}.

I have been actively applying to roles in this field and believe my skills and experience align well with the requirements of this position. I am particularly interested in this opportunity because of the work your company is doing and the potential to grow within your team.

Through my experience, I have developed strong problem-solving skills and a solid foundation in modern technologies, allowing me to contribute effectively in a fast-paced environment.

I would welcome the opportunity to discuss how I can contribute to your team.

Thank you for your time and consideration.

Kind regards,
Elena`;

    setCoverLetterJob(job);
    setCoverLetterText(text);
  }

  function handleStartEdit(job: Job) {
    setEditingJobId(job.id);
    setEditForm({
      company: job.company,
      role: job.role,
      status: job.status,
      notes: job.notes ?? "",
      interview_date: toDatetimeLocalValue(job.interview_date),
    });
  }

  function handleCancelEdit() {
    setEditingJobId(null);
    setEditForm({
      company: "",
      role: "",
      status: "Applied",
      notes: "",
      interview_date: "",
    });
  }

  async function handleSaveEdit(jobId: string) {
    try {
      setSavingJobId(jobId);

      const payload = {
        company: editForm.company.trim(),
        role: editForm.role.trim(),
        status: editForm.status,
        notes: editForm.notes.trim() || null,
        interview_date: editForm.interview_date
          ? new Date(editForm.interview_date).toISOString()
          : null,
      };

      if (!payload.company || !payload.role) {
        alert("Company and role are required.");
        return;
      }

      const { error } = await supabase
        .from("job_applications")
        .update(payload)
        .eq("id", jobId);

      if (error) {
        console.error("Update error:", error.message);
        alert(`Failed to update job: ${error.message}`);
        return;
      }

      setEditingJobId(null);
      router.refresh();
    } catch (error) {
      console.error("Unexpected update error:", error);
      alert("Something went wrong while updating the job.");
    } finally {
      setSavingJobId(null);
    }
  }

  async function handleDelete(jobId: string, role: string, company: string) {
    const confirmed = window.confirm(
      `Delete "${role}" at "${company}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingJobId(jobId);

      const { error } = await supabase
        .from("job_applications")
        .delete()
        .eq("id", jobId);

      if (error) {
        console.error("Delete error:", error.message);
        alert(`Failed to delete job: ${error.message}`);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Unexpected delete error:", error);
      alert("Something went wrong while deleting the job.");
    } finally {
      setDeletingJobId(null);
    }
  }

  async function handleCopyCoverLetter() {
    try {
      await navigator.clipboard.writeText(coverLetterText);
      alert("Cover letter copied to clipboard.");
    } catch (error) {
      console.error("Copy failed:", error);
      alert("Failed to copy cover letter.");
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Your Applications</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Track your applications, interviews, and priorities.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Search by company or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-blue-500"
            />

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-sm font-medium text-yellow-300">
              Favorites: {favoriteCount}
            </span>

            <button
              type="button"
              onClick={() => setShowFavoritesOnly((prev) => !prev)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                showFavoritesOnly
                  ? "border-yellow-400 bg-yellow-500/20 text-yellow-300"
                  : "border-white/10 bg-zinc-950/60 text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              {showFavoritesOnly ? "Showing Favorites" : "Show Favorites Only"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
          <span>
            Results:{" "}
            <span className="font-medium text-white">{filteredJobs.length}</span>
          </span>

          {(searchTerm || selectedStatus !== "All" || showFavoritesOnly) && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("All");
                setShowFavoritesOnly(false);
              }}
              className="rounded-lg border border-white/10 px-3 py-1 text-zinc-300 transition hover:bg-zinc-800"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-zinc-950/50 p-8 text-center">
          <p className="text-base font-medium text-white">
            No matching applications found.
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Try changing your search, status filter, or favorites filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <article
              key={job.id}
              className={`rounded-2xl border p-5 transition ${
                job.is_favorite
                  ? "border-yellow-500/30 bg-yellow-500/10"
                  : "border-white/10 bg-zinc-950/60"
              }`}
            >
              {editingJobId === job.id ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-300">
                        Company
                      </label>
                      <input
                        type="text"
                        value={editForm.company}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            company: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-300">
                        Role
                      </label>
                      <input
                        type="text"
                        value={editForm.role}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            role: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-300">
                        Status
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            status: e.target.value as EditFormData["status"],
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-300">
                        Interview Date
                      </label>
                      <input
                        type="datetime-local"
                        value={editForm.interview_date}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            interview_date: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Notes
                    </label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(job.id)}
                      disabled={savingJobId === job.id}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingJobId === job.id ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {job.role}
                      </h3>
                      <p className="text-sm text-zinc-400">{job.company}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <FavoriteButton
                        jobId={job.id}
                        isFavorite={Boolean(job.is_favorite)}
                      />

                      <button
                        type="button"
                        onClick={() => handleGenerateCoverLetter(job)}
                        className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300 transition hover:bg-purple-500/20"
                      >
                        Cover Letter
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(job)}
                        className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(job.id, job.role, job.company)
                        }
                        disabled={deletingJobId === job.id}
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingJobId === job.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>

                    <span className="text-xs text-zinc-500">
                      Added {formatUtcDate(job.created_at)}
                    </span>
                  </div>

                  {job.interview_date && (
                    <p className="mt-3 text-sm text-blue-300">
                      Interview: {formatUtcDate(job.interview_date)}
                    </p>
                  )}

                  {job.notes && (
                    <p className="mt-3 text-sm leading-6 text-zinc-300">
                      {job.notes}
                    </p>
                  )}
                </>
              )}
            </article>
          ))}
        </div>
      )}

      {coverLetterJob && (
        <div className="mt-6 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-white">
              Cover Letter — {coverLetterJob.role} at {coverLetterJob.company}
            </h3>

            <button
              type="button"
              onClick={() => setCoverLetterJob(null)}
              className="rounded-lg border border-white/10 px-3 py-1 text-sm text-zinc-300 transition hover:bg-zinc-800"
            >
              Close
            </button>
          </div>

          <textarea
            value={coverLetterText}
            onChange={(e) => setCoverLetterText(e.target.value)}
            className="min-h-[280px] w-full rounded-xl border border-white/10 bg-zinc-950/60 p-4 text-sm text-white outline-none focus:border-purple-500"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCopyCoverLetter}
              className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500"
            >
              Copy
            </button>

            <button
              type="button"
              onClick={() => setCoverLetterJob(null)}
              className="rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}