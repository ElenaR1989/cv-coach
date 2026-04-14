import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

type CVPrintPageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    applicationId?: string
  }>
}

export default async function CVPrintPage({
  params,
  searchParams,
}: CVPrintPageProps) {
  const { id } = await params
  const { applicationId } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: cv, error: cvError } = await supabase
    .from("cv_profiles")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (cvError || !cv) {
    notFound()
  }

  let tailoredSummary: string | null = null
  let tailoredRole: string | null = null
  let tailoredCompany: string | null = null

  if (applicationId) {
    const { data: application } = await supabase
      .from("job_applications")
      .select("id, company, role, tailored_cv")
      .eq("id", applicationId)
      .eq("user_id", user.id)
      .single()

    if (application?.tailored_cv?.trim()) {
      tailoredSummary = application.tailored_cv
      tailoredRole = application.role
      tailoredCompany = application.company
    }
  }

  const summaryToShow = tailoredSummary?.trim() || cv.summary || ""

  return (
    <html>
      <head>
        <title>
          {cv.full_name || cv.title || "CV"}
        </title>
        <style>{`
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            background: white;
            color: black;
          }

          .page {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px;
          }

          .header {
            margin-bottom: 24px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
          }

          .name {
            font-size: 34px;
            font-weight: 700;
            margin: 0 0 8px 0;
          }

          .meta {
            font-size: 14px;
            color: #374151;
            margin-bottom: 4px;
          }

          .badge {
            display: inline-block;
            margin-top: 10px;
            padding: 8px 12px;
            border: 1px solid #10b981;
            background: #ecfdf5;
            color: #065f46;
            border-radius: 8px;
            font-size: 13px;
          }

          .section {
            margin-top: 28px;
          }

          .section-title {
            font-size: 14px;
            letter-spacing: 1px;
            text-transform: uppercase;
            font-weight: 700;
            margin-bottom: 12px;
            color: #111827;
          }

          .summary {
            font-size: 16px;
            line-height: 1.7;
            white-space: pre-wrap;
          }

          .grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 28px;
            margin-top: 24px;
          }

          .card {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px;
          }

          ul {
            margin: 0;
            padding-left: 18px;
          }

          li {
            margin-bottom: 6px;
          }

          .print-actions {
            max-width: 900px;
            margin: 20px auto 0;
            padding: 0 40px;
          }

          .print-button {
            padding: 10px 16px;
            border: 1px solid #111827;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
          }

          @media print {
            .print-actions {
              display: none;
            }

            .page {
              padding: 0;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="print-actions">
          <button
            className="print-button"
            onClick={() => window.print()}
          >
            Save as PDF
          </button>
        </div>

        <div className="page">
          <div className="header">
            <h1 className="name">{cv.full_name || cv.title}</h1>

            {cv.email ? <div className="meta">{cv.email}</div> : null}
            {cv.phone ? <div className="meta">{cv.phone}</div> : null}
            {cv.location ? <div className="meta">{cv.location}</div> : null}
            {cv.website ? <div className="meta">{cv.website}</div> : null}

            {tailoredSummary ? (
              <div className="badge">
                Tailored for {tailoredCompany} — {tailoredRole}
              </div>
            ) : null}
          </div>

          <div className="grid">
            <div>
              <div className="card">
                <div className="section-title">Contact</div>
                {cv.email ? <div className="meta">{cv.email}</div> : null}
                {cv.phone ? <div className="meta">{cv.phone}</div> : null}
                {cv.location ? <div className="meta">{cv.location}</div> : null}
                {cv.website ? <div className="meta">{cv.website}</div> : null}
              </div>

              {Array.isArray(cv.skills) && cv.skills.length > 0 ? (
                <div className="card" style={{ marginTop: "16px" }}>
                  <div className="section-title">Skills</div>
                  <ul>
                    {cv.skills.map((skill: string) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div>
              <div className="section">
                <div className="section-title">Professional Summary</div>
                <div className="summary">{summaryToShow}</div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}