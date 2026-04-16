import CVPreview from "@/app/dashboard/cvs/[id]/CVPreview"

export default function CvPrintPage() {
  const fakeCV = {
    id: "123",
    full_name: "Elena Rahimi",
    title: "Professional Profile",
    email: "test@test.com",
    phone: "123456789",
    location: "London",
    website: null,
    linkedin: null,
    github: null,
    skills: "React, Next.js, TypeScript",
    education: "My University",
    experience: [],
    education_entries: [],
  }

  return (
    <div style={{ background: "white", padding: "20px" }}>
      <CVPreview
        cv={fakeCV}
        applicationId="test-app-id"
        application={null}
        isPrint={true}
      />
    </div>
  )
}