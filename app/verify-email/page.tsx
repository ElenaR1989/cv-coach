import Image from "next/image"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md text-center space-y-6">

        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="Hireflow"
            width={80}
            height={80}
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold">
          Verify your email
        </h1>

        {/* Message */}
        <p className="text-sm text-white/70">
          We’ve sent you a verification email.
          <br />
          Please check your inbox and click the link to activate your account.
        </p>

        {/* Extra help */}
        <p className="text-xs text-white/50">
          Didn’t receive it? Check your spam folder.
        </p>

        {/* Back to login */}
        <Link
          href="/login"
          className="inline-block mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition"
        >
          Back to login
        </Link>

      </div>
    </div>
  )
}