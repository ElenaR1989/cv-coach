"use client"

import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

type ExperienceItem = {
  title: string
  company: string
  dates: string
  description: string
}

type EducationItem = {
  school: string
  qualification: string
  dates: string
  description: string
}

export default function NewCVPage() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    { title: "", company: "", dates: "", description: "" },
  ])

  const [educations, setEducations] = useState<EducationItem[]>([
    { school: "", qualification: "", dates: "", description: "" },
  ])

  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      { title: "", company: "", dates: "", description: "" },
    ])
  }

  const updateExperience = (
    index: number,
    field: keyof ExperienceItem,
    value: string
  ) => {
    setExperiences((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  const removeExperience = (index: number) => {
    setExperiences((prev) => prev.filter((_, i) => i !== index))
  }

  const addEducation = () => {
    setEducations((prev) => [
      ...prev,
      { school: "", qualification: "", dates: "", description: "" },
    ])
  }

  const updateEducation = (
    index: number,
    field: keyof EducationItem,
    value: string
  ) => {
    setEducations((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  const removeEducation = (index: number) => {
    setEducations((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(formData: FormData) {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    const title = String(formData.get("title") || "").trim()
    const fullName = String(formData.get("full_name") || "").trim()
    const summary = String(formData.get("summary") || "").trim()
    const email = String(formData.get("email") || "").trim()
    const phone = String(formData.get("phone") || "").trim()
    const location = String(formData.get("location") || "").trim()
    const website = String(formData.get("website") || "").trim()
    const linkedin = String(formData.get("linkedin") || "").trim()
    const github = String(formData.get("github") || "").trim()
    const skills = String(formData.get("skills") || "").trim()

    if (!title) {
      alert("CV label is required")
      return
    }

    const cleanedExperiences = experiences
      .map((item) => ({
        title: item.title.trim(),
        company: item.company.trim(),
        dates: item.dates.trim(),
        description: item.description.trim(),
      }))
      .filter(
        (item) =>
          item.title || item.company || item.dates || item.description
      )

    const cleanedEducations = educations
      .map((item) => ({
        school: item.school.trim(),
        qualification: item.qualification.trim(),
        dates: item.dates.trim(),
        description: item.description.trim(),
      }))
      .filter(
        (item) =>
          item.school ||
          item.qualification ||
          item.dates ||
          item.description
      )

    const { error } = await supabase.from("cv_profiles").insert([
      {
        user_id: user.id,
        title,
        full_name: fullName || null,
        summary: summary || null,
        email: email || null,
        phone: phone || null,
        location: location || null,
        website: website || null,
        linkedin: linkedin || null,
        github: github || null,
        skills: skills || null,
        experience: cleanedExperiences.length ? cleanedExperiences : null,
        education_entries: cleanedEducations.length ? cleanedEducations : null,
      },
    ])

    if (error) {
      alert(error.message)
      return
    }

    window.location.href = "/dashboard/cvs"
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/cvs"
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Back to CVs
        </Link>

        <Link
          href="/dashboard"
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Create CV</h1>
        <p className="text-muted-foreground">Add a new CV version</p>
      </div>

      <form
        action={handleSubmit}
        className="space-y-5 rounded-2xl border bg-background p-6 shadow-sm"
      >
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">
            CV Label
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="e.g. R Elena Rahimi"
            className="w-full rounded-lg border px-4 py-3"
          />
          <p className="text-xs text-muted-foreground">
            This is your internal CV name for the dashboard.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="full_name" className="block text-sm font-medium">
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            placeholder="e.g. Elena Rahimi"
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="summary" className="block text-sm font-medium">
            Summary
          </label>
          <textarea
            id="summary"
            name="summary"
            rows={4}
            placeholder="A short professional summary..."
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border px-4 py-3"
          />
          <input
            name="phone"
            type="text"
            placeholder="Phone"
            className="w-full rounded-lg border px-4 py-3"
          />
          <input
            name="location"
            type="text"
            placeholder="Location"
            className="w-full rounded-lg border px-4 py-3"
          />
          <input
            name="website"
            type="text"
            placeholder="Website"
            className="w-full rounded-lg border px-4 py-3"
          />
          <input
            name="linkedin"
            type="text"
            placeholder="LinkedIn"
            className="w-full rounded-lg border px-4 py-3"
          />
          <input
            name="github"
            type="text"
            placeholder="GitHub"
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="skills" className="block text-sm font-medium">
            Skills
          </label>
          <textarea
            id="skills"
            name="skills"
            rows={4}
            placeholder="e.g. Customer service, communication, teamwork"
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        <div className="space-y-4 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Experience</h2>
            <button
              type="button"
              onClick={addExperience}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
            >
              + Add another job
            </button>
          </div>

          <div className="space-y-4">
            {experiences.map((experience, index) => (
              <div key={index} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Job {index + 1}</p>

                  {experiences.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="rounded-lg border px-3 py-1 text-sm hover:bg-muted"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Job Title"
                  value={experience.title}
                  onChange={(e) =>
                    updateExperience(index, "title", e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                />

                <input
                  type="text"
                  placeholder="Company"
                  value={experience.company}
                  onChange={(e) =>
                    updateExperience(index, "company", e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                />

                <input
                  type="text"
                  placeholder="e.g. Jan 2023 - Mar 2025"
                  value={experience.dates}
                  onChange={(e) =>
                    updateExperience(index, "dates", e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                />

                <textarea
                  rows={5}
                  placeholder="Describe what you did in this role... Put each achievement on a new line."
                  value={experience.description}
                  onChange={(e) =>
                    updateExperience(index, "description", e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Education</h2>
            <button
              type="button"
              onClick={addEducation}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
            >
              + Add another education
            </button>
          </div>

          <div className="space-y-4">
            {educations.map((education, index) => (
              <div key={index} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Education {index + 1}</p>

                  {educations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="rounded-lg border px-3 py-1 text-sm hover:bg-muted"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="School / College / University"
                  value={education.school}
                  onChange={(e) =>
                    updateEducation(index, "school", e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                />

                <input
                  type="text"
                  placeholder="Qualification / Course"
                  value={education.qualification}
                  onChange={(e) =>
                    updateEducation(index, "qualification", e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                />

                <input
                  type="text"
                  placeholder="e.g. Sep 2013 - Jun 2016"
                  value={education.dates}
                  onChange={(e) =>
                    updateEducation(index, "dates", e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                />

                <textarea
                  rows={4}
                  placeholder="Extra notes, grades, achievements, modules..."
                  value={education.description}
                  onChange={(e) =>
                    updateEducation(index, "description", e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-black px-5 py-3 text-white hover:opacity-90"
        >
          Save CV
        </button>
      </form>
    </div>
  )
}