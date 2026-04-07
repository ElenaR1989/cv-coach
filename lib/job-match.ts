const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "will",
  "your",
  "you",
  "are",
  "our",
  "job",
  "role",
  "have",
  "has",
  "had",
  "was",
  "were",
  "but",
  "not",
  "all",
  "can",
  "any",
  "who",
  "what",
  "when",
  "where",
  "how",
  "why",
  "into",
  "onto",
  "about",
  "than",
  "then",
  "them",
  "they",
  "their",
  "there",
  "here",
  "also",
  "each",
  "able",
  "using",
  "used",
  "use",
  "work",
  "working",
  "experience",
  "required",
  "requirements",
  "skills",
  "skill",
  "responsibilities",
  "responsibility",
  "candidate",
  "ideal",
  "looking",
  "include",
  "including",
])

function normalizeText(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ")
}

function extractKeywords(text: string) {
  const normalized = normalizeText(text)

  const words = normalized
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .filter((word) => word.length >= 4)
    .filter((word) => !STOP_WORDS.has(word))

  const counts = new Map<string, number>()

  for (const word of words) {
    counts.set(word, (counts.get(word) || 0) + 1)
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 15)
}

export function calculateJobMatch(cvText: string, jobText: string) {
  const cleanCV = normalizeText(cvText)
  const cleanJob = normalizeText(jobText)

  if (!jobText.trim()) {
    return {
      score: 0,
      matchedKeywords: [] as string[],
      missingKeywords: [] as string[],
      suggestions: ["Paste a job description to calculate match score."],
    }
  }

  const jobKeywords = extractKeywords(cleanJob)
  const matchedKeywords = jobKeywords.filter((keyword) =>
    cleanCV.includes(keyword)
  )
  const missingKeywords = jobKeywords.filter(
    (keyword) => !cleanCV.includes(keyword)
  )

  const rawScore =
    jobKeywords.length === 0
      ? 0
      : Math.round((matchedKeywords.length / jobKeywords.length) * 100)

  const suggestions: string[] = []

  if (rawScore < 40) {
    suggestions.push("Your CV looks weak for this role. Add more job-specific keywords.")
  } else if (rawScore < 70) {
    suggestions.push("Your CV is partly aligned, but it needs tailoring for this role.")
  } else {
    suggestions.push("Good match. Your CV already aligns well with this role.")
  }

  if (missingKeywords.length > 0) {
    suggestions.push(
      `Try adding these keywords where truthful: ${missingKeywords.slice(0, 5).join(", ")}`
    )
  }

  if (!/\d/.test(cvText)) {
    suggestions.push("Add measurable results like numbers, percentages, or team size.")
  }

  if (!/(managed|led|improved|increased|created|delivered)/i.test(cvText)) {
    suggestions.push("Use stronger action words like managed, led, improved, or delivered.")
  }

  return {
    score: Math.min(rawScore, 100),
    matchedKeywords,
    missingKeywords,
    suggestions,
  }
}