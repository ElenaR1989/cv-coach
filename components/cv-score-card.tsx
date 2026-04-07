
 "use client"

export default function CVScoreCard({
  score,
  suggestions,
}: {
  score: number
  suggestions: string[]
}) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      <h2 className="mb-4 text-xl font-semibold">CV Score</h2>
      <div className="mb-4 text-5xl font-bold">{score}%</div>

      <div className="space-y-2">
        {suggestions.length === 0 ? (
          <p className="text-green-400">Great CV! 🎉</p>
        ) : (
          suggestions.map((suggestion, index) => (
            <p key={index} className="text-sm text-gray-300">
              • {suggestion}
            </p>
          ))
        )}
      </div>
    </div>
  )
}
