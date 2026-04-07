type InterviewJob = {
  id: string;
  company: string;
  role: string;
  interview_date: string | null;
};

function formatInterviewDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getInterviewLabel(date: string) {
  const now = new Date();
  const interview = new Date(date);

  const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const interviewStart = new Date(
    interview.getFullYear(),
    interview.getMonth(),
    interview.getDate()
  );

  const diffMs = interviewStart.getTime() - nowStart.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days left`;
}

function getLabelClasses(date: string) {
  const now = new Date();
  const interview = new Date(date);

  const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const interviewStart = new Date(
    interview.getFullYear(),
    interview.getMonth(),
    interview.getDate()
  );

  const diffMs = interviewStart.getTime() - nowStart.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return "bg-blue-500/20 text-blue-300 border border-blue-400/30";
  }

  if (days === 1) {
    return "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30";
  }

  if (days <= 3) {
    return "bg-yellow-500/20 text-yellow-300 border border-yellow-400/30";
  }

  return "bg-white/10 text-gray-300 border border-white/10";
}

export default function UpcomingInterviews({
  jobs,
}: {
  jobs: InterviewJob[];
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Upcoming Interviews</h2>
          <p className="mt-1 text-sm text-gray-400">
            Your nearest scheduled interviews
          </p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-center">
          <p className="text-sm text-gray-400">No upcoming interviews scheduled.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20 hover:bg-black/30 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-white">{job.company}</h3>
                <p className="text-sm text-gray-400">{job.role}</p>
              </div>

              <div className="md:text-right">
                <p className="text-sm font-medium text-blue-300">
                  {job.interview_date
                    ? formatInterviewDate(job.interview_date)
                    : "No date"}
                </p>

                {job.interview_date && (
                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${getLabelClasses(
                      job.interview_date
                    )}`}
                  >
                    {getInterviewLabel(job.interview_date)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}