"use client"

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

type EditCVFormProps = {
  cv: {
    id: string
    title: string | null
    full_name: string | null
    summary: string | null
    email: string | null
    phone: string | null
    location: string | null
    website: string | null
    linkedin: string | null
    github: string | null
    skills: string | null
    experience: ExperienceItem[] | null
    education_entries: EducationItem[] | null
  }
  action: (formData: FormData) => void
}

export default function EditCVForm({ cv, action }: EditCVFormProps) {
  const [experience, setExperience] = useState<ExperienceItem[]>(
    Array.isArray(cv.experience) && cv.experience.length > 0
      ? cv.experience
      : [{ title: "", company: "", dates: "", description: "" }]
  )

  const [education, setEducation] = useState<EducationItem[]>(
    Array.isArray(cv.education_entries) && cv.education_entries.length > 0
      ? cv.education_entries
      : [{ school: "", qualification: "", dates: "", description: "" }]
  )

  const [improvingIndex, setImprovingIndex] = useState<number | null>(null)

  const addExperience = () => {
    setExperience([
      ...experience,
      { title: "", company: "", dates: "", description: "" },
    ])
  }

  const removeExperience = (index: number) => {
    if (experience.length === 1) {
      setExperience([{ title: "", company: "", dates: "", description: "" }])
      return
    }
    setExperience(experience.filter((_, i) => i !== index))
  }

  const updateExperience = (
    index: number,
    field: keyof ExperienceItem,
    value: string
  ) => {
    const next = [...experience]
    next[index] = { ...next[index], [field]: value }
    setExperience(next)
  }

  const addEducation = () => {
    setEducation([
      ...education,
      { school: "", qualification: "", dates: "", description: "" },
    ])
  }

  const removeEducation = (index: number) => {
    if (education.length === 1) {
      setEducation([
        { school: "", qualification: "", dates: "", description: "" },
      ])
      return
    }
    setEducation(education.filter((_, i) => i !== index))
  }

  const updateEducation = (
    index: number,
    field: keyof EducationItem,
    value: string
  ) => {
    const next = [...education]
    next[index] = { ...next[index], [field]: value }
    setEducation(next)
  }

  const improveExperience = async (index: number) => {
    const current = experience[index]?.description?.trim()

    if (!current) {
      alert("Please add some experience text first.")
      return
    }

    try {
      setImprovingIndex(index)

      const response = await fetch("/api/improve-experience", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: current,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data?.error || "Failed to improve experience")
        return
      }

      const improved = String(data?.improved || "").trim()

      if (!improved) {
        alert("No improved text returned")
        return
      }

      updateExperience(index, "description", improved)

      if (data?.mode === "mock") {
        alert("Improved in safe mock mode. Turn AI_ENABLED=true later for real AI.")
      }
    } catch (error) {
      console.error(error)
      alert("Failed to improve experience")
    } finally {
      setImprovingIndex(null)
    }
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="cvId" value={cv.id} />

      <div className="rounded-2xl border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Basic Details</h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium">CV Label</label>
          <input
            name="title"
            defaultValue={cv.title ?? ""}
            placeholder="Internal CV name"
            className="w-full rounded-lg border px-4 py-3"
          />
          <p className="text-sm text-gray-500">
            This is your internal CV name for the dashboard.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Full Name</label>
          <input
            name="full_name"
            defaultValue={cv.full_name ?? ""}
            placeholder="e.g. Elena Rahimi"
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Summary</label>
          <textarea
            name="summary"
            defaultValue={cv.summary ?? ""}
            placeholder="Professional summary"
            rows={5}
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="email"
            defaultValue={cv.email ?? ""}
            placeholder="Email"
            className="w-full rounded-lg border px-4 py-3"
          />
          <input
            name="phone"
            defaultValue={cv.phone ?? ""}
            placeholder="Phone"
            className="w-full rounded-lg border px-4 py-3"
          />
          <input
            name="location"
            defaultValue={cv.location ?? ""}
            placeholder="Location"
            className="w-full rounded-lg border px-4 py-3"
          />
          <input
            name="website"
            defaultValue={cv.website ?? ""}
            placeholder="Website"
            className="w-full rounded-lg border px-4 py-3"
          />
          <input
            name="linkedin"
            defaultValue={cv.linkedin ?? ""}
            placeholder="LinkedIn"
            className="w-full rounded-lg border px-4 py-3"
          />
          <input
            name="github"
            defaultValue={cv.github ?? ""}
            placeholder="GitHub"
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Skills</label>
          <textarea
            name="skills"
            defaultValue={cv.skills ?? ""}
            placeholder="e.g. teamwork, communication, leadership"
            rows={4}
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>
      </div>

      <div className="rounded-2xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Experience</h2>
          <button
            type="button"
            onClick={addExperience}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            + Add another job
          </button>
        </div>

        {experience.map((item, index) => (
          <div key={index} className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Job {index + 1}</h3>
              <button
                type="button"
                onClick={() => removeExperience(index)}
                className="rounded-lg border px-3 py-1 text-sm"
              >
                Remove
              </button>
            </div>

            <input
              name={`exp_title_${index}`}
              value={item.title}
              onChange={(e) =>
                updateExperience(index, "title", e.target.value)
              }
              placeholder="Job Title"
              className="w-full rounded-lg border px-4 py-3"
            />

            <input
              name={`exp_company_${index}`}
              value={item.company}
              onChange={(e) =>
                updateExperience(index, "company", e.target.value)
              }
              placeholder="Company"
              className="w-full rounded-lg border px-4 py-3"
            />

            <input
              name={`exp_dates_${index}`}
              value={item.dates}
              onChange={(e) =>
                updateExperience(index, "dates", e.target.value)
              }
              placeholder="e.g. Jan 2023 - Mar 2025"
              className="w-full rounded-lg border px-4 py-3"
            />

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-sm font-medium">
                  Description
                </label>

                <button
                  type="button"
                  onClick={() => improveExperience(index)}
                  disabled={improvingIndex === index}
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
                >
                  {improvingIndex === index
                    ? "Improving..."
                    : "Improve with AI"}
                </button>
              </div>

              <textarea
                name={`exp_desc_${index}`}
                value={item.description}
                onChange={(e) =>
                  updateExperience(index, "description", e.target.value)
                }
                placeholder="Write one achievement per line. Example:
Managed daily operations
Led a team of 16 people
Handled rota and finance"
                rows={6}
                className="w-full rounded-lg border px-4 py-3"
              />

              <p className="text-sm text-gray-500">
                Tip: add one achievement per line. Each line becomes a bullet point in the CV preview.
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Education</h2>
          <button
            type="button"
            onClick={addEducation}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            + Add another education
          </button>
        </div>

        {education.map((item, index) => (
          <div key={index} className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Education {index + 1}</h3>
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="rounded-lg border px-3 py-1 text-sm"
              >
                Remove
              </button>
            </div>

            <input
              name={`edu_school_${index}`}
              value={item.school}
              onChange={(e) => updateEducation(index, "school", e.target.value)}
              placeholder="School / College / University"
              className="w-full rounded-lg border px-4 py-3"
            />

            <input
              name={`edu_qualification_${index}`}
              value={item.qualification}
              onChange={(e) =>
                updateEducation(index, "qualification", e.target.value)
              }
              placeholder="Qualification"
              className="w-full rounded-lg border px-4 py-3"
            />

            <input
              name={`edu_dates_${index}`}
              value={item.dates}
              onChange={(e) => updateEducation(index, "dates", e.target.value)}
              placeholder="e.g. 2005 - 2009"
              className="w-full rounded-lg border px-4 py-3"
            />

            <textarea
              name={`edu_desc_${index}`}
              value={item.description}
              onChange={(e) =>
                updateEducation(index, "description", e.target.value)
              }
              placeholder="Extra notes, grades, achievements, modules..."
              rows={4}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="rounded-lg bg-black px-5 py-3 text-white"
      >
        Update CV
      </button>
    </form>
  )
}