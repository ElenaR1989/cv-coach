export function calculateCVScore(cvText: string) {
  let score = 0
  const suggestions: string[] = []

  const text = cvText.toLowerCase()

  // Length check
  if (text.length > 300) {
    score += 20
  } else {
    suggestions.push("Add more detail to your CV")
  }

  // Action verbs
  const actionWords = ["managed", "led", "improved", "increased", "created"]
  const hasActionWords = actionWords.some(word => text.includes(word))

  if (hasActionWords) {
    score += 20
  } else {
    suggestions.push("Use strong action words (e.g. managed, led, improved)")
  }

  // Numbers / impact
  const hasNumbers = /\d/.test(text)

  if (hasNumbers) {
    score += 20
  } else {
    suggestions.push("Add measurable results (e.g. increased sales by 20%)")
  }

  // Skills section
  if (text.includes("skills")) {
    score += 20
  } else {
    suggestions.push("Add a skills section")
  }

  // Keywords (basic)
  const keywords = ["customer", "team", "service", "communication"]
  const keywordMatches = keywords.filter(word => text.includes(word)).length

  score += keywordMatches * 5

  if (keywordMatches < 2) {
    suggestions.push("Include more relevant keywords (customer, team, service)")
  }

  return {
    score: Math.min(score, 100),
    suggestions,
  }
}