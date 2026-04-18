export default function CancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
        <h1 className="text-xl font-semibold text-amber-300">
          Payment cancelled
        </h1>
        <p className="mt-2 text-sm text-white/70">
          You can upgrade anytime.
        </p>

        <a
          href="/pricing"
          className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm text-black"
        >
          Back to pricing
        </a>
      </div>
    </div>
  )
}