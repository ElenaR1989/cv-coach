type CV = {
  id: string
  full_name?: string | null
  title?: string | null
  summary?: string | null
}

type Props = {
  cv: CV
  applicationId?: string
  application?: {
    id?: string
    company?: string | null
    role?: string | null
    tailored_cv?: string | null
  } | null
  isPrint?: boolean
  template?: string
  theme?: string
}

export default function CVPreview({
  cv,
  application = null,
  isPrint = false,
}: Props) {
  return (
    <div style={{ padding: "24px", background: "white", color: "black" }}>
      <h1>CV PREVIEW DEBUG</h1>
      <p>cv.id: {cv.id}</p>
      <p>full_name: {cv.full_name ?? "none"}</p>
      <p>title: {cv.title ?? "none"}</p>
      <p>summary: {cv.summary ?? "none"}</p>
      <p>isPrint: {String(isPrint)}</p>
      <p>application company: {application?.company ?? "none"}</p>
    </div>
  )
}