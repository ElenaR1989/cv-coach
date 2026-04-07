"use client"

type DeleteCVButtonProps = {
  title: string
}

export default function DeleteCVButton({ title }: DeleteCVButtonProps) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        const ok = window.confirm(
          `Delete CV "${title}"? This cannot be undone.`
        )

        if (!ok) {
          e.preventDefault()
        }
      }}
      className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
    >
      Delete
    </button>
  )
}