export default function SuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
        <h1 className="text-xl font-semibold text-emerald-300">
          🎉 Payment successful!
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Your Pro features are now unlocked.
        </p>

        <a
          href="/dashboard"
          className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm text-black"
        >
          Go to dashboard
        </a>
      </div>
    </div>
  )
}