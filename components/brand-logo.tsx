import Image from "next/image"
import Link from "next/link"

/**
 * The HireFlow logo + wordmark, linking home. Used on every marketing/funnel
 * page's header so the logo path, alt text, and brand name live in one place
 * instead of being retyped (and able to drift) on every page.
 */
export default function BrandLogo({
  href = "/",
  size = 32,
  className = "flex items-center gap-3",
  textClassName = "font-semibold",
  showText = true,
}: {
  href?: string
  size?: number
  className?: string
  textClassName?: string
  showText?: boolean
}) {
  return (
    <Link href={href} className={className}>
      <Image src="/logo.png" alt="HireFlow" width={size} height={size} className="rounded-md" />
      {showText && <span className={textClassName}>HireFlow</span>}
    </Link>
  )
}
