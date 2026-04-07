function cleanLines(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line.length > 5)
    .filter((line) => !/^[A-Z][a-z]+\s[A-Z][a-z]+$/.test(line)) // remove names
}

function isWeakLine(line: string) {
  const weakWords = ["team work", "organised", "responsible", "helped"]
  return weakWords.some((word) => line.toLowerCase().includes(word))
}

export function improveCVForJob(cvText: string, jobText: string) {
  const jobLower = jobText.toLowerCase()
  const cvLower = cvText.toLowerCase()

  const suggestions: string[] = []
  const improvedBullets: { before: string; after: string }[] = []

  const keywords = [
    "customer",
    "sales",
    "team",
    "communication",
    "targets",
    "remote",
    "service",
    "support",
    "client",
  ]

  const missingKeywords = keywords.filter(
    (k) => jobLower.includes(k) && !cvLower.includes(k)
  )

  const lines = cleanLines(cvText).slice(0, 5)

  for (const line of lines) {
    let improved = line

    if (/rota/i.test(line)) {
      improved =
        "Managed staff rota planning to ensure smooth daily operations and full shift coverage."
    } else if (/finance/i.test(line)) {
      improved =
        "Handled financial tasks and supported budgeting to maintain accurate records and efficiency."
    } else if (/team/i.test(line)) {
      improved =
        "Collaborated with team members to improve workflow, communication, and service delivery."
    } else if (/customer|service/i.test(line)) {
      improved =
        "Delivered excellent customer service, resolving issues and improving customer satisfaction."
    } else if (isWeakLine(line)) {
      improved =
        "Contributed to team success by improving processes, communication, and daily operations."
    } else {
      // skip random text
      continue
    }

    if (missingKeywords.length > 0) {
      const keyword = missingKeywords[0]
      if (!improved.toLowerCase().includes(keyword)) {
        improved += ` Focused on ${keyword}.`
      }
    }

    improvedBullets.push({
      before: line,
      after: improved,
    })
  }

  if (improvedBullets.length === 0) {
    improvedBullets.push({
      before: "No usable experience found",
      after:
        "Add more detailed experience bullet points so your CV can be tailored to jobs.",
    })
  }

  suggestions.push("Use strong action verbs like managed, led, improved.")
  suggestions.push("Add measurable results (numbers, targets, achievements).")

  if (missingKeywords.length > 0) {
    suggestions.push(
      `Include keywords from the job: ${missingKeywords.slice(0, 5).join(", ")}`
    )
  }

  return {
    title: "Smarter CV Improvements",
    improvedBullets,
    suggestions,
  }
}