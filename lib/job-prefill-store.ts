type PrefillJob = {
  company: string
  role: string
  source: string
  job_url: string
  job_description: string
}

let pending: PrefillJob | null = null

export function setPrefillJob(data: PrefillJob) {
  pending = data
}

export function consumePrefillJob(): PrefillJob | null {
  const data = pending
  pending = null
  return data
}
