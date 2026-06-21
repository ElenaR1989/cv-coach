import JobForm from "@/components/job-form"

type NewJobPageProps = {
  searchParams: Promise<{
    prefill?: string
    company?: string
    role?: string
    description?: string
    url?: string
    source?: string
  }>
}

export default async function NewJobPage({ searchParams }: NewJobPageProps) {
  const { prefill, company, role, description, url, source } = await searchParams

  // If prefill=1, the form will read from sessionStorage client-side
  if (prefill) {
    return <JobForm prefillFromSession />
  }

  return (
    <JobForm
      initialData={{
        company: company ?? "",
        role: role ?? "",
        job_url: url ?? "",
        source: source ?? "",
        job_description: description ?? "",
      }}
    />
  )
}
