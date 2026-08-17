import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || ""
  const url = request.nextUrl.clone()

  // Check for subdomain e.g. agency.hire-flow.app
  const mainDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "hire-flow.app"
  const isMainDomain = hostname === mainDomain || hostname === `www.${mainDomain}` || hostname.includes("localhost")

  if (!isMainDomain) {
    // Extract subdomain slug e.g. "agency" from "agency.hire-flow.app"
    const slug = hostname.replace(`.${mainDomain}`, "")
    if (slug && slug !== "www") {
      url.pathname = `/agency/${slug}${url.pathname}`
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
